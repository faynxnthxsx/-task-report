<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Resources\TaskResource;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * แสดงรายการงานทั้งหมด (ตามสิทธิ์ + filter)
     * GET /api/tasks
     */
    public function index(Request $request)
    {
        $request->validate([
            'status'       => ['nullable', 'in:pending,in_progress,completed'],
            'priority'     => ['nullable', 'in:low,normal,high'],
            'assigned_to'  => ['nullable', 'integer', 'exists:users,id'],
            'sort_by'      => ['nullable', 'in:created_at,deadline,priority,status'],
            'sort_dir'     => ['nullable', 'in:asc,desc'],
        ], [
            'status.in'          => 'สถานะไม่ถูกต้อง',
            'priority.in'        => 'ระดับความสำคัญไม่ถูกต้อง',
            'assigned_to.exists' => 'ผู้รับงานไม่ถูกต้อง',
            'sort_by.in'         => 'ฟิลด์ที่ใช้เรียงลำดับไม่ถูกต้อง',
            'sort_dir.in'        => 'ทิศทางการเรียงลำดับต้องเป็น asc หรือ desc',
        ]);

        $user = $request->user();

        // ✅ โหลด tags ไปเลย (ถ้า TaskResource แสดง tags จะได้ไม่ต้องยิง /tags)
        $query = Task::with('tags');

        // ✅ staff เห็นได้เฉพาะงานของตัวเอง
        if ($user && $user->role === 'staff') {
            $query->where('assigned_to', $user->id);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }

        $sortBy  = $request->query('sort_by', 'created_at');
        $sortDir = $request->query('sort_dir', 'desc');

        $query->orderBy($sortBy, $sortDir);

        return TaskResource::collection($query->get());
    }

    /**
     * สร้างงานใหม่
     * POST /api/tasks
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'detail'      => ['nullable', 'string', 'max:5000'],
            'status'      => ['required', 'in:pending,in_progress,completed'],
            'deadline'    => ['nullable', 'date'],
            'priority'    => ['required', 'in:low,normal,high'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ], [
            'title.required'      => 'กรุณาใส่ชื่องาน',
            'status.in'           => 'สถานะไม่ถูกต้อง',
            'priority.in'         => 'ระดับความสำคัญไม่ถูกต้อง',
            'assigned_to.exists'  => 'ผู้รับงานไม่ถูกต้อง',
            'detail.max'          => 'รายละเอียดงานยาวเกินไป (สูงสุด 5000 ตัวอักษร)',
        ]);

        // ✅ staff สร้างได้เฉพาะงานของตัวเอง
        if ($user && $user->role === 'staff') {
            $data['assigned_to'] = $user->id;
        }

        // ✅ ถ้าไม่ส่ง assigned_to มา ให้ default เป็นตัวเอง
        if (empty($data['assigned_to'])) {
            $data['assigned_to'] = $user->id;
        }

        $task = Task::create($data);

        return new TaskResource($task->load('tags'));
    }

    /**
     * แสดงงานทีละตัว
     * GET /api/tasks/{task}
     */
    public function show(Request $request, Task $task)
    {
        $this->authorize('view', $task);
        return new TaskResource($task->load('tags'));
    }

    /**
     * แก้งาน
     * PUT/PATCH /api/tasks/{task}
     */
    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'detail'      => ['nullable', 'string', 'max:5000'],
            'status'      => ['required', 'in:pending,in_progress,completed'],
            'deadline'    => ['nullable', 'date'],
            'priority'    => ['required', 'in:low,normal,high'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ], [
            'title.required'      => 'กรุณาใส่ชื่องาน',
            'status.in'           => 'สถานะไม่ถูกต้อง',
            'priority.in'         => 'ระดับความสำคัญไม่ถูกต้อง',
            'assigned_to.exists'  => 'ผู้รับงานไม่ถูกต้อง',
            'detail.max'          => 'รายละเอียดงานยาวเกินไป (สูงสุด 5000 ตัวอักษร)',
        ]);

        $user = $request->user();

        // ✅ staff ห้ามเปลี่ยนผู้รับงานเป็นคนอื่น
        if ($user && $user->role === 'staff') {
            $data['assigned_to'] = $user->id;
        }

        // ✅ ถ้า admin/manager ไม่ส่ง assigned_to มา ให้คงค่าเดิม
        if (!array_key_exists('assigned_to', $data) || $data['assigned_to'] === null) {
            $data['assigned_to'] = $task->assigned_to;
        }

        $task->update($data);

        return new TaskResource($task->load('tags'));
    }

    /**
     * ลบงาน
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();
        return response()->json(['message' => 'Deleted'], 200);
    }

    /**
     * ✅ ดึง tags ของงาน
     * GET /api/tasks/{task}/tags
     */
    public function tags(Request $request, Task $task)
    {
        // staff จะผ่านได้เฉพาะงานตัวเอง (ตาม TaskPolicy@view)
        $this->authorize('view', $task);

        return response()->json([
            'tags' => $task->tags()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }
}
