// frontend/src/pages/Tasks.jsx
import { useEffect, useState } from "react";
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

  const canCreateOrEdit =
    currentUser && (currentUser.role === "admin" || currentUser.role === "manager");
  const canDelete = currentUser && currentUser.role === "admin";

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

  // โหลดรายการงาน (ตาม filter/search/sort)
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/tasks", {
          params: {
            q: searchText || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            priority: priorityFilter !== "all" ? priorityFilter : undefined, // ⭐ เพิ่มตรงนี้
            sort: sortBy,
          },
        });

        const data = res.data.data ?? res.data;
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("โหลด tasks ไม่สำเร็จ", err);
        const msg =
          err.response?.data?.message || "ไม่สามารถโหลดรายการงานได้";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [searchText, statusFilter, priorityFilter, sortBy]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!canCreateOrEdit) {
      alert("คุณไม่มีสิทธิ์สร้างงาน (ต้องเป็น admin หรือ manager)");
      return;
    }
    if (!title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title,
        detail,
        status,
        priority,
        deadline: deadline || null,
      };

      const res = await api.post("/tasks", payload);
      const newTask = res.data.data ?? res.data;

      setTasks((prev) => [newTask, ...prev]);

      setTitle("");
      setDetail("");
      setStatus("pending");
      setPriority("normal");
      setDeadline("");
    } catch (err) {
      console.error("สร้างงานใหม่ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "สร้างงานใหม่ไม่สำเร็จ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!canDelete) {
      alert("ลบงานได้เฉพาะ admin เท่านั้น");
      return;
    }

    if (!window.confirm("ต้องการลบงานนี้จริงหรือไม่?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("ลบงานไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message || "ลบงานไม่สำเร็จ (อาจไม่มีสิทธิ์)";
      alert(msg);
    }
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
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              สร้างงานใหม่
            </h2>
            {!canCreateOrEdit && (
              <span style={{ fontSize: "11px", color: "#fbbf24" }}>
                * สร้างงานได้เฉพาะ admin / manager
              </span>
            )}
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
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
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
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
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
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
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
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
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
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
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
                cursor:
                  submitting || !canCreateOrEdit ? "not-allowed" : "pointer",
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
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
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

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {tasks.map((task) => (
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
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {task.title}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                    }}
                  >
                    {task.detail || "— ไม่มีรายละเอียด —"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "#111827",
                      }}
                    >
                      สถานะ: {renderStatus(task.status)}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "#111827",
                      }}
                    >
                      ความสำคัญ: {renderPriority(task.priority)}
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        border: "1px solid rgba(148,163,184,0.7)",
                        backgroundColor: "#111827",
                      }}
                    >
                      กำหนดส่ง:{" "}
                      {task.deadline ? task.deadline : "ยังไม่กำหนด"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    สร้างเมื่อ: {task.created_at || "-"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
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
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={!canDelete}
                    style={{
                      fontSize: "12px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: "1px solid #b91c1c",
                      backgroundColor: "transparent",
                      color: canDelete ? "#fecaca" : "#6b7280",
                      cursor: canDelete ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ลบงาน
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
