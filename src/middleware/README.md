# Role-Based Authentication Middleware

Middleware ini menyediakan sistem role-based authentication yang mudah diintegrasikan ke project React dengan Firebase.

## Fitur Utama

- ✅ **Role Checking** - Memeriksa role user dari Firestore
- ✅ **Auto Redirect** - Redirect otomatis berdasarkan role
- ✅ **Access Control** - Kontrol akses berdasarkan role tertentu
- ✅ **Error Handling** - Penanganan error yang robust
- ✅ **Callback Support** - Callback untuk custom logic
- ✅ **Reusable** - Bisa digunakan di berbagai komponen
- ✅ **TypeScript Ready** - JSDoc yang lengkap untuk TypeScript

## Cara Penggunaan

### 1. Basic Role Check & Redirect

```javascript
import { autoRedirectByRole } from "../middleware/roleMiddleware";

// Redirect otomatis berdasarkan role
const result = await autoRedirectByRole(userId, navigate);
console.log("User role:", result.role);
```

### 2. Advanced Role Check dengan Options

```javascript
import { roleCheckMiddleware } from "../middleware/roleMiddleware";

const result = await roleCheckMiddleware(userId, navigate, {
  redirectOnSuccess: true,
  fallbackRole: "user",
  adminRedirectPath: "/admin/dashboard",
  userRedirectPath: "/dashboard",
  onRoleCheck: (role) => {
    console.log("User role detected:", role);
  },
  onError: (error) => {
    console.error("Role check failed:", error);
  },
});
```

### 3. Role Access Control

```javascript
import { roleAccessMiddleware } from "../middleware/roleMiddleware";

const result = await roleAccessMiddleware(userId, ["admin", "moderator"], {
  onAccessGranted: (role) => {
    console.log("Access granted for role:", role);
  },
  onAccessDenied: (userRole, requiredRoles) => {
    console.log(
      `Access denied. User role: ${userRole}, Required: ${requiredRoles}`
    );
  },
});

if (result.hasAccess) {
  // User memiliki akses
} else {
  // User tidak memiliki akses
}
```

### 4. Menggunakan Hook di Komponen React

```javascript
import { useRoleMiddleware } from '../middleware/roleMiddleware';

const MyComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkRoleAndRedirect, checkRoleAccess } = useRoleMiddleware(user.uid, navigate);

  const handleLogin = async () => {
    // Check role dan redirect
    const result = await checkRoleAndRedirect({
      onRoleCheck: (role) => {
        console.log('User logged in with role:', role);
      }
    });
  };

  const checkAccess = async () => {
    // Check akses untuk role tertentu
    const result = await checkRoleAccess(["admin"], {
      onAccessGranted: () => {
        console.log('Admin access granted');
      }
    });
  };

  return (
    // Component JSX
  );
};
```

### 5. Menggunakan RoleBasedComponent

```javascript
import RoleBasedComponent from "../components/RoleBasedComponent";

const AdminOnlyPage = () => {
  return (
    <RoleBasedComponent requiredRoles={["admin"]}>
      <div>
        <h1>Admin Dashboard</h1>
        <p>Hanya admin yang bisa melihat ini</p>
      </div>
    </RoleBasedComponent>
  );
};

// Dengan fallback component
const AdminPageWithFallback = () => {
  return (
    <RoleBasedComponent
      requiredRoles={["admin"]}
      fallbackComponent={
        <div className="text-red-500">
          Anda tidak memiliki akses ke halaman ini
        </div>
      }
    >
      <AdminContent />
    </RoleBasedComponent>
  );
};
```

### 6. Menggunakan useRoleCheck Hook

```javascript
import { useRoleCheck } from "../components/RoleBasedComponent";

const MyComponent = () => {
  const { userRole, roleLoading, hasAccess, user } = useRoleCheck([
    "admin",
    "moderator",
  ]);

  if (roleLoading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <div>Access denied. Your role: {userRole}</div>;
  }

  return (
    <div>
      <h1>Welcome {user.email}</h1>
      <p>Your role: {userRole}</p>
    </div>
  );
};
```

## Struktur Data Firestore

Pastikan collection `users` memiliki struktur seperti ini:

```javascript
// Collection: users
// Document ID: {userId}
{
  email: "user@example.com",
  role: "admin", // atau "user", "moderator", dll
  createdAt: Timestamp,
  lastLogin: Timestamp,
  updatedAt: Timestamp
}
```

## Error Handling

Middleware ini menangani berbagai error scenario:

- **Firestore Error** - Fallback ke role default
- **Network Error** - Retry mechanism
- **Invalid Role** - Fallback ke "user"
- **Missing User** - Redirect ke login

## Customization

### Custom Redirect Paths

```javascript
const result = await roleCheckMiddleware(userId, navigate, {
  adminRedirectPath: "/super-admin",
  userRedirectPath: "/user-home",
});
```

### Custom Fallback Role

```javascript
const result = await roleCheckMiddleware(userId, navigate, {
  fallbackRole: "guest",
});
```

### Disable Auto Redirect

```javascript
const result = await roleCheckMiddleware(userId, navigate, {
  redirectOnSuccess: false,
});

// Manual redirect berdasarkan result
if (result.role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/dashboard");
}
```

## Best Practices

1. **Gunakan try-catch** untuk error handling
2. **Set fallback role** yang sesuai dengan business logic
3. **Gunakan callback** untuk custom logic
4. **Cache role data** jika diperlukan
5. **Validate role** sebelum menggunakan

## Troubleshooting

### Role tidak terdeteksi

- Pastikan collection `users` ada di Firestore
- Pastikan document user memiliki field `role`
- Cek Firebase rules untuk read permission

### Redirect tidak berfungsi

- Pastikan `navigate` function valid
- Cek console untuk error
- Pastikan path redirect valid

### Performance issues

- Gunakan caching untuk role data
- Batasi jumlah role check
- Gunakan `useMemo` untuk expensive operations
