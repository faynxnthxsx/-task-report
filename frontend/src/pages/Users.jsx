// frontend/src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const navigate = useNavigate();

  const [currentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("taskreport_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/users");
      const list = res.data?.users ?? res.data?.data ?? res.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("โหลด users ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "คุณไม่มีสิทธิ์เข้าหน้านี้ (Admin เท่านั้น)"
          : "ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
      setError(msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const text = `${u.name || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [users, search]);

  const handleChangeRole = async (userId, nextRole) => {
    if (!isAdmin) return;

    setSavingId(userId);
    setError("");

    try {
      const res = await api.patch(`/users/${userId}/role`, { role: nextRole });
      const updated = res.data?.user;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated?.role ?? nextRole } : u))
      );
    } catch (err) {
      console.error("เปลี่ยน role ไม่สำเร็จ", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Forbidden (Admin เท่านั้น)"
          : "เปลี่ยน role ไม่สำเร็จ");
      setError(msg);
    } finally {
      setSavingId(null);
    }
  };

  const chipStyle = useMemo(
    () => ({
      padding: "6px 10px",
      borderRadius: "999px",
      border: "1px solid rgba(148,163,184,0.7)",
      backgroundColor: "#020617",
      color: "#e5e7eb",
      fontSize: "13px",
    }),
    []
  );

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
            จัดการผู้ใช้ (User Management)
          </h1>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.8)",
              backgroundColor: "transparent",
              color: "#e5e7eb",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ← กลับไป Tasks
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "14px" }}>
          เข้าถึงได้เฉพาะ Admin: ดูรายชื่อผู้ใช้และเปลี่ยน role
        </div>

        {error && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 12px",
              borderRadius: "12px",
              backgroundColor: "#7f1d1d",
              border: "1px solid #fecaca",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            padding: "16px",
            borderRadius: "18px",
            backgroundColor: "#111827",
            border: "1px solid rgba(148,163,184,0.4)",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="ค้นหาชื่อ / email / role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 280px",
                minWidth: "220px",
                padding: "8px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: "13px",
              }}
            />

            <button
              type="button"
              onClick={loadUsers}
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
              รีเฟรชรายชื่อ
            </button>

            <span style={{ ...chipStyle }}>
              ผู้ใช้ทั้งหมด: {users.length}
            </span>
          </div>
        </div>

        <div
          style={{
            borderRadius: "18px",
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.4)",
            backgroundColor: "#020617",
          }}
        >
          <div style={{ maxHeight: "560px", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#020617", position: "sticky", top: 0 }}>
                  {["ID", "Name", "Email", "Role", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(148,163,184,0.6)",
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
                    <td colSpan={5} style={{ padding: "12px", textAlign: "center" }}>
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "12px", textAlign: "center" }}>
                      ไม่พบผู้ใช้
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(55,65,81,0.7)" }}>
                      <td style={{ padding: "10px 12px" }}>#{u.id}</td>
                      <td style={{ padding: "10px 12px" }}>{u.name || "-"}</td>
                      <td style={{ padding: "10px 12px" }}>{u.email || "-"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={chipStyle}>{u.role}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <select
                          value={u.role}
                          disabled={!isAdmin || savingId === u.id}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "1px solid rgba(148,163,184,0.7)",
                            backgroundColor: "#020617",
                            color: "#e5e7eb",
                            fontSize: "13px",
                            cursor: !isAdmin ? "not-allowed" : "pointer",
                            opacity: savingId === u.id ? 0.7 : 1,
                          }}
                        >
                          <option value="admin">admin</option>
                          <option value="manager">manager</option>
                          <option value="staff">staff</option>
                        </select>
                        {savingId === u.id && (
                          <span style={{ marginLeft: "8px", fontSize: "12px", color: "#9ca3af" }}>
                            กำลังบันทึก...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isAdmin && (
          <div style={{ marginTop: "12px", fontSize: "13px", color: "#9ca3af" }}>
            หมายเหตุ: role เปลี่ยนได้เฉพาะ admin เท่านั้น
          </div>
        )}
      </div>
    </div>
  );
}
