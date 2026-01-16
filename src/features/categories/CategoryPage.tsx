import type React from "react"
import { CrudPage } from "@/crud/CrudPage"
import { CrudTable } from "@/crud/components/CrudTable"
import { CrudFormModal } from "@/crud/components/CrudFormModal"
import { categoryResource } from "./index"
import { Badge } from "@/components/ui/badge"

const categoryColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  {
    key: "status",
    title: "Status",
    render: (row: any) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>,
  },
  {
    key: "created_at",
    title: "Created",
    render: (row: any) => new Date(row.created_at).toLocaleDateString(),
  },
]

const categoryFields = [
  { name: "name", label: "Name", type: "text", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
] as const

export const CategoryPage: React.FC = () => {
  const CategoryFormModal: React.FC<any> = (props) => <CrudFormModal {...props} fields={categoryFields as any} />

  return (
    <CrudPage
      title="Categories"
      resource={categoryResource}
      columns={categoryColumns}
      getId={(row: any) => row.id}
      Table={CrudTable}
      FormModal={CategoryFormModal}
      defaultParams={{ perPage: 12 }}
    />
  )
}
