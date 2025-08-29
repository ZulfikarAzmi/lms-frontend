import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { checkUserRole } from "../services/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          // Ambil role user dari Firestore
          const role = await checkUserRole(u.uid);
          console.log("AuthContext - User role:", role);
          setUserRole(role);
        } catch (error) {
          console.error("AuthContext - Error checking role:", error);
          setUserRole("user"); // default role jika error
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
