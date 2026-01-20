import { z } from "zod";
import type { FieldConfig } from "@/crud/types";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(["active", "inactive"], { required_error: "Status is required" }),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

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
