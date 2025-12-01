<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * ใช้แบบ: ->middleware('role:admin') หรือ 'role:manager,admin'
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // ถ้าไม่ได้ล็อกอิน หรือ role ไม่อยู่ใน list ที่กำหนด → ห้ามเข้า
        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Forbidden',
            ], 403);
        }

        return $next($request);
    }
}
