// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, userRole, loading } = useAuth();

  // Tahan render sampai status auth dan role diketahui
  if (loading) return null;

  // kalau tidak ada user, redirect ke login
  if (!user) return <Navigate to="/" replace />;

  // Jika rute admin-only dan user bukan admin, redirect ke dashboard
  if (adminOnly && userRole !== "admin") {
    console.log("ProtectedRoute - Access denied for non-admin user. Role:", userRole);
    return <Navigate to="/dashboard" replace />;
  }

  // Jika user adalah admin dan mencoba mengakses halaman user biasa
  if (!adminOnly && userRole === "admin") {
    console.log("ProtectedRoute - Admin accessing user page, redirecting to admin dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("ProtectedRoute - Access granted. Role:", userRole);
  return children;
};

export default ProtectedRoute;
