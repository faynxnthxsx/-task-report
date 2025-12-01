// frontend/src/pages/TaskDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ข้อมูลงาน
  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskError, setTaskError] = useState("");

  // คอมเมนต์ของงานนี้
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  // ฟอร์มคอมเมนต์ใหม่
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  // แก้ไขคอมเมนต์
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // user ปัจจุบัน (เอาไว้โชว์ชื่อ + สิทธิ์)
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const canCreateComment = !!currentUser;

  const handleBack = () => {
    navigate("/tasks");
  };

  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return "ค้างอยู่";
      case "in_progress":
        return "กำลังทำ";
      case "completed":
        return "ทำเสร็จแล้ว";
      default:
        return status || "-";
    }
  };

  const renderPriority = (priority) => {
    switch (priority) {
      case "high":
        return "สูง";
      case "normal":
        return "ปกติ";
      case "low":
        return "ต่ำ";
      default:
        return priority || "-";
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("th-TH");
  };

  // helper: normalize comment ให้อยู่ในรูปเดียวกัน
  const normalizeComment = (c) => {
    if (!c) return null;

    const body = (c.body ?? c.content ?? c.text ?? "").toString().trim();
    const createdAt = c.created_at ?? c.createdAt ?? null;

    const userName =
      c.user_name ?? c.user?.name ?? currentUser?.name ?? "ไม่ระบุชื่อ";

    return {
      ...c,
      body,
      user_name: userName,
      created_at: createdAt,
    };
  };

  // โหลดข้อมูล task
  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      setLoadingTask(true);
      setTaskError("");

      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data?.data ?? res.data);
      } catch (err) {
        console.error("โหลด task ไม่สำเร็จ", err);
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 404
            ? "ไม่พบบันทึกงานนี้ในระบบ"
            : "ไม่สามารถโหลดข้อมูลงานได้");
        setTaskError(msg);
      } finally {
        setLoadingTask(false);
      }
    };

    fetchTask();
  }, [id]);

  // โหลดคอมเมนต์ของ task นี้
  const loadComments = async () => {
    if (!id) return;

    setLoadingComments(true);
    setCommentsError("");

    try {
      const res = await api.get(`/tasks/${id}/comments`);
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      const normalized = list.map(normalizeComment).filter(Boolean);

      setComments(normalized);
    } catch (err) {
      console.error("โหลด comments ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "ไม่สามารถโหลดคอมเมนต์ได้";
      setCommentsError(msg);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ส่งคอมเมนต์ใหม่
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!id) return;

    setSendingComment(true);
    setCommentsError("");

    try {
      const res = await api.post(`/tasks/${id}/comments`, {
        body: newComment.trim(),
      });

      let created = normalizeComment(res.data);
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch (err) {
      console.error("ส่งคอมเมนต์ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "ไม่สามารถส่งคอมเมนต์ได้";
      setCommentsError(msg);
    } finally {
      setSendingComment(false);
    }
  };

  // เริ่มแก้ไขคอมเมนต์
  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditingText(comment.body || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  // บันทึกแก้ไขคอมเมนต์
  const handleSaveEdit = async (commentId) => {
    if (!editingText.trim()) return;
    if (!id) return;

    setSavingEdit(true);
    setCommentsError("");

    try {
      const res = await api.patch(`/tasks/${id}/comments/${commentId}`, {
        body: editingText.trim(),
      });

      const updated = normalizeComment(res.data);

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );

      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("แก้ไขคอมเมนต์ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "ไม่สามารถแก้ไขคอมเมนต์ได้";
      setCommentsError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  // ลบคอมเมนต์
  const handleDeleteComment = async (commentId) => {
    if (!id) return;

    const ok = window.confirm("ต้องการลบคอมเมนต์นี้ใช่ไหม?");
    if (!ok) return;

    setCommentsError("");

    try {
      await api.delete(`/tasks/${id}/comments/${commentId}`);

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("ลบคอมเมนต์ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "ไม่สามารถลบคอมเมนต์ได้";
      setCommentsError(msg);
    }
  };

  // ---------- UI ----------

  if (loadingTask) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e5e7eb",
        }}
      >
        <p>กำลังโหลดข้อมูลงาน...</p>
      </div>
    );
  }

  if (taskError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e5e7eb",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "#111827",
            borderRadius: "18px",
            padding: "20px 22px",
            border: "1px solid #b91c1c",
          }}
        >
          <p style={{ marginBottom: "12px" }}>{taskError}</p>
          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(to right, #6366f1, #8b5cf6)",
              color: "#fff",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            กลับไปหน้ารายการงาน
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        padding: "24px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "720px" }}>
        {/* ปุ่มกลับ */}
        <button
          type="button"
          onClick={handleBack}
          style={{
            marginBottom: "16px",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.8)",
            backgroundColor: "transparent",
            color: "#e5e7eb",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ← กลับไปหน้ารายการงาน
        </button>

        {/* กล่องรายละเอียดงาน */}
        <div
          style={{
            padding: "20px 22px",
            borderRadius: "18px",
            background:
              "radial-gradient(circle at top left,#020617,#020617,#020617)",
            border: "1px solid rgba(148,163,184,0.4)",
            boxShadow: "0 20px 40px rgba(15,23,42,0.7)",
            marginBottom: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            {task.title}
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#9ca3af",
              marginBottom: "14px",
              whiteSpace: "pre-wrap",
            }}
          >
            {task.detail || "— ไม่มีรายละเอียด —"}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#111827",
                border: "1px solid rgba(148,163,184,0.6)",
              }}
            >
              สถานะ: {renderStatus(task.status)}
            </span>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#111827",
                border: "1px solid rgba(148,163,184,0.6)",
              }}
            >
              ความสำคัญ: {renderPriority(task.priority)}
            </span>

            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#111827",
                border: "1px solid rgba(148,163,184,0.6)",
              }}
            >
              กำหนดส่ง: {task.deadline ? task.deadline : "ยังไม่กำหนด"}
            </span>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            <div>สร้างเมื่อ: {formatDateTime(task.created_at)}</div>
            <div>อัปเดตล่าสุด: {formatDateTime(task.updated_at)}</div>
          </div>
        </div>

        {/* ---------- คอมเมนต์ / บันทึกงาน ---------- */}
        <div
          style={{
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

          {/* ฟอร์มเพิ่มคอมเมนต์ */}
          {canCreateComment ? (
            <form
              onSubmit={handleSubmitComment}
              style={{ marginBottom: "12px" }}
            >
              <textarea
                placeholder="เขียนคอมเมนต์เกี่ยวกับงานนี้..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  backgroundColor: "#020617",
                  color: "#e5e7eb",
                  fontSize: "14px",
                  marginBottom: "8px",
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
                  แสดงเป็น: {currentUser?.name || "ผู้ใช้ที่เข้าสู่ระบบ"}
                </span>

                <button
                  type="submit"
                  disabled={sendingComment || !newComment.trim()}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      sendingComment || !newComment.trim()
                        ? "#4b5563"
                        : "linear-gradient(to right,#6366f1,#8b5cf6)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor:
                      sendingComment || !newComment.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {sendingComment ? "กำลังส่ง..." : "เพิ่มคอมเมนต์"}
                </button>
              </div>
            </form>
          ) : (
            <p
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                marginBottom: 12,
              }}
            >
              ต้องเข้าสู่ระบบก่อนจึงจะคอมเมนต์ได้
            </p>
          )}

          {/* error จากคอมเมนต์ */}
          {commentsError && (
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
              {commentsError}
            </div>
          )}

          {/* list คอมเมนต์ */}
          {loadingComments ? (
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              กำลังโหลดคอมเมนต์...
            </p>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              ยังไม่มีคอมเมนต์สำหรับงานนี้
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {comments.map((c) => {
                const isEditing = editingId === c.id;
                const canEdit = !!c.can_edit;
                const canDelete = !!c.can_delete;

                return (
                  <div
                    key={c.id}
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
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          {c.user_name || "ไม่ระบุชื่อ"}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                          }}
                        >
                          {formatDateTime(c.created_at || c.createdAt)}
                        </span>
                      </div>

                      {(canEdit || canDelete) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            fontSize: "11px",
                          }}
                        >
                          {canEdit && !isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(c)}
                              style={{
                                border: "none",
                                borderRadius: "999px",
                                padding: "3px 8px",
                                backgroundColor: "#111827",
                                color: "#e5e7eb",
                                cursor: "pointer",
                              }}
                            >
                              แก้ไข
                            </button>
                          )}

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c.id)}
                              style={{
                                border: "none",
                                borderRadius: "999px",
                                padding: "3px 8px",
                                backgroundColor: "#7f1d1d",
                                color: "#fee2e2",
                                cursor: "pointer",
                              }}
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* เนื้อหาคอมเมนต์ / ช่องแก้ไข */}
                    {isEditing ? (
                      <div
                        style={{
                          marginTop: "4px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            border:
                              "1px solid rgba(148,163,184,0.8)",
                            backgroundColor: "#020617",
                            color: "#e5e7eb",
                            fontSize: "13px",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "6px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            style={{
                              border: "none",
                              borderRadius: "999px",
                              padding: "4px 10px",
                              backgroundColor: "#111827",
                              color: "#e5e7eb",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            disabled={savingEdit || !editingText.trim()}
                            onClick={() => handleSaveEdit(c.id)}
                            style={{
                              border: "none",
                              borderRadius: "999px",
                              padding: "4px 10px",
                              background:
                                savingEdit || !editingText.trim()
                                  ? "#4b5563"
                                  : "linear-gradient(to right,#6366f1,#8b5cf6)",
                              color: "#fff",
                              fontSize: "12px",
                              cursor:
                                savingEdit || !editingText.trim()
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {savingEdit ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "13px",
                          whiteSpace: "pre-wrap",
                          marginTop: "2px",
                        }}
                      >
                        {c.body || "— (ไม่มีข้อความ) —"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
