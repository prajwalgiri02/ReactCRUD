# How to Use This Boilerplate

This project is a generic admin panel aimed at allowing you to rapidly build CRUD interfaces.

## Adding a New Feature

To add a new feature (e.g., "Products"), follow these steps:

### 1. Define the Type

Create a type definition for your resource in `src/features/products/types.ts` (create the directory if needed).

```typescript
export type Product = {
  id: string;
  name: string;
  price: number;
  // ... other fields
};
```

### 2. Create the Resource Definition

Create a `resource.tsx` file in `src/features/products/resource.tsx`. This is where the magic happens. You define your columns and form fields here.

```typescript
import { createCrudResource } from "@/crud/createCrudResource";
import { Product } from "./types";

export const productResource = createCrudResource<Product>({
  queryKey: "products",
  apiEndpoint: "/api/products", // Your API endpoint
  columns: [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price" },
  ],
  form: {
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "price", label: "Price", type: "number" },
    ],
  },
});
```

### 3. Create the Page

Create `src/features/products/ProductListPage.tsx` which uses the generic `CrudPage`.

```tsx
"use client";

import CrudPage from "@/crud/CrudPage";
import { productResource } from "./resource";

export default function ProductListPage() {
  return <CrudPage resource={productResource} />;
}
```

### 4. Add the Route

Create `src/app/products/page.tsx`:

```tsx
import ProductListPage from "@/features/products/ProductListPage";

export default function Page() {
  return <ProductListPage />;
}
```

### 5. Update Sidebar

Add your new link to `src/components/layout/Sidebar.tsx`.

```tsx
{ to: "/products", label: "Products", icon: Package },
```

## Generic Components

The core logic lies in `src/crud`.

- `CrudPage`: The main container.
- `CrudTable`: The data table.
- `createCrudResource`: Helper to define metadata.

## Styling

Components use **shadcn/ui** and **Tailwind CSS**. You can customize them in `src/components/ui`.
