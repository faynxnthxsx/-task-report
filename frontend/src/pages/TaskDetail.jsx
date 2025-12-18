// frontend/src/pages/TaskDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ---------- state ข้อมูลงาน ----------
  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskError, setTaskError] = useState("");

  // ---------- state แก้ไขงาน ----------
  const [editingTask, setEditingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editPriority, setEditPriority] = useState("normal");
  const [editDeadline, setEditDeadline] = useState("");

  // ---------- state คอมเมนต์ ----------
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // ---------- state tags ----------
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagsError, setTagsError] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [removingTagId, setRemovingTagId] = useState(null);

  // user ปัจจุบัน
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ owner ของงานนี้ (สำคัญมาก)
  const isOwner = useMemo(() => {
    if (!currentUser || !task) return false;
    return Number(task.assigned_to) === Number(currentUser.id);
  }, [currentUser, task]);

  const isAdminOrManager = useMemo(() => {
    return (
      !!currentUser &&
      (currentUser.role === "admin" || currentUser.role === "manager")
    );
  }, [currentUser]);

  // ✅ สิทธิ์ “ตามงานนี้”
  const canEditTask = useMemo(() => {
    if (!currentUser) return false;
    if (isAdminOrManager) return true;
    // staff แก้ได้เฉพาะงานตัวเอง
    return currentUser.role === "staff" && isOwner;
  }, [currentUser, isAdminOrManager, isOwner]);

  // ✅ แท็ก: ให้สิทธิ์ตาม canEditTask (ตามงานนี้)
  const canManageTags = canEditTask;

  // ✅ คอมเมนต์: admin/manager ทำได้ทุกงาน, staff ทำได้เฉพาะงานตัวเอง
  const canCreateComment = useMemo(() => {
    if (!currentUser) return false;
    if (isAdminOrManager) return true;
    return currentUser.role === "staff" && isOwner;
  }, [currentUser, isAdminOrManager, isOwner]);

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
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("th-TH");
  };

  const chipStyle = useMemo(
    () => ({
      padding: "4px 10px",
      borderRadius: "999px",
      backgroundColor: "#111827",
      border: "1px solid rgba(148,163,184,0.6)",
      fontSize: "13px",
    }),
    []
  );

  // helper: normalize comment ให้รูปแบบสม่ำเสมอ
  const normalizeComment = (c) => {
    if (!c) return null;

    const body = (c.body ?? c.content ?? "").toString().trim();
    const createdAt = c.created_at ?? c.createdAt ?? null;
    const userName = c.user_name ?? c.user?.name ?? "ไม่ระบุชื่อ";

    return {
      ...c,
      body,
      user_name: userName,
      created_at: createdAt,
    };
  };

  // ---------- โหลด task ----------
  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      setLoadingTask(true);
      setTaskError("");

      try {
        const res = await api.get(`/tasks/${id}`);
        const data = res.data?.data ?? res.data;
        if (!data) {
          setTaskError("ไม่พบข้อมูลงาน");
          setTask(null);
          return;
        }

        setTask(data);

        // set ค่าเริ่มต้นของฟอร์มแก้ไขงาน
        setEditTitle(data.title || "");
        setEditDetail(data.detail || "");
        setEditStatus(data.status || "pending");
        setEditPriority(data.priority || "normal");
        setEditDeadline(data.deadline || "");
      } catch (err) {
        console.error("โหลด task ไม่สำเร็จ", err);
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 404
            ? "ไม่พบบันทึกงานนี้ในระบบ"
            : err.response?.status === 403
            ? "คุณไม่มีสิทธิ์ดูงานนี้"
            : "ไม่สามารถโหลดข้อมูลงานได้");
        setTaskError(msg);
        setTask(null);
      } finally {
        setLoadingTask(false);
      }
    };

    fetchTask();
  }, [id]);

  // ---------- โหลด comments ----------
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

      // ✅ ถ้า 403 (ไม่ใช่เจ้าของ) ไม่ต้องขึ้นแดงรบกวนหน้า
      if (err.response?.status === 403) {
        setComments([]);
        setCommentsError("");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถโหลดคอมเมนต์ได้";
        setCommentsError(msg);
        setComments([]);
      }
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- โหลด tags ----------
  const loadTags = async () => {
    if (!id) return;

    setLoadingTags(true);
    setTagsError("");

    try {
      const res = await api.get(`/tasks/${id}/tags`);
      const list = res.data?.tags ?? res.data;
      setTags(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("โหลด tags ไม่สำเร็จ", err);

      // ✅ ถ้า 403 (ไม่ใช่เจ้าของ) ไม่ต้องขึ้นแดงรบกวนหน้า
      if (err.response?.status === 403) {
        setTags([]);
        setTagsError("");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถโหลดแท็กได้";
        setTagsError(msg);
        setTags([]);
      }
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- แก้ไขงาน ----------
  const handleStartEditTask = () => {
    if (!task) return;
    setEditTitle(task.title || "");
    setEditDetail(task.detail || "");
    setEditStatus(task.status || "pending");
    setEditPriority(task.priority || "normal");
    setEditDeadline(task.deadline || "");
    setEditingTask(true);
    setTaskError("");
  };

  const handleCancelEditTask = () => {
    if (task) {
      setEditTitle(task.title || "");
      setEditDetail(task.detail || "");
      setEditStatus(task.status || "pending");
      setEditPriority(task.priority || "normal");
      setEditDeadline(task.deadline || "");
    }
    setEditingTask(false);
  };

  const handleSaveTask = async () => {
    if (!task || !id) return;
    if (!editTitle.trim()) {
      setTaskError("กรุณากรอกชื่อหัวข้องาน");
      return;
    }

    setSavingTask(true);
    setTaskError("");

    try {
      const payload = {
        title: editTitle.trim(),
        detail: editDetail,
        status: editStatus,
        priority: editPriority,
        deadline: editDeadline || null,
      };

      const res = await api.patch(`/tasks/${id}`, payload);
      const updated = res.data?.data ?? res.data;

      setTask(updated);
      setEditingTask(false);
    } catch (err) {
      console.error("แก้ไขงานไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "คุณไม่มีสิทธิ์แก้ไขงานนี้"
          : "ไม่สามารถบันทึกการแก้ไขงานได้");
      setTaskError(msg);
    } finally {
      setSavingTask(false);
    }
  };

  // ---------- tags: เพิ่ม ----------
  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!id) return;

    const name = newTagName.trim();
    if (!name) return;

    setAddingTag(true);
    setTagsError("");

    try {
      const res = await api.post(`/tasks/${id}/tags`, { name });

      const nextTags = res.data?.tags;
      if (Array.isArray(nextTags)) {
        setTags(nextTags);
      } else {
        setTags((prev) => {
          const exists = prev.some(
            (t) => (t?.name || "").toLowerCase() === name.toLowerCase()
          );
          return exists ? prev : [...prev, res.data?.tag ?? { name }];
        });
        await loadTags();
      }

      setNewTagName("");
    } catch (err) {
      console.error("เพิ่มแท็กไม่สำเร็จ", err);

      if (err.response?.status === 403) {
        setTagsError("คุณไม่มีสิทธิ์เพิ่มแท็กของงานนี้");
      } else {
        const msg =
          err.response?.data?.message ||
          (err.response?.status === 409
            ? "แท็กนี้มีอยู่แล้ว"
            : "ไม่สามารถเพิ่มแท็กได้");
        setTagsError(msg);
      }
    } finally {
      setAddingTag(false);
    }
  };

  // ---------- tags: ลบ ----------
  const handleRemoveTag = async (tag) => {
    if (!id) return;
    if (!tag?.id) {
      setTagsError("ลบแท็กไม่สำเร็จ: ไม่พบ tag id");
      return;
    }

    const ok = window.confirm(`ต้องการลบแท็ก "${tag.name}" ออกจากงานนี้ใช่ไหม?`);
    if (!ok) return;

    setRemovingTagId(tag.id);
    setTagsError("");

    try {
      await api.delete(`/tasks/${id}/tags/${tag.id}`);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      await loadTags();
    } catch (err) {
      console.error("ลบแท็กไม่สำเร็จ", err);

      if (err.response?.status === 403) {
        setTagsError("คุณไม่มีสิทธิ์ลบแท็กของงานนี้");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถลบแท็กได้";
        setTagsError(msg);
      }
    } finally {
      setRemovingTagId(null);
    }
  };

  // ---------- คอมเมนต์: สร้าง ----------
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

      const created = normalizeComment(res.data);
      if (created) {
        setComments((prev) => [...prev, created]);
      }
      setNewComment("");
    } catch (err) {
      console.error("ส่งคอมเมนต์ไม่สำเร็จ", err);

      if (err.response?.status === 403) {
        setCommentsError("คุณไม่มีสิทธิ์คอมเมนต์ในงานนี้");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถส่งคอมเมนต์ได้";
        setCommentsError(msg);
      }
    } finally {
      setSendingComment(false);
    }
  };

  // ---------- คอมเมนต์: แก้ไข ----------
  const handleStartEditComment = (comment) => {
    setEditingId(comment.id);
    setEditingText(comment.body || "");
  };

  const handleCancelEditComment = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingText.trim()) return;
    if (!id) return;

    setSavingEdit(true);
    setCommentsError("");

    try {
      const res = await api.patch(`/tasks/${id}/comments/${commentId}`, {
        body: editingText.trim(),
      });

      const updated = normalizeComment(res.data);

      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));

      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error("แก้ไขคอมเมนต์ไม่สำเร็จ", err);

      if (err.response?.status === 403) {
        setCommentsError("คุณไม่มีสิทธิ์แก้ไขคอมเมนต์นี้");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถแก้ไขคอมเมนต์ได้";
        setCommentsError(msg);
      }
    } finally {
      setSavingEdit(false);
    }
  };

  // ---------- คอมเมนต์: ลบ ----------
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

      if (err.response?.status === 403) {
        setCommentsError("คุณไม่มีสิทธิ์ลบคอมเมนต์นี้");
      } else {
        const msg = err.response?.data?.message || "ไม่สามารถลบคอมเมนต์ได้";
        setCommentsError(msg);
      }
    }
  };

  // ---------- UI state ระหว่างโหลด / error ----------
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

  if (taskError && !task) {
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

  if (!task) return null;

  // ---------- MAIN UI ----------
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

        {/* กล่องรายละเอียดงาน + แก้ไขงาน */}
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
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
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
              marginBottom: "10px",
            }}
          >
            <span style={chipStyle}>สถานะ: {renderStatus(task.status)}</span>
            <span style={chipStyle}>ความสำคัญ: {renderPriority(task.priority)}</span>
            <span style={chipStyle}>
              กำหนดส่ง: {task.deadline ? task.deadline : "ยังไม่กำหนด"}
            </span>
          </div>

          <div style={{ marginTop: "4px", fontSize: "12px", color: "#6b7280" }}>
            <div>สร้างเมื่อ: {formatDateTime(task.created_at)}</div>
            <div>อัปเดตล่าสุด: {formatDateTime(task.updated_at)}</div>
          </div>

          {/* error จากการแก้ไขงาน */}
          {taskError && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 10px",
                borderRadius: "10px",
                backgroundColor: "#7f1d1d",
                border: "1px solid #fecaca",
                fontSize: "13px",
              }}
            >
              {taskError}
            </div>
          )}

          {/* ฟอร์มแก้ไขงาน */}
          {canEditTask && (
            <div
              style={{
                marginTop: "16px",
                paddingTop: "10px",
                borderTop: "1px dashed rgba(148,163,184,0.5)",
              }}
            >
              {!editingTask ? (
                <button
                  type="button"
                  onClick={handleStartEditTask}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.8)",
                    backgroundColor: "transparent",
                    color: "#e5e7eb",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  แก้ไขงานนี้
                </button>
              ) : (
                <div
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                      }}
                    >
                      หัวข้องาน
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "#020617",
                        color: "#e5e7eb",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        marginBottom: "4px",
                      }}
                    >
                      รายละเอียด
                    </label>
                    <textarea
                      value={editDetail}
                      onChange={(e) => setEditDetail(e.target.value)}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "#020617",
                        color: "#e5e7eb",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ minWidth: "140px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        สถานะ
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148,163,184,0.7)",
                          backgroundColor: "#020617",
                          color: "#e5e7eb",
                          fontSize: "13px",
                        }}
                      >
                        <option value="pending">ค้างอยู่</option>
                        <option value="in_progress">กำลังทำ</option>
                        <option value="completed">ทำเสร็จแล้ว</option>
                      </select>
                    </div>

                    <div style={{ minWidth: "140px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        ความสำคัญ
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148,163,184,0.7)",
                          backgroundColor: "#020617",
                          color: "#e5e7eb",
                          fontSize: "13px",
                        }}
                      >
                        <option value="low">ต่ำ</option>
                        <option value="normal">ปกติ</option>
                        <option value="high">สูง</option>
                      </select>
                    </div>

                    <div style={{ minWidth: "180px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        กำหนดส่ง
                      </label>
                      <input
                        type="date"
                        value={editDeadline || ""}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: "1px solid rgba(148,163,184,0.7)",
                          backgroundColor: "#020617",
                          color: "#e5e7eb",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleCancelEditTask}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: "#111827",
                        color: "#e5e7eb",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={savingTask}
                      onClick={handleSaveTask}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        border: "none",
                        background: savingTask
                          ? "#4b5563"
                          : "linear-gradient(to right,#6366f1,#8b5cf6)",
                        color: "#fff",
                        fontSize: "13px",
                        cursor: savingTask ? "not-allowed" : "pointer",
                      }}
                    >
                      {savingTask ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------- TAGS (MVP) ---------- */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "10px",
              borderTop: "1px dashed rgba(148,163,184,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "10px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                แท็กของงานนี้
              </h2>

              {/* ✅ รีเฟรชแสดงได้ทุกคน (ดูอย่างเดียวไม่พัง) */}
              <button
                type="button"
                onClick={loadTags}
                style={{
                  border: "1px solid rgba(148,163,184,0.8)",
                  backgroundColor: "transparent",
                  color: "#e5e7eb",
                  borderRadius: "999px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                รีเฟรชแท็ก
              </button>
            </div>

            {tagsError && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  backgroundColor: "#7f1d1d",
                  border: "1px solid #fecaca",
                  fontSize: "13px",
                }}
              >
                {tagsError}
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              {loadingTags ? (
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                  กำลังโหลดแท็ก...
                </p>
              ) : tags.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#6b7280" }}>ยังไม่มีแท็ก</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {tags.map((t) => (
                    <span
                      key={t.id ?? t.name}
                      style={{
                        ...chipStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      #{t.name}
                      {canManageTags && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          disabled={removingTagId === t.id}
                          style={{
                            border: "none",
                            backgroundColor: "#7f1d1d",
                            color: "#fee2e2",
                            borderRadius: "999px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            cursor:
                              removingTagId === t.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {removingTagId === t.id ? "..." : "ลบ"}
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ ฟอร์มเพิ่มแท็ก: แสดงเฉพาะคนที่มีสิทธิ์จริง */}
            {canManageTags ? (
              <form
                onSubmit={handleAddTag}
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="พิมพ์ชื่อแท็ก เช่น urgent"
                  style={{
                    flex: "1 1 220px",
                    minWidth: "200px",
                    padding: "8px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.7)",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    fontSize: "13px",
                  }}
                />
                <button
                  type="submit"
                  disabled={addingTag || !newTagName.trim()}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "none",
                    background:
                      addingTag || !newTagName.trim()
                        ? "#4b5563"
                        : "linear-gradient(to right,#6366f1,#8b5cf6)",
                    color: "#fff",
                    fontSize: "13px",
                    cursor:
                      addingTag || !newTagName.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingTag ? "กำลังเพิ่ม..." : "เพิ่มแท็ก"}
                </button>
              </form>
            ) : (
              <p style={{ marginTop: "10px", fontSize: "13px", color: "#9ca3af" }}>
                คุณไม่มีสิทธิ์จัดการแท็กของงานนี้
              </p>
            )}
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
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "10px" }}>
            คอมเมนต์ / บันทึกงาน
          </h2>

          {/* ✅ ฟอร์มเพิ่มคอมเมนต์: เฉพาะคนที่มีสิทธิ์จริง */}
          {canCreateComment ? (
            <form onSubmit={handleSubmitComment} style={{ marginBottom: "12px" }}>
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
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>
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
            <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: 12 }}>
              คุณไม่มีสิทธิ์คอมเมนต์ในงานนี้
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
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>
                          {c.user_name || "ไม่ระบุชื่อ"}
                        </span>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>
                          {formatDateTime(c.created_at || c.createdAt)}
                        </span>
                      </div>

                      {(canEdit || canDelete) && (
                        <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
                          {canEdit && !isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEditComment(c)}
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
                            border: "1px solid rgba(148,163,184,0.8)",
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
                            onClick={handleCancelEditComment}
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
                            onClick={() => handleSaveEditComment(c.id)}
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
