# Generic CRUD Frontend

This is a **Next.js 16** project utilizing a generic CRUD system to rapidly build admin interfaces.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Documentation

For a detailed guide on how to use the CRUD system, available components, and architecture, please refer to [PROJECT_CAPABILITIES.md](./PROJECT_CAPABILITIES.md).

## 🛠 Features

- **Generic CRUD Components**: Reusable `CrudPage` and `CrudTable` for consistent UI.
- **Type-Safe Resources**: Strong TypeScript integration for safe API interactions.
- **Shadcn/UI**: Beautiful, accessible components based on Radix UI.
- **React Hook Form**: Performant form handling with Zod validation.
- **Bulk Actions**: Built-in support for multi-row operations.

## 📁 Project Structure

- `src/crud`: Core generic logic (Don't modify this often).
- `src/features`: Domain specific CRUD features (e.g., Categories).
- `src/components/ui`: Reusable UI components.
