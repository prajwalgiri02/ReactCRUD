import type { ListParams, ListResponse, CrudId } from "../types";
import { mockDb, type Category } from "./mockDb";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCategoryApi = {
  async list(params: ListParams): Promise<ListResponse<Category>> {
    await sleep(200);

    let items = [...mockDb.categories];

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(searchLower));
    }

    if (params.sortBy) {
      items.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Category];
        const bVal = b[params.sortBy as keyof Category];

        if (typeof aVal === "string") {
          const bValStr = String(bVal);
          return params.descending ? bValStr.localeCompare(aVal) : aVal.localeCompare(bValStr);
        }

        return params.descending ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
      });
    }

    const total = items.length;
    const perPage = params.perPage || 12;
    const page = params.page || 1;
    const lastPage = Math.ceil(total / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    const paginatedItems = items.slice((page - 1) * perPage, page * perPage);

    return {
      items: paginatedItems,
      meta: {
        current_page: page,
        per_page: perPage,
        last_page: lastPage,
        total,
        from,
        to,
      },
    };
  },

  async detail(id: CrudId): Promise<Category> {
    await sleep(200);
    const item = mockDb.categories.find((c) => c.id === id);
    if (!item) throw new Error("Not found");
    return item;
  },

  async create(data: Partial<Category>): Promise<Category> {
    await sleep(200);
    const newItem: Category = {
      id: Math.max(...mockDb.categories.map((c) => c.id), 0) + 1,
      name: data.name || "",
      status: data.status || "active",
      created_at: new Date().toISOString(),
    };
    mockDb.categories.push(newItem);
    return newItem;
  },

  async update(id: CrudId, data: Partial<Category>): Promise<Category> {
    await sleep(200);
    const item = mockDb.categories.find((c) => c.id === id);
    if (!item) throw new Error("Not found");
    Object.assign(item, data);
    return item;
  },

  async remove(id: CrudId): Promise<void> {
    await sleep(200);
    const idx = mockDb.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Not found");
    mockDb.categories.splice(idx, 1);
  },
};
