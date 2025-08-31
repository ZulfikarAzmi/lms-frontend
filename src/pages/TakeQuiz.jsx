import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { QuizService } from "../services/QuizService";

const TakeQuiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (courseId && quizId) {
      loadQuizData();
    }
  }, [courseId, quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Load quiz details
      const quizData = await QuizService.getQuiz(quizId);
      setQuiz(quizData);

      // Load questions
      const questionsData = await QuizService.getQuestions(quizId);
      setQuestions(questionsData);

      // Set time limit (default: 30 minutes per question, max 2 hours)
      const timeLimit = Math.min(questionsData.length * 30, 120);
      setTimeLeft(timeLimit * 60); // Convert to seconds
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Gagal memuat quiz");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      const confirmed = window.confirm(
        "Beberapa pertanyaan belum dijawab. Apakah yakin ingin submit quiz?"
      );
      if (!confirmed) return;
    }

    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      const answers = [];

      questions.forEach((question) => {
        const userAnswer = userAnswers[question.id] || null;
        const isCorrect = userAnswer === question.answer;

        if (isCorrect) {
          correctAnswers++;
        }

        answers.push({
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer: question.answer,
          isCorrect,
        });
      });

      const finalScore = correctAnswers;
      setScore(finalScore);

      // Submit result to Firebase
      await QuizService.submitResult(
        courseId,
        user.uid,
        quizId,
        finalScore,
        questions.length,
        answers
      );

      setQuizCompleted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Gagal submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return Math.round(
      (Object.keys(userAnswers).length / questions.length) * 100
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Quiz Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Quiz yang Anda cari tidak tersedia atau sudah tidak aktif.
        </p>
        <button
          onClick={() => navigate(`/course/${courseId}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali ke Course
        </button>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 70; // Passing grade: 70%

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div
            className={`text-6xl mb-4 ${
              isPassed ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPassed ? "🎉" : "😔"}
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {isPassed ? "Selamat! Quiz Selesai" : "Quiz Selesai"}
          </h1>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Hasil Quiz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Jawaban Benar</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">Total Pertanyaan</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${
                    isPassed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">Persentase</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p
              className={`text-lg font-medium ${
                isPassed ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPassed
                ? "🎯 Anda berhasil menyelesaikan quiz dengan baik!"
                : "📚 Jangan menyerah, coba lagi untuk meningkatkan pemahaman Anda."}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali ke Course
            </button>
            {!isPassed && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {quiz.title}
          </h1>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              📋 Informasi Quiz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Jumlah Pertanyaan:</span>{" "}
                {questions.length}
              </div>
              <div>
                <span className="font-medium">Waktu:</span>{" "}
                {Math.floor(timeLeft / 60)} menit
              </div>
              <div>
                <span className="font-medium">Passing Grade:</span> 70%
              </div>
              <div>
                <span className="font-medium">Tipe:</span> Multiple Choice
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Peraturan Quiz:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Pilih satu jawaban yang paling tepat untuk setiap pertanyaan
              </li>
              <li>
                • Anda dapat kembali ke pertanyaan sebelumnya sebelum submit
              </li>
              <li>• Quiz akan otomatis submit ketika waktu habis</li>
              <li>• Pastikan semua pertanyaan terjawab sebelum submit</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={startQuiz}
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 Mulai Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Waktu Tersisa</div>
            <div
              className={`text-xl font-bold ${
                timeLeft < 300 ? "text-red-600" : "text-gray-800"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress: {getProgressPercentage()}%</span>
          <span>
            Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Pertanyaan {currentQuestionIndex + 1}
          </h2>
          <p className="text-lg text-gray-700">{currentQuestion.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                userAnswer === option
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={userAnswer === option}
                onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                className="mr-3 text-blue-600"
              />
              <span className="text-lg text-gray-700">
                {String.fromCharCode(65 + index)}. {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentQuestionIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            ← Sebelumnya
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              {Object.keys(userAnswers).length} dari {questions.length}{" "}
              pertanyaan terjawab
            </span>
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Selanjutnya →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;

