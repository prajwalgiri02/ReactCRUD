import { createCrudResource } from "@/crud/createCrudResource";
import { mockCategoryApi } from "@/crud/mock/mockApi";

export const categoryResource = createCrudResource(mockCategoryApi, {
  getDefaultValues: () => ({
    name: "",
    status: "active",
  }),
  extra: {
    fetchAllForDropdown: async () => {
      // Simulate fetching all by asking for a large page
      const res = await mockCategoryApi.list({ page: 1, perPage: 10000 });
      const options = res.items.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      return [{ id: null, name: "None" }, ...options];
    },
  },
});
