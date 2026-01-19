import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnConfig, ListParams, PaginationMeta, CrudId } from "../types";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface CrudTableProps<T = unknown> {
  columns: ColumnConfig[];
  rows: T[];
  loading: boolean;
  meta: PaginationMeta | null;
  params: ListParams;
  onParamsChange: (nextPartialParams: Partial<ListParams>) => void;

  onEdit: (row: T) => void;
  onDelete: (row: T) => void;

  // Optional
  onView?: (row: T) => void;
  onCreate?: () => void;

  /** pass extra toolbar buttons (Export, Bulk delete, Filters, etc.) */
  toolbarActions?: React.ReactNode;

  /** override/extend row actions area */
  rowActions?: (row: T) => React.ReactNode;

  /** keep if you already use it */
  extraRowActions?: (row: T) => React.ReactNode;

  /** if your rows don't have id, pass getRowId */
  getRowId?: (row: T, index: number) => string | number;

  /** hide selection completely */
  enableSelection?: boolean;

  /** get selected ids for bulk actions */
  onSelectionChange?: (ids: CrudId[]) => void;
}

export const CrudTable = React.forwardRef(
  <T,>(
    {
      columns,
      rows,
      loading,
      meta,
      params,
      onParamsChange,
      onEdit,
      onDelete,
      onView,
      onCreate,
      toolbarActions,
      rowActions,
      extraRowActions,
      getRowId,
      enableSelection = true,
      onSelectionChange,
    }: CrudTableProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const handleSearch = (value: string) => onParamsChange({ search: value, page: 1 });
    const handlePerPageChange = (value: string) => onParamsChange({ perPage: Number.parseInt(value, 10), page: 1 });

    const handleSort = (key: string) => {
      if (params.sortBy === key) onParamsChange({ descending: !params.descending });
      else onParamsChange({ sortBy: key, descending: false, page: 1 });
    };

    const rangeText =
      meta && meta.from != null && meta.to != null ? `${meta.from}–${meta.to} of ${meta.total}` : meta ? `Total ${meta.total}` : "";

    // -------------------------
    // Selection
    // -------------------------
    const rowIds = React.useMemo(() => {
      return rows.map((r, i) => {
        const id = getRowId ? getRowId(r, i) : ((r as any)?.id ?? i);
        return String(id);
      });
    }, [rows, getRowId]);

    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
      setSelectedIds(new Set());
    }, [meta?.current_page, params.search, params.sortBy, params.descending, params.perPage]);

    React.useEffect(() => {
      if (!onSelectionChange) return;
      const ids = Array.from(selectedIds).map((x) => (Number.isFinite(Number(x)) ? (Number(x) as any) : (x as any)));
      onSelectionChange(ids);
    }, [selectedIds, onSelectionChange]);

    const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
    const someSelected = rowIds.some((id) => selectedIds.has(id)) && !allSelected;

    const toggleAll = () => {
      setSelectedIds(() => {
        if (allSelected) return new Set();
        return new Set(rowIds);
      });
    };

    const toggleOne = (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    // -------------------------
    // Pagination (numbered + dots)
    // -------------------------
    const goToPage = (p: number) => {
      if (!meta) return;
      const page = Math.max(1, Math.min(meta.last_page, p));
      onParamsChange({ page });
    };

    const pageItems = React.useMemo(() => {
      if (!meta) return [] as Array<number | "dots">;

      const total = meta.last_page;
      const current = meta.current_page;

      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

      const items: Array<number | "dots"> = [];
      const left = Math.max(2, current - 1);
      const right = Math.min(total - 1, current + 1);

      items.push(1);

      if (left > 2) items.push("dots");
      for (let p = left; p <= right; p++) items.push(p);
      if (right < total - 1) items.push("dots");

      items.push(total);

      return items;
    }, [meta?.current_page, meta?.last_page]);

    // -------------------------
    // UI helpers
    // -------------------------
    const IconAction = ({
      title,
      onClick,
      danger,
      children,
    }: {
      title: string;
      onClick?: () => void;
      danger?: boolean;
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        title={title}
        aria-label={title}
        onClick={onClick}
        className={cn(
          "h-10 w-10 rounded-2xl grid place-items-center transition-colors",
          "hover:bg-muted",
          danger ? "text-red-600 hover:text-red-700" : "text-primary",
        )}
      >
        {children}
      </button>
    );

    return (
      <div ref={ref} className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-[280px] max-w-[52vw]">
              <Input
                placeholder="Search..."
                value={params.search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-11 rounded-2xl pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-70">
                  <path
                    d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toolbarActions}

            {onCreate ? (
              <Button onClick={onCreate} className="h-10 rounded-2xl px-4">
                Create
              </Button>
            ) : null}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {enableSelection && (
                  <TableHead className="w-[48px]">
                    <div className="flex items-center">
                      <Checkbox
                        checked={allSelected}
                        {...(someSelected ? { checked: "indeterminate" as any } : {})}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </div>
                  </TableHead>
                )}

                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-2 hover:text-foreground/80"
                      title="Sort"
                    >
                      {col.title}
                      {params.sortBy === col.key ? (params.descending ? " ▼" : " ▲") : null}
                    </button>
                  </TableHead>
                ))}

                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (enableSelection ? 2 : 1)} className="text-center py-10 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (enableSelection ? 2 : 1)} className="text-center py-10 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const rowKey = getRowId ? getRowId(row, idx) : ((row as any)?.id ?? idx);
                  const idStr = String(rowIds[idx]);

                  return (
                    <TableRow key={rowKey}>
                      {enableSelection && (
                        <TableCell className="w-[48px]">
                          <Checkbox checked={selectedIds.has(idStr)} onCheckedChange={() => toggleOne(idStr)} aria-label="Select row" />
                        </TableCell>
                      )}

                      {columns.map((col) => (
                        <TableCell key={col.key}>{col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}</TableCell>
                      ))}

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rowActions ? (
                            rowActions(row)
                          ) : (
                            <>
                              {onView ? (
                                <IconAction title="View" onClick={() => onView(row)}>
                                  <Eye className="h-4 w-4" />
                                </IconAction>
                              ) : null}

                              <IconAction title="Edit" onClick={() => onEdit(row)}>
                                <Pencil className="h-4 w-4" />
                              </IconAction>

                              <IconAction title="Delete" onClick={() => onDelete(row)} danger>
                                <Trash2 className="h-4 w-4" />
                              </IconAction>

                              {extraRowActions ? extraRowActions(row) : null}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        {meta && (
          <div className="flex items-center justify-between px-4 py-2 border-t text-sm text-muted-foreground bg-white">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select value={String(params.perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="h-8 w-[70px] rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span>{rangeText}</span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(meta.current_page - 1)}
                  disabled={meta.current_page === 1}
                  className="h-9 w-9 rounded-xl"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  ‹
                </Button>

                <div className="flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
                  {pageItems.map((it, idx) =>
                    it === "dots" ? (
                      <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <button
                        key={it}
                        type="button"
                        onClick={() => goToPage(it)}
                        className={cn(
                          "h-9 min-w-9 px-3 rounded-xl text-sm transition-colors",
                          it === meta.current_page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground/80",
                        )}
                        aria-current={it === meta.current_page ? "page" : undefined}
                        title={`Page ${it}`}
                      >
                        {it}
                      </button>
                    ),
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(meta.current_page + 1)}
                  disabled={meta.current_page === meta.last_page}
                  className="h-9 w-9 rounded-xl"
                  aria-label="Next page"
                  title="Next page"
                >
                  ›
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
) as <T>(props: CrudTableProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement;

CrudTable.displayName = "CrudTable";
