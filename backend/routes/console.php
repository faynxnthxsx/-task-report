<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

// สมัคร Artisan command แบบง่าย ด้วยการใช้ closure
Artisan::command('inspire', function () {
    // $this คือ object ของ Console Command (Laravel ส่งมาให้)
    // comment() = แสดงข้อความใน console ด้วยสไตล์ "comment" (ออกสีเหลืองอ่อน ๆ)
    //
    // Inspiring::quote() = ดึง "คำคมสร้างแรงบันดาลใจ" หนึ่งประโยคจากคลาส Inspiring
    $this->comment(Inspiring::quote());

    // เวลาเรารัน: php artisan inspire
    // มันจะแสดงประโยคจาก Inspiring::quote() บนหน้าจอ
})
    // purpose() = ใส่คำอธิบายว่า command นี้มีไว้ทำอะไร
    // ใช้แสดงตอนดูรายการคำสั่ง (php artisan list) หรือ help
    ->purpose('Display an inspiring quote');
