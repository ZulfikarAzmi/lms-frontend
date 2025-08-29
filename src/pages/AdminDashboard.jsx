import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import CourseList from "../components/CourseList";
import MaterialList from "../components/MaterialList";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAdminAccess = async () => {
      if (user && userRole) {
        try {
          console.log("Validating admin access for user:", user.uid);
          console.log("User role in AdminDashboard from context:", userRole);

          if (userRole !== "admin") {
            console.log("User is not admin, redirecting to user dashboard");
            navigate("/dashboard", { replace: true });
            return;
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error validating admin access:", error);
          navigate("/dashboard", { replace: true });
        }
      }
    };

    if (!authLoading) {
      validateAdminAccess();
    }
  }, [user, userRole, authLoading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return null; // Will redirect
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      alert("Gagal logout: " + error.message);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-purple-100 mt-2">
            Selamat datang di panel administrasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">Pengguna terdaftar</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Active Sessions
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">Sesi aktif</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              System Status
            </h3>
            <p className="text-3xl font-bold text-purple-600">Online</p>
            <p className="text-sm text-gray-500">Sistem berjalan normal</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Manage Users
            </button>
            <button
              onClick={() => navigate("/admin/materials")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Materials
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              View Logs
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Emergency Stop
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Course Management
          </h2>
          <CourseList isAdmin={true} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
