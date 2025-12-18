// frontend/src/lib/api.js
import axios from "axios";

/**
 * IMPORTANT
 * - VITE_API_URL ต้องเป็นแค่ root เช่น http://127.0.0.1:8000
 * - ห้ามใส่ /api ซ้ำใน .env
 */
const root = import.meta.env.VITE_API_URL?.trim();
const baseURL = root ? `${root}/api` : "/api";

export const api = axios.create({ baseURL });

const TOKEN_KEY = "taskreport_token";

// ✅ helper set header ให้ชัวร์ทั้ง axios v0/v1
function setHeader(config, key, value) {
  if (config.headers?.set) config.headers.set(key, value);
  else {
    config.headers = config.headers || {};
    config.headers[key] = value;
  }
}

/**
 * 🔐 ใส่ token อัตโนมัติทุก request
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    setHeader(config, "Authorization", `Bearer ${token}`);
  }

  setHeader(config, "Accept", "application/json");
  return config;
});

/**
 * ตั้งค่า token ลงใน header + localStorage
 */
export function setApiToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
  }
}

// alias เผื่อไฟล์เก่า
export const setAuthToken = setApiToken;

/**
 * โหลด token ตอนเปิดหน้า / refresh
 */
export function loadAuthTokenFromStorage() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return token;
}

/**
 * ล้าง token
 */
export function clearAuthToken() {
  setApiToken(null);
}
