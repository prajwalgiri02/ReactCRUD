import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { CategoryListPage } from "@/features/categories/CategoryListPage";
import { CategoryFormPage } from "@/features/categories/CategoryFormPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route path="/categories" element={<CategoryListPage />} />
          <Route path="/categories/create" element={<CategoryFormPage />} />
          <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
          <Route path="*" element={<div className="p-6 text-center text-muted-foreground">404 - Page Not Found</div>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
