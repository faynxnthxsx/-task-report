<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// anonymous class extends Migration
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * รันตอนเราใช้คำสั่ง: php artisan migrate
     */
    public function up(): void
    {
        // ------------------ ตาราง jobs ------------------
        Schema::create('jobs', function (Blueprint $table) {
            // id auto-increment (BIGINT) เป็น primary key
            $table->id();

            // ชื่อ queue ที่ job นี้อยู่ เช่น "default", "emails" ฯลฯ
            // index() เพื่อค้นหาจากชื่อนี้ได้เร็ว (เช่นดึงเฉพาะ queue ใด queue หนึ่ง)
            $table->string('queue')->index();

            // payload = ข้อมูล job ทั้งก้อน (serialize/JSON)
            // เก็บว่า class ไหน, parameters อะไร ฯลฯ
            $table->longText('payload');

            // attempts = พยายามรันมาแล้วกี่ครั้ง (นับจำนวน)
            // ใช้ unsignedTinyInteger = 0–255
            $table->unsignedTinyInteger('attempts');

            // reserved_at = เวลา (timestamp เป็น integer) ที่ job ถูก "จอง" โดย worker ตัวหนึ่ง
            // nullable = อาจยังไม่ถูกจองก็ได้ (รอ worker มาจับไปทำ)
            $table->unsignedInteger('reserved_at')->nullable();

            // available_at = เวลา (timestamp) ที่ job นี้เริ่มดึงไปทำได้
            // ใช้สำหรับ job ที่ delay (เช่น dispatch(...)->delay(10))
            $table->unsignedInteger('available_at');

            // created_at = เวลา (timestamp) ที่ job นี้ถูกใส่เข้าคิว
            $table->unsignedInteger('created_at');
        });

        // ------------------ ตาราง job_batches ------------------
        Schema::create('job_batches', function (Blueprint $table) {
            // id เป็น string (มักเป็น UUID) ใช้เป็น primary key
            $table->string('id')->primary();

            // name = ชื่อ batch (ให้ dev อ่านรู้ว่า batch นี้คืออะไร)
            $table->string('name');

            // total_jobs = จำนวน job ทั้งหมดใน batch นี้
            $table->integer('total_jobs');

            // pending_jobs = จำนวน job ที่ยังเหลืออยู่ (ยังไม่เสร็จ)
            $table->integer('pending_jobs');

            // failed_jobs = จำนวน job ที่ล้มเหลวใน batch นี้
            $table->integer('failed_jobs');

            // failed_job_ids = เก็บ list id ของ job ที่ล้มเหลว (serialize/JSON)
            $table->longText('failed_job_ids');

            // options = ตัวเลือกต่าง ๆ ของ batch (เช่น callback, allow_failures ฯลฯ)
            // nullable = บาง batch อาจไม่มี options เสริม
            $table->mediumText('options')->nullable();

            // cancelled_at = เวลา (timestamp) ที่ batch นี้ถูกยกเลิก (ถ้ามี)
            $table->integer('cancelled_at')->nullable();

            // created_at = timestamp ตอนสร้าง batch
            $table->integer('created_at');

            // finished_at = timestamp ตอน batch เสร็จสมบูรณ์ (หรือหยุด)
            $table->integer('finished_at')->nullable();
        });

        // ------------------ ตาราง failed_jobs ------------------
        Schema::create('failed_jobs', function (Blueprint $table) {
            // id auto-increment primary key
            $table->id();

            // uuid = รหัส unique สำหรับ failed job นี้ (ใช้ค้นหาอ้างอิงได้สะดวก)
            $table->string('uuid')->unique();

            // connection = ชื่อ connection queue ที่ใช้ เช่น "database", "redis"
            $table->text('connection');

            // queue = ชื่อ queue ที่ job นี้อยู่ตอนรัน เช่น "default", "emails"
            $table->text('queue');

            // payload = ข้อมูล job (class, data ฯลฯ) ตอนที่ล้มเหลว
            $table->longText('payload');

            // exception = ข้อความ error / stack trace เต็ม ๆ
            $table->longText('exception');

            // เวลา job นี้ล้มเหลว (default = เวลาปัจจุบันตอน insert)
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * รันตอน: php artisan migrate:rollback
     * ใช้ลบตารางที่สร้างไว้ใน up()
     */
    public function down(): void
    {
        // ลบตาราง jobs ถ้ามี
        Schema::dropIfExists('jobs');

        // ลบตาราง job_batches ถ้ามี
        Schema::dropIfExists('job_batches');

        // ลบตาราง failed_jobs ถ้ามี
        Schema::dropIfExists('failed_jobs');
    }
};
