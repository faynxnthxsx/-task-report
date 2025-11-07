import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Tasks } from "../services/api.js";

export default function TaskEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", detail: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr("");
        const data = await Tasks.get(id);
        setForm({ title: data.title || "", detail: data.detail || "" });
      } catch (e) {
        setErr(e.message || "โหลดไม่สำเร็จ");
      } finally { setLoading(false); }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("กรอกชื่อเรื่อง");
    try {
      setSaving(true); setErr("");
      await Tasks.update(id, form);
      nav(`/tasks/${id}`);
    } catch (e) {
      setErr(e.message || "บันทึกไม่สำเร็จ");
    } finally { setSaving(false); }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <h2>Edit Task #{id}</h2>
      {err && <div style={{ color: "red" }}>{err}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <Link to={`/tasks/${id}`}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
