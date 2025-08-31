import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUserData } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import { useRoleMiddleware } from "../middleware/roleMiddleware";
import CourseList from "../components/CourseList";
import MaterialList from "../components/MaterialList";
import { ProgressService } from "../services/ProgressService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);

  const { checkRoleAccess } = useRoleMiddleware(user?.uid, navigate);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          console.log("Loading user data for UID:", user.uid);
          console.log("User Role from Context:", userRole);

          const data = await getUserData(user.uid);
          const progress = await ProgressService.getUserProgress(user.uid);

          console.log("User UID:", user.uid);
          console.log("User Data:", data);
          console.log("User Progress:", progress);

          setUserData(data);
          setUserProgress(progress);

          // Jika user adalah admin, redirect ke admin dashboard
          if (userRole === "admin") {
            console.log("User is admin, redirecting to admin dashboard");
            navigate("/admin/dashboard", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user && userRole) {
      loadUserData();
    }
  }, [user, userRole, navigate]);

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
        
        {/* Welcome Message */}
        {userRole !== "admin" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Selamat Datang di ZulfiCourse!
              </h3>
              <p className="text-blue-700">
                Silahkan pilih course yang ingin anda pelajari.
              </p>
            </div>
          </div>
        )}

        {/* Available Courses */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Course yang Tersedia
          </h2>
          <CourseList isAdmin={false} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
