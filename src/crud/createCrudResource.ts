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

  if (params.filters && typeof params.filters === "object") {
    for (const [key, val] of Object.entries(params.filters)) {
      if (val == null) continue;

      if (Array.isArray(val)) {
        for (const item of val) qs.append(`filters[${key}][]`, String(item));
      } else if (typeof val === "object") {
        qs.set(`filters[${key}]`, JSON.stringify(val));
      } else {
        qs.set(`filters[${key}]`, String(val));
      }
    }
  }

  return qs;
}

type CrudApiOptions = {
  /**
   * If provided, we will call this on 401 once, then retry the original request once.
   * Example: () => fetch("/auth/refresh", { method:"POST", credentials:"include" })
   */
  refreshAuth?: () => Promise<Response>;
};

/**
 * REST CRUD API factory
 * Adds:
 * - detail()
 * - filters support in list()
 * - better error handling (+ validation errors via CrudValidationError)
 * - credentials: "include" for HttpOnly cookie auth
 * - optional 401 -> refresh -> retry
 * - safe 204 handling
 */
export function createRestCrudApi<T>(
  baseUrl: string = process.env.API_BASE_URL || "",
  fetcher: Fetcher = fetch,
  options: CrudApiOptions = {}
): CrudApi<T> {
  const request = async (input: RequestInfo | URL, init: RequestInit = {}, triedRefresh = false) => {
    const mergedInit: RequestInit = {
      ...init,
      credentials: "include", //  send HttpOnly cookies
      headers: {
        Accept: "application/json",
        ...(init.headers || {}),
      },
    };

    const res = await fetcher(input, mergedInit);

    //  optional: auto refresh once on 401 then retry once
    if (res.status === 401 && options.refreshAuth && !triedRefresh) {
      const refreshRes = await options.refreshAuth();
      if (refreshRes.ok) {
        return request(input, init, true);
      }
    }

    return res;
  };

  return {
    async list(params) {
      const qs = buildQuery(params);
      const res = await request(`${baseUrl}?${qs.toString()}`);

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to load list";
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      // 204 safety (rare for list, but safe)
      if (res.status === 204) return { items: [], meta: null };

      const payload = await res.json();

      if (Array.isArray(payload)) {
        return { items: payload, meta: null };
      }

      if (Array.isArray((payload as any).data) && !(payload as any).items) {
        return {
          items: (payload as any).data,
          meta: (payload as any).meta || (payload as any).pagination || null,
        };
      }

      return payload as ListResponse<T>;
    },

    async detail(id: CrudId) {
      const res = await request(`${baseUrl}/${id}`);

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to load detail";
        throw new CrudHttpError(String(msg), res.status, payload);
      }

      if (res.status === 204) return null as unknown as T;

      return (await res.json()) as T;
    },

    async create(data) {
      const res = await request(baseUrl, {
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

      if (res.status === 204) return null as unknown as T;

      return (await res.json()) as T;
    },

    async update(id: CrudId, data) {
      const res = await request(`${baseUrl}/${id}`, {
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

      if (res.status === 204) return null as unknown as T;

      return (await res.json()) as T;
    },

    async remove(id: CrudId) {
      const res = await request(`${baseUrl}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const payload = await readPayloadSafe(res);
        const msg = (payload && (payload.message || payload.error)) || "Failed to delete";
        throw new CrudHttpError(String(msg), res.status, payload);
      }
    },
  };
}
