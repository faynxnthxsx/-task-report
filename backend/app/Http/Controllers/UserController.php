<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private function forbidUnlessAdmin(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return null;
    }

    /**
     * GET /api/users
     * admin เท่านั้น: ดูรายชื่อผู้ใช้
     */
    public function index(Request $request)
    {
        if ($resp = $this->forbidUnlessAdmin($request)) return $resp;

        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json(['users' => $users]);
    }

    /**
     * PATCH /api/users/{user}/role
     * admin เท่านั้น: เปลี่ยน role
     * body: { "role": "admin|manager|staff" }
     */
    public function updateRole(Request $request, User $user)
    {
        if ($resp = $this->forbidUnlessAdmin($request)) return $resp;

        $data = $request->validate([
            'role' => ['required', 'in:admin,manager,staff'],
        ], [
            'role.in' => 'Role ไม่ถูกต้อง',
        ]);

        $user->role = $data['role'];
        $user->save();

        return response()->json([
            'message' => 'Updated',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}
