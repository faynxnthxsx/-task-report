<?php

// ใช้คลาส Str สำหรับช่วยจัดการสตริง (เช่น Str::slug())
use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | ตัวเลือกนี้กำหนดว่า "cache store" ตัวไหนจะถูกใช้เป็นค่าเริ่มต้น
    | เวลาเราเรียก cache() โดยไม่ระบุว่าจะใช้ store ไหน
    |
    */

    // อ่านค่าจาก ENV: CACHE_STORE ถ้าไม่ตั้งค่า ใช้ 'database' เป็น default
    // เช่น ถ้า CACHE_STORE=file ก็จะใช้ store 'file' ข้างล่างเป็นหลัก
    'default' => env('CACHE_STORE', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Cache Stores
    |--------------------------------------------------------------------------
    |
    | ส่วนนี้กำหนด cache "stores" ทั้งหมดที่แอปสามารถใช้ได้
    | แต่ละ store จะระบุ driver & การตั้งค่าของตัวเอง
    |
    | เราสามารถกำหนดหลาย store ที่ใช้ driver เดียวกันได้
    | เพื่อแยกประเภทข้อมูลคนละกลุ่ม เช่น cache สำหรับ session, cache สำหรับ query ฯลฯ
    |
    | Supported drivers: "array", "database", "file", "memcached",
    |                    "redis", "dynamodb", "octane",
    |                    "failover", "null"
    |
    */

    'stores' => [

        // store แบบ array: เก็บในหน่วยความจำ PHP ชั่วคราว
        // หายทันทีเมื่อจบ request → เหมาะกับการทดสอบมากกว่าใช้จริง
        'array' => [
            'driver' => 'array',
            'serialize' => false, // ไม่ serialize ค่า (เร็วขึ้นในบางกรณี)
        ],

        // store แบบ database: เก็บ cache ในตารางฐานข้อมูล
        'database' => [
            'driver' => 'database',

            // connection ของ DB ที่ใช้เก็บ cache (ถ้า null จะใช้ค่า default)
            'connection' => env('DB_CACHE_CONNECTION'),

            // ชื่อตารางที่ใช้เก็บ cache ค่า default = 'cache'
            'table' => env('DB_CACHE_TABLE', 'cache'),

            // การตั้งค่า lock (ล็อคกันแข่งกันเขียน) ผ่าน DB connection/table แยกต่างหาก
            'lock_connection' => env('DB_CACHE_LOCK_CONNECTION'),
            'lock_table' => env('DB_CACHE_LOCK_TABLE'),
        ],

        // store แบบ file: เก็บ cache เป็นไฟล์ใน storage/
        'file' => [
            'driver' => 'file',

            // โฟลเดอร์เก็บไฟล์ cache
            'path' => storage_path('framework/cache/data'),

            // โฟลเดอร์เก็บไฟล์สำหรับ lock (ใช้ที่เดียวกัน)
            'lock_path' => storage_path('framework/cache/data'),
        ],

        // store แบบ memcached: ใช้ memcached server (ต้องติดตั้งแยก)
        'memcached' => [
            'driver' => 'memcached',

            // สำหรับทำ persistent connection
            'persistent_id' => env('MEMCACHED_PERSISTENT_ID'),

            // ข้อมูล auth เข้า memcached (ถ้ามี)
            'sasl' => [
                env('MEMCACHED_USERNAME'),
                env('MEMCACHED_PASSWORD'),
            ],

            // options เสริม (คอมเมนต์ไว้เป็นตัวอย่าง)
            'options' => [
                // Memcached::OPT_CONNECT_TIMEOUT => 2000,
            ],

            // รายการเซิร์ฟเวอร์ memcached ที่จะเชื่อมต่อไปหา
            'servers' => [
                [
                    'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                    'port' => env('MEMCACHED_PORT', 11211),
                    'weight' => 100,
                ],
            ],
        ],

        // store แบบ redis: ใช้ Redis server ในการเก็บ cache
        'redis' => [
            'driver' => 'redis',

            // connection ของ redis ที่ใช้สำหรับ cache (ดูใน config/database.php)
            'connection' => env('REDIS_CACHE_CONNECTION', 'cache'),

            // connection ที่ใช้สำหรับระบบ lock
            'lock_connection' => env('REDIS_CACHE_LOCK_CONNECTION', 'default'),
        ],

        // store แบบ dynamodb: ใช้ AWS DynamoDB เป็น cache backend
        'dynamodb' => [
            'driver' => 'dynamodb',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'table' => env('DYNAMODB_CACHE_TABLE', 'cache'),
            'endpoint' => env('DYNAMODB_ENDPOINT'),
        ],

        // store แบบ octane: ใช้ร่วมกับ Laravel Octane เพื่อ optimize performance
        'octane' => [
            'driver' => 'octane',
        ],

        // store แบบ failover: ถ้า store แรกมีปัญหา จะ fallback ไป store ถัดไป
        'failover' => [
            'driver' => 'failover',

            // ลำดับ store ที่จะใช้: พยายามใช้ 'database' ก่อน ถ้าพังค่อยใช้ 'array'
            'stores' => [
                'database',
                'array',
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefix
    |--------------------------------------------------------------------------
    |
    | เวลาใช้ cache แบบ shared (เช่น Redis, Memcached, DynamoDB)
    | อาจมีหลายแอปใช้เซิร์ฟเวอร์เดียวกันได้
    | เลยต้องมี prefix กันชื่อ key ชนกัน
    |
    */

    // prefix ที่จะถูกเติมหน้าทุก cache key
    // ถ้าใน ENV มี CACHE_PREFIX ให้ใช้ตามนั้น
    // ถ้าไม่มี: ใช้ APP_NAME จาก .env → แปลงเป็น slug → ต่อท้าย '-cache-'
    // อย่างเช่น APP_NAME="Task Report Backend"
    // จะได้ prefix ประมาณ "task-report-backend-cache-"
    'prefix' => env(
        'CACHE_PREFIX',
        Str::slug((string) env('APP_NAME', 'laravel')).'-cache-'
    ),

];
