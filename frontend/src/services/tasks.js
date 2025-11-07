const BASE = import.meta.env.VITE_API_URL; // http://127.0.0.1:8000

export async function listTasks() {
  const r = await fetch(`${BASE}/api/tasks`, {
    headers: { Accept: 'application/json' },
  });
  if (!r.ok) throw new Error('fetch tasks failed');
  return r.json();
}

export async function createTask(payload) {
  const r = await fetch(`${BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('create task failed');
  return r.json();
}

export async function updateTask(id, payload) {
  const r = await fetch(`${BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('update task failed');
  return r.json();
}

export async function deleteTask(id) {
  const r = await fetch(`${BASE}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!r.ok) throw new Error('delete task failed');
  return true;
}
