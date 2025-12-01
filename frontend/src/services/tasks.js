// BASE URL ของ API (ดึงมาจาก .env ของ Vite เช่น: http://127.0.0.1:8000)
const BASE = import.meta.env.VITE_API_URL; // http://127.0.0.1:8000

// -----------------------------
// 1. ดึงรายการ Tasks ทั้งหมด
// -----------------------------
export async function listTasks() {
  // เรียก GET /api/tasks ไปที่ Laravel
  const r = await fetch(`${BASE}/api/tasks`, {
    headers: { Accept: 'application/json' }, // ขอ response เป็น JSON
  });

  // ถ้าสถานะไม่ใช่ 200-299 ถือว่าล้มเหลว
  if (!r.ok) throw new Error('fetch tasks failed');

  // ส่งข้อมูล JSON กลับให้ frontend ใช้งาน
  return r.json();
}

// -----------------------------
// 2. สร้าง Task ใหม่
// -----------------------------
export async function createTask(payload) {
  // payload ควรเป็น object เช่น { title: 'Learn', description: '...', status: 'pending' }
  const r = await fetch(`${BASE}/api/tasks`, {
    method: 'POST', // ใช้ POST สร้างข้อมูลใหม่
    headers: {
      'Content-Type': 'application/json', // บอกว่าข้อมูลที่ส่งเป็น JSON
      Accept: 'application/json',
    },
    body: JSON.stringify(payload), // แปลงเป็น JSON ก่อนส่ง
  });

  if (!r.ok) throw new Error('create task failed');

  return r.json(); // คืน response จาก backend
}

// -----------------------------
// 3. อัปเดต Task ตาม id
// -----------------------------
export async function updateTask(id, payload) {
  const r = await fetch(`${BASE}/api/tasks/${id}`, {
    method: 'PUT', // ใช้ PUT อัปเดตข้อมูล
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error('update task failed');

  return r.json();
}

// -----------------------------
// 4. ลบ Task
// -----------------------------
export async function deleteTask(id) {
  const r = await fetch(`${BASE}/api/tasks/${id}`, {
    method: 'DELETE', // ใช้ DELETE เพื่อลบ task
    headers: { Accept: 'application/json' },
  });

  if (!r.ok) throw new Error('delete task failed');

  // ถ้าไม่มี error ถือว่าลบสำเร็จ → คืน true
  return true;
}
