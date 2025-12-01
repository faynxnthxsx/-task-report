// frontend/src/components/TaskComments.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function TaskComments({ taskId }) {
  // ดึง user ปัจจุบัน (เอาไว้โชว์ชื่อ)
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canCreateComment = !!currentUser; // แค่ล็อกอินก็เมนต์ได้

  // โหลดคอมเมนต์ของ task นี้
  async function loadComments() {
    if (!taskId) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/tasks/${taskId}/comments`);

      // backend อาจส่งแบบ { data: [...] } หรือ [...] ตรง ๆ
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : [];

      console.log("COMMENTS RESPONSE =", raw);
      setComments(list);
    } catch (err) {
      console.error("Error loading comments", err);
      setError("โหลดคอมเมนต์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // ส่งคอมเมนต์ใหม่
  async function handleSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      // 👇 ให้ชื่อ field ตรงกับ controller: 'body'
      const res = await api.post(`/tasks/${taskId}/comments`, {
        body: newComment.trim(),
      });

      // สมมติ backend คืนคอมเมนต์ตัวที่สร้างกลับมา
      const created = res.data?.data ?? res.data ?? null;

      setNewComment("");

      if (created && created.id) {
        // เติมเข้า list ทันที
        setComments((prev) => [...prev, created]);
      } else {
        // ถ้า backend ไม่คืน object มา ก็ reload ทั้ง list
        await loadComments();
      }
    } catch (err) {
      console.error("Error posting comment", err);
      setError(err.response?.data?.message || "ส่งคอมเมนต์ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("th-TH");
    } catch {
      return value;
    }
  }

  // ⭐ กรองคอมเมนต์ที่ไม่มีข้อความทิ้ง (แก้เคสคอมเมนต์เก่า ๆ ที่ว่างเปล่า)
  const visibleComments = comments.filter((c) => {
    const text = (c.body || c.content || c.text || "").trim();
    return text.length > 0;
  });

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "16px 18px",
        borderRadius: "16px",
        backgroundColor: "#020617",
        border: "1px solid rgba(148,163,184,0.4)",
      }}
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "10px",
        }}
      >
        คอมเมนต์ / บันทึกงาน
      </h2>

      {/* สถานะโหลด / error */}
      {loading && (
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
          กำลังโหลดคอมเมนต์...
        </p>
      )}

      {error && (
        <div
          style={{
            marginBottom: "8px",
            padding: "6px 8px",
            borderRadius: "8px",
            backgroundColor: "#7f1d1d",
            border: "1px solid #fecaca",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* list คอมเมนต์ */}
      {!loading && visibleComments.length === 0 && (
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          ยังไม่มีคอมเมนต์สำหรับงานนี้
        </p>
      )}

      {visibleComments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "4px",
            marginBottom: "12px",
          }}
        >
          {visibleComments.map((c, index) => (
            <div
              // ✅ ให้ key ไม่ซ้ำแน่นอน (กัน warning "unique key")
              key={
                c.id ??
                `${c.task_id || "task"}-${c.user_id || "user"}-${
                  c.created_at || index
                }-${index}`
              }
              style={{
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid rgba(148,163,184,0.4)",
                backgroundColor: "#020617",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {c.user_name || c.user?.name || c.author || "ไม่ระบุชื่อ"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  {formatDate(c.created_at || c.createdAt)}
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {c.body || c.content || c.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ฟอร์มเพิ่มคอมเมนต์ */}
      {!canCreateComment && (
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          ต้องเข้าสู่ระบบก่อนจึงจะคอมเมนต์ได้
        </p>
      )}

      {canCreateComment && (
        <form onSubmit={handleSubmit} style={{ marginTop: "8px" }}>
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เขียนคอมเมนต์เกี่ยวกับงานนี้..."
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.6)",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              fontSize: "14px",
              marginBottom: "8px",
              resize: "vertical",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#9ca3af",
              }}
            >
              แสดงเป็น:{" "}
              {currentUser?.name ? currentUser.name : "ผู้ใช้ที่เข้าสู่ระบบ"}
            </span>

            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              style={{
                padding: "7px 14px",
                borderRadius: "999px",
                border: "none",
                background:
                  submitting || !newComment.trim()
                    ? "#4b5563"
                    : "linear-gradient(to right,#6366f1,#8b5cf6)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor:
                  submitting || !newComment.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting ? "กำลังส่ง..." : "เพิ่มคอมเมนต์"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
