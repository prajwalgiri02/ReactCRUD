# Project Overview

This is a **Next.js** application designed as a robust **CRUD (Create, Read, Update, Delete)** framework. It uses a modern tech stack and a custom abstraction layer to rapidly build data-management interfaces.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Headless primitives) with custom styling (likely shadcn/ui inspired).
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: `react-hook-form` + `zod` validation.
- **Charts**: `recharts`

## 📂 Project Structure

- **`app/`**: Contains the Next.js App Router pages and layouts.
  - `page.tsx`: The main dashboard/landing page.
  - `globals.css`: Global styles and Tailwind directives.
- **`crud/`**: The core abstraction layer for the application.
  - `CrudPage.tsx`: A generic page component that handles the viewing, searching, pagination, and modal state for any resource.
  - `types.ts`: Defines the interfaces (`CrudResource`, `ColumnConfig`, `CrudApi`) that drive the generic components.
  - `components/`: Generic components used by `CrudPage` (e.g., `CrudTable`, `CrudFormModal`).
- **`features/`**: Contains domain-specific feature logic.
  - Example: `features/categories/`
    - `CategoryPage.tsx`: Configures the `CrudPage` for the "Categories" feature.
    - `index.ts`: Likely exports the API/Resource definition.
- **`components/`**: Reusable UI components (buttons, inputs, cards, etc.).
- **`lib/`**: Utility functions and shared helpers.

## 🏗️ Architecture

The project employs a **data-driven architecture** for its CRUD pages. Instead of duplicating logic for every entity (Categories, Users, Products, etc.), the application uses a **Resource Pattern**:

1.  **Define the Resource**: You define how to fetch, create, update, and delete a specific entity.
2.  **Define Configuration**: You describe how the table columns should look and how the form should behave.
3.  **Render generic generic Page**: You pass this configuration to the `<CrudPage />` component, which handles the rest.

### Key Types (`crud/types.ts`)

- **`CrudResource<T>`**: An object containing the API methods (`list`, `create`, `update`, `remove`) and optional data transformers.
- **`ColumnConfig`**: Defines table columns (`key`, `title`, `render`).

## 🛠️ How to Add a New Feature

To add a new feature (e.g., "Products"), follow this pattern:

1.  **Create Feature Directory**: Create `features/products/`.
2.  **Define Types & API**: Create types for your product and implement the `CrudApi` interface (fetching data from your backend or mock).
3.  **Create Resource**: Export a `productResource` object conforming to `CrudResource`.
4.  **Create Page Component**:
    - Create `ProductsPage.tsx`.
    - Define your table `columns`.
    - Return `<CrudPage resource={productResource} columns={columns} ... />`.
5.  **Add Route**:
    - Create `app/products/page.tsx`.
    - Import and render your `ProductsPage` component.

## 🏁 Getting Started

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Run development server**:

    ```bash
    npm run dev
    ```

3.  **Open in browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).
