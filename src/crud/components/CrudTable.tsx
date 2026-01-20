"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ColumnConfig, ListParams, PaginationMeta, CrudId } from "../types";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import DOMPurify from "dompurify";

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

  /** optional bulk delete handler */
  onBulkDelete?: (ids: CrudId[]) => Promise<void> | void;

  /** render bulk actions when there is selection */
  bulkActions?: (ctx: { selectedCount: number; clear: () => void; selectedIds: CrudId[] }) => React.ReactNode;
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
      onBulkDelete,
      bulkActions,
    }: CrudTableProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [rowToDelete, setRowToDelete] = React.useState<T | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleSearch = (value: string) => onParamsChange({ search: value, page: 1 });
    const handlePerPageChange = (value: string) => onParamsChange({ perPage: Number.parseInt(value, 10), page: 1 });

    const handleSort = (key: string) => {
      if (params.sortBy === key) onParamsChange({ descending: !params.descending });
      else onParamsChange({ sortBy: key, descending: false, page: 1 });
    };

    const rangeText = meta && meta.from != null && meta.to != null ? `${meta.from}–${meta.to} of ${meta.total}` : meta ? `Total ${meta.total}` : "";

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

    // Bulk selection state helpers
    const selectedIdList = React.useMemo<CrudId[]>(() => {
      return Array.from(selectedIds).map((x) => (Number.isFinite(Number(x)) ? (Number(x) as any) : (x as any)));
    }, [selectedIds]);

    const selectedCount = selectedIds.size;

    const clearSelection = () => setSelectedIds(new Set());

    // -------------------------
    // Delete Dialog
    // -------------------------
    const handleDeleteClick = (row: T) => {
      setRowToDelete(row);
      setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
      if (!rowToDelete) return;
      setIsDeleting(true);
      try {
        await onDelete(rowToDelete);
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setRowToDelete(null);
      }
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
    // Skeleton Rows
    // -------------------------
    const SkeletonRow = () => (
      <TableRow>
        {enableSelection && (
          <TableCell className="w-[48px]">
            <Skeleton className="h-4 w-4" />
          </TableCell>
        )}
        {columns.map((col) => (
          <TableCell key={col.key}>
            <Skeleton className="h-4 w-full max-w-[200px]" />
          </TableCell>
        ))}
        <TableCell className="text-right">
          <Skeleton className="h-8 w-8 ml-auto" />
        </TableCell>
      </TableRow>
    );

    return (
      <div ref={ref} className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          {enableSelection && selectedCount > 0 ? (
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground">{selectedCount} selected</span>

                <Button variant="ghost" size="sm" onClick={clearSelection} className="h-9 rounded-xl text-muted-foreground hover:text-foreground">
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {onBulkDelete ? (
                  <Button variant="destructive" size="sm" className="h-9 rounded-xl gap-2" onClick={() => onBulkDelete(selectedIdList)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : null}

                {bulkActions ? bulkActions({ selectedCount, clear: clearSelection, selectedIds: selectedIdList }) : null}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-[280px] max-w-[52vw]">
                  <Input
                    placeholder="Search..."
                    value={params.search || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {toolbarActions}

                {onCreate ? (
                  <Button onClick={onCreate} className="h-10 rounded-xl px-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {enableSelection && (
                  <TableHead className="w-[48px]">
                    <div className="flex items-center">
                      <Checkbox
                        checked={someSelected ? "indeterminate" : allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                        className="h-4 w-4 rounded-[6px] border-muted-foreground/25 bg-transparent data-[state=checked]:bg-primary/90 data-[state=checked]:border-primary/30"
                      />
                    </div>
                  </TableHead>
                )}

                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-2 hover:text-foreground/80 font-medium"
                      title="Sort"
                    >
                      {col.title}
                      {params.sortBy === col.key ? (params.descending ? " ▼" : " ▲") : null}
                    </button>
                  </TableHead>
                ))}

                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: params.perPage || 5 }).map((_, idx) => <SkeletonRow key={idx} />)
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
                    <TableRow key={rowKey} className="hover:bg-muted/50 transition-colors">
                      {enableSelection && (
                        <TableCell className="w-[48px]">
                          <Checkbox
                            checked={selectedIds.has(idStr)}
                            onCheckedChange={() => toggleOne(idStr)}
                            aria-label="Select row"
                            className="h-4 w-4 rounded-[6px] border-muted-foreground/25 bg-transparent data-[state=checked]:bg-primary/90 data-[state=checked]:border-primary/30"
                          />
                        </TableCell>
                      )}

                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.render ? (
                            col.render(row)
                          ) : col.html && typeof (row as any)[col.key] === "string" ? (
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize((row as any)[col.key] ?? "", { USE_PROFILES: { html: true } }),
                              }}
                            />
                          ) : (
                            String((row as any)[col.key] ?? "")
                          )}
                        </TableCell>
                      ))}

                      <TableCell className="text-right">
                        {rowActions ? (
                          rowActions(row)
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              {onView && (
                                <DropdownMenuItem onClick={() => onView(row)} className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => onEdit(row)} className="gap-2">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteClick(row)} className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              {extraRowActions && (
                                <>
                                  <DropdownMenuSeparator />
                                  {extraRowActions(row)}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
          <div className="flex items-center justify-between px-2 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select value={String(params.perPage)} onValueChange={handlePerPageChange}>
                <SelectTrigger className="h-8 w-[70px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(meta.current_page - 1)}
                  disabled={meta.current_page === 1}
                  className="h-8 w-8 rounded-lg"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
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
                          "h-8 min-w-8 px-3 rounded-lg text-sm transition-colors",
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
                  className="h-8 w-8 rounded-lg"
                  aria-label="Next page"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>Are you sure you want to delete this item? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
) as (<T>(props: CrudTableProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement) & { displayName?: string };

CrudTable.displayName = "CrudTable";
