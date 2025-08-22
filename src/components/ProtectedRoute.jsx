// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Tahan render sampai status auth diketahui
  if (loading) return null;

  // kalau tidak ada user, redirect ke login
  if (!user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
