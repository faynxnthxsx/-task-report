// src/pages/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function Reports() {
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

  if (loading) {
    return <p>กำลังโหลดรายงาน...</p>;
  }

  return (
    <div className="reports-page">
      <div className="reports-inner">
        <h2>Reports</h2>
        <p className="reports-subtitle">
          สรุปรายงานผลงานจากข้อมูลงานในระบบ
        </p>

        {/* การ์ดสรุปด้านบน */}
        <div className="report-cards">
          <div className="report-card">
            <h3>งานทั้งหมด</h3>
            <p className="report-number">{summary.total}</p>
          </div>

          <div className="report-card">
            <h3>ทำเสร็จแล้ว</h3>
            <p className="report-number">{summary.completed}</p>
          </div>

          <div className="report-card">
            <h3>กำลังทำ / ค้าง</h3>
            <p className="report-number">
              {summary.inProgress + summary.pending}
            </p>
          </div>
        </div>

        {/* ตารางรายละเอียด */}
        <h3 style={{ marginTop: "2rem" }}>รายละเอียดงาน</h3>
        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่องาน</th>
                <th>สถานะ</th>
                <th>วันที่สร้าง</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    ยังไม่มีงานในระบบ
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>
                      {task.created_at
                        ? new Date(task.created_at).toLocaleDateString("th-TH")
                        : "-"}
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
