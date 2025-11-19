<?php

// ใช้คลาส Application, Exceptions, Middleware
// จาก namespace Illuminate\Foundation\...
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// return แอปพลิเคชัน Laravel ที่ถูกตั้งค่าทุกอย่างเรียบร้อยแล้ว
// ไฟล์ bootstrap/app.php นี้ จะถูกเรียกตอนเริ่มต้นระบบ
return Application::configure(
        // basePath = โฟลเดอร์หลักของโปรเจกต์เรา (เช่น C:\projects\task-report\backend)
        // dirname(__DIR__) = โฟลเดอร์ "หนึ่งระดับบน" จาก bootstrap/
//      bootstrap/
//      └── app.php (ไฟล์นี้)
//      └── .. = รากโปรเจกต์ (ที่มี composer.json, routes/, app/, config/ etc.)
        basePath: dirname(__DIR__)
    )

    // ตั้งค่าเรื่อง "Routing" (ไฟล์ route ต่าง ๆ)
    ->withRouting(
        // web routes = หน้าเว็บปกติ (มี session, CSRF, ใช้ view ฯลฯ)
        // เช่น Route::get('/', ...) อยู่ในไฟล์นี้
        web: __DIR__.'/../routes/web.php',

        // api routes = สำหรับ API (stateless, ไม่มี session, ใช้ prefix /api)
        // เช่น Route::get('/tasks', ...) ใน API
        api: __DIR__.'/../routes/api.php',

        // console routes = คำสั่ง artisan แบบ custom
        // เราสามารถสร้างคำสั่งของเราขึ้นมาเองแล้ว map ไว้ในไฟล์นี้
        commands: __DIR__.'/../routes/console.php',

        // health check route = path สำหรับเช็คว่าเซิร์ฟเวอร์ยังโอเคไหม
        // ในที่นี้คือ /up (GET /up) เวลาไปเปิดดูถ้าขึ้น 200 แปลว่าแอปรันอยู่
        health: '/up',
    )

    // ตั้งค่า middleware ส่วนกลางของแอป (ยังไม่ได้ใส่อะไรเพิ่ม)
    ->withMiddleware(function (Middleware $middleware) {
        // ตรงนี้เราสามารถเพิ่ม / ปรับกลุ่ม middleware ได้
        // เช่น $middleware->web(...), $middleware->api(...), ฯลฯ
        //
        // ตอนนี้ปล่อยว่างไว้ = ใช้ค่า default ของ Laravel ไปก่อน
    })

    // ตั้งค่าการจัดการ Exceptions (error handler)
    ->withExceptions(function (Exceptions $exceptions) {
        // ตรงนี้ใช้ลงทะเบียนวิธี handle exception แบบ custom
        // เช่น จัดการ error บางชนิดให้ตอบ JSON พิเศษ, log ต่างแบบ ฯลฯ
        //
        // ตอนนี้เว้นว่าง = ใช้ handler มาตรฐานของ Laravel ไปก่อน
    })

    // หลังจากตั้งค่าทั้งหมดเสร็จแล้ว → สร้าง instance ของ Application จริง ๆ
    // แอปนี้จะถูกใช้ต่อใน public/index.php ตอนรับ request
    ->create();
