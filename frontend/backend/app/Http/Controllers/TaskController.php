<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    // GET /api/tasks
    public function index()
    {
        try {
            $items = Task::orderByDesc('id')->get();
            return response()->json($items, 200);
        } catch (\Throwable $e) {
            Log::error('tasks.index error: '.$e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'title' => 'required|string|max:255',
                'detail' => 'nullable|string',
            ]);
            $task = Task::create($data);
            return response()->json($task, 201);
        } catch (\Throwable $e) {
            Log::error('tasks.store error: '.$e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    // GET /api/tasks/{id}
    public function show(Task $task)
    {
        return response()->json($task, 200);
    }

    // PUT/PATCH /api/tasks/{id}
    public function update(Request $request, Task $task)
    {
        try {
            $data = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'detail' => 'nullable|string',
            ]);
            $task->update($data);
            return response()->json($task, 200);
        } catch (\Throwable $e) {
            Log::error('tasks.update error: '.$e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    // DELETE /api/tasks/{id}
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(null, 204);
    }
}
