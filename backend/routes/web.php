<?php

use Illuminate\Support\Facades\Route; // ดึง Route facade มาใช้สำหรับประกาศเส้นทาง (routes)

// กำหนด route แบบ GET สำหรับ URL "/"
// เช่น http://localhost/ หรือ http://your-site.com/
Route::get('/', function () {
    // เมื่อมีคนเข้า URL "/" ให้รันโค้ดในฟังก์ชันนี้
    // แล้ว "คืนค่า" เป็น view ชื่อ 'welcome'
    //
    // view('welcome') = ไปโหลดไฟล์ resources/views/welcome.blade.php
    // แล้วเรนเดอร์เป็น HTML ส่งกลับไปให้ browser
    return view('welcome');
});
