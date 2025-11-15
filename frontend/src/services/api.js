// src/services/api.js
import axios from "axios";

// ใช้ '/api' ผ่าน Vite proxy ตอน dev
// ถ้าตั้ง VITE_API_URL ไว้ ให้ชี้เป็น '/api' หรือ 'https://your-host/api'
const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: BASE,             // << ไม่ต้อง + '/api' ซ้ำ
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

function msgOf(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return "Request failed";
}

export const Health = {
  async ping() {
    try {
      const r = await api.get("/health");
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
};

export const Tasks = {
  async list(params) {
    try {
      const r = await api.get("/tasks", { params });
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
  async create(payload) {
    try {
      const r = await api.post("/tasks", payload);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
  async get(id) {
    try {
      const r = await api.get(`/tasks/${id}`);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
  async update(id, payload) {
    try {
      const r = await api.put(`/tasks/${id}`, payload);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
  async remove(id) {
    try {
      const r = await api.delete(`/tasks/${id}`);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
};
