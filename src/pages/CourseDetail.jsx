import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CourseService } from "../services/CourseService";
import { QuizService } from "../services/QuizService";
import CourseMaterial from "../components/CourseMaterial";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth(); // cek role admin atau user
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    loadCourse();
    loadActiveQuiz();
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

  const loadActiveQuiz = async () => {
    try {
      setQuizLoading(true);
      const quiz = await QuizService.getActiveQuiz(id);
      setActiveQuiz(quiz);
    } catch (error) {
      console.error("Error loading active quiz:", error);
      setActiveQuiz(null);
    } finally {
      setQuizLoading(false);
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{course.title}</h1>

      {/* Admin only: tombol kelola quiz */}
      {userRole === "admin" && (
        <div className="mb-6">
          <button
            onClick={() => navigate(`/admin/dashboard/${course.id}/quizzes`)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Kelola Quiz
          </button>
        </div>
      )}

      {/* Take Quiz button for all users */}
      {activeQuiz && (
        <div className="mb-6">
          <button
            onClick={() =>
              navigate(`/course/${course.id}/quiz/${activeQuiz.id}`)
            }
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🧠 Take Quiz: {activeQuiz.title}
          </button>
        </div>
      )}

      {/* Quiz loading state */}
      {quizLoading && (
        <div className="mb-6 text-center text-gray-500">Memeriksa quiz...</div>
      )}

      <CourseMaterial courseId={course.id} courseTitle={course.title} />
    </div>
  );
};

export default CourseDetail;
