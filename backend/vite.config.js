import { defineConfig } from 'vite';            // helper สำหรับ define config ของ Vite
import laravel from 'laravel-vite-plugin';      // plugin ที่เชื่อม Vite เข้ากับ Laravel
import tailwindcss from '@tailwindcss/vite';    // plugin ของ Tailwind CSS v4 สำหรับ Vite

// export config หลักของ Vite
export default defineConfig({
    // รายชื่อ plugins ที่ Vite จะใช้
    plugins: [
        // -----------------------------
        // Laravel Vite Plugin
        // -----------------------------
        laravel({
            // ไฟล์ "เริ่มต้น" ที่จะให้ Vite build
            // ตรงกับที่เราใช้ใน Blade เช่น:
            //   @vite(['resources/css/app.css', 'resources/js/app.js'])
            input: ['resources/css/app.css', 'resources/js/app.js'],

            // ถ้าเปิด refresh = true
            // เวลามีการเปลี่ยนแปลงไฟล์ Blade / PHP บางอย่าง
            // Vite จะสั่งให้ browser reload หน้าให้อัตโนมัติ
            refresh: true,
        }),

        // -----------------------------
        // Tailwind CSS v4 Plugin
        // -----------------------------
        // ทำให้ Vite เข้าใจไฟล์ CSS ที่ใช้:
        //   @import 'tailwindcss';
        //   @source ...
        //   @theme { ... }
        tailwindcss(),
    ],
});
