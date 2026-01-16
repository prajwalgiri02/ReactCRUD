import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColumnConfig, ListParams, PaginationMeta } from "../types"
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react"

interface CrudTableProps {
  columns: ColumnConfig[]
  rows: unknown[]
  loading: boolean
  meta: PaginationMeta | null
  params: ListParams
  onParamsChange: (nextPartialParams: Partial<ListParams>) => void
  onEdit: (row: unknown) => void
  onDelete: (row: unknown) => void
  extraRowActions?: (row: unknown) => React.ReactNode
}

export const CrudTable = React.forwardRef<HTMLDivElement, CrudTableProps>(
  ({ columns, rows, loading, meta, params, onParamsChange, onEdit, onDelete, extraRowActions }, ref) => {
    const handleSearch = (value: string) => onParamsChange({ search: value, page: 1 })

    const handlePerPageChange = (value: string) => onParamsChange({ perPage: Number.parseInt(value, 10), page: 1 })

    const handleSort = (key: string) => {
      if (params.sortBy === key) onParamsChange({ descending: !params.descending })
      else onParamsChange({ sortBy: key, descending: false, page: 1 })
    }

    const handlePrevPage = () => {
      if (meta && meta.current_page > 1) onParamsChange({ page: meta.current_page - 1 })
    }

    const handleNextPage = () => {
      if (meta && meta.current_page < meta.last_page) onParamsChange({ page: meta.current_page + 1 })
    }

    const rangeText =
      meta && meta.from != null && meta.to != null ? `Showing ${meta.from}–${meta.to} of ${meta.total}` : meta ? `Total ${meta.total}` : ""

    return (
      <div ref={ref} className="space-y-4">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search..."
            value={params.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={String(params.perPage)} onValueChange={handlePerPageChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="24">24 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 font-semibold cursor-pointer hover:text-foreground/80"
                    >
                      {col.title}
                      {params.sortBy === col.key &&
                        (params.descending ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />)}
                    </button>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const rowKey = (row as any)?.id ?? idx
                  return (
                    <TableRow key={rowKey}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(row)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(row)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                            {extraRowActions ? <>{extraRowActions(row)}</> : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {meta && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{rangeText}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={meta.current_page === 1}>
                Previous
              </Button>
              <span className="text-sm flex items-center px-2">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={meta.current_page === meta.last_page}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
)

CrudTable.displayName = "CrudTable"
