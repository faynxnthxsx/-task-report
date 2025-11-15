<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Resources\TaskResource;

class TaskController extends Controller
{
    public function index()
    {
        // ดึงงานทั้งหมดใหม่สุดก่อน
        return TaskResource::collection(Task::latest()->get());
    }

    public function store(Request $request)
    {
        // validate แบบง่าย ไม่ใช้ FormRequest แล้ว
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            // ถ้าจะใช้ detail จริง ๆ ค่อยเพิ่ม column + rule
            // 'detail' => ['nullable', 'string'],
        ]);

        $task = Task::create($validated);

        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    public function show(Task $task)
    {
        return new TaskResource($task);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            // sometimes = ส่งมาก็ต้อง validate / ไม่ส่งมาก็ได้
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            // 'detail' => ['nullable', 'string'],
        ]);

        $task->update($validated);

        return new TaskResource($task);
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return response()->noContent();
    }
}
