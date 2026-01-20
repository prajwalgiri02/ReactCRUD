import type { FieldConfig, ColumnConfig } from "../types";

export function fieldsToColumns(fields: FieldConfig[]): ColumnConfig[] {
  return fields.map((f) => ({
    key: f.name,
    title: f.label,
    html: f.html ?? f.type === "textarea",
  }));
}
