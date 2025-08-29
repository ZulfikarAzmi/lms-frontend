import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CourseService } from "../services/CourseService";
import CourseMaterial from "../components/CourseMaterial";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10 text-gray-500">
        Course tidak ditemukan
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {course.title}
      </h1>
      <CourseMaterial courseId={course.id} courseTitle={course.title} />
    </div>
  );
};

export default CourseDetail;
