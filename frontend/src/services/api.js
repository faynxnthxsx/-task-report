// src/services/api.js
import axios from "axios";

// กำหนด BASE URL ของ API
// - ถ้ามีตั้งค่า VITE_API_URL ไว้ใน .env → ใช้ค่านั้น (เช่น http://127.0.0.1:8000/api หรือ http://127.0.0.1:8000)
// - ถ้าไม่มี → ใช้ค่าเริ่มต้นเป็น "/api" (ให้ Vite proxy ช่วยเด้งไป backend)
// .replace(/\/+$/, "") = ตัด / ท้ายสุดออก (กันกรณีมี /// ซ้อนกัน)
const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

// สร้าง instance ของ axios เอาไว้ใช้เรียก API
export const api = axios.create({
  baseURL: BASE, // baseURL หลัก เช่น '/api' หรือ 'http://127.0.0.1:8000/api' (ไม่ต้อง + '/api' ซ้ำ)
  headers: { "Content-Type": "application/json" }, // ให้ส่ง/รับเป็น JSON เป็นหลัก
  timeout: 10000, // ถ้าเกิน 10 วินาทีให้ timeout
});

// ฟังก์ชันช่วยดึงข้อความ error จาก axios error object
function msgOf(err) {
  // ถ้า backend ส่ง message มาใน response (เช่น { message: "..." })
  if (err?.response?.data?.message) return err.response.data.message;
  // ถ้าเป็น error ทั่วไปจาก JS/axios
  if (err?.message) return err.message;
  // กรณีไม่รู้จริง ๆ ว่าเป็น error อะไร
  return "Request failed";
}

// -------------------------
// กลุ่ม API: Health Check
// -------------------------
export const Health = {
  // เรียก GET /health เพื่อลอง ping ว่า backend ยังโอเคไหม
  async ping() {
    try {
      const r = await api.get("/health");
      return r.data; // คืนข้อมูลดิบจาก backend (เช่น { status: "ok" })
    } catch (e) {
      // แปลง error ให้เป็น Error ปกติ พร้อมข้อความอ่านง่าย
      throw new Error(msgOf(e));
    }
  },
};

// -------------------------
// กลุ่ม API: Tasks
// -------------------------
export const Tasks = {
  // ดึงรายการ tasks ทั้งหมด (รองรับส่ง params เช่น ?status=pending)
  async list(params) {
    try {
      const r = await api.get("/tasks", { params });
      // ตรงนี้ r.data อาจเป็นรูปแบบ { success, data, error } หรือ array ตรง ๆ ตาม backend
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },

  // สร้าง task ใหม่
  // payload ควรเป็น object เช่น { title: '...', description: '...', status: 'pending' }
  async create(payload) {
    try {
      const r = await api.post("/tasks", payload);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },

  // ดึงข้อมูล task รายตัวจาก id
  async get(id) {
    try {
      const r = await api.get(`/tasks/${id}`);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },

  // อัปเดต task ตาม id (เช่น title/status ใหม่)
  async update(id, payload) {
    try {
      const r = await api.put(`/tasks/${id}`, payload);
      return r.data;
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },

  // ลบ task ตาม id
  async remove(id) {
    try {
      const r = await api.delete(`/tasks/${id}`);
      return r.data; // บาง backend อาจคืน { success: true } หรือ data:null
    } catch (e) {
      throw new Error(msgOf(e));
    }
  },
};
