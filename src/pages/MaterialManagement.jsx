import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/AuthService";
import MaterialList from "../components/MaterialList";
import { useAuth } from "../context/AuthContext";
import { useRoleMiddleware } from "../middleware/roleMiddleware";

const MaterialManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkRoleAccess } = useRoleMiddleware(user?.uid, navigate);

  // Check admin access
  React.useEffect(() => {
    const checkAccess = async () => {
      const result = await checkRoleAccess(["admin"], {
        onAccessDenied: () => {
          navigate("/dashboard", { replace: true });
        },
      });
    };

    if (user) {
      checkAccess();
    }
  }, [user, checkRoleAccess, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      alert("Gagal logout: " + error.message);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Material Management</h1>
              <p className="text-green-100 mt-2">
                Kelola materi pembelajaran untuk semua course
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                ← Kembali ke Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Material Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Kelola Materi Pembelajaran
          </h2>
          <MaterialList isAdmin={true} />
        </div>
      </div>
    </div>
  );
};

export default MaterialManagement;


