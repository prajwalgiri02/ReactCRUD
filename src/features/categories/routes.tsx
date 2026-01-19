export const categoryRoutes = {
  list: "/categories",
  create: "/categories/create",
  edit: (id: string | number) => `/categories/${id}/edit`,
}
