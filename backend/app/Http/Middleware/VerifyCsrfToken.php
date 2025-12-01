<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * URIs ที่จะไม่เช็ก CSRF (ใช้ตอน dev / เรียกด้วย curl)
     */
    protected $except = [
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password',
        // ถ้าภายหลังอยากเปิด CSRF เต็มๆ ค่อยลบออกได้
    ];
}
