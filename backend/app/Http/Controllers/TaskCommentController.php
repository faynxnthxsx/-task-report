<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    /**
     * แสดงคอมเมนต์ทั้งหมดของงานหนึ่งงาน
     * GET /api/tasks/{task}/comments
     */
    public function index(Request $request, Task $task)
    {
        $user = $request->user(); // อาจเป็น null ถ้าไม่ login

        $comments = $task->comments()
            ->with('user')
            ->orderBy('created_at')
            ->get();

        $data = $comments->map(function (TaskComment $comment) use ($user) {
            $text = $comment->body ?? $comment->content ?? '';

            $canEdit = false;
            $canDelete = false;

            if ($user) {
                $isOwner   = $comment->user_id === $user->id;
                $isAdmin   = $user->role === 'admin';
                $isManager = $user->role === 'manager';
                // $isStaff   = $user->role === 'staff'; // ยังไม่ได้ใช้ตรงนี้ แต่ประกาศไว้ให้ชัดเจนก็ได้

                $canModerate = $isAdmin || $isManager;

                if ($canModerate) {
                    // admin/manager แก้/ลบได้ทุกคอมเมนต์
                    $canEdit   = true;
                    $canDelete = true;
                } elseif ($isOwner) {
                    // เจ้าของคอมเมนต์ แก้/ลบของตัวเองได้
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
    public function store(Request $request, Task $task)
    {
        $data = $request->validate([
            'body'    => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
        ]);

        $text = $data['body'] ?? $data['content'] ?? null;

        if (! $text || trim($text) === '') {
            return response()->json([
                'message' => 'กรุณากรอกข้อความคอมเมนต์',
            ], 422);
        }

        $user = $request->user();

        $comment = $task->comments()->create([
            'body'    => $text,
            'user_id' => $user?->id,
        ]);

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

        $response = [
            'id'          => $comment->id,
            'body'        => $text,
            'content'     => $text,
            'user_name'   => $user?->name ?? 'ไม่ระบุชื่อ',
            'user_id'     => $comment->user_id,
            'created_at'  => $comment->created_at,
            'can_edit'    => $canEdit,
            'can_delete'  => $canDelete,
        ];

        return response()->json($response, 201);
    }

    /**
     * แก้ไขคอมเมนต์
     * PATCH /api/tasks/{task}/comments/{comment}
     */
    public function update(Request $request, Task $task, TaskComment $comment)
    {
        if ($comment->task_id !== $task->id) {
            abort(404, 'Comment not belongs to this task');
        }

        $user = $request->user();

        if (! $user) {
            abort(401, 'กรุณาเข้าสู่ระบบ');
        }

        $isOwner   = $comment->user_id === $user->id;
        $isAdmin   = $user->role === 'admin';
        $isManager = $user->role === 'manager';
        // $isStaff   = $user->role === 'staff';

        $canModerate = $isAdmin || $isManager;

        if (! $canModerate && ! $isOwner) {
            abort(403, 'คุณไม่มีสิทธิ์แก้ไขคอมเมนต์นี้');
        }

        $data = $request->validate([
            'body'    => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
        ]);

        $text = $data['body'] ?? $data['content'] ?? null;

        if (! $text || trim($text) === '') {
            return response()->json([
                'message' => 'กรุณากรอกข้อความคอมเมนต์',
            ], 422);
        }

        $comment->update([
            'body' => $text,
        ]);

        $canEdit   = $canModerate || $isOwner;
        $canDelete = $canModerate || $isOwner;

        $response = [
            'id'          => $comment->id,
            'body'        => $text,
            'content'     => $text,
            'user_name'   => optional($comment->user)->name ?? 'ไม่ระบุชื่อ',
            'user_id'     => $comment->user_id,
            'created_at'  => $comment->created_at,
            'can_edit'    => $canEdit,
            'can_delete'  => $canDelete,
        ];

        return response()->json($response);
    }

    /**
     * ลบคอมเมนต์
     * DELETE /api/tasks/{task}/comments/{comment}
     *
     * - admin / manager ลบได้ทุกอัน
     * - เจ้าของคอมเมนต์ลบของตัวเองได้
     */
    public function destroy(Request $request, Task $task, TaskComment $comment)
    {
        if ($comment->task_id !== $task->id) {
            abort(404, 'Comment not belongs to this task');
        }

        $user = $request->user();

        if (! $user) {
            abort(401, 'กรุณาเข้าสู่ระบบ');
        }

        $isOwner   = $comment->user_id === $user->id;
        $isAdmin   = $user->role === 'admin';
        $isManager = $user->role === 'manager';
        // $isStaff   = $user->role === 'staff';

        $canModerate = $isAdmin || $isManager;

        if (! $canModerate && ! $isOwner) {
            abort(403, 'คุณไม่มีสิทธิ์ลบคอมเมนต์นี้');
        }

        $comment->delete();

        return response()->json([
            'message' => 'ลบคอมเมนต์เรียบร้อยแล้ว',
        ]);
    }
}
