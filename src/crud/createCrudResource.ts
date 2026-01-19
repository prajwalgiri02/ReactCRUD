import type { CrudApi, CrudResource } from "./types";

export function createCrudResource<T>(api: CrudApi<T>, options?: Omit<CrudResource<T>, "api">): CrudResource<T> {
  return {
    api,
    ...options,
  };
}
  