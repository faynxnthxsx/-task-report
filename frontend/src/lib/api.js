// src/lib/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// instance สำหรับเรียก Laravel API เช่น api.get("/tasks")
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    Accept: "application/json",
  },
});
