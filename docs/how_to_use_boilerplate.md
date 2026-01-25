# How to Use This Boilerplate

This project is designed for rapid CRUD development. Use the automated tools whenever possible to save time and ensure consistency.

## ⚡ The Fast Way: Automated Generation

The easiest way to add a new feature is to use the `gen:feature` script.

```bash
npm run gen:feature <plural-name> [PascalEntityName] [fields]
```

### Example

```bash
npm run gen:feature categories Category "name:text,slug:text,image:image"
```

This command will:

1. Create all necessary files in `src/features/categories/`.
2. Create all necessary pages in `src/app/(dashboard)/categories/`.
3. Set up the API layer, types, and schema automatically.

---

## 🛠 The Manual Way: Fallback

If you need a highly custom structure, you can add a feature manually by following these steps:

### 1. Define the Type

Create `src/features/products/types.ts`:

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

### 2. Create the API & Resource

Create `src/features/products/index.ts`:

```typescript
import { createRestCrudApi } from "@/crud/createCrudResource";
import { createCrudResource } from "@/crud/types";
import { Product } from "./types";

const api = createRestCrudApi<Product>("/api/products");
export const productResource = createCrudResource(api);
```

### 3. Define the Schema

Create `src/features/products/schema.tsx`:

```tsx
import { FieldConfig } from "@/crud/types";
import { fieldsToColumns } from "@/crud/utils/fieldsToColumns";

export const productFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "price", label: "Price", type: "number" },
];

export const productColumns = fieldsToColumns(productFields);
```

### 4. Create the Pages

Use `CrudPage` for listing and `GenericFormPage` for create/edit. Refer to existing features for the boilerplate code.

---

## 🏗 Core Components

- **`CrudPage`**: The entry point for listing data. Handles search, pagination, and delete actions.
- **`GenericFormPage`**: Handles both Create and Edit workflows.
- **`createRestCrudApi`**: A standardized way to talk to your backend.

## 🎨 Field Types

Available field types in `FieldConfig`:

- `text`: Standard input.
- `number`: Numeric input.
- `select`: Dropdown (requires `options`).
- `textarea`: WYSIWYG editor.
- `checkbox`: Boolean toggle.
- `date`: Date picker.
