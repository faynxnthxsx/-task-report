// frontend/src/lib/api.js
import axios from "axios";

// ✅ ให้ baseURL เป็น '/api' เพื่อให้ผ่าน proxy ของ Vite ไป Laravel (http://localhost:8000)
export const api = axios.create({
  baseURL: "/api",
});

/**
 * ตั้งค่า token ลงใน header Authorization และเก็บใน localStorage
 * ใช้ชื่อ setApiToken เป็นหลัก (ให้ตรงกับ Login.jsx ปัจจุบัน)
 */
export function setApiToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("taskreport_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("taskreport_token");
  }
}

// 👇 เผื่อที่อื่นใช้ชื่อ setAuthToken อยู่ ให้ชี้มาที่ตัวเดียวกัน
export const setAuthToken = setApiToken;

/**
 * ล้าง token ออกจาก header + localStorage
 */
export function clearAuthToken() {
  setApiToken(null);
}

/**
 * โหลด token ที่เคยเก็บไว้ใน localStorage กลับมาใส่ header ตอนเปิดหน้าใหม่
 */
export function loadAuthTokenFromStorage() {
  const token = localStorage.getItem("taskreport_token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}
