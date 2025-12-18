<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;

class ReportController extends Controller
{
    /**
     * Summary Report
     * - staff เห็นเฉพาะงานตัวเอง (assigned_to)
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        $base = Task::query();

        if ($user && $user->role === 'staff') {
            $base->where('assigned_to', $user->id);
        }

        $total       = (clone $base)->count();
        $completed   = (clone $base)->where('status', 'completed')->count();
        $pending     = (clone $base)->where('status', 'pending')->count();
        $inProgress  = (clone $base)->where('status', 'in_progress')->count();

        $overdue = (clone $base)
            ->whereNotNull('deadline')
            ->whereDate('deadline', '<', now()->toDateString())
            ->where('status', '!=', 'completed')
            ->count();

        return response()->json([
            'total'       => $total,
            'completed'   => $completed,
            'pending'     => $pending,
            'in_progress' => $inProgress,
            'overdue'     => $overdue,
        ]);
    }
}
