<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskTagController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;

Route::get('/health', function () {
    return ['status' => 'ok'];
});

// ✅ ใช้เช็คว่า routes/api.php ถูกโหลดจริงไหม
Route::get('/ping', function () {
    return ['pong' => true];
});

/**
 * POST /api/login
 */
Route::post('/login', function (Request $request) {
    $data = $request->validate([
        'email'    => ['required', 'email'],
        'password' => ['required'],
    ]);

    $user = User::where('email', $data['email'])->first();

    if (! $user || ! Hash::check($data['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

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

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // ✅ Tasks CRUD
    Route::apiResource('tasks', TaskController::class);

    // ✅ Task Comments
    Route::get   ('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post  ('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::patch ('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

    // ✅ Task Tags
    Route::get   ('/tasks/{task}/tags', [TaskTagController::class, 'index']);
    Route::post  ('/tasks/{task}/tags', [TaskTagController::class, 'store']);
    Route::delete('/tasks/{task}/tags/{tag}', [TaskTagController::class, 'destroy']);

    // ✅ Reports
    Route::get('/reports/summary', [ReportController::class, 'summary']);

    // ✅ Users (Admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);

});
