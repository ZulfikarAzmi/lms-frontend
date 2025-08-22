import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">{mode === "login" ? "Login" : "Register"}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === "login" ? "Masuk untuk lanjut ke dashboard" : "Buat akun baru"}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />

        {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
        </button>

        <div className="mt-4 text-sm text-center">
          {mode === "login" ? (
            <>Belum punya akun?{" "}
              <button type="button" onClick={() => setMode("register")} className="text-blue-600 underline">
                Register
              </button></>
          ) : (
            <>Sudah punya akun?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-blue-600 underline">
                Login
              </button></>
          )}
        </div>
      </form>
    </div>
  );
}
