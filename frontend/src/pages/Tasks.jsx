import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tasks } from "../services/api.js";

export default function TasksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title: "", detail: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await Tasks.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "โหลดรายการไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("กรอกชื่อเรื่อง");
    try {
      setSubmitting(true);
      setErr("");
      await Tasks.create(form);
      setForm({ title: "", detail: "" });
      await load();
    } catch (e) {
      setErr(e.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = async (id) => {
    if (!confirm(`ลบงาน #${id}?`)) return;
    try {
      setErr("");
      await Tasks.remove(id);
      await load();
    } catch (e) {
      setErr(e.message || "ลบไม่สำเร็จ");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Tasks</h2>

      {err && <div style={{ color: "red" }}>{err}</div>}
      {loading ? <div>Loading…</div> : null}

      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          placeholder="ชื่อเรื่อง (title)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="รายละเอียด (detail)"
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
        />
        <button disabled={submitting}>{submitting ? "Saving…" : "Create Task"}</button>
      </form>

      <div style={{ borderTop: "1px solid #ddd", paddingTop: 12 }}>
        <h3>รายการงาน</h3>
        <ul style={{ paddingLeft: 16, display: "grid", gap: 6 }}>
          {items.map((x) => (
            <li key={x.id}>
              <b>#{x.id}</b> — {x.title}{" "}
              <Link to={`/tasks/${x.id}`}>View</Link>{" "}
              <Link to={`/tasks/${x.id}/edit`}>Edit</Link>{" "}
              <button onClick={() => removeItem(x.id)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>
        {(!items || items.length === 0) && <div>— ไม่มีงาน —</div>}
      </div>
    </div>
  );
}
