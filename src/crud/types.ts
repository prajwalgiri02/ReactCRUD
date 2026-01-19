import type { ReactNode } from "react";

export type CrudId = string | number;

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ListParams {
  page: number;
  perPage: number;
  sortBy?: string;
  descending?: boolean;
  search?: string;
  filters?: Record<string, unknown>;
}

export interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta | null;
}

export interface CrudApi<T> {
  list: (params: ListParams) => Promise<ListResponse<T>>;
  detail?: (id: CrudId) => Promise<T>;
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: CrudId, data: Partial<T>) => Promise<T>;
  remove?: (id: CrudId) => Promise<void>;
}

export interface CrudResource<T> {
  api: CrudApi<T>;
  transformIn?: (row: T) => Record<string, unknown>;
  transformOut?: (data: Record<string, unknown>) => Partial<T>;
  beforeSubmit?: (data: Partial<T>) => Partial<T>;
  afterSubmit?: (ctx: { mode: "create" | "edit"; id?: CrudId; values: Partial<T> }) => void | Promise<void>;
  getDefaultValues?: () => Record<string, unknown>;
  extra?: Record<string, (...args: any[]) => any>;
}

export interface ColumnConfig {
  key: string;
  title: string;
  render?: (row: unknown) => ReactNode;
}

export interface ValidationErrors {
  [fieldName: string]: string[] | string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  render?: (props: { value: any; onChange: (value: any) => void; error?: string }) => ReactNode;
}
