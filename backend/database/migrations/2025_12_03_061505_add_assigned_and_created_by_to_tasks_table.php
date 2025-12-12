<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ตอนนี้คอลัมน์ assigned_to / created_by มีอยู่แล้วในตาราง tasks
        // เลยไม่ต้องเพิ่มอะไรใน up()
    }

    public function down(): void
    {
        // ถ้าอยากให้ rollback แล้วลบคอลัมน์ออกจริง ๆ ค่อยมาเติมทีหลังได้
    }
};
