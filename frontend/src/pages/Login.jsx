// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setApiToken } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");       // ✅ ไม่เด้งเมลเก่าเอง
  const [password, setPassword] = useState(""); // ✅ ไม่เด้งรหัสเก่าเอง
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ยิงไปที่ /api/login
      const res = await api.post("/login", {
        email,
        password,
      });

      const { token, user } = res.data;
      console.log("Login success:", user);

      // เก็บ user ลง localStorage ไว้ใช้โชว์ชื่อ/role ทีหลัง
      localStorage.setItem("taskreport_user", JSON.stringify(user));

      // เก็บ token + set header ให้ axios
      setApiToken(token);

      // ไปหน้า Tasks หลัง login
      navigate("/tasks");
    } catch (err) {
      console.error("Login error:", err);

      const msg =
        err.response?.data?.message ||
        "ไม่สามารถเข้าสู่ระบบได้ (ดู console เพิ่มเติม)";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px 28px 28px",
          borderRadius: "18px",
          background:
            "radial-gradient(circle at top left,#020617,#020617,#020617)",
          border: "1px solid rgba(148,163,184,0.35)",
          boxShadow: "0 20px 40px rgba(15,23,42,0.7)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "4px",
          }}
        >
          เข้าสู่ระบบ
        </h1>
        <p
          style={{
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "16px",
            opacity: 0.85,
          }}
        >
          ใช้บัญชีของระบบ Task &amp; Report
        </p>

        {error && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              borderRadius: "10px",
              backgroundColor: "#7f1d1d",
              border: "1px solid #fecaca",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}
            >
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}
            >
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: "999px",
              border: "none",
              background: loading
                ? "#4b5563"
                : "linear-gradient(to right,#6366f1,#8b5cf6)",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          * สำหรับทดสอบ: @test.com / 12345678
        </p>
      </div>
    </div>
  );
}
