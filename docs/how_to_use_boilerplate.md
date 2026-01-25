# CRUD Admin Boilerplate – Usage Guide

This boilerplate is a **generic admin panel** designed to help you build CRUD (Create, Read, Update, Delete) interfaces extremely fast, with almost no repetitive work.

You can build features **manually** or use the **built-in scaffold generator** (recommended).

---

# 🚀 Quick Start (Recommended)

Use the generator to create a complete feature in seconds.

```bash
npm run gen:feature -- products Product "title:text,slug:text,description:textarea,price:number,image:text,creationAt:date,updatedAt:date"
```

This single command creates:

```
src/features/products/
  types.ts
  schema.tsx
  routes.ts
  index.ts
  ProductListPage.tsx
  ProductFormPage.tsx

src/app/(dashboard)/products/
  page.tsx
  create/page.tsx
  [id]/edit/page.tsx
```

Your feature is now fully functional with:

- list page
- create form
- edit form
- API integration
- routing

---

# 📦 Generated File Responsibilities

## 1️⃣ `types.ts` – Backend Contract

This file represents the **real backend response**. It must always match your API.

```ts
export interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  image: string;
  creationAt: string;
  updatedAt: string;
}
```

---

## 2️⃣ `schema.tsx` – Source of Truth

Controls:

- form fields
- table columns
- render logic
- visibility rules

```ts
export const productFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "description", type: "textarea", showInTable: false },
  { name: "price", type: "number" },
];
```

### Visibility Rules

```ts
showInTable: false; // hidden from table
showInForm: false; // hidden from form
```

---

## 3️⃣ `index.ts` – Resource Definition

Connects schema + types to your API.

```ts
import type { Product } from "./types";

const api = createRestCrudApi<Product>("/api/products");
export const productResource = createCrudResource(api);
```

---

## 4️⃣ `ProductListPage.tsx`

Generic list page (table, filters, bulk actions, pagination).

No custom logic required.

---

## 5️⃣ `ProductFormPage.tsx`

Handles both create and edit automatically.

---

## 6️⃣ App Router Pages

Generated automatically:

```
/products
/products/create
/products/[id]/edit
```

No manual routing required.

---

# ✍️ Manual Setup (Optional)

If you prefer manual setup, follow this flow:

## 1. Create feature folder

```
src/features/products/
```

## 2. Create `types.ts`

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

## 3. Create `index.ts`

```ts
import type { Product } from "./types";
const api = createRestCrudApi<Product>("/api/products");
export const productResource = createCrudResource(api);
```

## 4. Create schema

```ts
export const productFields = [
  { name: "name", type: "text" },
  { name: "price", type: "number" },
];
```

## 5. Create route page

```tsx
import { ProductListPage } from "@/features/products/ProductListPage";
export default function Page() {
  return <ProductListPage />;
}
```

---

# 🧠 How the Architecture Works

```
API → types.ts → schema.tsx → resource → pages
```

- **types.ts** = backend truth
- **schema.tsx** = UI truth
- **resource** = API wiring
- **pages** = wrappers only

---

# 🎯 Best Practices

- Always use the generator for new features
- Keep backend types inside each feature
- Treat schema as the single source of truth
- Use visibility flags instead of custom logic
- Never use mock data in production

---

# 🔧 Advanced Generator Usage

## Overwrite existing feature

```bash
npm run gen:feature -- products Product "title:text,price:number" --force
```

## Generate orders

```bash
npm run gen:feature -- orders Order "userId:number,orderNumber:text,status:text,total:number,creationAt:date"
```

---

# 🧩 What You Can Extend

- relations (auto select from other resources)
- enums (status, roles)
- file uploads
- readonly fields
- audit fields
- permissions

---

This boilerplate is designed to scale from **small dashboards to large admin systems** with zero rewrite.
