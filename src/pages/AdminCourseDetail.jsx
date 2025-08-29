import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MaterialList from "../components/MaterialList";
import { getCourseById } from "../services/CourseService";

const AdminCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = await getCourseById(id);
        setCourse(courseData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-purple-100 mt-2">{course.description}</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-white text-purple-600 rounded hover:bg-purple-50 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Manajemen Materi
          </h2>
          <MaterialList isAdmin={true} courseId={id} />
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetail;