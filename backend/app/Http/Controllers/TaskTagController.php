<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Tag;
use Illuminate\Http\Request;

class TaskTagController extends Controller
{
    /**
     * staff เข้าถึง task นี้ได้ไหม (ถ้าไม่ใช่เจ้าของ -> 403)
     */
    private function forbidIfStaffNotOwner(Request $request, Task $task)
    {
        $user = $request->user();

        // ✅ โปรเจคนี้ใช้ assigned_to (ไม่ใช่ assignee_id)
        if ($user && $user->role === 'staff' && (int)$task->assigned_to !== (int)$user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return null;
    }

    /**
     * แสดง tags ของ task
     * GET /api/tasks/{task}/tags
     */
    public function index(Request $request, $task)
    {
        $taskModel = Task::with('tags')->find($task);

        if (! $taskModel) {
            return response()->json(['message' => 'ไม่พบงาน (task) id = ' . $task], 404);
        }

        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $tags = $taskModel->tags
            ->map(function (Tag $tag) {
                return [
                    'id'    => $tag->id,
                    'name'  => $tag->name,
                    'color' => $tag->color,
                ];
            })
            ->values();

        return response()->json($tags);
    }

    /**
     * เพิ่ม tag ให้ task
     * POST /api/tasks/{task}/tags
     * body: { "name": "urgent", "color": "red" } หรือ { "tag_id": 1 }
     */
    public function store(Request $request, $task)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json(['message' => 'ไม่พบงาน (task) id = ' . $task], 404);
        }

        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $data = $request->validate([
            'tag_id' => ['nullable', 'integer', 'exists:tags,id'],
            'name'   => ['nullable', 'string', 'max:50'],
            'color'  => ['nullable', 'string', 'max:20'],
        ], [
            'tag_id.exists' => 'tag_id ไม่ถูกต้อง',
            'name.max'      => 'ชื่อ tag ยาวเกินไป (สูงสุด 50 ตัวอักษร)',
            'color.max'     => 'สี tag ยาวเกินไป (สูงสุด 20 ตัวอักษร)',
        ]);

        if (! empty($data['tag_id'])) {
            $tag = Tag::find($data['tag_id']);
        } else {
            $name = $data['name'] ?? null;

            if (! $name || trim($name) === '') {
                return response()->json(['message' => 'กรุณาส่ง tag_id หรือ name'], 422);
            }

            $tag = Tag::firstOrCreate(
                ['name' => trim($name)],
                ['color' => $data['color'] ?? null]
            );
        }

        $taskModel->tags()->syncWithoutDetaching([$tag->id]);

        $taskModel->load('tags');

        $tags = $taskModel->tags->map(function (Tag $t) {
            return [
                'id'    => $t->id,
                'name'  => $t->name,
                'color' => $t->color,
            ];
        })->values();

        return response()->json([
            'message' => 'เพิ่ม tag สำเร็จ',
            'tags'    => $tags,
        ], 201);
    }

    /**
     * ลบ tag ออกจาก task
     * DELETE /api/tasks/{task}/tags/{tag}
     */
    public function destroy(Request $request, $task, $tag)
    {
        $taskModel = Task::find($task);

        if (! $taskModel) {
            return response()->json(['message' => 'ไม่พบงาน (task) id = ' . $task], 404);
        }

        if ($resp = $this->forbidIfStaffNotOwner($request, $taskModel)) {
            return $resp;
        }

        $tagModel = Tag::find($tag);

        if (! $tagModel) {
            return response()->json(['message' => 'ไม่พบ tag id = ' . $tag], 404);
        }

        $taskModel->tags()->detach($tagModel->id);

        $taskModel->load('tags');

        $tags = $taskModel->tags->map(function (Tag $t) {
            return [
                'id'    => $t->id,
                'name'  => $t->name,
                'color' => $t->color,
            ];
        })->values();

        return response()->json([
            'message' => 'ลบ tag สำเร็จ',
            'tags'    => $tags,
        ]);
    }
}
