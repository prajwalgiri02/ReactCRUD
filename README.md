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

#### 1. CrudResource

A `CrudResource` defines how to interact with an entity. It includes API methods and optional hooks for transformation and submission logic.

```typescript
export interface CrudResource<T> {
  api: CrudApi<T>;
  transformIn?: (row: T) => Record<string, unknown>;
  transformOut?: (data: Record<string, unknown>) => Partial<T>;
  beforeSubmit?: (data: Partial<T>) => Partial<T>;
  afterSubmit?: (ctx: { mode: "create" | "edit"; id?: CrudId; values: Partial<T> }) => void | Promise<void>;
  getDefaultValues?: () => Record<string, unknown>;
  extra?: Record<string, (...args: any[]) => any>;
}
```

### 2. FieldConfig

Defines form fields and their rendering. The `GenericFormPage` uses this to build the form UI automatically.

```typescript
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "date";
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  render?: (props: { value: any; onChange: (value: any) => void; error?: string }) => ReactNode;
}
```

### 3. Zod Schema

Used for validation. The `GenericFormPage` validates the entire form against this schema before submission.

---

## � File Structure

```
src/
├── crud/                      # 🔥 Core CRUD abstraction layer
│   ├── types.ts               # Central type definitions
│   ├── CrudPage.tsx           # Generic list page orchestrator
│   ├── createCrudResource.ts  # Resource factory
│   ├── components/
│   │   ├── CrudTable.tsx      # Generic table with search/pagination
│   │   ├── GenericFormPage.tsx # 🔥 New schema-driven form page
│   │   └── fields/            # Reusable field renderers
│   └── mock/                  # Mock data and APIs
│
├── features/                  # � Domain-specific features
│   └── categories/
│       ├── index.ts           # Resource definition
│       ├── CategoryListPage.tsx # List page configuration
│       ├── CategoryFormPage.tsx # Form page configuration
│       ├── columns.tsx        # Table column definitions
│       ├── schema.ts          # 🔥 Form schema & field config
│       └── routes.tsx         # Feature route constants
```

---

## 🆕 Adding New Features (The 5-Minute Entity)

Adding a new entity now requires minimal code. Here's the checklist for a **Products** feature:

### 1. Define Schema & Fields (`schema.ts`)

```typescript
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0),
});

export const productFields: FieldConfig[] = [
  { name: "name", label: "Product Name", type: "text" },
  { name: "price", label: "Price", type: "number" },
];
```

### 2. Define Resource (`index.ts`)

```typescript
export const productResource = createCrudResource(productApi, {
  getDefaultValues: () => ({ name: "", price: 0 }),
});
```

### 3. Setup List & Form Pages

Create `ProductListPage.tsx` and `ProductFormPage.tsx` using the generic components. They usually only need ~15 lines of code.

### 4. Register Routes in `App.tsx`

```typescript
<Route path="/products" element={<ProductListPage />} />
<Route path="/products/create" element={<ProductFormPage />} />
<Route path="/products/:id/edit" element={<ProductFormPage />} />
```

---

## 🔄 Data Flow (Separate Pages)

1.  **List View**: `CrudPage` fetches data via `api.list` and renders `CrudTable`.
2.  **Create/Edit**: Navigation to `/create` or `/:id/edit` renders `CategoryFormPage`.
3.  **Form Logic**: `GenericFormPage` orchestrates initial loading (`api.detail`), validation (Zod), transformation, and submission.
4.  **Completion**: After successful submit, the user is navigated back to the list page.

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
