import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QuizService } from "../services/QuizService";
import QuizList from "../components/QuizList";
import QuizForm from "../components/QuizForm";

const QuizManagement = () => {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuizTitle, setNewQuizTitle] = useState("");

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        const data = await QuizService.getQuizzes(courseId);
        setQuizzes(data || []);
        if (data && data.length > 0) {
          const activeQuizData = data.find((quiz) => quiz.isActive) || data[0];
          setActiveQuiz(activeQuizData);
          setIsActive(activeQuizData.isActive || false);
          if (activeQuizData.isActive) {
            loadQuestions(activeQuizData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchData();
  }, [courseId]);

  const loadQuestions = async (quizId) => {
    try {
      const data = await QuizService.getQuestions(quizId);
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (!isActive) {
        // Check if we have a custom title
        if (!newQuizTitle.trim()) {
          alert("Masukkan judul quiz terlebih dahulu!");
          return;
        }

        // Create quiz with custom title
        const newQuizRef = await QuizService.createQuiz(
          courseId,
          newQuizTitle.trim()
        );
        const quiz = {
          id: newQuizRef.id,
          title: newQuizTitle.trim(),
          courseId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update the quiz to be active
        await QuizService.updateQuiz(quiz.id, { isActive: true });

        setQuizzes([quiz]);
        setActiveQuiz(quiz);
        loadQuestions(quiz.id);
        setIsActive(true);
        setNewQuizTitle(""); // Reset title input
      } else {
        // Deactivate quiz by updating status
        if (activeQuiz) {
          await QuizService.updateQuiz(activeQuiz.id, {
            isActive: false,
            updatedAt: new Date(),
          });
          const deactivatedQuiz = { ...activeQuiz, isActive: false };
          setQuizzes([deactivatedQuiz]);
          setActiveQuiz(deactivatedQuiz);
          setQuestions([]);
          setIsActive(false);
        }
      }
    } catch (error) {
      console.error("Error toggling quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAdded = () => {
    if (activeQuiz) {
      loadQuestions(activeQuiz.id);
      // Refresh quizzes to update the question count in QuizList
      const refreshQuizzes = async () => {
        try {
          const data = await QuizService.getQuizzes(courseId);
          setQuizzes(data || []);
        } catch (error) {
          console.error("Error refreshing quizzes:", error);
        }
      };
      refreshQuizzes();
    }
    setEditingQuestion(null);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const handleQuizDeleted = (deletedQuizId) => {
    // Remove the deleted quiz from state
    setQuizzes(quizzes.filter((quiz) => quiz.id !== deletedQuizId));

    // If the deleted quiz was the active quiz, reset the state
    if (activeQuiz && activeQuiz.id === deletedQuizId) {
      setActiveQuiz(null);
      setIsActive(false);
      setQuestions([]);
      setEditingQuestion(null);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!activeQuiz) return;
    if (window.confirm("Apakah yakin ingin menghapus pertanyaan ini?")) {
      try {
        await QuizService.deleteQuestion(activeQuiz.id, questionId);
        loadQuestions(activeQuiz.id);
        // Refresh quizzes to update the question count in QuizList
        const refreshQuizzes = async () => {
          try {
            const data = await QuizService.getQuizzes(courseId);
            setQuizzes(data || []);
          } catch (error) {
            console.error("Error refreshing quizzes:", error);
          }
        };
        refreshQuizzes();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="font-medium">Aktifkan Quiz</label>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`px-4 py-1 rounded-md text-white ${
              isActive ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {isLoading ? "Loading..." : isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>

        {!isActive && (
          <div className="p-4 border rounded-md bg-blue-50">
            {quizzes.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-blue-700">
                  Quiz sudah ada tapi nonaktif. Pilih opsi:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (activeQuiz) {
                        try {
                          await QuizService.updateQuiz(activeQuiz.id, {
                            isActive: true,
                            updatedAt: new Date(),
                          });
                          const reactivatedQuiz = {
                            ...activeQuiz,
                            isActive: true,
                          };
                          setQuizzes([reactivatedQuiz]);
                          setActiveQuiz(reactivatedQuiz);
                          setIsActive(true);
                          loadQuestions(reactivatedQuiz.id);
                        } catch (error) {
                          console.error("Error reactivating quiz:", error);
                          alert("Gagal mengaktifkan quiz");
                        }
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Aktifkan Quiz yang Ada
                  </button>
                  <span className="text-blue-600 self-center">atau</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-700 mb-3">
                Belum ada quiz. Buat quiz baru:
              </p>
            )}

            <label className="block text-sm font-medium text-blue-700 mb-2">
              Buat Quiz Baru:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                className="flex-1 border p-2 rounded"
                placeholder="Masukkan judul quiz (contoh: Quiz Pertemuan 1)"
                required
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Masukkan judul quiz sebelum mengaktifkan
            </p>
          </div>
        )}
      </div>

      <QuizList
        courseId={courseId}
        isAdmin={true}
        refreshTrigger={`${quizzes.length}-${isActive}`} // Refresh when quizzes or status change
        onQuizDeleted={handleQuizDeleted}
      />

      {isActive && activeQuiz && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">
            Tambah / Edit Pertanyaan untuk {activeQuiz.title}
          </h2>

          {/* Quiz Title Edit */}
          <div className="mb-4 p-4 border rounded-md bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Judul Quiz:
              </label>
              <button
                onClick={async () => {
                  if (
                    window.confirm(
                      "Apakah yakin ingin menghapus quiz ini? Semua pertanyaan akan hilang!"
                    )
                  ) {
                    try {
                      await QuizService.deleteQuiz(activeQuiz.id);
                      setQuizzes([]);
                      setActiveQuiz(null);
                      setQuestions([]);
                      setIsActive(false);
                      alert("Quiz berhasil dihapus!");
                    } catch (error) {
                      console.error("Error deleting quiz:", error);
                      alert("Gagal menghapus quiz");
                    }
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Hapus Quiz
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={activeQuiz.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setActiveQuiz({ ...activeQuiz, title: newTitle });
                }}
                className="flex-1 border p-2 rounded"
                placeholder="Masukkan judul quiz"
              />
              <button
                onClick={async () => {
                  try {
                    await QuizService.updateQuiz(activeQuiz.id, {
                      title: activeQuiz.title,
                      updatedAt: new Date(),
                    });
                    alert("Judul quiz berhasil diupdate!");
                  } catch (error) {
                    console.error("Error updating quiz title:", error);
                    alert("Gagal mengupdate judul quiz");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Judul
              </button>
            </div>
          </div>

          <QuizForm
            quizId={activeQuiz.id}
            editingQuestion={editingQuestion}
            onQuestionAdded={handleQuestionAdded}
            onCancelEdit={handleCancelEdit}
          />

          {/* Daftar pertanyaan */}
          {questions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Daftar Pertanyaan:</h3>
              {questions.map((q, idx) => (
                <div key={q.id} className="border p-3 rounded mb-2">
                  <p className="font-medium">
                    {idx + 1}. {q.question}
                  </p>
                  <ul className="list-disc ml-5">
                    {q.options.map((opt, i) => (
                      <li key={i}>
                        {opt} {opt === q.answer && <strong>(Jawaban)</strong>}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => handleEditQuestion(q)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
