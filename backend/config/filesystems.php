<?php

use Illuminate\Support\Str; // (แม้ในไฟล์นี้จะไม่ได้ใช้ Str แต่บางโปรเจกต์อาจเพิ่มเองทีหลังได้)

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | กำหนดว่าให้ Laravel ใช้ "disk" ตัวไหนเป็นค่าเริ่มต้น
    | เวลาเราเรียก Storage::... โดยไม่ระบุชื่อ disk
    |
    */

    // อ่านจาก .env: FILESYSTEM_DISK ถ้าไม่ตั้งไว้ให้ใช้ 'local'
    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | กำหนด disk ต่าง ๆ ที่ใช้เก็บไฟล์
    | เราสามารถมีหลาย disk ได้ และ disk เดียวกันอาจใช้ driver เดียวกันได้
    |
    | ตัวอย่าง driver ที่รองรับ: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        // disk ชื่อ 'local' เก็บไฟล์ในเครื่อง (ฝั่ง server)
        'local' => [
            'driver' => 'local',                        // ใช้ driver local
            'root' => storage_path('app/private'),      // โฟลเดอร์จริง: storage/app/private
            'serve' => true,                            // ให้ Laravel ช่วย serve ไฟล์ได้ (เวอร์ชันใหม่)
            'throw' => false,                           // ถ้าเกิด error ให้ไม่โยน exception (คืน false แทน)
            'report' => false,                          // ไม่ต้องรายงาน error ให้อัตโนมัติ
        ],

        // disk ชื่อ 'public' สำหรับไฟล์ที่ต้องให้เว็บเข้าถึงได้
        'public' => [
            'driver' => 'local',                        // ใช้ driver local เช่นกัน
            'root' => storage_path('app/public'),       // โฟลเดอร์จริง: storage/app/public
            // URL เริ่มต้นเวลาสร้างลิงก์ไฟล์ เช่น http://localhost/storage/...
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',                   // มองว่าไฟล์เป็น public (ใช้กับบาง driver)
            'throw' => false,
            'report' => false,
        ],

        // disk ชื่อ 's3' สำหรับเก็บไฟล์บน Amazon S3 (คลาวด์)
        's3' => [
            'driver' => 's3',                           // ใช้ driver s3
            'key' => env('AWS_ACCESS_KEY_ID'),          // access key ของ AWS
            'secret' => env('AWS_SECRET_ACCESS_KEY'),   // secret key ของ AWS
            'region' => env('AWS_DEFAULT_REGION'),      // region เช่น ap-southeast-1
            'bucket' => env('AWS_BUCKET'),              // ชื่อ bucket
            'url' => env('AWS_URL'),                    // base URL ถ้ามี
            'endpoint' => env('AWS_ENDPOINT'),          // endpoint กรณีพิเศษ (เช่น MinIO)
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | กำหนด symlink ที่จะถูกสร้างเมื่อรันคำสั่ง:
    | php artisan storage:link
    |
    | key = path ของลิงก์ที่จะสร้าง
    | value = path ของโฟลเดอร์ปลายทางจริง
    |
    */

    'links' => [
        // สร้างลิงก์: public/storage → storage/app/public
        // ทำให้ไฟล์ที่เก็บใน disk('public') เข้าได้ผ่าน URL /storage/...
        public_path('storage') => storage_path('app/public'),
    ],

];
