import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories/*" element={<CategoriesPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
