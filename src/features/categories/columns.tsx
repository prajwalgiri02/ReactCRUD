import { fieldsToColumns } from "@/crud/utils/fieldsToColumns";
import { categoryFields } from "./schema";
import { StatusPill } from "@/components/table/cells";

const base = fieldsToColumns(categoryFields);

export const categoryColumns = base.map((c) => {
  if (c.key === "status") {
    return { ...c, render: (row: any) => <StatusPill value={row.status} /> };
  }
  if (c.key === "created_at") {
    return { ...c, render: (row: any) => new Date(row.created_at).toLocaleDateString() };
  }
  if (c.key === "id") {
    return { ...c, render: (row: any) => <span className="font-semibold">{row.id}</span> };
  }
  return c;
});
