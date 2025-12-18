<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    /**
     * เช็คว่า staff เข้าถึง task นี้ได้ไหม
     */
    private function forbidIfStaffNotOwner(Request $request, Task $taskModel)
    {
        $user = $request->user();

        if ($user && $user->role === 'staff' && $taskModel->assignee_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return null;
    }

    /**
     * แสดงคอมเมนต์ทั้งหมดของงานหนึ่งงาน
     * GET /api/tasks/{task}/comments
     */
    public function index(Request $request, $task)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json([
                'message' => 'ไม่พบงาน (task) id = ' . $task,
            ], 404);
        }

        // ✅ staff ดูได้เฉพาะ task ของตัวเอง
        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $user = $request->user();

        $comments = $taskModel->comments()
            ->with('user')
            ->orderBy('created_at')
            ->get();

        $data = $comments->map(function (TaskComment $comment) use ($user) {
            $text = $comment->body ?? '';

            $canEdit = false;
            $canDelete = false;

            if ($user) {
                $isOwner   = $comment->user_id === $user->id;
                $isAdmin   = $user->role === 'admin';
                $isManager = $user->role === 'manager';

                $canModerate = $isAdmin || $isManager;

                if ($canModerate || $isOwner) {
                    $canEdit   = true;
                    $canDelete = true;
                }
            }

            return [
                'id'          => $comment->id,
                'body'        => $text,
                'content'     => $text,
                'user_name'   => optional($comment->user)->name ?? 'ไม่ระบุชื่อ',
                'user_id'     => $comment->user_id,
                'created_at'  => $comment->created_at,
                'can_edit'    => $canEdit,
                'can_delete'  => $canDelete,
            ];
        });

        return response()->json($data->all());
    }

    /**
     * สร้างคอมเมนต์ใหม่ใต้ Task
     * POST /api/tasks/{task}/comments
     */
    public function store(Request $request, $task)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json([
                'message' => 'ไม่พบงาน (task) id = ' . $task,
            ], 404);
        }

        // ✅ staff คอมเมนต์ได้เฉพาะ task ของตัวเอง
        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        // ✅ ต้อง login ก่อน
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
        }

        // ✅ validate ข้อความ
        $data = $request->validate([
            'body'    => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string', 'max:1000'],
        ], [
            'body.max'    => 'คอมเมนต์ยาวเกินไป (สูงสุด 1000 ตัวอักษร)',
            'content.max' => 'คอมเมนต์ยาวเกินไป (สูงสุด 1000 ตัวอักษร)',
        ]);

        $text = $data['body'] ?? $data['content'] ?? null;

        if (! $text || trim($text) === '') {
            return response()->json([
                'message' => 'กรุณากรอกข้อความคอมเมนต์',
            ], 422);
        }

        $comment = $taskModel->comments()->create([
            'body'    => $text,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'id'          => $comment->id,
            'body'        => $text,
            'content'     => $text,
            'user_name'   => $user->name ?? 'ไม่ระบุชื่อ',
            'user_id'     => $comment->user_id,
            'created_at'  => $comment->created_at,
            'can_edit'    => true,
            'can_delete'  => true,
        ], 201);
    }

    /**
     * แก้ไขคอมเมนต์
     * PATCH/PUT /api/tasks/{task}/comments/{comment}
     */
    public function update(Request $request, $task, $comment)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json([
                'message' => 'ไม่พบงาน (task) id = ' . $task,
            ], 404);
        }

        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $commentModel = TaskComment::where('task_id', $task)->find($comment);

        if (! $commentModel) {
            return response()->json([
                'message' => 'ไม่พบคอมเมนต์ id = ' . $comment . ' ใน task นี้',
            ], 404);
        }

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
        }

        $isOwner   = $commentModel->user_id === $user->id;
        $isAdmin   = $user->role === 'admin';
        $isManager = $user->role === 'manager';

        if (! ($isOwner || $isAdmin || $isManager)) {
            return response()->json([
                'message' => 'คุณไม่มีสิทธิ์แก้ไขคอมเมนต์นี้',
            ], 403);
        }

        $data = $request->validate([
            'body'    => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string', 'max:1000'],
        ]);

        $text = $data['body'] ?? $data['content'] ?? null;

        if (! $text || trim($text) === '') {
            return response()->json([
                'message' => 'กรุณากรอกข้อความคอมเมนต์',
            ], 422);
        }

        $commentModel->update([
            'body' => $text,
        ]);

        return response()->json([
            'id'          => $commentModel->id,
            'body'        => $text,
            'content'     => $text,
            'user_name'   => optional($commentModel->user)->name ?? 'ไม่ระบุชื่อ',
            'user_id'     => $commentModel->user_id,
            'created_at'  => $commentModel->created_at,
            'can_edit'    => true,
            'can_delete'  => true,
        ]);
    }

    /**
     * ลบคอมเมนต์
     * DELETE /api/tasks/{task}/comments/{comment}
     */
    public function destroy(Request $request, $task, $comment)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json([
                'message' => 'ไม่พบงาน (task) id = ' . $task,
            ], 404);
        }

        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $commentModel = TaskComment::where('task_id', $task)->find($comment);

        if (! $commentModel) {
            return response()->json([
                'message' => 'ไม่พบคอมเมนต์ id = ' . $comment . ' ใน task นี้',
            ], 404);
        }

        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'กรุณาเข้าสู่ระบบ'], 401);
        }

        $isOwner   = $commentModel->user_id === $user->id;
        $isAdmin   = $user->role === 'admin';
        $isManager = $user->role === 'manager';

        if (! ($isOwner || $isAdmin || $isManager)) {
            return response()->json([
                'message' => 'คุณไม่มีสิทธิ์ลบคอมเมนต์นี้',
            ], 403);
        }

        $commentModel->delete();

        return response()->json([
            'message' => 'ลบคอมเมนต์เรียบร้อยแล้ว',
        ]);
    }
}
