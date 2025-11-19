<?php

namespace App\Http\Controllers;

// import trait สำหรับจัดการสิทธิ์ (authorization)
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
// import trait สำหรับตรวจสอบข้อมูล (validation)
use Illuminate\Foundation\Validation\ValidatesRequests;
// import Controller หลักของ Laravel แล้วตั้งชื่อเล่นว่า BaseController
use Illuminate\Routing\Controller as BaseController;

// ประกาศคลาส Controller ของแอปเราเอง
// ซึ่งสืบทอด (extends) ความสามารถจาก BaseController ของ Laravel
class Controller extends BaseController
{
    // ผสม (mix-in) trait สองตัวนี้เข้ามาในคลาส
    // เพื่อให้มี method ช่วย เช่น $this->authorize(), $this->validate()
    use AuthorizesRequests, ValidatesRequests;
}
