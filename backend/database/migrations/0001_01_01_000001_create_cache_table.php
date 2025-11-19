<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// ใช้ anonymous class extends Migration แล้ว return ออกไป
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * เมธอดนี้จะถูกรันตอนเราใช้คำสั่ง:
     * php artisan migrate
     */
    public function up(): void
    {
        // ---------- สร้างตาราง cache ----------
        Schema::create('cache', function (Blueprint $table) {
            // key = คีย์ของ cache (เป็น string) ใช้เป็น PRIMARY KEY
            // เช่น "users_count", "settings:site_name" เป็นต้น
            $table->string('key')->primary();

            // value = ค่าของ cache เก็บเป็น mediumText
            // ภายในมักจะเป็น string ที่ serialize/encode แล้ว (เช่น JSON)
            $table->mediumText('value');

            // expiration = เวลา expiration เป็นตัวเลข (ส่วนใหญ่คือ timestamp วินาที)
            // เอาไว้รู้ว่าข้อมูลนี้หมดอายุเมื่อไร
            $table->integer('expiration');
        });

        // ---------- สร้างตาราง cache_locks ----------
        Schema::create('cache_locks', function (Blueprint $table) {
            // key = ชื่อ lock (เช่น "report:monthly:lock") ใช้เป็น PRIMARY KEY
            $table->string('key')->primary();

            // owner = ตัวระบุว่าใครเป็นเจ้าของ lock นี้
            // เช่น ID ของ process หรือ token บางอย่าง
            $table->string('owner');

            // expiration = เวลา lock หมดอายุ (จำนวนวินาที / timestamp)
            $table->integer('expiration');
        });
    }

    /**
     * Reverse the migrations.
     *
     * เมธอดนี้จะถูกรันตอนเราใช้คำสั่ง:
     * php artisan migrate:rollback
     * เพื่อย้อนกลับ (ลบตารางที่สร้างใน up())
     */
    public function down(): void
    {
        // ถ้ามีตาราง cache อยู่ ให้ลบทิ้ง
        Schema::dropIfExists('cache');

        // ถ้ามีตาราง cache_locks อยู่ ให้ลบทิ้ง
        Schema::dropIfExists('cache_locks');
    }
};
