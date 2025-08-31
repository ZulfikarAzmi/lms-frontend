import React, { useEffect, useState } from "react";
import { QuizService } from "../services/QuizService";

const QuizList = ({ courseId, isAdmin, refreshTrigger, onQuizDeleted }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState({});
  const [deletingQuizId, setDeletingQuizId] = useState(null);

  const fetchData = async () => {
    if (!courseId) return; // kalau belum ada courseId, jangan query

    try {
      const data = await QuizService.getQuizzes(courseId);
      setQuizzes(data || []);

      // Fetch questions for each quiz
      if (data && data.length > 0) {
        const questionsData = {};
        for (const quiz of data) {
          try {
            const questions = await QuizService.getQuestions(quiz.id);
            questionsData[quiz.id] = questions;
          } catch (error) {
            console.error(
              `Error fetching questions for quiz ${quiz.id}:`,
              error
            );
            questionsData[quiz.id] = [];
          }
        }
        setQuizQuestions(questionsData);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, refreshTrigger]);

  if (quizzes.length === 0) {
    return <p className="text-gray-500">Belum ada quiz</p>;
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="p-4 border rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">{quiz.title}</h3>
              <p className="text-sm text-gray-500">Course: {quiz.courseId}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    quiz.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {quiz.isActive ? "Aktif" : "Nonaktif"}
                </span>
                {quiz.createdAt && (
                  <span className="text-xs text-gray-500">
                    Dibuat:{" "}
                    {new Date(quiz.createdAt.toDate()).toLocaleDateString(
                      "id-ID"
                    )}
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Edit
                </button>
                <button
                  onClick={async () => {
                    const questionCount = quizQuestions[quiz.id]?.length || 0;
                    let confirmMessage = `Apakah yakin ingin menghapus quiz "${quiz.title}"?`;

                    // Add quiz details
                    confirmMessage += `\n\n📊 Detail Quiz:`;
                    confirmMessage += `\n• Status: ${
                      quiz.isActive ? "AKTIF" : "Nonaktif"
                    }`;
                    confirmMessage += `\n• Jumlah Pertanyaan: ${questionCount}`;
                    if (quiz.createdAt) {
                      const createdDate = new Date(
                        quiz.createdAt.toDate()
                      ).toLocaleDateString("id-ID");
                      confirmMessage += `\n• Dibuat: ${createdDate}`;
                    }

                    if (quiz.isActive) {
                      confirmMessage += `\n\n⚠️ PERHATIAN: Quiz ini sedang AKTIF!`;
                    }

                    if (questionCount > 0) {
                      confirmMessage += `\n\n🗑️ Semua ${questionCount} pertanyaan akan dihapus!`;
                    }

                    if (window.confirm(confirmMessage)) {
                      setDeletingQuizId(quiz.id);
                      try {
                        await QuizService.deleteQuiz(quiz.id);
                        // Refresh the quiz list after deletion
                        fetchData();
                        // Notify parent component about the deletion
                        if (onQuizDeleted) {
                          onQuizDeleted(quiz.id);
                        }
                        alert("Quiz berhasil dihapus!");
                      } catch (error) {
                        console.error("Error deleting quiz:", error);
                        alert("Gagal menghapus quiz");
                      } finally {
                        setDeletingQuizId(null);
                      }
                    }
                  }}
                  disabled={deletingQuizId === quiz.id}
                  className={`px-3 py-1 rounded-md text-white ${
                    deletingQuizId === quiz.id
                      ? "bg-red-400 cursor-not-allowed"
                      : quiz.isActive
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  title={
                    quiz.isActive
                      ? "Quiz sedang aktif - hapus dengan hati-hati!"
                      : "Hapus quiz"
                  }
                >
                  {deletingQuizId === quiz.id ? (
                    "Menghapus..."
                  ) : (
                    <>
                      {quiz.isActive && "⚠️ "}
                      Hapus
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Display questions if any */}
          {quizQuestions[quiz.id] && quizQuestions[quiz.id].length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Pertanyaan ({quizQuestions[quiz.id].length}):
              </h4>
              <div className="space-y-2">
                {quizQuestions[quiz.id].map((question, idx) => (
                  <div key={question.id} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-sm">
                      {idx + 1}. {question.question}
                    </p>
                    <div className="mt-2 ml-4">
                      {question.options.map((option, optIdx) => (
                        <p
                          key={optIdx}
                          className={`text-sm ${
                            option === question.answer
                              ? "text-green-600 font-semibold"
                              : "text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {option}
                          {option === question.answer && " ✓"}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!quizQuestions[quiz.id] || quizQuestions[quiz.id].length === 0) && (
            <p className="text-sm text-gray-500 mt-3">Belum ada pertanyaan</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizList;
