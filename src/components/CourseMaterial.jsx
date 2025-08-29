import React, { useState, useEffect } from "react";
import { MaterialService } from "../services/MaterialService";
import { ProgressService } from "../services/ProgressService";
import VideoPlayer from "./VideoPlayer";
import { useAuth } from "../context/AuthContext";

const CourseMaterial = ({ courseId, courseTitle }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);

  useEffect(() => {
    if (courseId && user) {
      loadMaterials();
      loadProgress();
    }
  }, [courseId, user]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const materialsData = await MaterialService.getMaterialsByCourseId(courseId);
      setMaterials(materialsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const progressData = await ProgressService.getUserCourseProgress(user.uid, courseId);
      setProgress(progressData);
      setCompletedCount(progressData.length);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const handleMaterialToggle = async (materialId) => {
    try {
      const isCompleted = progress.some((p) => p.materialId === materialId);

      if (isCompleted) {
        await ProgressService.markMaterialAsIncomplete(user.uid, materialId);
        setProgress((prev) => prev.filter((p) => p.materialId !== materialId));
        setCompletedCount((prev) => prev - 1);
      } else {
        await ProgressService.markMaterialAsCompleted(user.uid, materialId, courseId);
        const newProgress = {
          id: Date.now().toString(),
          userId: user.uid,
          materialId,
          courseId,
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(),
        };
        setProgress((prev) => [...prev, newProgress]);
        setCompletedCount((prev) => prev + 1);

        if (currentMaterialIndex < materials.length - 1) {
          setTimeout(() => {
            setCurrentMaterialIndex(currentMaterialIndex + 1);
          }, 1000);
        }
      }
    } catch (error) {
      alert(`Gagal mengubah status materi: ${error.message}`);
    }
  };

  const isMaterialCompleted = (materialId) =>
    progress.some((p) => p.materialId === materialId);

  const calculateProgress = () => {
    if (materials.length === 0) return 0;
    return Math.round((completedCount / materials.length) * 100);
  };

  const canAccessMaterial = (materialIndex) => {
    if (materialIndex === 0) return true;
    const previousMaterial = materials[materialIndex - 1];
    return previousMaterial && isMaterialCompleted(previousMaterial.id);
  };

  const goToMaterial = (index) => {
    if (canAccessMaterial(index)) {
      setCurrentMaterialIndex(index);
    }
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

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-lg shadow-md p-4 h-fit">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Navigasi Materi
        </h3>
        <ul className="space-y-2">
          {materials.map((material, index) => {
            const isCompleted = isMaterialCompleted(material.id);
            const isAccessible = canAccessMaterial(index);
            const isActive = index === currentMaterialIndex;

            return (
              <li key={material.id}>
                <button
                  onClick={() => goToMaterial(index)}
                  disabled={!isAccessible}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isAccessible
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="truncate">{material.title}</span>
                  {isCompleted && (
                    <span className="text-green-500 font-bold">✓</span>
                  )}
                  {!isAccessible && <span className="text-red-400">🔒</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Progress */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {completedCount} dari {materials.length} selesai (
            {calculateProgress()}%)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {materials[currentMaterialIndex]?.title ||
                  "Materi tidak tersedia"}
              </h3>
              {materials[currentMaterialIndex]?.description && (
                <p className="text-gray-600 mb-3">
                  {materials[currentMaterialIndex].description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleMaterialToggle(materials[currentMaterialIndex]?.id)
                }
                disabled={!canAccessMaterial(currentMaterialIndex)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isMaterialCompleted(materials[currentMaterialIndex]?.id)
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                    : canAccessMaterial(currentMaterialIndex)
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                    : "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed"
                }`}
              >
                {isMaterialCompleted(materials[currentMaterialIndex]?.id)
                  ? "✓ Selesai"
                  : "Selesai"}
              </button>
            </div>
          </div>

          <div className="mt-4">
            {canAccessMaterial(currentMaterialIndex) ? (
              <VideoPlayer
                videoUrl={materials[currentMaterialIndex]?.videoUrl}
                title={materials[currentMaterialIndex]?.title}
              />
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-2">🔒 Materi terkunci</p>
                  <p className="text-gray-400 text-sm">
                    Selesaikan materi sebelumnya untuk membuka materi ini
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterial;
