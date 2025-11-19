<?php

// ไฟล์นี้จะ return "array ของ service providers" ของแอปเรา
// Laravel จะโหลด providers พวกนี้ตอนบูตระบบ
return [
    // ระบุคลาสของ Service Provider ที่ต้องการให้ Laravel โหลด
    // เขียนแบบ ::class เพื่อให้ได้ชื่อคลาสแบบเต็ม (เช่น "App\Providers\AppServiceProvider")
    // AppServiceProvider คือที่ที่เราใช้ลงทะเบียน service ต่าง ๆ ของแอป
    // เช่น binding interface -> class, ตั้งค่า config เพิ่ม ฯลฯ
    App\Providers\AppServiceProvider::class,
];
