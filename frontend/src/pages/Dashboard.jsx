// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateShort(value) {
  if (!value) return "—";
  const d = toDate(value);
  if (!d) return value;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
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

function deadlineInfo(deadline) {
  if (!deadline) {
    return {
      label: "ไม่กำหนดเดดไลน์",
      tone: "none",
    };
  }

  const d = toDate(deadline);
  if (!d) {
    return {
      label: "รูปแบบวันที่ผิด",
      tone: "none",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `เลยมา ${Math.abs(diffDays)} วัน`, tone: "danger" };
  }
  if (diffDays === 0) {
    return { label: "เดดไลน์วันนี้", tone: "warning" };
  }
  if (diffDays <= 2) {
    return { label: `อีก ${diffDays} วัน`, tone: "warning" };
  }
  if (diffDays <= 7) {
    return { label: `ภายใน ${diffDays} วัน`, tone: "ok" };
  }
  return { label: `เหลืออีก ${diffDays} วัน`, tone: "ok" };
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      const list = res.data.data || res.data || [];
      setTasks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("โหลด tasks สำหรับ Dashboard ไม่สำเร็จ", err);
      alert("โหลดข้อมูล Dashboard ไม่สำเร็จ (ดู console เพิ่มเติม)");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ดึงข้อมูล user ปัจจุบันแล้วเก็บลง localStorage
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/me");
        localStorage.setItem("taskreport_user", JSON.stringify(res.data));
        console.log("โหลดข้อมูลผู้ใช้สำเร็จ:", res.data);
      } catch (err) {
        console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // โหลดรายการงานสำหรับ Dashboard
  useEffect(() => {
    fetchTasks();
  }, []);

  const total = tasks.length;

  const statusCounts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const priorityCounts = {
    low: tasks.filter((t) => t.priority === "low").length,
    normal: tasks.filter((t) => t.priority === "normal").length,
    high: tasks.filter((t) => t.priority === "high").length,
  };

  const tasksWithDeadline = tasks.filter((t) => t.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = tasksWithDeadline.filter((t) => {
    const d = toDate(t.deadline);
    if (!d) return false;
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  });

  const upcoming = [...tasksWithDeadline]
    .sort((a, b) => {
      const da = toDate(a.deadline);
      const db = toDate(b.deadline);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    })
    .slice(0, 5); // เอาแค่ 5 งานที่ใกล้สุด

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f9fafb",
      }}
    >
      {/* หัวข้อหลัก */}
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
            Dashboard ภาพรวมงาน
          </h1>
          <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
            สรุปสถานะงาน, ความสำคัญ และเดดไลน์แบบเร็ว ๆ
          </p>
        </div>
        <span style={{ fontSize: "12px", opacity: 0.8 }}>
          งานทั้งหมด: {total} รายการ
        </span>
      </div>

      {loading ? (
        <p>กำลังโหลดข้อมูล Dashboard...</p>
      ) : (
        <>
          {/* กล่องสรุปบนสุด */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <SummaryCard
              title="งานทั้งหมด"
              value={total}
              description="ทุกสถานะรวมกัน"
            />
            <SummaryCard
              title="ค้างอยู่"
              value={statusCounts.pending}
              description="ยังไม่เริ่ม / ยังไม่เปลี่ยนสถานะ"
            />
            <SummaryCard
              title="กำลังทำ"
              value={statusCounts.inProgress}
              description="งานที่อยู่ระหว่างดำเนินการ"
            />
            <SummaryCard
              title="ทำเสร็จแล้ว"
              value={statusCounts.completed}
              description="งานที่ปิดเรียบร้อย"
            />
            <SummaryCard
              title="High priority"
              value={priorityCounts.high}
              description="งานสำคัญสูง"
            />
            <SummaryCard
              title="เลยเดดไลน์"
              value={overdue.length}
              description="เลยวันกำหนดส่งแล้ว"
              highlight={overdue.length > 0}
            />
          </div>

          {/* แถวล่าง: งานเดดไลน์ใกล้ + สรุปสถานะ/priority เล็ก ๆ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)",
              gap: "16px",
            }}
          >
            {/* งานที่เดดไลน์ใกล้ ๆ */}
            <div
              style={{
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid rgba(148,163,184,0.4)",
                background:
                  "radial-gradient(circle at top left,#020617,#020617,#020617)",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                งานที่เดดไลน์ใกล้ / เลยกำหนด
              </h2>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: "13px", opacity: 0.8 }}>
                  ยังไม่มีงานที่กำหนดเดดไลน์
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {upcoming.map((task) => {
                    const info = deadlineInfo(task.deadline);

                    let border = "rgba(148,163,184,0.4)";
                    let bg = "#020617";
                    if (info.tone === "danger") {
                      border = "#f97373";
                      bg = "rgba(127,29,29,0.4)";
                    } else if (info.tone === "warning") {
                      border = "#facc15";
                      bg = "rgba(113,63,18,0.4)";
                    } else if (info.tone === "ok") {
                      border = "#22c55e";
                      bg = "rgba(22,101,52,0.4)";
                    }

                    return (
                      <div
                        key={task.id}
                        style={{
                          borderRadius: "10px",
                          border: `1px solid ${border}`,
                          backgroundColor: bg,
                          padding: "6px 8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                            }}
                          >
                            #{task.id} · {task.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.85,
                            }}
                          >
                            เดดไลน์: {formatDateShort(task.deadline)} · สถานะ:{" "}
                            {statusLabel(task.status)} · ความสำคัญ:{" "}
                            {priorityLabel(task.priority)}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            border: "1px solid rgba(15,23,42,0.9)",
                            backgroundColor: "rgba(15,23,42,0.9)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {info.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* สรุปเล็ก ๆ ทางขวา */}
            <div
              style={{
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid rgba(148,163,184,0.4)",
                background:
                  "radial-gradient(circle at top left,#020617,#020617,#020617)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                สรุปแบบเร็ว
              </h2>
              <RowLine
                label="สัดส่วนสถานะ"
                value={`${statusCounts.pending} ค้าง · ${statusCounts.inProgress} กำลังทำ · ${statusCounts.completed} เสร็จแล้ว`}
              />
              <RowLine
                label="ความสำคัญ"
                value={`${priorityCounts.low} ต่ำ · ${priorityCounts.normal} ปกติ · ${priorityCounts.high} สูง`}
              />
              <RowLine
                label="งานที่มีเดดไลน์"
                value={`${tasksWithDeadline.length} งาน`}
              />
              <RowLine
                label="เลยเดดไลน์แล้ว"
                value={`${overdue.length} งาน`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, description, highlight = false }) {
  return (
    <div
      style={{
        borderRadius: "18px",
        padding: "16px",
        border: highlight
          ? "1px solid #f97373"
          : "1px solid rgba(148,163,184,0.4)",
        background: highlight
          ? "radial-gradient(circle at top left,#7f1d1d,#020617)"
          : "radial-gradient(circle at top left,#020617,#020617,#020617)",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          opacity: 0.9,
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          opacity: 0.7,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function RowLine({ label, value }) {
  return (
    <div
      style={{
        fontSize: "12px",
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: "2px" }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}
