"use client";

import { GenericFormPage } from "@/crud/components/GenericFormPage";
import { categoryResource } from "./index";
import { categorySchema, categoryFields } from "./schema";
import { categoryRoutes } from "./routes";

export function CategoryFormPage() {
  return (
    <GenericFormPage
      resource={categoryResource}
      schema={categorySchema}
      fields={categoryFields}
      listPath={categoryRoutes.list}
      title={{ create: "Create Category", edit: "Edit Category" }}
    />
  );
}
