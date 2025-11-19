// src/pages/Tasks.jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    detail: "",
    status: "pending", // ✅ เพิ่มสถานะในฟอร์ม
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState("");

  // โหลดรายการงานจาก Laravel
  async function fetchTasks() {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();

      // Laravel Resource collection ส่ง { data: [...] }
      if (Array.isArray(data?.data)) {
        setTasks(data.data);
      } else if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setErr(e.message || "โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  // เพิ่ม / แก้ไข งาน
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setSaving(true);
      setErr("");

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/api/tasks/${editingId}`
        : `${API_URL}/api/tasks`;

      const payload = {
        title: form.title,
        detail: form.detail,
        status: form.status, // ✅ ส่งสถานะไปด้วย
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "บันทึกไม่สำเร็จ";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
          if (data?.errors) {
            const all = Object.values(data.errors).flat();
            if (all.length) msg = all.join("\n");
          }
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      setForm({ title: "", detail: "", status: "pending" });
      setEditingId(null);
      fetchTasks();
    } catch (e) {
      setErr(e.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("ลบงานนี้ใช่ไหม?")) return;
    try {
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      setTasks((list) => list.filter((t) => t.id !== id));
    } catch (e) {
      alert("ลบไม่สำเร็จ");
    }
  }

  function onEdit(task) {
    setForm({
      title: task.title,
      detail: task.detail ?? "",
      status: task.status || "pending", // ✅ โหลดสถานะเดิมมาแก้ไข
    });
    setEditingId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCancelEdit() {
    setEditingId(null);
    setForm({ title: "", detail: "", status: "pending" });
  }

  // ✅ ฟังก์ชันเปลี่ยนสถานะจากการ์ด
  async function updateStatus(task, newStatus) {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("เปลี่ยนสถานะไม่สำเร็จ");

      const json = await res.json();
      const updatedTask = json.data ?? json; // เผื่อ Resource หุ้ม data

      setTasks((list) =>
        list.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } catch (e) {
      alert(e.message || "เปลี่ยนสถานะไม่สำเร็จ");
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1 className="hero-title">
          Task &amp; Report Management System <span className="dash">—</span>
        </h1>
        <p className="hero-desc">ระบบการจัดการงานเเละรายงานผล</p>
      </header>

      <main className="container">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              {editingId ? "แก้ไขงาน" : "เพิ่มงาน"}
            </h2>
            {editingId && (
              <button className="btn ghost" onClick={onCancelEdit}>
                ยกเลิกการแก้ไข
              </button>
            )}
          </div>

          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <label>ชื่องาน </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="เช่น สรุปบทเรียนบทที่ 6"
                className="input"
              />
            </div>

            <div className="field">
              <label>รายละเอียดงาน (detail)</label>
              <textarea
                name="detail"
                value={form.detail}
                onChange={onChange}
                placeholder="คำอธิบายสั้น ๆ หรือโน้ต"
                className="textarea"
                rows={4}
              />
            </div>

            {/* ✅ ฟิลด์เลือกสถานะงาน */}
            <div className="field">
              <label>สถานะงาน</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="input"
              >
                <option value="pending">ค้างอยู่ (ยังไม่เริ่ม)</option>
                <option value="in_progress">กำลังทำ</option>
                <option value="completed">ทำเสร็จแล้ว</option>
              </select>
            </div>

            <div className="actions">
              <button className="btn primary" disabled={saving}>
                {saving
                  ? "กำลังบันทึก..."
                  : editingId
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มงาน"}
              </button>
            </div>

            {err && <p className="error">{err}</p>}
          </form>
        </section>

        <section className="list-head">
          <h2 className="section-title">รายงาน</h2>
          <span className="count">{tasks.length} รายการ</span>
        </section>

        <section className="grid">
          {tasks.map((t) => (
            <article key={t.id} className="task-card">
              <div className="task-top">
                <span className="task-id">#{t.id}</span>
                <span className="task-dot" />
              </div>

              <h3 className="task-title">{t.title}</h3>
              {t.detail && <p className="task-detail">{t.detail}</p>}

              {/* ✅ แสดงสถานะปัจจุบัน */}
              <p className="task-detail">
                สถานะ:{" "}
                {t.status === "completed"
                  ? "ทำเสร็จแล้ว"
                  : t.status === "in_progress"
                  ? "กำลังทำ"
                  : "ค้างอยู่"}
              </p>

              <div className="task-actions">
                <button
                  className="btn small primary"
                  onClick={() => onEdit(t)}
                >
                  แก้ไข
                </button>
                <button
                  className="btn small danger"
                  onClick={() => onDelete(t.id)}
                >
                  ลบ
                </button>
              </div>

              {/* ✅ ปุ่มเปลี่ยนสถานะเร็ว ๆ */}
              <div className="task-actions" style={{ marginTop: 4 }}>
                <button
                  className="btn small"
                  onClick={() => updateStatus(t, "pending")}
                >
                  ตั้งเป็นค้างอยู่
                </button>
                <button
                  className="btn small"
                  onClick={() => updateStatus(t, "in_progress")}
                >
                  กำลังทำ
                </button>
                <button
                  className="btn small primary"
                  onClick={() => updateStatus(t, "completed")}
                >
                  ทำเสร็จแล้ว
                </button>
              </div>
            </article>
          ))}

          {!loading && tasks.length === 0 && (
            <div className="empty">
              <p>ยังไม่มีงาน ลองเพิ่มงานแรกของคุณเลย ✨</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Task &amp; Report Management</span>
        <span className="sep">•</span>
        <span>Designed for Portfolio</span>
      </footer>
    </div>
  );
}
