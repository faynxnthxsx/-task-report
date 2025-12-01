// eslint.config.js

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ใช้ Flat Config ของ ESLint (เวอร์ชันใหม่)
// defineConfig รับเป็น array ของ config หลายชุด
export default defineConfig([
  // บอก ESLint ว่าไม่ต้องตรวจโฟลเดอร์ dist
  globalIgnores(['dist']),

  {
    // ให้ ESLint ทำงานเฉพาะไฟล์ .js และ .jsx ทั้งหมดในโปรเจค
    files: ['**/*.{js,jsx}'],

    // ใช้กฎพื้นฐานสำหรับ JavaScript + React Hooks + React Refresh
    extends: [
      js.configs.recommended,                 // กฎพื้นฐานของ JavaScript
      reactHooks.configs['recommended-latest'], // กฎ react-hooks เช่น useEffect dependency
      reactRefresh.configs.vite,             // สำหรับ HMR ของ Vite + React
    ],

    // ตั้งค่าภาษา + environment
    languageOptions: {
      ecmaVersion: 2020,                      // รองรับ syntax modern JS
      globals: globals.browser,               // บอก ESLint ว่ารันบน Browser (window, document, etc.)
      parserOptions: {
        ecmaVersion: 'latest',                // รองรับ ES ล่าสุด
        ecmaFeatures: { jsx: true },          // เปิด JSX mode
        sourceType: 'module',                 // รองรับ import/export
      },
    },

    // กฎเสริม
    rules: {
      // error เมื่อเจอตัวแปรไม่ได้ใช้
      // ยกเว้นตัวแปรที่ขึ้นต้นด้วยตัวใหญ่หรือ '_'
      // เช่น _ignore หรือ ComponentName
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
