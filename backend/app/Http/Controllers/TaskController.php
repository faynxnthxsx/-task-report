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
        $user = $request->user();

        $query = Task::query();

        // ถ้าเป็น staff เห็นได้เฉพาะงานของตัวเอง
        if ($user->role === 'staff') {
            $query->where('assigned_to', $user->id);
        }

        // filter ตาม status / priority / assigned_to (สำหรับ admin/manager)
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($assigned = $request->query('assigned_to')) {
            $query->where('assigned_to', $assigned);
        }

        // sort (default: created_at desc)
        $sortBy  = $request->query('sort_by', 'created_at');
        $sortDir = $request->query('sort_dir', 'desc');

        if (! in_array($sortBy, ['created_at', 'deadline', 'priority', 'status'])) {
            $sortBy = 'created_at';
        }
        if (! in_array($sortDir, ['asc', 'desc'])) {
            $sortDir = 'desc';
        }

        $query->orderBy($sortBy, $sortDir);

        $tasks = $query->get();

        return TaskResource::collection($tasks);
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
            'detail'      => ['nullable', 'string'],
            'status'      => ['required', 'in:pending,in_progress,completed'],
            'deadline'    => ['nullable', 'date'],
            'priority'    => ['required', 'in:low,normal,high'],
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        // ถ้าเป็น staff ให้บังคับว่าต้อง assign ให้ตัวเองเท่านั้น
        if ($user->role === 'staff') {
            $data['assigned_to'] = $user->id;
        }

        $task = Task::create($data);

        return new TaskResource($task);
    }

    /**
     * แสดงงานทีละตัว
     * GET /api/tasks/{task}
     */
    public function show(Request $request, Task $task)
    {
        $user = $request->user();

        // staff เห็นได้เฉพาะงานของตัวเอง
        if ($user->role === 'staff' && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return new TaskResource($task);
    }

    /**
     * แก้งาน
     * PUT /api/tasks/{task}
     */
    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        // staff ห้ามแก้งานของคนอื่น
        if ($user->role === 'staff' && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'detail'      => ['nullable', 'string'],
            'status'      => ['required', 'in:pending,in_progress,completed'],
            'deadline'    => ['nullable', 'date'],
            'priority'    => ['required', 'in:low,normal,high'],
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        // staff ยังแก้ assigned_to คนอื่นไม่ได้
        if ($user->role === 'staff') {
            $data['assigned_to'] = $user->id;
        }

        $task->update($data);

        return new TaskResource($task);
    }

    /**
     * ลบงาน
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, Task $task)
    {
        $user = $request->user();

        // staff ห้ามลบงาน
        if ($user->role === 'staff') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $task->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }
}
