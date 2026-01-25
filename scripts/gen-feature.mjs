#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const args = process.argv.slice(2);

const featureRaw = args[0];
if (!featureRaw) {
  console.log(
    "Usage: node scripts/gen-feature.mjs <featureNamePlural> [EntityNamePascal] [fields] [--force]\n" +
      'Example: node scripts/gen-feature.mjs categories Category "name:text,slug:text,image:text,creationAt:date,updatedAt:date"',
  );
  process.exit(1);
}

const entityRaw = args[1]; // optional
const fieldsRaw = args[2]; // optional
const FORCE = args.includes("--force");

const SRC_FEATURES_ROOT = path.join(process.cwd(), "src", "features");
const APP_ROOT = path.join(process.cwd(), "src", "app", "(dashboard)");

function toPascal(str) {
  return str
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}
function toCamel(str) {
  const p = toPascal(str);
  return p[0].toLowerCase() + p.slice(1);
}
function singularize(plural) {
  if (plural.endsWith("ies")) return plural.slice(0, -3) + "y";
  if (plural.endsWith("ses")) return plural.slice(0, -2);
  if (plural.endsWith("s") && plural.length > 1) return plural.slice(0, -1);
  return plural;
}

const feature = featureRaw.toLowerCase();
const entity = entityRaw ? entityRaw : toPascal(singularize(feature)); // Category
const entityVar = toCamel(entity); // category

const routesVar = `${entityVar}Routes`; // categoryRoutes
const resourceVar = `${entityVar}Resource`; // categoryResource
const fieldsVar = `${entityVar}Fields`; // categoryFields
const columnsVar = `${entityVar}Columns`; // categoryColumns

const featureDir = path.join(SRC_FEATURES_ROOT, feature);

const defaultFields = [
  { name: "name", type: "text" },
  { name: "slug", type: "text" },
  { name: "image", type: "text" },
  { name: "creationAt", type: "date" },
  { name: "updatedAt", type: "date" },
];

const parsedFields = fieldsRaw
  ? fieldsRaw.split(",").map((p) => {
      const [name, type] = p.trim().split(":");
      return { name: name.trim(), type: (type || "text").trim() };
    })
  : defaultFields;

const hasId = parsedFields.some((f) => f.name === "id");
const fieldsForColumns = hasId ? parsedFields : [{ name: "id", type: "id" }, ...parsedFields];

function fieldLabel(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function inputType(type) {
  if (type === "id") return "text";
  if (type === "date" || type === "datetime") return "date";
  if (type === "image") return "text";
  return type;
}

function tsTypeFromField(f) {
  if (f.name === "id") return "number";
  if (f.type === "number") return "number";
  if (f.type === "boolean") return "boolean";
  return "string";
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}
async function ensureDirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}
async function writeFileSafe(filePath, content) {
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

  if (exists && !FORCE) {
    console.log(`Skip (exists): ${path.relative(process.cwd(), filePath)}  (use --force to overwrite)`);
    return;
  }

  await ensureDirForFile(filePath);
  await fs.writeFile(filePath, content, "utf8");
  console.log(`Write: ${path.relative(process.cwd(), filePath)}`);
}

function typesTs() {
  // This is the REAL API type (matches backend)
  const lines = fieldsForColumns.map((f) => `  ${f.name}: ${tsTypeFromField(f)};`);
  return `export interface ${entity} {\n${lines.join("\n")}\n}\n`;
}

function schemaTsx() {
  const formFields = parsedFields.filter((f) => f.name !== "id");

  const typeShape = formFields.length ? formFields.map((f) => `  ${f.name}: string;`).join("\n") : "  // add fields";

  const fieldsArr = formFields.length
    ? formFields
        .map((f) => {
          const label = fieldLabel(f.name);
          const placeholder = f.name === "image" ? "https://…" : f.name === "slug" ? "clothes" : `Enter ${label.toLowerCase()}`;
          return `  {
    name: "${f.name}",
    label: "${label}",
    type: "${inputType(f.type)}",
    placeholder: "${placeholder}",
  },`;
        })
        .join("\n")
    : "  // add fields";

  const hasImage = fieldsForColumns.some((f) => f.name === "image");
  const hasCreationAt = fieldsForColumns.some((f) => f.name === "creationAt");
  const hasUpdatedAt = fieldsForColumns.some((f) => f.name === "updatedAt");

  return `"use client";

import type { FieldConfig } from "@/crud/types";
import { fieldsToColumns } from "@/crud/utils/fieldsToColumns";

export type ${entity}FormData = {
${typeShape}
};

export const ${fieldsVar}: FieldConfig[] = [
${fieldsArr}
];

// Columns derived from fields (single source of truth)
const base = fieldsToColumns(${fieldsVar});

// Ensure ID is always in the table (at the start)
if (!base.find(c => c.key === "id")) {
  base.unshift({ key: "id", title: "ID" });
}

export const ${columnsVar} = base.map((c) => {
  if (c.key === "id") {
    return { ...c, render: (row: any) => <span className="font-semibold">{row.id}</span> };
  }

  ${
    hasImage
      ? `if (c.key === "image") {
    return {
      ...c,
      render: (row: any) => (
        <img
          src={row.image}
          alt={row.title ?? row.name ?? "Item"}
          className="h-10 w-10 rounded-lg object-cover"
        />
      ),
    };
  }`
      : ""
  }

  ${
    hasCreationAt
      ? `if (c.key === "creationAt") {
    return {
      ...c,
      title: "Created",
      render: (row: any) => new Date(row.creationAt).toLocaleDateString(),
    };
  }`
      : ""
  }

  ${
    hasUpdatedAt
      ? `if (c.key === "updatedAt") {
    return {
      ...c,
      title: "Updated",
      render: (row: any) => new Date(row.updatedAt).toLocaleDateString(),
    };
  }`
      : ""
  }

  return c;
});
`;
}

function routesTs() {
  return `export const ${routesVar} = {
  list: "/${feature}",
  create: "/${feature}/create",
  edit: (id: string | number) => \`/${feature}/\${id}/edit\`,
};
`;
}

function indexTs() {
  // feature-local type: ./types
  return `import { createRestCrudApi } from "@/crud/createCrudResource";
import { createCrudResource } from "@/crud/types";
import type { ${entity} } from "./types";

const baseUrl = (process.env.API_BASE_URL || "/api") + "/${feature}";
const api = createRestCrudApi<${entity}>(baseUrl);

export const ${resourceVar} = createCrudResource(api);
`;
}

function featureListPageTsx() {
  return `"use client";

import { CrudPage } from "@/crud/CrudPage";
import { CrudTable } from "@/crud/components/CrudTable";
import { ${columnsVar} } from "./schema";
import { ${resourceVar} } from "./index";
import { ${routesVar} } from "./routes";
import type { ${entity} } from "./types";

export function ${entity}ListPage() {
  return (
    <CrudPage<${entity}>
      title="${entity}s"
      resource={${resourceVar}}
      columns={${columnsVar} as any}
      getId={(row: any) => row.id}
      defaultParams={{ perPage: 12 }}
      createPath={${routesVar}.create}
      editPath={(row: any) => ${routesVar}.edit(row.id)}
      Table={(props) => <CrudTable {...props} />}
    />
  );
}
`;
}

function featureFormPageTsx() {
  return `"use client";

import { GenericFormPage } from "@/crud/components/GenericFormPage";
import { ${resourceVar} } from "./index";
import { ${fieldsVar} } from "./schema";
import { ${routesVar} } from "./routes";
import type { ${entity} } from "./types";

export function ${entity}FormPage() {
  return (
    <GenericFormPage<${entity}>
      resource={${resourceVar}}
      fields={${fieldsVar}}
      listPath={${routesVar}.list}
      title={{ create: "Create ${entity}", edit: "Edit ${entity}" }}
    />
  );
}
`;
}

function appListPageTsx() {
  return `"use client";

import { ${entity}ListPage } from "@/features/${feature}/${entity}ListPage";

export default function ${entity}sPage() {
  return <${entity}ListPage />;
}
`;
}

function appCreatePageTsx() {
  return `"use client";

import { ${entity}FormPage } from "@/features/${feature}/${entity}FormPage";

export default function Create${entity}Page() {
  return <${entity}FormPage />;
}
`;
}

function appEditPageTsx() {
  return `"use client";

import { ${entity}FormPage } from "@/features/${feature}/${entity}FormPage";

export default function Edit${entity}Page() {
  return <${entity}FormPage />;
}
`;
}

async function main() {
  await ensureDir(featureDir);

  // Feature files
  await writeFileSafe(path.join(featureDir, "types.ts"), typesTs());
  await writeFileSafe(path.join(featureDir, "schema.tsx"), schemaTsx());
  await writeFileSafe(path.join(featureDir, "routes.ts"), routesTs());
  await writeFileSafe(path.join(featureDir, "index.ts"), indexTs());

  await writeFileSafe(path.join(featureDir, `${entity}ListPage.tsx`), featureListPageTsx());
  await writeFileSafe(path.join(featureDir, `${entity}FormPage.tsx`), featureFormPageTsx());

  // App Router pages
  await writeFileSafe(path.join(APP_ROOT, feature, "page.tsx"), appListPageTsx());
  await writeFileSafe(path.join(APP_ROOT, feature, "create", "page.tsx"), appCreatePageTsx());
  await writeFileSafe(path.join(APP_ROOT, feature, "[id]", "edit", "page.tsx"), appEditPageTsx());

  console.log("\nDone.");
  console.log(`Feature: src/features/${feature}`);
  console.log(`Pages:   src/app/(dashboard)/${feature}/...`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
