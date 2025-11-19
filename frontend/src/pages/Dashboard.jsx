// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await api.get("/tasks");
        const data = res.data;

        let list = [];
        if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        setTasks(list);
      } catch (err) {
        console.error("โหลดงานไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.status === "done" || t.status === "completed"
    ).length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const latestTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const d1 = new Date(a.created_at || 0).getTime();
      const d2 = new Date(b.created_at || 0).getTime();
      return d2 - d1;
    });
    return sorted.slice(0, 5);
  }, [tasks]);

  if (loading) {
    return <p style={{ padding: "1.5rem" }}>กำลังโหลด Dashboard...</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <h1>Task &amp; Report Dashboard</h1>
        <p className="dashboard-subtitle">
          ภาพรวมงานและรายงานแบบย่อจากข้อมูลงานในระบบ
        </p>

        {/* การ์ดสรุป */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>งานทั้งหมด</h3>
            <p className="dashboard-number">{summary.total}</p>
          </div>

          <div className="dashboard-card">
            <h3>ทำเสร็จแล้ว</h3>
            <p className="dashboard-number">{summary.completed}</p>
          </div>

          <div className="dashboard-card">
            <h3>กำลังทำ</h3>
            <p className="dashboard-number">{summary.inProgress}</p>
          </div>

          <div className="dashboard-card">
            <h3>ค้างอยู่</h3>
            <p className="dashboard-number">{summary.pending}</p>
          </div>
        </div>

        {/* ส่วนล่าง: งานล่าสุด + ปุ่มลัด */}
        <div className="dashboard-main">
          <div className="dashboard-panel">
            <h3>งานล่าสุด</h3>
            {latestTasks.length === 0 ? (
              <p className="dashboard-empty">ยังไม่มีงานในระบบ</p>
            ) : (
              <ul className="dashboard-list">
                {latestTasks.map((task) => (
                  <li key={task.id} className="dashboard-list-item">
                    <div>
                      <div className="dashboard-task-title">{task.title}</div>
                      <div className="dashboard-task-meta">
                        <span>สถานะ: {task.status}</span>
                        <span>
                          &nbsp;•&nbsp;
                          {task.created_at
                            ? new Date(task.created_at).toLocaleDateString(
                                "th-TH"
                              )
                            : "ไม่ทราบวันที่"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>เมนูลัด</h3>
            <p style={{ marginBottom: "0.75rem" }}>
              ไปจัดการงานหรือดูรายงานแบบละเอียด
            </p>
            <div className="dashboard-actions">
              <Link to="/tasks" className="btn">
                จัดการงาน (Tasks)
              </Link>
              <Link to="/reports" className="btn">
                ดูรายงาน (Reports)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
