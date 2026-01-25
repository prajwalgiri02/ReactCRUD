# 🚀 Generic CRUD Frontend Boilerplate

A high-performance, developer-focused **Next.js 16** boilerplate designed to build admin dashboards in record time. It features a robust generic CRUD system that handles data fetching, table rendering, pagination, and form management with minimal boilerplate.

---

## 🛠 Features

- **⚡ Feature Generator**: Generate an entire CRUD feature (API, Types, Schema, Pages, and Routes) in seconds with a single command.
- **🏗 Generic Architecture**: Decoupled UI logic using `CrudPage` and `GenericFormPage` components.
- **✨ Rich Field Support**: Includes Text, Number, Select, Checkbox, Date, and Tiptap-powered WYSIWYG editors.
- **🔗 End-to-End Type Safety**: Strong TypeScript integration from the API layer to the UI components.
- **📦 Backend Agnostic**: Optimized for Laravel-style responses (422 errors, pagination) but flexible enough for any JSON API.
- **🎨 Premium UI**: Styled with **Tailwind CSS 4** and **Shadcn/UI** for a sleek, modern look.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### 3. Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000` to see the dashboard.

---

## ⚡ Generating a New Feature

Stop writing boilerplate. Use the automation script to create new features instantly.

### Command Syntax

```bash
npm run gen:feature <plural-name> [PascalEntityName] [fields]
```

### Example

To create a **Products** management system:

```bash
npm run gen:feature products Product "name:text,price:number,description:textarea,image:image,active:checkbox"
```

**What this generates:**

1. **Feature Folder** (`src/features/products/`):
   - `types.ts`: Interface definitions.
   - `index.ts`: API instantiation.
   - `schema.tsx`: Table columns and Form field definitions.
   - `ListPage.tsx` & `FormPage.tsx`: The high-level UI components.
2. **App Routes** (`src/app/(dashboard)/products/`):
   - `page.tsx`: Listing page.
   - `create/page.tsx`: Creation page.
   - `[id]/edit/page.tsx`: Edit page.

---

## 🏗 Architecture & Handling

### 1. The CRUD Core (`src/crud`)

The engine of the boilerplate. You rarely need to touch this.

- **`createRestCrudApi`**: A powerful fetcher that handles pagination, sorting, search, and validation errors.
- **`CrudPage`**: A generic container that manages list fetching, table state, and navigation.
- **`GenericFormPage`**: A flexible form handler that handles both Create and Edit modes automatically.

### 2. Feature Definitions (`schema.tsx`)

This is the "Source of Truth" for your feature. Here you define:

- **Columns**: Which fields show up in the table and how they are rendered (e.g., custom image renders).
- **Form Fields**: Labels, placeholders, and types for the input fields.

### 3. API Integration

The system expects standard REST operations:

- `GET /resource`: Returns `{ data: [...], meta: { ... } }` or `[...]`.
- `GET /resource/:id`: Returns the entity.
- `POST /resource`: Creates an entity.
- `PUT /resource/:id`: Updates the entity.
- `DELETE /resource/:id`: Removes the entity.

---

## 🎨 Customizing the UI

### Adding custom fields

If you need a special input (e.g., a File Upload):

1. Create your component in `src/crud/components/fields/`.
2. Add it to the switch case in `src/crud/components/GenericFormPage.tsx`.

### Custom Table Cells

In your feature's `schema.tsx`, you can override any column's `render` function:

```tsx
export const categoryColumns = base.map((c) => {
  if (c.key === "price") {
    return { ...c, render: (row) => <span>${row.price.toFixed(2)}</span> };
  }
  return c;
});
```

---

## 📖 Useful Scripts

- `npm run dev`: Start development mode.
- `npm run build`: Build for production.
- `npm run gen:feature`: Run the feature generator.
- `npm run lint`: Run ESLint.

---

Made with ❤️ for rapid development.
