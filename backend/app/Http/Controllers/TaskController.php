<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    /**
     * แสดงรายการงานทั้งหมด
     * GET /api/tasks
     */
    public function index(Request $request)
{
    $query = Task::query();

    // ⭐ 1) Filter by status: /api/tasks?status=pending
    $status = $request->query('status'); // all / pending / in_progress / completed

    if ($status && $status !== 'all') {
        // กันคนส่ง status มั่ว ๆ เข้ามา
        $allowedStatuses = ['pending', 'in_progress', 'completed'];

        if (in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        }
    }

    // ⭐ 2) Filter by date range (ใช้ created_at เป็นหลัก)
    // รูปแบบวันที่ที่ส่งมาแนะนำเป็น YYYY-MM-DD
    $from = $request->query('from'); // เช่น 2025-11-01
    $to   = $request->query('to');   // เช่น 2025-11-30

    if ($from) {
        $query->whereDate('created_at', '>=', $from);
    }

    if ($to) {
        $query->whereDate('created_at', '<=', $to);
    }

    // ⭐ 3) Sort (เหมือนของเดิม)
    // ?sort=latest → ใหม่สุดอยู่บน
    $sort = $request->query('sort');

    if ($sort === 'latest') {
        $query->orderBy('created_at', 'desc');
    } else {
        // default: เก่าสุดอยู่บน
        $query->orderBy('created_at', 'asc');
    }

    // ดึงรายการงานทั้งหมดตามเงื่อนไขด้านบน
    $tasks = $query->get();

    // ส่งออกผ่าน Resource เหมือนเดิม
    return TaskResource::collection($tasks);
}
    /**
     * สร้างงานใหม่
     * POST /api/tasks
     * (เฉพาะ admin / manager)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, ['admin', 'manager'], true)) {
            abort(403, 'คุณไม่มีสิทธิ์สร้างงาน');
        }

        $data = $request->validate([
            'title'    => ['required', 'string', 'max:255'],
            'detail'   => ['nullable', 'string'],
            'status'   => ['nullable', 'in:pending,in_progress,completed'],
            'deadline' => ['nullable', 'date'],
            'priority' => ['nullable', 'in:low,normal,high'],
        ]);

        // ค่า default
        if (! isset($data['status'])) {
            $data['status'] = 'pending';
        }
        if (! isset($data['priority'])) {
            $data['priority'] = 'normal';
        }

        $task = Task::create($data);

        return response()->json(TaskResource::make($task), 201);
    }

    /**
     * ดูรายละเอียดงานหนึ่งงาน
     * GET /api/tasks/{task}
     */
    public function show(Task $task)
    {
        return TaskResource::make($task);
    }

    /**
     * แก้ไขงาน
     * PUT/PATCH /api/tasks/{task}
     *
     * - admin / manager แก้ได้ทุก field
     * - staff แก้ได้เฉพาะ status (pending / in_progress / completed)
     */
    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'กรุณาเข้าสู่ระบบ');
        }

        // admin / manager -> full access
        if (in_array($user->role, ['admin', 'manager'], true)) {
            $data = $request->validate([
                'title'    => ['sometimes', 'required', 'string', 'max:255'],
                'detail'   => ['nullable', 'string'],
                'status'   => ['sometimes', 'required', 'in:pending,in_progress,completed'],
                'deadline' => ['nullable', 'date'],
                'priority' => ['nullable', 'in:low,normal,high'],
            ]);

            $task->update($data);

            return TaskResource::make($task);
        }

        // staff -> อนุญาตให้เปลี่ยนได้แค่ status
        if ($user->role === 'staff') {
            $data = $request->validate([
                'status' => ['required', 'in:pending,in_progress,completed'],
            ]);

            $task->update([
                'status' => $data['status'],
            ]);

            return TaskResource::make($task);
        }

        // role อื่น ๆ ไม่อนุญาต
        abort(403, 'คุณไม่มีสิทธิ์แก้ไขงานนี้');
    }

    /**
     * ลบงาน
     * DELETE /api/tasks/{task}
     * (เฉพาะ admin)
     */
    public function destroy(Request $request, Task $task)
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'คุณไม่มีสิทธิ์ลบงาน');
        }

        $task->delete();

        return response()->json([
            'message' => 'ลบงานเรียบร้อยแล้ว',
        ]);
    }
}
