// frontend/src/App.jsx
import "./styles.css";

import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import LoginPage from "./pages/Login";
import TaskDetailPage from "./pages/TaskDetail";
import UsersPage from "./pages/Users";

import { setApiToken, loadAuthTokenFromStorage } from "./lib/api";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const hasToken = !!localStorage.getItem("taskreport_token");

  // ⭐ ตอนเปิดแอป / รีเฟรชหน้า ให้โหลด token จาก localStorage ใส่ Axios
  useEffect(() => {
    loadAuthTokenFromStorage();
  }, []);

  // เวลารีเฟรชหน้าให้ sync user อีกรอบ เผื่อ localStorage เปลี่ยน
  useEffect(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      setCurrentUser(raw ? JSON.parse(raw) : null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const handleLogout = () => {
    setApiToken(null);
    localStorage.removeItem("taskreport_user");
    localStorage.removeItem("taskreport_token");
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  function RequireAuth({ children }) {
    const token = localStorage.getItem("taskreport_token");
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020617" }}>
      {/* header – แสดงเฉพาะตอนล็อกอินแล้ว */}
      {hasToken && (
        <header
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #111827",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ color: "#e5e7eb", textDecoration: "none" }}>
              Dashboard
            </Link>

            <Link
              to="/tasks"
              style={{ color: "#e5e7eb", textDecoration: "none" }}
            >
              Tasks
            </Link>

            <Link
              to="/reports"
              style={{ color: "#e5e7eb", textDecoration: "none" }}
            >
              Reports
            </Link>

            {/* ✅ Users (โชว์เฉพาะ admin) */}
            {currentUser?.role === "admin" && (
              <Link
                to="/users"
                style={{ color: "#e5e7eb", textDecoration: "none" }}
              >
                Users
              </Link>
            )}
          </nav>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {currentUser && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser.name} ({currentUser.role || "user"})
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              style={{
                fontSize: "13px",
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.8)",
                backgroundColor: "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </header>
      )}

      <main>
        <Routes>
          {/* หน้า login ไม่เช็ค token */}
          <Route path="/login" element={<LoginPage />} />

          {/* / ถ้ามี token แสดง Dashboard ถ้าไม่มีก็เด้งไป login */}
          <Route
            path="/"
            element={hasToken ? <Dashboard /> : <Navigate to="/login" replace />}
          />

          {/* ต้องล็อกอินก่อนถึงเข้าได้ */}
          <Route
            path="/tasks"
            element={
              <RequireAuth>
                <Tasks />
              </RequireAuth>
            }
          />

          <Route
            path="/tasks/:id"
            element={
              <RequireAuth>
                <TaskDetailPage />
              </RequireAuth>
            }
          />

          <Route
            path="/reports"
            element={
              <RequireAuth>
                <Reports />
              </RequireAuth>
            }
          />

          {/* ✅ User Management UI */}
          <Route
            path="/users"
            element={
              <RequireAuth>
                <UsersPage />
              </RequireAuth>
            }
          />

          {/* route อื่น ๆ เด้งไป login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
