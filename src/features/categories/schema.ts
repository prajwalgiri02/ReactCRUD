import type { FieldConfig } from "@/crud/types";

export type CategoryFormData = {
  name: string;
  status: "active" | "inactive";
};

export const categoryFields: FieldConfig[] = [
  {
    name: "name",
    label: "Name",
    type: "textarea",
    placeholder: "Enter category name",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];
