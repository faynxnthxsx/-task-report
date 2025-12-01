<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| prefix ทั้งหมดเป็น /api/ โดยอัตโนมัติ
*/

Route::get('/health', function () {
    return ['status' => 'ok'];
});

/**
 * API Login (ใช้ Sanctum token)
 *
 * POST /api/login
 */
Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email'    => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (! Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    /** @var \App\Models\User $user */
    $user = $request->user();

    // ลบ token เก่าทิ้งให้เหลืออันล่าสุดอันเดียว
    $user->tokens()->delete();

    $token = $user->createToken('task-report')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user'  => [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ],
    ]);
});

/**
 * ส่วนที่ต้อง login ด้วย Sanctum
 * (Dashboard, Tasks CRUD, Comments)
 */
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // ✅ Tasks CRUD
    Route::apiResource('tasks', TaskController::class);

    // ✅ Comments ใต้ Task (ต้องมี token ถึงจะรู้ว่าใครเป็นคนคอมเมนต์ + เช็ค admin ลบได้)
   /**
 * ⭐ คอมเมนต์ใต้ Task
 * ไม่บังคับ auth ที่ route แต่ใน controller จะเช็กสิทธิ์เอง
 */
Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
Route::patch('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
Route::put('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

});
