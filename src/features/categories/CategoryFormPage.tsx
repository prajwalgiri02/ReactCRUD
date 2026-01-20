"use client";

import { GenericFormPage } from "@/crud/components/GenericFormPage";
import { categoryResource } from "./index";
import { categoryFields } from "./schema"; 
import { categoryRoutes } from "./routes";

export function CategoryFormPage() {
  return (
    <GenericFormPage
      resource={categoryResource}
      fields={categoryFields}
      listPath={categoryRoutes.list}
      title={{ create: "Create Category", edit: "Edit Category" }}
    />
  );
}
