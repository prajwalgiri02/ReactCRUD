import React from "react"
import { StatusPill } from "@/components/table/cells"

export const categoryColumns = [
  { key: "id", title: "ID", render: (row: any) => <span className="font-semibold">{row.id}</span> },
  { key: "name", title: "Name" },
  { key: "status", title: "Status", render: (row: any) => <StatusPill value={row.status} /> },
  { key: "created_at", title: "Created", render: (row: any) => new Date(row.created_at).toLocaleDateString() },
]
