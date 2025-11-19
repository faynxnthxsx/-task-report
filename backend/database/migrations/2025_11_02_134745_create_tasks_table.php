<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// anonymous migration class
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * เมธอดนี้จะรันตอนใช้คำสั่ง:
     *   php artisan migrate
     * ใช้สำหรับ "สร้าง" ตาราง tasks
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            // id (BIGINT UNSIGNED, auto-increment, PRIMARY KEY)
            // ใช้เป็นไอดีหลักของงานแต่ละอัน
            $table->id();

            // title: ชื่องาน (string = VARCHAR(255) โดย default)
            // ใช้แสดงสั้น ๆ ใน list เช่น "เขียนรายงาน", "Test API"
            $table->string('title');

            // detail: รายละเอียดงานแบบยาว
            // ใช้ TEXT เพราะอาจพิมพ์ยาวกว่าชื่อได้เยอะ
            // nullable() = ไม่จำเป็นต้องกรอก (ปล่อยว่างได้)
            $table->text('detail')->nullable();

            // status: สถานะของงาน เช่น "pending", "done", "in_progress" ฯลฯ
            // ใช้ string ธรรมดา และตั้งค่าเริ่มต้นเป็น 'pending'
            $table->string('status')->default('pending');

            // timestamps: สร้าง 2 ฟิลด์อัตโนมัติ
            // - created_at  เวลา record ถูกสร้าง
            // - updated_at  เวลา record ถูกแก้ไขล่าสุด
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * เมธอดนี้จะรันตอนใช้คำสั่ง:
     *   php artisan migrate:rollback
     * ใช้เพื่อ "ย้อน" สิ่งที่ up() ทำไปแล้ว
     */
    public function down(): void
    {
        // ถ้ามีตาราง tasks อยู่ ให้ลบทิ้ง
        Schema::dropIfExists('tasks');
    }
};
