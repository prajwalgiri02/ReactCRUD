import type { FieldConfig } from "@/crud/types";

export type CategoryFormData = {
  name: string;
  slug: string;
  image: string;
};

export const categoryFields: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "Enter category name",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    placeholder: "clothes",
  },
  {
    name: "image",
    label: "Image URL",
    type: "text",
    placeholder: "https://…",
  },
];
