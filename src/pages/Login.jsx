import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, redirectBasedOnRole } from "../services/AuthService";
import { useRoleMiddleware } from "../middleware/roleMiddleware";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let user;

      if (mode === "login") {
        user = await login(email, password);
      } else {
        user = await register(email, password);
      }

      // Redirect berdasarkan role user dengan callback
      const result = await redirectBasedOnRole(user.uid, navigate);

      // Set user role untuk display
      setUserRole(result.role);

      // Log hasil redirect
      console.log("Redirect result:", result);
    } catch (error) {
      // Handle error dengan pesan yang lebih user-friendly
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email tidak ditemukan. Silakan cek email Anda.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password salah. Silakan cek password Anda.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password terlalu lemah. Minimal 6 karakter.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Terlalu banyak percobaan login. Silakan tunggu beberapa saat.";
      }

      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow"
      >
        <h1 className="text-2xl font-bold mb-2">
          {mode === "login" ? "Login" : "Register"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === "login"
            ? "Masuk untuk lanjut ke dashboard"
            : "Buat akun baru"}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <div className="mt-4 text-sm text-center">
          {mode === "login" ? (
            <>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-blue-600 underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-blue-600 underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
