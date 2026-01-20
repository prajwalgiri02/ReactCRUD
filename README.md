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

This project is designed as a **Generic Admin Panel Boilerplate**.

👉 **[Read the Usage Guide](./docs/how_to_use_boilerplate.md)** to learn how to add your own CRUD features.

## 🛠 Features

- **Generic CRUD Components**: Reusable `CrudPage` and `CrudTable` for consistent UI.
- **Type-Safe Resources**: Strong TypeScript integration for safe API interactions.
- **Shadcn/UI**: Beautiful, accessible components based on Radix UI.
- **React Hook Form**: Performant form handling with Zod validation.

## 📁 Project Structure

- `src/crud`: Core generic logic (Don't modify this often).
- `src/features`: Domain specific CRUD features (e.g., Categories).
- `src/components/ui`: Reusable UI components.
