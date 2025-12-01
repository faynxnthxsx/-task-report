// frontend/src/components/RequireRole.jsx
import { Navigate } from "react-router-dom";

export default function RequireRole({ roles, children }) {
  const raw = localStorage.getItem("taskreport_user");
  let role = "staff";

  if (raw) {
    try {
      const user = JSON.parse(raw);
      role = user?.role || "staff";
    } catch (err) {
      console.error("Failed to parse taskreport_user from localStorage", err);
    }
  }

  if (!roles.includes(role)) {
    // ถ้า role ไม่ตรง → เด้งกลับหน้าแรก
    return <Navigate to="/" replace />;
  }

  return children;
}
