import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MaterialManagement from "./pages/MaterialManagement";
import CourseDetail from "./pages/CourseDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import CourseManagement from "./pages/CourseManagement";
import MaterialForm from "./components/MaterialForm";
import QuizManagement from "./pages/QuizManagement";
import TakeQuiz from "./pages/TakeQuiz";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Course Detail untuk user */}
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />

        {/* Take Quiz untuk user */}
        <Route
          path="/course/:courseId/quiz/:quizId"
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          }
        />

        {/* Material Management */}
        <Route
          path="/admin/dashboard/:courseId/materials"
          element={
            <ProtectedRoute adminOnly={true}>
              <MaterialForm />
            </ProtectedRoute>
          }
        />

        {/* Quiz Management */}
        <Route
          path="/admin/dashboard/:courseId/quizzes"
          element={
            <ProtectedRoute adminOnly={true}>
              <QuizManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
