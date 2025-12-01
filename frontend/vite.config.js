// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ✅ ทุก request ที่ขึ้นต้นด้วย /api จะถูก proxy ไปที่ Laravel (http://localhost:8000)
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
