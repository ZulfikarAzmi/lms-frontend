import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRoleMiddleware } from "../middleware/roleMiddleware";
import { checkUserRole } from "../services/AuthService";

/**
 * Komponen contoh yang mendemonstrasikan penggunaan middleware role checking
 * Komponen ini bisa digunakan sebagai template untuk komponen lain yang membutuhkan role checking
 */
const RoleBasedComponent = ({
  children,
  requiredRoles = [],
  fallbackComponent = null,
}) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && requiredRoles.length > 0) {
      setRoleLoading(true);
      checkUserRole(user.uid)
        .then((role) => {
          setUserRole(role);
          setHasAccess(requiredRoles.includes(role));
          setRoleLoading(false);
        })
        .catch(() => {
          setUserRole("user");
          setHasAccess(false);
          setRoleLoading(false);
        });
    }
  }, [user, requiredRoles]);

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika tidak ada user, tampilkan fallback
  if (!user) {
    return (
      fallbackComponent || (
        <div className="p-4 text-center text-gray-500">
          Silakan login terlebih dahulu
        </div>
      )
    );
  }

  // Jika user tidak memiliki role yang dibutuhkan
  if (!hasAccess) {
    return (
      fallbackComponent || (
        <div className="p-4 text-center text-red-500">
          Anda tidak memiliki akses ke halaman ini
          <br />
          <span className="text-sm text-gray-400">
            Role yang dibutuhkan: {requiredRoles.join(", ")}
            <br />
            Role Anda: {userRole}
          </span>
        </div>
      )
    );
  }

  // Jika user memiliki akses, tampilkan children
  return <div className="role-based-component">{children}</div>;
};

/**
 * Hook untuk menggunakan role checking di komponen lain
 * @param {Array} requiredRoles - Array role yang dibutuhkan
 * @returns {Object} - Object berisi status role dan loading
 */
export const useRoleCheck = (requiredRoles = []) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (user && requiredRoles.length > 0) {
      setRoleLoading(true);
      checkUserRole(user.uid)
        .then((role) => {
          setUserRole(role);
          setHasAccess(requiredRoles.includes(role));
          setRoleLoading(false);
        })
        .catch(() => {
          setUserRole("user");
          setHasAccess(false);
          setRoleLoading(false);
        });
    }
  }, [user, requiredRoles]);

  return {
    userRole,
    roleLoading,
    hasAccess,
    user,
  };
};

export default RoleBasedComponent;
