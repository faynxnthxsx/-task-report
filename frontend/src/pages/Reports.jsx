// frontend/src/pages/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  if (!value) return "—";
  const d = toDate(value);
  if (!d) return value;
  // YYYY-MM-DD HH:MM
  return d.toISOString().slice(0, 16).replace("T", " ");
}

function formatDateShort(value) {
  if (!value) return "—";
  const d = toDate(value);
  if (!d) return value;
  return d.toISOString().slice(0, 10);
}

function statusLabel(status) {
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
}

function priorityLabel(priority) {
  switch (priority) {
    case "low":
      return "ต่ำ";
    case "high":
      return "สูง";
    case "normal":
    default:
      return "ปกติ";
  }
}

export default function ReportsPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter state (หน้า UI)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");

  // ⭐ ใหม่: filter ช่วง "วันที่สร้างงาน" (created_at)
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  // ดึง tasks จาก backend โดยใช้ filter หลัก (status + created_from/to)
  const fetchTasks = async (filters = {}) => {
    try {
      setLoading(true);

      const params = {};

      if (filters.status && filters.status !== "all") {
        params.status = filters.status;
      }

      if (filters.from) {
        params.from = filters.from; // รูปแบบ YYYY-MM-DD
      }

      if (filters.to) {
        params.to = filters.to; // รูปแบบ YYYY-MM-DD
      }

      // เรียงใหม่สุดอยู่บน (จะได้อ่านง่ายในหน้า report)
      params.sort = "latest";

      const res = await api.get("/tasks", { params });

      const list = res.data?.data || res.data || [];
      setTasks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("โหลด tasks สำหรับ Reports ไม่สำเร็จ", err);
      alert("โหลดข้อมูล Reports ไม่สำเร็จ (ดู console เพิ่มเติม)");
    } finally {
      setLoading(false);
    }
  };

  // เรียก fetchTasks ทุกครั้งที่ status/createdFrom/createdTo เปลี่ยน
  useEffect(() => {
    fetchTasks({
      status: statusFilter,
      from: createdFrom || undefined,
      to: createdTo || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, createdFrom, createdTo]);

  // filter ฝั่ง frontend: search + priority + deadline
  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((t) => {
      // ค้นหาใน title + detail
      const text = `${t.title || ""} ${t.detail || ""}`.toLowerCase();
      const q = search.trim().toLowerCase();
      if (q && !text.includes(q)) return false;

      // (ซ้ำกับ backend แต่กันเผื่อ)
      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false;
      }

      // filter ตาม deadline (ยังเป็น logic ฝั่ง frontend)
      if (deadlineFilter !== "all") {
        const d = t.deadline ? toDate(t.deadline) : null;

        if (deadlineFilter === "no_deadline") {
          if (d) return false;
        } else if (deadlineFilter === "overdue") {
          if (!d) return false;
          d.setHours(0, 0, 0, 0);
          if (d.getTime() >= today.getTime()) return false;
        } else if (deadlineFilter === "within_7") {
          if (!d) return false;
          d.setHours(0, 0, 0, 0);
          const diffMs = d.getTime() - today.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays < 0 || diffDays > 7) return false;
        }
      }

      // filter created_at แบบ frontend (ซ้ำกับ backend เพื่อความชัวร์)
      const created = t.created_at ? toDate(t.created_at) : null;
      if (createdFrom) {
        const fromDate = toDate(createdFrom);
        if (fromDate && created && created < fromDate) return false;
      }
      if (createdTo) {
        const toDateObj = toDate(createdTo);
        if (toDateObj && created && created > toDateObj) return false;
      }

      return true;
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    deadlineFilter,
    createdFrom,
    createdTo,
  ]);

  const counts = {
    total: tasks.length,
    filtered: filteredTasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  // สร้างไฟล์ CSV จาก filteredTasks แล้วให้โหลด
  const handleExportCsv = () => {
    if (filteredTasks.length === 0) {
      alert("ยังไม่มีรายการให้ export");
      return;
    }

    const header = [
      "id",
      "title",
      "detail",
      "status",
      "priority",
      "deadline",
      "created_at",
      "updated_at",
    ];

    const rows = filteredTasks.map((t) => [
      t.id,
      t.title || "",
      (t.detail || "").replace(/\r?\n/g, " "),
      t.status || "",
      t.priority || "",
      formatDateShort(t.deadline),
      formatDate(t.created_at),
      formatDate(t.updated_at),
    ]);

    const csvLines = [
      header.join(","),
      ...rows.map((r) =>
        r
          .map((cell) => {
            const text = String(cell ?? "");
            if (text.includes(",") || text.includes('"') || text.includes("\n")) {
              return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
          })
          .join(",")
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.download = `tasks-report-${ts}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f9fafb",
      }}
    >
      {/* หัว */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600 }}>
            Reports / รายงานงาน
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
            สรุปรายการงาน พร้อม filter และ export เป็น CSV ได้
          </p>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: "12px",
            opacity: 0.8,
          }}
        >
          <div>ทั้งหมด: {counts.total} งาน</div>
          <div>หลังกรอง: {counts.filtered} งาน</div>
          <div>เสร็จแล้ว: {counts.completed} งาน</div>
          <div>ค้าง/กำลังทำ: {counts.pending + counts.inProgress} งาน</div>
        </div>
      </div>

      {/* กล่อง filter + export */}
      <div
        style={{
          borderRadius: "18px",
          padding: "16px",
          marginBottom: "16px",
          border: "1px solid rgba(148,163,184,0.4)",
          background:
            "radial-gradient(circle at top left,#020617,#020617,#020617)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* ช่อง search */}
          <div style={{ flex: 2, minWidth: "200px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>
              ค้นหา (ชื่อ / รายละเอียด)
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="เช่น โครงงาน, การบ้านเครือข่าย..."
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            />
          </div>

          {/* filter สถานะ */}
          <div style={{ flex: 1, minWidth: "160px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">ค้างอยู่</option>
              <option value="in_progress">กำลังทำ</option>
              <option value="completed">ทำเสร็จแล้ว</option>
            </select>
          </div>

          {/* filter priority */}
          <div style={{ flex: 1, minWidth: "160px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>
              ความสำคัญ
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="low">ต่ำ</option>
              <option value="normal">ปกติ</option>
              <option value="high">สูง</option>
            </select>
          </div>

          {/* filter deadline */}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>
              เดดไลน์
            </label>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="overdue">เลยกำหนดแล้ว</option>
              <option value="within_7">ภายใน 7 วันข้างหน้า</option>
              <option value="no_deadline">ยังไม่กำหนดเดดไลน์</option>
            </select>
          </div>

          {/* ⭐ filter วันที่สร้าง: from */}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>
              วันที่สร้าง (ตั้งแต่)
            </label>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            />
          </div>

          {/* ⭐ filter วันที่สร้าง: to */}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "13px" }}>
              วันที่สร้าง (ถึง)
            </label>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(148,163,184,0.6)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {/* ปุ่ม export */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "12px", opacity: 0.8 }}>
            แสดง {filteredTasks.length} จาก {tasks.length} งาน
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: "8px 14px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(to right,#6366f1,#8b5cf6)",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Export CSV (เฉพาะที่กรองแล้ว)
          </button>
        </div>
      </div>

      {/* ตารางรายงาน */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid rgba(148,163,184,0.4)",
          overflow: "hidden",
          backgroundColor: "#020617",
        }}
      >
        <div
          style={{
            maxHeight: "520px",
            overflow: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#020617",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                {[
                  "ID",
                  "Title",
                  "Detail",
                  "Status",
                  "Priority",
                  "Deadline",
                  "Created At",
                  "Updated At",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "1px solid rgba(148,163,184,0.6)",
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#020617",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                  >
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                  >
                    ไม่พบงานตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid rgba(55,65,81,0.7)",
                    }}
                  >
                    <td style={{ padding: "6px 10px" }}>#{t.id}</td>
                    <td style={{ padding: "6px 10px" }}>{t.title}</td>
                    <td
                      style={{
                        padding: "6px 10px",
                        maxWidth: "260px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={t.detail || ""}
                    >
                      {t.detail || "—"}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      {statusLabel(t.status)}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      {priorityLabel(t.priority)}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      {formatDateShort(t.deadline)}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      {formatDate(t.created_at)}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      {formatDate(t.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
