<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

// อย่าใส่คำว่า /api นำหน้า เพราะ Laravel จะ prefix ให้อัตโนมัติ
Route::get('/health', fn () => response()->json(['ok' => true]));

Route::apiResource('tasks', TaskController::class);
