# React CRUD Framework - Detailed Project Explanation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Core Concepts](#core-concepts)
5. [File Structure](#file-structure)
6. [How It Works](#how-it-works)
7. [Data Flow](#data-flow)
8. [Adding New Features](#adding-new-features)
9. [Extension Points](#extension-points)
10. [Example: Categories Feature](#example-categories-feature)

---

## 📖 Project Overview

This is a **generic CRUD (Create, Read, Update, Delete) framework** built with **React**, **TypeScript**, and **Vite**. The project was originally a Next.js application but has been converted to a standalone React application using React Router for navigation.

### What Problem Does It Solve?

In most applications, you need to manage multiple entities (users, products, categories, orders, etc.). Traditionally, you would write similar code for each entity:

- A table to display items
- Search and pagination controls
- Forms to create/edit items
- API calls to fetch/save/delete data

This project **eliminates code duplication** by providing a **generic, reusable CRUD system**. You define your data structure and API, and the framework handles the rest automatically.

### Key Benefits

✅ **No Code Duplication** - Write once, use for all entities  
✅ **Type-Safe** - Full TypeScript support  
✅ **Flexible** - Extensive customization through hooks and transformers  
✅ **Modern UI** - Beautiful components using Radix UI and Tailwind CSS  
✅ **Developer-Friendly** - Simple, intuitive API

---

## 🚀 Technology Stack

### Core Framework

- **React 18.3** - UI library
- **TypeScript** - Type safety and better developer experience
- **Vite 6** - Fast build tool and dev server
- **React Router DOM 7** - Client-side routing

### UI & Styling

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Headless, accessible UI primitives
- **Lucide React** - Beautiful icon library
- **shadcn/ui** - Pre-built component patterns (customized)

### Forms & Validation

- **React Hook Form 7.60** - Performant form management
- **Zod 3.25** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod

### Additional Libraries

- **Sonner** - Toast notifications
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional CSS class utilities

---

## 🏗️ Project Architecture

The project follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Pages Layer                     │
│  (Routes & Page Components)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Features Layer                  │
│  (Domain-specific logic & config)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         CRUD Abstraction Layer          │
│  (Generic components & logic)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         UI Components Layer             │
│  (Reusable UI primitives)               │
└─────────────────────────────────────────┘
```

### Architecture Pattern: Resource-Based CRUD

The core architectural pattern is the **Resource Pattern**:

1. **Define a Resource** - Describe how to interact with an entity (API methods)
2. **Configure Display** - Define table columns and form fields
3. **Render Generic Page** - Pass configuration to `<CrudPage />` component

This pattern allows you to add new entities with minimal code.

---

## 🧩 Core Concepts

### 1. CrudResource

A `CrudResource` is the heart of the system. It defines:

```typescript
interface CrudResource<T> {
  api: CrudApi<T>; // API methods (list, create, update, remove)
  transformIn?: (row: T) => Record<string, unknown>; // Transform DB data to form data
  transformOut?: (data: Record<string, unknown>) => Partial<T>; // Transform form data to API data
  beforeSubmit?: (data: Partial<T>) => Partial<T>; // Modify data before API call
  afterSubmit?: (ctx: { mode: "create" | "edit"; id?: CrudId; values: Partial<T> }) => void | Promise<void>; // Post-submit hook
  getDefaultValues?: () => Record<string, unknown>; // Default form values
  extra?: Record<string, (...args: any[]) => any>; // Custom methods
}
```

### 2. CrudApi

The API interface that defines how to interact with your backend:

```typescript
interface CrudApi<T> {
  list: (params: ListParams) => Promise<ListResponse<T>>; // Fetch paginated list
  detail?: (id: CrudId) => Promise<T>; // Fetch single item
  create?: (data: Partial<T>) => Promise<T>; // Create new item
  update?: (id: CrudId, data: Partial<T>) => Promise<T>; // Update existing item
  remove?: (id: CrudId) => Promise<void>; // Delete item
}
```

### 3. ListParams

Parameters for list queries (pagination, search, sorting):

```typescript
interface ListParams {
  page: number;
  perPage: number;
  sortBy?: string;
  descending?: boolean;
  search?: string;
  filters?: Record<string, unknown>;
}
```

### 4. ColumnConfig

Defines how table columns are displayed:

```typescript
interface ColumnConfig {
  key: string; // Property name
  title: string; // Column header
  render?: (row: unknown) => ReactNode; // Custom render function
}
```

---

## 📂 File Structure

```
React-CRUD/
├── src/
│   ├── App.tsx                          # Main app component with routing
│   ├── main.tsx                         # Application entry point
│   ├── index.css                        # Global styles
│   │
│   ├── crud/                            # 🔥 Core CRUD abstraction layer
│   │   ├── types.ts                     # TypeScript interfaces
│   │   ├── CrudPage.tsx                 # Generic page component
│   │   ├── createCrudResource.ts        # Resource factory function
│   │   ├── components/
│   │   │   ├── CrudTable.tsx            # Generic table with search/pagination
│   │   │   └── CrudFormModal.tsx        # Generic form modal
│   │   ├── mock/
│   │   │   ├── mockDb.ts                # In-memory mock database
│   │   │   └── mockApi.ts               # Mock API implementation
│   │   └── utils/
│   │       └── debounce.ts              # Debounce utility
│   │
│   ├── features/                        # 🎯 Domain-specific features
│   │   └── categories/
│   │       ├── index.ts                 # Category resource definition
│   │       └── CategoryPage.tsx         # Category page configuration
│   │
│   ├── pages/                           # 📄 Route pages
│   │   └── CategoriesPage.tsx           # Categories route wrapper
│   │
│   ├── components/                      # 🎨 Reusable UI components
│   │   └── ui/                          # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       └── ... (many more)
│   │
│   └── lib/                             # 🛠️ Utilities
│       └── utils.ts                     # Helper functions
│
├── public/                              # Static assets
├── package.json                         # Dependencies
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
└── tailwind.config.js                   # Tailwind CSS configuration
```

---

## ⚙️ How It Works

### Step-by-Step Workflow

#### 1. **User Navigates to a Page**

```typescript
// App.tsx
<Route path="/categories/*" element={<CategoriesPage />} />
```

#### 2. **Page Component Renders**

```typescript
// pages/CategoriesPage.tsx
export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-10">
      <CategoryFeature />
    </div>
  );
}
```

#### 3. **Feature Component Configures CrudPage**

```typescript
// features/categories/CategoryPage.tsx
export const CategoryPage: React.FC = () => {
  return (
    <CrudPage
      title="Categories"
      resource={categoryResource} // ← Resource definition
      columns={categoryColumns} // ← Column configuration
      getId={(row: any) => row.id} // ← ID extractor
      Table={CrudTable} // ← Table component
      FormModal={CrudFormModal} // ← Form component
      defaultParams={{ perPage: 12 }} // ← Default parameters
    />
  );
};
```

#### 4. **Resource Definition**

```typescript
// features/categories/index.ts
export const categoryResource = createCrudResource(mockCategoryApi, {
  transformIn: (row: any) => ({
    name: row.name,
    status: row.status,
  }),
  transformOut: (data: any) => ({
    name: data.name,
    status: data.status,
  }),
  getDefaultValues: () => ({
    name: "",
    status: "active",
  }),
  extra: {
    fetchAllForDropdown: async () => {
      const res = await mockCategoryApi.list({ page: 1, perPage: 10000 });
      return res.items.map((item: any) => ({ id: item.id, name: item.name }));
    },
  },
});
```

#### 5. **CrudPage Manages State & Logic**

The `CrudPage` component:

- ✅ Manages pagination state
- ✅ Handles search with debouncing
- ✅ Manages sorting
- ✅ Opens/closes modal
- ✅ Handles form submission
- ✅ Manages loading states
- ✅ Handles errors

#### 6. **CrudTable Displays Data**

The `CrudTable` component:

- ✅ Renders table with columns
- ✅ Provides search input
- ✅ Provides per-page selector
- ✅ Handles sorting (click column headers)
- ✅ Shows pagination controls
- ✅ Provides edit/delete actions

#### 7. **CrudFormModal Handles Forms**

The `CrudFormModal` component:

- ✅ Renders form fields
- ✅ Validates with Zod schema
- ✅ Shows validation errors
- ✅ Handles create/edit modes
- ✅ Submits data

---

## 🔄 Data Flow

### Reading Data (List View)

```
User Action (Navigate to page)
    ↓
CrudPage mounts
    ↓
useEffect triggers fetchList()
    ↓
resource.api.list(params) called
    ↓
Mock API filters/sorts/paginates data
    ↓
Returns { items: [], meta: {...} }
    ↓
CrudPage updates state (rows, meta)
    ↓
CrudTable receives rows and renders
    ↓
User sees table with data
```

### Creating/Updating Data

```
User clicks "Add New" or "Edit"
    ↓
CrudPage opens modal
    ↓
Modal shows form with initial values
  - Create: getDefaultValues()
  - Edit: transformIn(currentRow)
    ↓
User fills form and clicks "Save"
    ↓
Form validates with Zod schema
    ↓
CrudPage.handleFormSubmit() called
    ↓
transformOut() transforms form data
    ↓
beforeSubmit() modifies data (if defined)
    ↓
resource.api.create() or update() called
    ↓
afterSubmit() hook runs (if defined)
    ↓
Modal closes, list refreshes
    ↓
User sees updated table
```

### Search & Filtering

```
User types in search box
    ↓
handleSearch() called
    ↓
debouncedSearch() delays execution (500ms)
    ↓
setParams({ search: value, page: 1 })
    ↓
useEffect detects params change
    ↓
fetchList() called with new params
    ↓
API filters data based on search
    ↓
Table updates with filtered results
```

---

## 🆕 Adding New Features

Let's say you want to add a **Products** feature. Here's how:

### Step 1: Define Your Data Type

```typescript
// features/products/types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  stock: number;
  status: "active" | "inactive";
  created_at: string;
}
```

### Step 2: Create API Implementation

```typescript
// features/products/api.ts
import type { CrudApi } from "@/crud/types";
import type { Product } from "./types";

export const productApi: CrudApi<Product> = {
  async list(params) {
    // Call your backend API
    const response = await fetch(`/api/products?${new URLSearchParams(params)}`);
    return response.json();
  },

  async create(data) {
    const response = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async remove(id) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  },
};
```

### Step 3: Create Resource

```typescript
// features/products/index.ts
import { createCrudResource } from "@/crud/createCrudResource";
import { productApi } from "./api";

export const productResource = createCrudResource(productApi, {
  transformIn: (row) => ({
    name: row.name,
    price: row.price,
    category_id: row.category_id,
    stock: row.stock,
    status: row.status,
  }),

  transformOut: (data) => ({
    name: data.name,
    price: Number(data.price),
    category_id: data.category_id || null,
    stock: Number(data.stock),
    status: data.status,
  }),

  getDefaultValues: () => ({
    name: "",
    price: 0,
    category_id: null,
    stock: 0,
    status: "active",
  }),
});
```

### Step 4: Define Columns

```typescript
// features/products/ProductPage.tsx
import { ColumnConfig } from "@/crud/types";
import { Badge } from "@/components/ui/badge";

const productColumns: ColumnConfig[] = [
  { key: "id", title: "ID" },
  { key: "name", title: "Product Name" },
  {
    key: "price",
    title: "Price",
    render: (row: any) => `$${row.price.toFixed(2)}`,
  },
  { key: "stock", title: "Stock" },
  {
    key: "status",
    title: "Status",
    render: (row: any) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>,
  },
];
```

### Step 5: Create Page Component

```typescript
// features/products/ProductPage.tsx
import { CrudPage } from "@/crud/CrudPage";
import { CrudTable } from "@/crud/components/CrudTable";
import { CrudFormModal } from "@/crud/components/CrudFormModal";
import { productResource } from "./index";

export const ProductPage: React.FC = () => {
  return (
    <CrudPage
      title="Products"
      resource={productResource}
      columns={productColumns}
      getId={(row: any) => row.id}
      Table={CrudTable}
      FormModal={CrudFormModal}
      defaultParams={{ perPage: 12 }}
    />
  );
};
```

### Step 6: Add Route

```typescript
// App.tsx
import ProductsPage from "./pages/ProductsPage";

<Routes>
  <Route path="/categories/*" element={<CategoriesPage />} />
  <Route path="/products/*" element={<ProductsPage />} /> {/* ← New route */}
</Routes>;
```

### Step 7: Create Route Wrapper

```typescript
// pages/ProductsPage.tsx
import { ProductPage } from "@/features/products/ProductPage";

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-10">
      <ProductPage />
    </div>
  );
}
```

**That's it!** You now have a fully functional Products CRUD page with:

- ✅ Paginated table
- ✅ Search functionality
- ✅ Sorting
- ✅ Create/Edit forms
- ✅ Delete functionality

---

## 🔌 Extension Points

The framework provides multiple extension points for customization:

### 1. **transformIn** - Transform DB Data to Form Data

Use when your database structure differs from your form structure.

```typescript
transformIn: (row) => ({
  // Convert date string to Date object
  birthdate: new Date(row.birthdate),
  // Split full name into first/last
  firstName: row.full_name.split(" ")[0],
  lastName: row.full_name.split(" ")[1],
});
```

### 2. **transformOut** - Transform Form Data to API Data

Use to prepare form data before sending to API.

```typescript
transformOut: (data) => ({
  // Combine first/last name
  full_name: `${data.firstName} ${data.lastName}`,
  // Convert Date to ISO string
  birthdate: data.birthdate.toISOString(),
});
```

### 3. **beforeSubmit** - Modify Data Before API Call

Use for last-minute data modifications or cleanup.

```typescript
beforeSubmit: (data) => ({
  ...data,
  // Trim whitespace
  name: data.name.trim(),
  // Ensure lowercase email
  email: data.email.toLowerCase(),
});
```

### 4. **afterSubmit** - Post-Submission Hook

Use for side effects after successful submission.

```typescript
afterSubmit: async ({ mode, id, values }) => {
  if (mode === "create") {
    // Show success notification
    toast.success("Product created successfully!");

    // Log analytics event
    analytics.track("product_created", { id });
  }
};
```

### 5. **getDefaultValues** - Default Form Values

Use to provide initial form values for creation.

```typescript
getDefaultValues: () => ({
  name: "",
  status: "active",
  category_id: null,
  price: 0,
  // Pre-fill with current date
  created_date: new Date().toISOString().split("T")[0],
});
```

### 6. **extra** - Custom Methods

Use to add custom methods to your resource.

```typescript
extra: {
  // Fetch all for dropdown
  fetchAllForDropdown: async () => {
    const res = await api.list({ page: 1, perPage: 10000 });
    return res.items.map(item => ({ id: item.id, name: item.name }));
  },

  // Bulk operations
  bulkDelete: async (ids: number[]) => {
    await Promise.all(ids.map(id => api.remove(id)));
  },

  // Export to CSV
  exportToCsv: async () => {
    const res = await api.list({ page: 1, perPage: 10000 });
    return convertToCsv(res.items);
  },
}
```

### 7. **extraRowActions** - Custom Row Actions

Add custom actions to table rows.

```typescript
<CrudPage
  // ... other props
  extraRowActions={(row: any) => <DropdownMenuItem onClick={() => handleDuplicate(row)}>Duplicate</DropdownMenuItem>}
/>
```

### 8. **extraFormActions** - Custom Form Actions

Add custom buttons to the form modal.

```typescript
<CrudPage
  // ... other props
  extraFormActions={({ mode, currentRow }) =>
    mode === "edit" && (
      <Button variant="outline" onClick={() => handlePreview(currentRow)}>
        Preview
      </Button>
    )
  }
/>
```

---

## 📚 Example: Categories Feature

Let's examine the complete Categories feature implementation:

### Resource Definition

```typescript
// features/categories/index.ts
export const categoryResource = createCrudResource(mockCategoryApi, {
  // Transform database row to form values
  transformIn: (row: any) => ({
    name: row.name,
    status: row.status,
  }),

  // Transform form values to API payload
  transformOut: (data: any) => ({
    name: data.name,
    status: data.status,
  }),

  // Default values for new category
  getDefaultValues: () => ({
    name: "",
    status: "active",
  }),

  // Custom method for fetching all categories
  extra: {
    fetchAllForDropdown: async () => {
      const res = await mockCategoryApi.list({ page: 1, perPage: 10000 });
      const options = res.items.map((item: any) => ({
        id: item.id,
        name: item.name,
      }));
      return [{ id: null, name: "None" }, ...options];
    },
  },
});
```

### Column Configuration

```typescript
// features/categories/CategoryPage.tsx
const categoryColumns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  {
    key: "status",
    title: "Status",
    render: (row: any) => <Badge variant={row.status === "active" ? "default" : "secondary"}>{row.status}</Badge>,
  },
  {
    key: "created_at",
    title: "Created",
    render: (row: any) => new Date(row.created_at).toLocaleDateString(),
  },
];
```

### Page Component

```typescript
// features/categories/CategoryPage.tsx
export const CategoryPage: React.FC = () => {
  return (
    <CrudPage
      title="Categories"
      resource={categoryResource}
      columns={categoryColumns}
      getId={(row: any) => row.id}
      Table={CrudTable}
      FormModal={CrudFormModal}
      defaultParams={{ perPage: 12 }}
    />
  );
};
```

### Mock API Implementation

```typescript
// crud/mock/mockApi.ts
export const mockCategoryApi = {
  async list(params: ListParams): Promise<ListResponse<Category>> {
    await sleep(200); // Simulate network delay

    let items = [...mockDb.categories];

    // Search filtering
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(searchLower));
    }

    // Sorting
    if (params.sortBy) {
      items.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Category];
        const bVal = b[params.sortBy as keyof Category];

        if (typeof aVal === "string") {
          return params.descending ? bVal.localeCompare(aVal as string) : aVal.localeCompare(bVal as string);
        }

        return params.descending ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
      });
    }

    // Pagination
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
```

---

## 🎯 Summary

This React CRUD framework provides:

1. **Generic Components** - Reusable `CrudPage`, `CrudTable`, and `CrudFormModal`
2. **Type-Safe API** - Full TypeScript support with interfaces
3. **Flexible Architecture** - Multiple extension points for customization
4. **Modern UI** - Beautiful, accessible components
5. **Developer Experience** - Simple API, minimal boilerplate

### When to Use This Framework

✅ Admin panels  
✅ Data management interfaces  
✅ Internal tools  
✅ Dashboards with CRUD operations  
✅ Prototypes and MVPs

### When NOT to Use This Framework

❌ Complex, highly customized UIs  
❌ Non-CRUD workflows  
❌ Public-facing applications with unique designs

---

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

4. **Start building:**
   Follow the "Adding New Features" guide to create your first entity!

---

**Happy Coding! 🎉**
