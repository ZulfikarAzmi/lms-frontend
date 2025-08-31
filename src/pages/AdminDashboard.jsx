import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/AuthService";
import { useNavigate, Link } from "react-router-dom";
import CourseList from "../components/CourseList";
import { CourseService } from "../services/CourseService"; // ⬅️ pakai service yang sudah ada

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // state untuk section Quiz (daftar course)
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");

  useEffect(() => {
    const validateAdminAccess = async () => {
      if (user && userRole) {
        try {
          if (userRole !== "admin") {
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

  // fetch semua course khusus buat section Quiz
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCourseLoading(true);
        const data = await CourseService.getAllCourses();
        setCourses(data || []);
      } catch (err) {
        console.error(err);
        setCourseError(err?.message || "Gagal memuat course");
      } finally {
        setCourseLoading(false);
      }
    };

    if (!loading) fetchCourses();
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || userRole !== "admin") return null; // sudah diarahkan

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
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-purple-100 mt-2">Selamat datang di panel administrasi</p>
        </div>

        {/* Course Management */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Management</h2>
          <CourseList isAdmin={true} />
        </div>
      </div>
    </div>
  );
};

// Kartu statistik
const StatCard = ({ title, value, color, desc }) => {
  const colorMap = {
    blue: { border: "border-blue-500", text: "text-blue-600" },
    green: { border: "border-green-500", text: "text-green-600" },
    purple: { border: "border-purple-500", text: "text-purple-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${c.border}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
};

export default AdminDashboard;
