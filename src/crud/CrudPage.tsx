import React, { useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ColumnConfig, CrudId, CrudResource, ListParams, PaginationMeta, ValidationErrors } from "./types";
import { debounce } from "./utils/debounce";

interface CrudPageProps<T> {
  title: string;
  resource: CrudResource<T>;
  columns: ColumnConfig[];
  getId: (row: T) => CrudId;
  Table: React.ComponentType<{
    columns: ColumnConfig[];
    rows: T[];
    loading: boolean;
    meta: PaginationMeta | null;
    params: ListParams;
    onParamsChange: (nextPartialParams: Partial<ListParams>) => void;
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    extraRowActions?: (row: T) => React.ReactNode;
  }>;
  FormModal: React.ComponentType<{
    open: boolean;
    mode: "create" | "edit";
    initialValues: Record<string, unknown>;
    loading: boolean;
    errors: ValidationErrors;
    onClose: () => void;
    onSubmit: (values: Record<string, unknown>) => void;
    extraFormActions?: React.ReactNode;
  }>;
  defaultParams?: Partial<ListParams>;
  extraRowActions?: (row: T) => React.ReactNode;
  extraFormActions?: ({ mode, currentRow }: { mode: "create" | "edit"; currentRow?: T }) => React.ReactNode;
}

function CrudPageInner<T>(
  { title, resource, columns, getId, Table, FormModal, defaultParams, extraRowActions, extraFormActions }: CrudPageProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentRow, setCurrentRow] = useState<T | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [formLoading, setFormLoading] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await resource.api.list(params);
      setRows(response.items);
      setMeta(response.meta ?? null);
    } catch (err) {
      console.error("Failed to fetch list:", err);
    } finally {
      setLoading(false);
    }
  }, [params, resource.api]);

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setParams((prev) => ({ ...prev, search: searchValue, page: 1 }));
    }, 500),
    []
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
    [debouncedSearch]
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleEdit = useCallback((row: T) => {
    setCurrentRow(row);
    setModalMode("edit");
    setFormErrors({});
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (row: T) => {
      const id = getId(row);
      if (!resource.api.remove) return;
      if (!window.confirm("Are you sure you want to delete this item?")) return;
      try {
        await resource.api.remove(id);
        await fetchList();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    },
    [getId, resource.api, fetchList]
  );

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        setFormLoading(true);
        setFormErrors({});

        let submitData: any = { ...values };
        if (resource.transformOut) submitData = resource.transformOut(submitData);
        if (resource.beforeSubmit) submitData = resource.beforeSubmit(submitData);

        let id: CrudId | undefined;
        if (modalMode === "create") {
          if (!resource.api.create) return;
          await resource.api.create(submitData);
        } else if (modalMode === "edit" && currentRow) {
          if (!resource.api.update) return;
          id = getId(currentRow);
          await resource.api.update(id, submitData);
        }

        await resource.afterSubmit?.({ mode: modalMode, id, values: submitData as any });

        setModalOpen(false);
        setCurrentRow(null);
        setFormErrors({});
        await fetchList();
      } catch (err: any) {
        const errorData = err?.response?.data;
        if (errorData?.errors) setFormErrors(errorData.errors);
        else if (errorData?.error) setFormErrors({ _error: [errorData.error] });
        else setFormErrors({ _error: [err?.message ?? "Submit failed"] });
      } finally {
        setFormLoading(false);
      }
    },
    [modalMode, currentRow, getId, resource, fetchList]
  );

  const getInitialFormValues = () => {
    if (modalMode === "edit" && currentRow && resource.transformIn) return resource.transformIn(currentRow);
    return resource.getDefaultValues ? resource.getDefaultValues() : {};
  };

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button
          onClick={() => {
            setCurrentRow(null);
            setModalMode("create");
            setFormErrors({});
            setModalOpen(true);
          }}
        >
          Add New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            rows={rows}
            loading={loading}
            meta={meta}
            params={params}
            onParamsChange={handleParamsChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            extraRowActions={extraRowActions}
          />
        </CardContent>
      </Card>

      <FormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={getInitialFormValues()}
        loading={formLoading}
        errors={formErrors}
        onClose={() => {
          setModalOpen(false);
          setCurrentRow(null);
          setFormErrors({});
        }}
        onSubmit={handleFormSubmit}
        extraFormActions={extraFormActions ? extraFormActions({ mode: modalMode, currentRow: currentRow ?? undefined }) : undefined}
      />
    </div>
  );
}

// this preserves generics for callers
export const CrudPage = React.forwardRef(CrudPageInner) as <T>(props: CrudPageProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement;

CrudPage.displayName = "CrudPage";
