<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    /**
     * แสดงรายการ tasks ทั้งหมด (ใหม่สุดก่อน)
     * GET /api/tasks
     */
    public function index()
    {
        $tasks = Task::latest()->get();

        // ยังใช้ Resource collection เหมือนเดิม
        return TaskResource::collection($tasks);
    }

    /**
     * สร้าง task ใหม่ (Create)
     * POST /api/tasks
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'detail' => ['nullable', 'string'],
            'status' => ['nullable', 'in:pending,in_progress,completed'],
        ]);

        // ถ้าไม่ส่ง status มา ให้ default เป็น pending
        if (!isset($validated['status'])) {
            $validated['status'] = 'pending';
        }

        $task = Task::create($validated);

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * แสดงรายละเอียด task ทีละตัว (Read one)
     * GET /api/tasks/{task}
     */
    public function show(Task $task)
    {
        return new TaskResource($task);
    }

    /**
     * อัปเดตข้อมูลของ task (Update)
     * PUT/PATCH /api/tasks/{task}
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'  => ['sometimes', 'required', 'string', 'max:255'],
            'detail' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', 'in:pending,in_progress,completed'],
        ]);

        $task->update($validated);

        return new TaskResource($task);
    }

    /**
     * ลบ task (Delete)
     * DELETE /api/tasks/{task}
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->noContent();
    }
}
