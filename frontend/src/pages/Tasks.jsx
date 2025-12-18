// frontend/src/pages/Tasks.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function TasksPage() {
  const navigate = useNavigate();

  // ⭐ current user (ดึงจาก localStorage)
  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ admin / manager / staff สร้างงานได้
  const canCreateOrEdit =
    !!currentUser &&
    (currentUser.role === "admin" ||
      currentUser.role === "manager" ||
      currentUser.role === "staff");

  // ✅ ลบงานได้: admin/manager ลบได้ทุกงาน, staff ลบได้เฉพาะงานตัวเอง
  const canDelete =
    !!currentUser &&
    (currentUser.role === "admin" ||
      currentUser.role === "manager" ||
      currentUser.role === "staff");

  // ✅ ดู tags ได้ไหม (ตอนนี้ staff ยิง /tags แล้ว 403)
  const canViewTags =
    !!currentUser && (currentUser.role === "admin" || currentUser.role === "manager");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ฟอร์มสร้างงานใหม่
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("normal");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ⭐ ตัวกรอง / ค้นหา / sort
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // ✅ Tag map (taskId -> tags[])
  const [tagsByTaskId, setTagsByTaskId] = useState({});
  const [tagsLoadingByTaskId, setTagsLoadingByTaskId] = useState({});

  // ✅ แปลง sort ของหน้า UI -> ให้ตรงกับ backend (sort_by / sort_dir)
  const toBackendSort = (uiSort) => {
    switch (uiSort) {
      case "latest":
        return { sort_by: "created_at", sort_dir: "desc" };
      case "oldest":
        return { sort_by: "created_at", sort_dir: "asc" };
      case "deadline_asc":
        return { sort_by: "deadline", sort_dir: "asc" };
      case "deadline_desc":
        return { sort_by: "deadline", sort_dir: "desc" };
      default:
        return { sort_by: "created_at", sort_dir: "desc" };
    }
  };

  // โหลดรายการงาน (ตาม filter/search/sort)
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const { sort_by, sort_dir } = toBackendSort(sortBy);

        const res = await api.get("/tasks", {
          params: {
            // NOTE: backend ตอนนี้ไม่ได้ใช้ q แต่ส่งไปก็ไม่พัง
            q: searchText || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            priority: priorityFilter !== "all" ? priorityFilter : undefined,
            sort_by,
            sort_dir,
          },
        });

        const data = res.data.data ?? res.data;
        const list = Array.isArray(data) ? data : [];

        // ✅ reset tag cache ก่อน setTasks (กันค้าง/ไม่โหลด)
        setTagsByTaskId({});
        setTagsLoadingByTaskId({});

        setTasks(list);
      } catch (err) {
        console.error("โหลด tasks ไม่สำเร็จ", err);
        const msg = err.response?.data?.message || "ไม่สามารถโหลดรายการงานได้";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [searchText, statusFilter, priorityFilter, sortBy]);

  // ✅ โหลด tags ของแต่ละ task (MVP: แสดงใน list)
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    // ✅ staff โดน 403 -> ไม่ต้องยิงโหลด tags
    if (!canViewTags) {
      // ใส่เป็น [] เพื่อให้ UI แสดง "ไม่มี" แบบนิ่งๆ
      const next = {};
      tasks.forEach((t) => {
        if (t?.id) next[t.id] = [];
      });
      setTagsByTaskId(next);
      setTagsLoadingByTaskId({});
      return;
    }

    const fetchTagsForTask = async (taskId) => {
      if (tagsByTaskId[taskId]) return;
      if (tagsLoadingByTaskId[taskId]) return;

      setTagsLoadingByTaskId((prev) => ({ ...prev, [taskId]: true }));

      try {
        const res = await api.get(`/tasks/${taskId}/tags`);
        const tags = res.data?.tags ?? res.data;
        setTagsByTaskId((prev) => ({
          ...prev,
          [taskId]: Array.isArray(tags) ? tags : [],
        }));
      } catch (err) {
        // ถ้าโดน 403 ก็ทำเป็นไม่มี tag ไปเลย (ไม่ให้หน้าแดง/ไม่ให้ UI พัง)
        if (err.response?.status === 403) {
          setTagsByTaskId((prev) => ({ ...prev, [taskId]: [] }));
          return;
        }

        console.error(`โหลด tags ของ task ${taskId} ไม่สำเร็จ`, err);
        setTagsByTaskId((prev) => ({ ...prev, [taskId]: [] }));
      } finally {
        setTagsLoadingByTaskId((prev) => ({ ...prev, [taskId]: false }));
      }
    };

    tasks.forEach((t) => {
      if (t?.id) fetchTagsForTask(t.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, canViewTags]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!canCreateOrEdit) {
      alert("กรุณาเข้าสู่ระบบก่อนสร้างงาน");
      return;
    }

    if (!title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      // ✅ ให้ตรงกับ DB/Backend ของโปรเจคนี้: ใช้ assigned_to
      const payload = {
        title,
        detail,
        status,
        priority,
        deadline: deadline || null,
        assigned_to: currentUser?.id,
      };

      const res = await api.post("/tasks", payload);
      const newTask = res.data.data ?? res.data;

      setTasks((prev) => [newTask, ...prev]);

      // reset form
      setTitle("");
      setDetail("");
      setStatus("pending");
      setPriority("normal");
      setDeadline("");
    } catch (err) {
      console.error("สร้างงานใหม่ไม่สำเร็จ", err);

      const errors = err.response?.data?.errors;
      const msg =
        err.response?.data?.message ||
        (errors
          ? Object.values(errors).flat().join(" | ")
          : "สร้างงานใหม่ไม่สำเร็จ");

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!canDelete) {
      alert("กรุณาเข้าสู่ระบบก่อนลบงาน");
      return;
    }

    // ✅ staff ลบได้เฉพาะงานตัวเอง (ใช้ assigned_to)
    if (currentUser?.role === "staff" && task.assigned_to !== currentUser?.id) {
      alert("คุณไม่มีสิทธิ์ลบงานของคนอื่น");
      return;
    }

    if (!window.confirm("ต้องการลบงานนี้จริงหรือไม่?")) return;

    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));

      setTagsByTaskId((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    } catch (err) {
      console.error("ลบงานไม่สำเร็จ", err);
      const msg = err.response?.data?.message || "ลบงานไม่สำเร็จ (อาจไม่มีสิทธิ์)";
      alert(msg);
    }
  };

  const renderStatus = (statusValue) => {
    switch (statusValue) {
      case "pending":
        return "ค้างอยู่";
      case "in_progress":
        return "กำลังทำ";
      case "completed":
        return "ทำเสร็จแล้ว";
      default:
        return statusValue || "-";
    }
  };

  const renderPriority = (priorityValue) => {
    switch (priorityValue) {
      case "high":
        return "สูง";
      case "normal":
        return "ปกติ";
      case "low":
        return "ต่ำ";
      default:
        return priorityValue || "-";
    }
  };

  const tagChipStyle = useMemo(
    () => ({
      padding: "3px 8px",
      borderRadius: "999px",
      border: "1px solid rgba(148,163,184,0.7)",
      backgroundColor: "#111827",
    }),
    []
  );

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
      <div style={{ width: "100%", maxWidth: "960px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          จัดการงาน (Tasks)
        </h1>

        {/* ฟอร์มสร้างงานใหม่ */}
        <div
          style={{
            marginBottom: "20px",
            padding: "20px 22px",
            borderRadius: "18px",
            backgroundColor: "#111827",
            border: "1px solid rgba(148,163,184,0.5)",
            opacity: canCreateOrEdit ? 1 : 0.6,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>สร้างงานใหม่</h2>
            <span style={{ fontSize: "11px", color: "#fbbf24" }}>
              * admin / manager สร้างงานให้ใครก็ได้, staff สร้างงานของตัวเองได้
            </span>
          </div>

          {error && (
            <div
              style={{
                marginBottom: "10px",
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

          <form onSubmit={handleCreateTask}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
                หัวข้องาน
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canCreateOrEdit}
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

            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
                รายละเอียด
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                disabled={!canCreateOrEdit}
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

            {/* แถว status + priority + deadline */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={{ minWidth: "140px" }}>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
                  สถานะ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!canCreateOrEdit}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.6)",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    fontSize: "14px",
                  }}
                >
                  <option value="pending">ค้างอยู่</option>
                  <option value="in_progress">กำลังทำ</option>
                  <option value="completed">ทำเสร็จแล้ว</option>
                </select>
              </div>

              <div style={{ minWidth: "140px" }}>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
                  ความสำคัญ
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={!canCreateOrEdit}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(148,163,184,0.6)",
                    backgroundColor: "#020617",
                    color: "#e5e7eb",
                    fontSize: "14px",
                  }}
                >
                  <option value="low">ต่ำ</option>
                  <option value="normal">ปกติ</option>
                  <option value="high">สูง</option>
                </select>
              </div>

              <div style={{ minWidth: "180px" }}>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>
                  กำหนดส่ง
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={!canCreateOrEdit}
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
            </div>

            <button
              type="submit"
              disabled={submitting || !canCreateOrEdit}
              style={{
                padding: "9px 18px",
                borderRadius: "999px",
                border: "none",
                background:
                  submitting || !canCreateOrEdit
                    ? "#4b5563"
                    : "linear-gradient(to right,#6366f1,#8b5cf6)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: submitting || !canCreateOrEdit ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกงาน"}
            </button>
          </form>
        </div>

        {/* รายการงาน + แถบค้นหา / filter / sort */}
        <div
          style={{
            padding: "20px 22px",
            borderRadius: "18px",
            backgroundColor: "#020617",
            border: "1px solid rgba(31,41,55,0.9)",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
            รายการงานทั้งหมด
          </h2>

          {/* 🔎 แถบค้นหา / filter / sort */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <input
              type="text"
              placeholder="ค้นหาจากชื่อหรือรายละเอียดงาน..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: "1 1 220px",
                minWidth: "200px",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "14px",
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                flex: "0 0 150px",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="pending">ค้างอยู่</option>
              <option value="in_progress">กำลังทำ</option>
              <option value="completed">ทำเสร็จแล้ว</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                flex: "0 0 150px",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="all">ทุกความสำคัญ</option>
              <option value="high">สูง</option>
              <option value="normal">ปกติ</option>
              <option value="low">ต่ำ</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: "0 0 150px",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="latest">ล่าสุดก่อน</option>
              <option value="oldest">เก่าสุดก่อน</option>
              <option value="deadline_asc">ใกล้ครบกำหนดก่อน</option>
              <option value="deadline_desc">ครบกำหนดไกลสุดก่อน</option>
            </select>
          </div>

          {loading && <p>กำลังโหลดรายการงาน...</p>}

          {!loading && tasks.length === 0 && (
            <p style={{ color: "#6b7280" }}>ยังไม่มีงานในระบบ</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tasks.map((task) => {
              const canDeleteThisTask =
                !!currentUser &&
                (currentUser.role === "admin" ||
                  currentUser.role === "manager" ||
                  (currentUser.role === "staff" && task.assigned_to === currentUser.id));

              const tags = tagsByTaskId[task.id];
              const tagsLoading = !!tagsLoadingByTaskId[task.id];

              return (
                <div
                  key={task.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #1f2937",
                    backgroundColor: "#020617",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                      {task.title}
                    </div>

                    <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                      {task.detail || "— ไม่มีรายละเอียด —"}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "12px" }}>
                      <span style={tagChipStyle}>สถานะ: {renderStatus(task.status)}</span>
                      <span style={tagChipStyle}>ความสำคัญ: {renderPriority(task.priority)}</span>
                      <span style={tagChipStyle}>
                        กำหนดส่ง: {task.deadline ? task.deadline : "ยังไม่กำหนด"}
                      </span>
                    </div>

                    {/* ✅ เพิ่มบรรทัดแสดง Tags (เพิ่มข้อมูลอย่างเดียว ไม่เปลี่ยนสี/เลย์เอาต์เดิม) */}
                    <div
                      style={{
                        marginTop: "6px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        fontSize: "12px",
                      }}
                    >
                      <span style={tagChipStyle}>
                        แท็ก:{" "}
                        {tagsLoading
                          ? "กำลังโหลด..."
                          : !tags
                          ? "—"
                          : tags.length === 0
                          ? "ไม่มี"
                          : tags.map((t) => t.name).join(", ")}
                      </span>
                    </div>

                    <div style={{ marginTop: "6px", fontSize: "11px", color: "#6b7280" }}>
                      สร้างเมื่อ: {task.created_at || "-"}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      style={{
                        fontSize: "12px",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        border: "1px solid rgba(148,163,184,0.8)",
                        backgroundColor: "transparent",
                        color: "#e5e7eb",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ดูรายละเอียด
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task)}
                      disabled={!canDeleteThisTask}
                      style={{
                        fontSize: "12px",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        border: "1px solid #b91c1c",
                        backgroundColor: "transparent",
                        color: canDeleteThisTask ? "#fecaca" : "#6b7280",
                        cursor: canDeleteThisTask ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ลบงาน
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
