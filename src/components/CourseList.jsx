import React, { useState, useEffect } from "react";
import { CourseService } from "../services/CourseService";
import CourseForm from "./CourseForm";

const CourseList = ({ isAdmin = false }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await CourseService.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAdded = () => {
    setShowForm(false);
    setEditingCourse(null);
    loadCourses();
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus course ini?")) {
      try {
        await CourseService.deleteCourse(courseId);
        loadCourses();
      } catch (error) {
        alert(`Gagal menghapus course: ${error.message}`);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (showForm) {
    return (
      <CourseForm
        onCourseAdded={handleCourseAdded}
        onCancel={handleCancelForm}
        editCourse={editingCourse}
      />
    );
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Tambah Course Baru
          </button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Belum ada course tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl} // Base64 string akan langsung bisa ditampilkan
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {course.title}
                </h3>

                {course.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  Dibuat:{" "}
                  {course.createdAt?.toDate?.()?.toLocaleDateString("id-ID") ||
                    "N/A"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
