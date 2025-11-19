// src/App.jsx
import "./styles.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <header
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #333",
          display: "flex",
          gap: "1rem",
        }}
      >
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link to="/tasks" style={{ color: "#fff", textDecoration: "none" }}>
          Tasks
        </Link>
        <Link to="/reports" style={{ color: "#fff", textDecoration: "none" }}>
          Reports
        </Link>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
