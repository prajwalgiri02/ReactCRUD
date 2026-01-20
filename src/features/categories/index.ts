import { createRestCrudApi } from "@/crud/createCrudResource";
import { createCrudResource } from "@/crud/types";
import type { Category } from "@/crud/mock/mockDb";

const baseUrl = (process.env.API_BASE_URL || "/api") + "/categories";
const api = createRestCrudApi<Category>(baseUrl);

export const categoryResource = createCrudResource(api);
