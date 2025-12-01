// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ⭐ โหลด token ขึ้น Header ทุกครั้งที่เปิดเว็บ
import { loadAuthTokenFromStorage } from "./lib/api.js";

// ต้องเรียกก่อน render เสมอ
loadAuthTokenFromStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
