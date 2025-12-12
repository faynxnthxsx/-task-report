<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;

class ReportController extends Controller
{
    /**
     * Summary Report
     * - ใช้สำหรับ Dashboard Reports หรือหน้า /reports
     * - แสดงจำนวนงานแต่ละสถานะ รวมถึง overdue
     * - staff เห็นเฉพาะงานที่ assigned_to ตัวเอง
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        $query = Task::query();

        // ถ้าเป็น staff → จำกัดให้เห็นเฉพาะงานตัวเอง
        if ($user->role === 'staff') {
            $query->where('assigned_to', $user->id);
        }

        $total = $query->count();

        return response()->json([
            'total'        => $total,
            'completed'    => $query->where('status', 'completed')->count(),
            'pending'      => $query->where('status', 'pending')->count(),
            'in_progress'  => $query->where('status', 'in_progress')->count(),
            'overdue'      => $query->where('deadline', '<', now())
                                    ->where('status', '!=', 'completed')
                                    ->count(),
        ]);
    }
}
