import { fieldsToColumns } from "@/crud/utils/fieldsToColumns";
import type { FieldConfig } from "@/crud/types";

export type CategoryFormData = {
  name: string;
  slug: string;
  image: string;
};

export const categoryFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", placeholder: "Enter category name" },
  { name: "slug", label: "Slug", type: "text", placeholder: "clothes" },
  { name: "image", label: "Image URL", type: "text", placeholder: "https://…" },
];

// columns derived from fields (with your custom overrides)
const base = fieldsToColumns(categoryFields);

export const categoryColumns = base.map((c) => {
  if (c.key === "id") {
    return { ...c, render: (row: any) => <span className="font-semibold">{row.id}</span> };
  }

  if (c.key === "image") {
    return {
      ...c,
      render: (row: any) => (
        <img src={row.image} alt={row.name} className="h-10 w-10 rounded-lg object-cover" />
      ),
    };
  }

  if (c.key === "creationAt") {
    return {
      ...c,
      title: "Created",
      render: (row: any) => new Date(row.creationAt).toLocaleDateString(),
    };
  }

  return c;
});
