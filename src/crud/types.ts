import type { ReactNode } from "react";

export type CrudId = string | number;

/** --- Pagination --- */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/** --- List / Query Types --- */
export type CrudFilters = Record<string, any>;

export interface ListParams<F extends CrudFilters = CrudFilters> {
  page: number;
  perPage: number;
  sortBy?: string;
  descending?: boolean;
  search?: string;
  filters?: F;
}

export interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta | null;
}

/** --- API --- */
export interface CrudApi<T, F extends CrudFilters = CrudFilters> {
  list: (params: ListParams<F>) => Promise<ListResponse<T>>;
  detail?: (id: CrudId) => Promise<T>;
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: CrudId, data: Partial<T>) => Promise<T>;
  remove?: (id: CrudId) => Promise<void>;
}

/** Optional convenience “modes” */
export type CrudApiRead<T, F extends CrudFilters = CrudFilters> = Pick<CrudApi<T, F>, "list" | "detail">;
export type CrudApiWrite<T> = Required<Pick<CrudApi<T>, "create" | "update" | "remove">>;
export type CrudApiFull<T, F extends CrudFilters = CrudFilters> = CrudApiRead<T, F> & CrudApiWrite<T>;

/** --- Resource / Form typing --- */
export type CrudFormValues = Record<string, any>;

export interface AfterSubmitContext<T> {
  mode: "create" | "edit";
  id?: CrudId;
  values: Partial<T>;
}

export interface CrudResource<
  T,
  FormValues extends CrudFormValues = CrudFormValues,
  F extends CrudFilters = CrudFilters
> {
  api: CrudApi<T, F>;

  /** Converts an entity into form values (e.g., dates -> yyyy-mm-dd, nested -> flat fields) */
  transformIn?: (row: T) => FormValues;

  /** Converts form values into payload (e.g., flat fields -> nested, strings -> numbers) */
  transformOut?: (data: FormValues) => Partial<T>;

  /** Final hook before submit (e.g., trim strings, enforce defaults) */
  beforeSubmit?: (data: Partial<T>) => Partial<T>;

  /** Side effects after submit (toast, redirect, refetch, etc.) */
  afterSubmit?: (ctx: AfterSubmitContext<T>) => void | Promise<void>;

  /** Default form values */
  getDefaultValues?: () => FormValues;

  /** Escape hatch for resource-specific helpers */
  extra?: Record<string, (...args: any[]) => any>;
}

/** --- Columns --- */
export interface ColumnConfig<T> {
  /** Prefer keyof T, but allow custom string keys if you want */
  key: keyof T | (string & {});
  title: string;
  render?: (row: T) => ReactNode;
  html?: boolean;
}

/** --- Validation --- */
export interface ValidationErrors {
  [fieldName: string]: string[] | string;
}

/** --- Fields --- */
export interface FieldRenderProps<V = any> {
  value: V;
  onChange: (value: V) => void;
  error?: string;
}

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FieldConfig<V = any> {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  placeholder?: string;
  options?: FieldOption[];
  render?: (props: FieldRenderProps<V>) => ReactNode;
  html?: boolean;
}

/** --- Helpers --- */
export function createCrudResource<
  T,
  FormValues extends CrudFormValues = CrudFormValues,
  F extends CrudFilters = CrudFilters
>(
  api: CrudApi<T, F>,
  options?: Omit<CrudResource<T, FormValues, F>, "api">
): CrudResource<T, FormValues, F> {
  return {
    api,
    ...(options ?? {}),
  };
}
