<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // ถ้ามี assignee_id อยู่แล้ว ให้ rename เป็น assigned_to
            if (Schema::hasColumn('tasks', 'assignee_id') && !Schema::hasColumn('tasks', 'assigned_to')) {
                $table->renameColumn('assignee_id', 'assigned_to');
            }

            // ถ้ายังไม่มี assigned_to จริง ๆ ให้เพิ่มใหม่
            if (!Schema::hasColumn('tasks', 'assigned_to')) {
                $table->unsignedBigInteger('assigned_to')->nullable()->index();
            }

            // ถ้ายังไม่มี created_by ให้เพิ่ม (Model ก็มีอยู่แล้ว)
            if (!Schema::hasColumn('tasks', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // ย้อนกลับแบบปลอดภัย: ถ้ามี assigned_to แต่ไม่มี assignee_id ให้ rename กลับ
            if (Schema::hasColumn('tasks', 'assigned_to') && !Schema::hasColumn('tasks', 'assignee_id')) {
                $table->renameColumn('assigned_to', 'assignee_id');
            }

            // ไม่ drop created_by ใน down เพื่อกันข้อมูลหาย (เลือกได้)
        });
    }
};
