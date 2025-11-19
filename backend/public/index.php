<?php

// import type สำหรับช่วยให้ IDE รู้ชนิดตัวแปร (ไม่บังคับ แต่ช่วยอ่านง่าย)
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// --------------------------------------------------------
// 1) จับเวลาเริ่มต้นของ Laravel
// --------------------------------------------------------

// กำหนด constant ชื่อ LARAVEL_START เป็นเวลา microtime ตอนนี้
// เอาไว้ใช้วัด performance ว่า request นี้ใช้เวลากี่วินาที
define('LARAVEL_START', microtime(true));

// --------------------------------------------------------
// 2) เช็กว่าอยู่ใน "โหมดปิดปรับปรุง" (maintenance mode) ไหม
// --------------------------------------------------------

// ถ้ามีไฟล์ maintenance.php อยู่ใน storage/framework/
// แปลว่ามีคนสั่ง `php artisan down` เอาไว้
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    // require ไฟล์นี้ทันที
    // ปกติไฟล์นี้จะ return หน้า "ระบบกำลังปิดปรับปรุง" แล้วหยุดการทำงานเลย
    require $maintenance;
}

// --------------------------------------------------------
// 3) โหลด Composer autoloader
// --------------------------------------------------------

// autoload.php ของ Composer จะทะเบียนคลาสทั้งหมดจาก vendor/
// ทำให้เราใช้คลาสต่าง ๆ ได้ด้วยคำว่า `use` โดยไม่ต้อง require ทีละไฟล์
require __DIR__.'/../vendor/autoload.php';

// --------------------------------------------------------
// 4) Bootstrap Laravel (เตรียมแอปให้พร้อมใช้งาน)
// --------------------------------------------------------

/**
 * @var Application $app
 *
 * require_once bootstrap/app.php
 * ไฟล์นั้นจะสร้าง instance ของ Illuminate\Foundation\Application
 * แล้วคืนค่ากลับมาเก็บในตัวแปร $app
 */
$app = require_once __DIR__.'/../bootstrap/app.php';

// --------------------------------------------------------
// 5) ให้ Laravel รับ Request และส่ง Response กลับ
// --------------------------------------------------------

// Request::capture() = ดึงข้อมูล HTTP request ปัจจุบัน (GET/POST/HEADER/COOKIE ฯลฯ)
// แปลงให้เป็น object Illuminate\Http\Request
//
// $app->handleRequest(...) = ให้ตัวแอป Laravel จัดการ request นี้
//   - ผ่าน middleware
//   - ผ่าน routing (routes/web.php หรือ routes/api.php)
//   - เรียก controller / action ที่ตรงกับ route
//   - สร้าง response
// แล้วส่ง response กลับไปที่ browser
$app->handleRequest(Request::capture());
