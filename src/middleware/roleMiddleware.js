import { checkUserRole } from "../services/AuthService";

/**
 * Middleware untuk memeriksa role user dan redirect berdasarkan role
 * @param {string} userId - ID user yang sedang login
 * @param {function} navigate - Fungsi navigate dari react-router-dom
 * @param {Object} options - Opsi tambahan untuk middleware
 * @returns {Promise<Object>} - Object berisi role dan status redirect
 */
export const roleCheckMiddleware = async (userId, navigate, options = {}) => {
  const {
    redirectOnSuccess = true, // Apakah redirect otomatis setelah cek role
    fallbackRole = "user", // Role default jika gagal cek
    adminRedirectPath = "/admin/dashboard", // Path redirect untuk admin
    userRedirectPath = "/dashboard", // Path redirect untuk user biasa
    onRoleCheck = null, // Callback setelah role check
    onError = null, // Callback jika terjadi error
  } = options;

  try {
    // Cek role user dari Firestore
    const userRole = await checkUserRole(userId);

    // Callback jika ada
    if (onRoleCheck) {
      onRoleCheck(userRole);
    }

    // Redirect berdasarkan role jika diizinkan
    if (redirectOnSuccess) {
      if (userRole === "admin") {
        navigate(adminRedirectPath, { replace: true });
      } else {
        navigate(userRedirectPath, { replace: true });
      }
    }

    return {
      success: true,
      role: userRole,
      redirected: redirectOnSuccess,
      redirectPath: userRole === "admin" ? adminRedirectPath : userRedirectPath,
    };
  } catch (error) {
    console.error("Role check middleware error:", error);

    // Callback error jika ada
    if (onError) {
      onError(error);
    }

    // Fallback ke role default
    const fallbackRoleValue = fallbackRole;

    if (redirectOnSuccess) {
      navigate(userRedirectPath, { replace: true });
    }

    return {
      success: false,
      role: fallbackRoleValue,
      redirected: redirectOnSuccess,
      redirectPath: userRedirectPath,
      error: error.message,
    };
  }
};

/**
 * Middleware untuk memeriksa apakah user memiliki role tertentu
 * @param {string} userId - ID user yang sedang login
 * @param {string|Array} requiredRoles - Role yang dibutuhkan (bisa string atau array)
 * @param {Object} options - Opsi tambahan
 * @returns {Promise<Object>} - Object berisi status akses dan role
 */
export const roleAccessMiddleware = async (
  userId,
  requiredRoles,
  options = {}
) => {
  const {
    fallbackRole = "user",
    onAccessGranted = null,
    onAccessDenied = null,
    onError = null,
  } = options;

  try {
    const userRole = await checkUserRole(userId);
    const rolesArray = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];
    const hasAccess = rolesArray.includes(userRole);

    if (hasAccess) {
      if (onAccessGranted) {
        onAccessGranted(userRole);
      }

      return {
        success: true,
        hasAccess: true,
        role: userRole,
        requiredRoles: rolesArray,
      };
    } else {
      if (onAccessDenied) {
        onAccessDenied(userRole, requiredRoles);
      }

      return {
        success: true,
        hasAccess: false,
        role: userRole,
        requiredRoles: rolesArray,
      };
    }
  } catch (error) {
    console.error("Role access middleware error:", error);

    if (onError) {
      onError(error);
    }

    return {
      success: false,
      hasAccess: false,
      role: fallbackRole,
      requiredRoles: Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles],
      error: error.message,
    };
  }
};

/**
 * Hook untuk menggunakan role middleware di komponen React
 * @param {string} userId - ID user
 * @param {function} navigate - Fungsi navigate
 * @returns {Object} - Object berisi fungsi middleware dan state
 */
export const useRoleMiddleware = (userId, navigate) => {
  const checkRoleAndRedirect = async (options = {}) => {
    return await roleCheckMiddleware(userId, navigate, options);
  };

  const checkRoleAccess = async (requiredRoles, options = {}) => {
    return await roleAccessMiddleware(userId, requiredRoles, options);
  };

  return {
    checkRoleAndRedirect,
    checkRoleAccess,
  };
};

/**
 * Middleware untuk redirect otomatis berdasarkan role (tanpa parameter tambahan)
 * @param {string} userId - ID user
 * @param {function} navigate - Fungsi navigate
 * @returns {Promise<void>}
 */
export const autoRedirectByRole = async (userId, navigate) => {
  return await roleCheckMiddleware(userId, navigate, {
    redirectOnSuccess: true,
    fallbackRole: "user",
  });
};

