import type { CrudApi, CrudId, ListParams, ListResponse, ValidationErrors } from "./types";

type Fetcher = typeof fetch;

export class CrudHttpError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = "CrudHttpError";
    this.status = status;
    this.payload = payload;
  }
}

export class CrudValidationError extends CrudHttpError {
  errors: ValidationErrors;

  constructor(message: string, status: number, payload: any, errors: ValidationErrors) {
    super(message, status, payload);
    this.name = "CrudValidationError";
    this.errors = errors;
  }
}

/**
 * Tries to extract field errors from common backend shapes:
 * - Laravel: { message, errors: { field: ["..."] } }
 * - Generic: { errors: { field: "..." } }
 */
function extractValidationErrors(payload: any): ValidationErrors | null {
  const errors = payload?.errors;
  if (!errors || typeof errors !== "object") return null;

  // ensure values are string | string[]
  const out: ValidationErrors = {};
  for (const [k, v] of Object.entries(errors)) {
    if (Array.isArray(v)) out[k] = v.map(String);
    else if (typeof v === "string") out[k] = v;
    else if (v != null) out[k] = String(v);
  }
  return Object.keys(out).length ? out : null;
}

async function readPayloadSafe(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function buildQuery(params: ListParams) {
  const qs = new URLSearchParams();

  qs.set("page", String(params.page));
  qs.set("perPage", String(params.perPage));

  if (params.search) qs.set("search", params.search);
  if (params.sortBy) qs.set("sortBy", String(params.sortBy));
  if (params.descending != null) qs.set("descending", String(params.descending));

  //  Filters support (flat primitives; arrays become repeated keys)
  if (params.filters && typeof params.filters === "object") {
    for (const [key, val] of Object.entries(params.filters)) {
      if (val == null) continue;

      if (Array.isArray(val)) {
        for (const item of val) qs.append(`filters[${key}][]`, String(item));
      } else if (typeof val === "object") {
        // object filters: stringify by default (safe fallback)
        qs.set(`filters[${key}]`, JSON.stringify(val));
      } else {
        qs.set(`filters[${key}]`, String(val));
      }
    }
  }

  return qs;
}

/**
 * REST CRUD API factory
 * Adds:
 * - detail()
 * - filters support in list()
 * - better error handling (+ validation errors via CrudValidationError)
 */
export function createRestCrudApi<T>(baseUrl: string = process.env.API_BASE_URL || "", fetcher: Fetcher = fetch): CrudApi<T> {
  return {
    async list(params) {
      const qs = buildQuery(params);
      const res = await fetcher(`${baseUrl}?${qs.toString()}`);

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to load list";
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      const payload = await res.json();

      // 1. If payload is an array, wrap it
      if (Array.isArray(payload)) {
        return { items: payload, meta: null };
      }

      // 2. If payload has 'data' (common pattern) but not 'items'
      if (Array.isArray((payload as any).data) && !(payload as any).items) {
        return {
          items: (payload as any).data,
          meta: (payload as any).meta || (payload as any).pagination || null,
        };
      }

      // 3. Otherwise assume it fits ListResponse<T>
      return payload as ListResponse<T>;
    },

    async detail(id: CrudId) {
      const res = await fetcher(`${baseUrl}/${id}`);

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to load detail";
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      return (await res.json()) as T;
    },

    async create(data) {
      const res = await fetcher(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to create";
        const fieldErrors = extractValidationErrors(payload);

        if (res.status === 422 && fieldErrors) {
          throw new CrudValidationError(String(msg), res.status, payload, fieldErrors);
        }
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      return (await res.json()) as T;
    },

    async update(id: CrudId, data) {
      const res = await fetcher(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to update";
        const fieldErrors = extractValidationErrors(payload);

        if (res.status === 422 && fieldErrors) {
          throw new CrudValidationError(String(msg), res.status, payload, fieldErrors);
        }
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      return (await res.json()) as T;
    },

    async remove(id: CrudId) {
      const res = await fetcher(`${baseUrl}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to delete";
        throw new CrudHttpError(String(msg), res.status, payload);
      }
    },
  };
}
