// src/App.jsx
import { useEffect, useState } from "react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", detail: "" });
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

      // ส่งเฉพาะ field ที่ backend รองรับชัวร์ ๆ (ตอนนี้คือ title)
      const payload = { title: form.title };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // พยายามอ่าน error จาก backend (ถ้ามี)
        let msg = "บันทึกไม่สำเร็จ";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
          if (data?.errors) {
            const all = Object.values(data.errors).flat();
            if (all.length) msg = all.join("\n");
          }
        } catch {
          // ถ้าอ่าน JSON ไม่ได้ก็ใช้ข้อความเดิม
        }
        throw new Error(msg);
      }

      setForm({ title: "", detail: "" });
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
    setForm({ title: task.title, detail: task.detail ?? "" });
    setEditingId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCancelEdit() {
    setEditingId(null);
    setForm({ title: "", detail: "" });
  }

  return (
    <div className="page">
      <header className="hero">
        <h1 className="hero-title">
          Task &amp; Report Management System <span className="dash">—</span>
        </h1>
        <p className="hero-desc">
          ระบบสำหรับเพิ่ม/แก้ไข/ลบงาน 
        </p>
      </header>

      <main className="container">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">
              {editingId ? "แก้ไขงาน" : "เพิ่มงานใหม่"}
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

            <div className="actions">
              <button className="btn primary" disabled={saving}>
                {saving
                  ? "กำลังบันทึก..."
                  : editingId
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มงาน"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={fetchTasks}
                disabled={loading}
                title="รีเฟรชข้อมูล"
              >
                {loading ? "กำลังโหลด..." : "รีโหลด"}
              </button>
            </div>

            {err && <p className="error">{err}</p>}
          </form>
        </section>

        <section className="list-head">
          <h2 className="section-title">รายการงาน</h2>
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
