"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnConfig, CrudId, CrudResource, ListParams, PaginationMeta } from "./types";
import { debounce } from "./utils/debounce";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CrudPageProps<T> {
  title: string;
  resource: CrudResource<T>;
  columns: ColumnConfig[];
  getId: (row: T) => CrudId;

  /** Table component (your CrudTable) */
  Table: React.ComponentType<{
    columns: ColumnConfig[];
    rows: T[];
    loading: boolean;
    meta: PaginationMeta | null;
    params: ListParams;
    onParamsChange: (nextPartialParams: Partial<ListParams>) => void;
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    onCreate?: () => void;
    toolbarRight?: React.ReactNode;
    extraRowActions?: (row: T) => React.ReactNode;
  }>;

  defaultParams?: Partial<ListParams>;
  extraRowActions?: (row: T) => React.ReactNode;

  /** page routes */
  createPath: string; // e.g. "/categories/create"
  editPath: (row: T) => string; // e.g. (row) => `/categories/${getId(row)}/edit`
}

function CrudPageInner<T>(
  { title, resource, columns, getId, Table, defaultParams, extraRowActions, createPath, editPath }: CrudPageProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const router = useRouter();

  const [params, setParams] = useState<ListParams>({
    page: 1,
    perPage: 12,
    sortBy: undefined,
    descending: false,
    search: "",
    filters: {},
    ...defaultParams,
  });

  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await resource.api.list(params);
      setRows(response.items);
      setMeta(response.meta ?? null);
    } catch (err) {
      console.error("Failed to fetch list:", err);
      toast.error("Failed to fetch data", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [params, resource.api]);

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setParams((prev) => ({ ...prev, search: searchValue, page: 1 }));
    }, 500),
    [],
  );

  const handleParamsChange = useCallback(
    (nextPartialParams: Partial<ListParams>) => {
      if ("search" in nextPartialParams) {
        debouncedSearch(nextPartialParams.search || "");
        return;
      }

      setParams((prev) => {
        const next = { ...prev, ...nextPartialParams };
        if ("filters" in nextPartialParams || "perPage" in nextPartialParams || "sortBy" in nextPartialParams || "descending" in nextPartialParams) {
          next.page = 1;
        }
        return next;
      });
    },
    [debouncedSearch],
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  //  Create/Edit now NAVIGATE to pages (no modal)
  const handleCreate = useCallback(() => {
    router.push(createPath);
  }, [router, createPath]);

  const handleEdit = useCallback(
    (row: T) => {
      router.push(editPath(row));
    },
    [router, editPath],
  );

  const handleDelete = useCallback(
    async (row: T) => {
      const id = getId(row);
      if (!resource.api.remove) return;

      try {
        await resource.api.remove(id);
        toast.success("Item deleted successfully");
        await fetchList();
      } catch (err) {
        console.error("Failed to delete:", err);
        toast.error("Failed to delete item", {
          description: err instanceof Error ? err.message : "An error occurred",
        });
      }
    },
    [getId, resource.api, fetchList],
  );

  return (
    <div ref={ref} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            rows={rows}
            loading={loading}
            meta={meta}
            params={params}
            onParamsChange={handleParamsChange}
            onCreate={handleCreate} // plus icon => create page
            onEdit={handleEdit} // edit icon => edit page
            onDelete={handleDelete}
            extraRowActions={extraRowActions}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// preserves generics
export const CrudPage = React.forwardRef(CrudPageInner) as <T>(props: CrudPageProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement;

CrudPage.displayName = "CrudPage";
