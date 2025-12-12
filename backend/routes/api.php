<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return ['status' => 'ok'];
});

/**
 * API Login
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

    // ตอน dev ยังไม่ลบ token เก่า ปล่อยให้มีหลาย token ได้
    // $user->tokens()->delete();

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
 * Protected Routes (ต้อง login)
 */
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    // Tasks CRUD
    Route::apiResource('tasks', TaskController::class);

    // ✅ Task Comments
    Route::get   ('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post  ('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::patch ('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);

    // Reports
    Route::get('/reports/summary', [ReportController::class, 'summary']);
});
