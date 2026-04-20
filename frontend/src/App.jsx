import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import Verify from "./pages/Verify";
import {
  Escrow,
  Invoices,
  TrustScore,
  Analytics,
  Profile,
} from "./pages/OtherPages";

const Protected = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
            success: {
              iconTheme: { primary: "#0B6E37", secondary: "#fff" },
              style: { border: "1px solid #d0ecd9" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#fff" },
              style: { border: "1px solid #fecaca" },
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Public QR verification — no auth */}
          <Route path="/verify/:productId" element={<Verify />} />
          <Route path="/verify/:productId/carton" element={<Verify />} />
          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/products"
            element={
              <Protected>
                <Products />
              </Protected>
            }
          />
          <Route
            path="/products/add"
            element={
              <Protected>
                <AddProduct />
              </Protected>
            }
          />
          <Route
            path="/products/:id"
            element={
              <Protected>
                <ProductDetail />
              </Protected>
            }
          />
          <Route
            path="/escrow"
            element={
              <Protected>
                <Escrow />
              </Protected>
            }
          />
          <Route
            path="/invoices"
            element={
              <Protected>
                <Invoices />
              </Protected>
            }
          />
          <Route
            path="/trust-score"
            element={
              <Protected>
                <TrustScore />
              </Protected>
            }
          />
          <Route
            path="/analytics"
            element={
              <Protected>
                <Analytics />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          Fallback
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
