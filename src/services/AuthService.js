import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { autoRedirectByRole } from "../middleware/roleMiddleware";

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Buat dokumen user baru di Firestore dengan role default "user"
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "user",
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    return userCredential.user;
  } catch (error) {
    console.error("Register error:", error.message);
    throw error;
  }
};

export const checkUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().role || "user";
    }
    return "user"; // default role jika tidak ada data
  } catch (error) {
    console.error("Error checking user role:", error.message);
    return "user"; // default role jika error
  }
};

export const redirectBasedOnRole = async (userId, navigate) => {
  try {
    console.log("Redirecting user:", userId);

    // Cek role user dari Firestore
    const userRole = await checkUserRole(userId);
    console.log("User role detected:", userRole);

    let redirectPath;
    if (userRole === "admin") {
      redirectPath = "/admin/dashboard";
      console.log("Redirecting admin to:", redirectPath);
    } else {
      redirectPath = "/dashboard";
      console.log("Redirecting user to:", redirectPath);
    }

    // Redirect user
    navigate(redirectPath, { replace: true });

    return {
      success: true,
      role: userRole,
      redirected: true,
      redirectPath: redirectPath,
    };
  } catch (error) {
    console.error("Error redirecting based on role:", error.message);
    // fallback ke dashboard jika error
    navigate("/dashboard", { replace: true });
    return {
      success: false,
      role: "user",
      redirected: true,
      redirectPath: "/dashboard",
      error: error.message,
    };
  }
};

/**
 * Fungsi untuk mengupdate role user (hanya untuk admin)
 * @param {string} userId - ID user yang akan diupdate
 * @param {string} newRole - Role baru
 * @returns {Promise<Object>} - Status update
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        role: newRole,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return {
      success: true,
      message: `Role user berhasil diupdate ke ${newRole}`,
    };
  } catch (error) {
    console.error("Error updating user role:", error.message);
    throw error;
  }
};

/**
 * Fungsi untuk mendapatkan semua data user
 * @param {string} userId - ID user
 * @returns {Promise<Object>} - Data user lengkap
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error.message);
    throw error;
  }
};
