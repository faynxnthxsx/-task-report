<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

Route::get('/health', fn () => ['ok' => true, 'time' => now()->toIso8601String()]);
Route::apiResource('tasks', TaskController::class);
