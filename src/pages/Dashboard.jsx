import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkUserRole, getUserData } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import { useRoleMiddleware } from "../middleware/roleMiddleware";
import CourseList from "../components/CourseList";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { checkRoleAccess } = useRoleMiddleware(user?.uid, navigate);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const role = await checkUserRole(user.uid);
          const data = await getUserData(user.uid);
          setUserRole(role);
          setUserData(data);
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      alert("Gagal logout: " + error.message);
    }
  };

  const checkAdminAccess = async () => {
    const result = await checkRoleAccess(["admin"], {
      onAccessGranted: (role) => {
        alert(`Access granted! Your role: ${role}`);
      },
      onAccessDenied: (userRole, requiredRoles) => {
        alert(
          `Access denied. Your role: ${userRole}, Required: ${requiredRoles.join(
            ", "
          )}`
        );
      },
    });

    console.log("Access check result:", result);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-blue-100 mt-2">
            Selamat datang di dashboard pengguna
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Informasi User
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium capitalize">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    userRole === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userRole || "Loading..."}
                </span>
              </p>
            </div>
            {userData && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Bergabung Sejak</p>
                  <p className="font-medium">
                    {userData.createdAt
                      ?.toDate?.()
                      ?.toLocaleDateString("id-ID") || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Login Terakhir</p>
                  <p className="font-medium">
                    {userData.lastLogin
                      ?.toDate?.()
                      ?.toLocaleDateString("id-ID") || "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={checkAdminAccess}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Admin Access
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Profile
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Settings
            </button>
            {userRole === "admin" && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Role-based Content */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Content Berdasarkan Role
          </h2>

          {userRole === "admin" ? (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">
                Admin Content
              </h3>
              <p className="text-purple-700">
                Anda memiliki akses penuh sebagai admin. Anda bisa mengakses
                semua fitur dan mengelola user lain.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800 mb-2">
                User Content
              </div>
              <p className="text-blue-700 mb-4">
                Anda adalah user biasa. Akses terbatas pada fitur-fitur dasar.
              </p>
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Course yang Tersedia
          </h2>
          <CourseList isAdmin={false} />
        </div>

        {/* Logout Button */}
        <div className="flex justify-end">
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

export default Dashboard;
