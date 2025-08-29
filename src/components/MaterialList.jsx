import React, { useState, useEffect } from "react";
import { MaterialService } from "../services/MaterialService";
import { CourseService } from "../services/CourseService";
import MaterialForm from "./MaterialForm";
import VideoPlayer from "./VideoPlayer";

const MaterialList = ({ isAdmin = false, courseId = null }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadMaterials();
    if (isAdmin) {
      loadCourses();
    }
  }, [courseId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      let materialsData;

      if (courseId) {
        // Load materi berdasarkan course ID
        materialsData = await MaterialService.getMaterialsByCourseId(courseId);
      } else {
        // Load semua materi
        materialsData = await MaterialService.getAllMaterials();
      }

      setMaterials(materialsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await CourseService.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const handleMaterialAdded = () => {
    setShowForm(false);
    setEditingMaterial(null);
    loadMaterials();
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      try {
        await MaterialService.deleteMaterial(materialId);
        loadMaterials();
      } catch (error) {
        alert(`Gagal menghapus materi: ${error.message}`);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  const getCourseTitle = (courseId) => {
    if (!courseId) return "Tidak ada course";
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : "Course tidak ditemukan";
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
      <MaterialForm
        onMaterialAdded={handleMaterialAdded}
        onCancel={handleCancelForm}
        editMaterial={editingMaterial}
      />
    );
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Tambah Materi Baru
          </button>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {courseId
              ? "Belum ada materi untuk course ini"
              : "Belum ada materi tersedia"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {material.title}
                    </h3>
                    {material.description && (
                      <p className="text-gray-600 mb-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Course: {getCourseTitle(material.courseId)}</span>
                      <span>
                        Dibuat:{" "}
                        {material.createdAt
                          ?.toDate?.()
                          ?.toLocaleDateString("id-ID") || "N/A"}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMaterial(material)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <VideoPlayer
                    videoUrl={material.videoUrl}
                    title={material.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialList;


