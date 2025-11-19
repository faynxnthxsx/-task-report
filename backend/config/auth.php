<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | กำหนดค่า "เริ่มต้น" ของระบบยืนยันตัวตน (auth)
    | - guard = ระบบเฝ้าประตูหลักที่ใช้เวลา Auth::user(), auth() ฯลฯ
    | - passwords = กลุ่มการ reset password ที่ใช้เป็น default
    |
    */

    'defaults' => [
        // guard หลัก ถ้าไม่ระบุ guard เองจะใช้ตัวนี้
        // อ่านจาก ENV: AUTH_GUARD ถ้าไม่มีให้ใช้ 'web'
        'guard' => env('AUTH_GUARD', 'web'),

        // กลุ่มระบบ reset password ที่ใช้ default
        // อ่านจาก ENV: AUTH_PASSWORD_BROKER ถ้าไม่มีใช้ 'users'
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | guard = วิธี "รู้ว่า user คนไหนล็อกอินอยู่"
    | แต่ละ guard จะมี:
    |  - driver (เช่น session)
    |  - provider (จะไปดึง user จากที่ไหน)
    |
    | ตอนนี้เรามี guard เดียวคือ 'web' (เหมาะกับเว็บปกติ)
    |
    | Supported drivers ใน config นี้: "session"
    |
    */

    'guards' => [
        'web' => [
            // driver session = เก็บสถานะล็อกอินผ่าน session + cookie
            'driver' => 'session',

            // ใช้ user provider ชื่อ 'users' (ไปดูข้างล่างใน 'providers')
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | provider = วิธี "ไปดึงข้อมูล user จริง ๆ" จาก DB หรือที่เก็บอื่น
    |
    | ปกติ:
    |  - driver = 'eloquent'  → ใช้ Model (เช่น App\Models\User)
    |  - driver = 'database'  → query จาก table ตรง ๆ
    |
    | เราสามารถมี provider หลายชุดได้ เช่น users, admins, customers
    | แล้วเอาแต่ละ provider ไปผูกกับ guards ต่างกันได้
    |
    | Supported drivers: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            // ใช้ Eloquent Model ในการดึง user
            'driver' => 'eloquent',

            // model ที่ใช้แทนตาราง users
            // อ่านจาก ENV: AUTH_MODEL ถ้าไม่ตั้ง ใช้ App\Models\User
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        // ตัวอย่างแบบใช้ driver "database" แทน eloquent
        // (ตอนนี้คอมเมนต์ไว้ไม่ได้ใช้งาน)
        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | ตั้งค่าระบบ "ลืมรหัสผ่าน / reset password"
    |
    | - provider = จะใช้ provider ไหน (ไปหา user จากไหน)
    | - table   = ตารางจัดเก็บ token สำหรับ reset password
    | - expire  = อายุของ token (นาที) – กันไม่ให้ใช้ได้นานเกินไป
    | - throttle = ต้องรอกี่วินาที ก่อนจะขอ token ใหม่ได้อีกครั้ง
    |
    */

    'passwords' => [
        'users' => [
            // ใช้ provider 'users' (คือ model User)
            'provider' => 'users',

            // ตารางเก็บ token reset password
            // ชื่อ default = 'password_reset_tokens'
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),

            // อายุ token = 60 นาที (1 ชั่วโมง)
            'expire' => 60,

            // ต้องรอ 60 วินาทีกว่าจะขอ token ใหม่ได้อีก
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | กำหนดจำนวนวินาทีที่การ "ยืนยันรหัสผ่าน" จะหมดอายุ
    | เช่น เวลาเปิดหน้าตั้งค่าที่สำคัญ ระบบอาจให้กรอกรหัสอีกครั้ง
    | ถ้าเกิน timeout นี้จะบังคับถามรหัสใหม่
    |
    | ค่า default = 10800 วินาที = 3 ชั่วโมง
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
