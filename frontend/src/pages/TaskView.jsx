import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tasks } from "../services/api.js";

export default function TaskView() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await Tasks.get(id);
        setItem(data);
      } catch (e) {
        setErr(e.message || "โหลดไม่สำเร็จ");
      }
    })();
  }, [id]);

  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!item) return <div>Loading…</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h2>Task #{item.id}</h2>
      <p><b>Title:</b> {item.title}</p>
      <p><b>Detail:</b> {item.detail || "-"}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link to={`/tasks/${item.id}/edit`}>Edit</Link>
        <Link to="/tasks">Back</Link>
      </div>
    </div>
  );
}
