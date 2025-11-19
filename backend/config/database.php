<?php

// ใช้คลาส Str เพื่อช่วยสร้าง prefix ของ Redis ด้านล่าง
use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | กำหนด "connection หลัก" ที่ Laravel จะใช้เวลา query ฐานข้อมูล
    | ถ้าเราไม่ระบุ connection เอง เช่น Model ส่วนใหญ่จะใช้ค่า default นี้
    |
    */

    // อ่านค่าจาก .env: DB_CONNECTION (เช่น sqlite, mysql, mariadb ฯลฯ)
    // ถ้าไม่ตั้งไว้ให้ใช้ 'sqlite' เป็นค่าเริ่มต้น
    'default' => env('DB_CONNECTION', 'sqlite'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | นิยาม connection ฐานข้อมูลทุกตัวที่แอปเรารู้จัก
    | จะเลือกใช้ตัวไหนก็ได้ตาม project (เช่น dev ใช้ sqlite, server ใช้ mysql)
    |
    | ด้านล่างมีตัวอย่าง config ของ:
    | - sqlite
    | - mysql
    | - mariadb
    | - pgsql (PostgreSQL)
    | - sqlsrv (SQL Server)
    |
    */

    'connections' => [

        // --------------------- SQLITE ---------------------
        'sqlite' => [
            'driver' => 'sqlite',                  // ใช้ driver sqlite
            'url' => env('DB_URL'),               // ใช้ URL ถ้ามีตั้งไว้ (มักไม่ใช้)
            // ไฟล์ฐานข้อมูล sqlite (ค่า default = database/database.sqlite)
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',                       // คำนำหน้าตาราง (ปกติไม่ใส่)
            // บังคับใช้ foreign key constraints (ON/OFF)
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            // ตัวเลือกเฉพาะ sqlite (ปล่อย null แปลว่าใช้ค่า default)
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
            // mode ของ transaction (DEFERRED / IMMEDIATE / EXCLUSIVE)
            'transaction_mode' => 'DEFERRED',
        ],

        // --------------------- MYSQL ---------------------
        'mysql' => [
            'driver' => 'mysql',                   // ใช้ driver mysql (ผ่าน PDO)
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'), // ที่อยู่ DB (ปกติ localhost)
            'port' => env('DB_PORT', '3306'),      // พอร์ต MySQL standard = 3306
            'database' => env('DB_DATABASE', 'laravel'), // ชื่อฐานข้อมูล
            'username' => env('DB_USERNAME', 'root'),    // ชื่อผู้ใช้ DB
            'password' => env('DB_PASSWORD', ''),        // รหัสผ่าน DB
            'unix_socket' => env('DB_SOCKET', ''),       // ใช้ socket (ส่วนใหญ่ปล่อยว่าง)

            // charset/collation สำหรับอ่านเขียนข้อมูล (utf8mb4 รองรับ emoji)
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),

            'prefix' => '',                        // คำนำหน้าตาราง (ถ้าอยากแยกหลายแอป)
            'prefix_indexes' => true,              // ให้ใช้ prefix กับชื่อ index ด้วย

            'strict' => true,                      // strict mode ช่วยจับ error จาก query แปลก ๆ
            'engine' => null,                      // กำหนด engine เช่น InnoDB (ปล่อย null ใช้ default)

            // options พิเศษของ PDO สำหรับ mysql
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                // ใส่ค่า SSL_CA ถ้ามี (เพื่อใช้ SSL กับ MySQL)
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // --------------------- MARIADB ---------------------
        'mariadb' => [
            'driver' => 'mariadb',                 // ใช้ driver mariadb (คล้าย mysql)
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // --------------------- POSTGRESQL (pgsql) ---------------------
        'pgsql' => [
            'driver' => 'pgsql',                   // ใช้ driver pgsql
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),      // พอร์ต PostgreSQL default = 5432
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',             // schema ที่ใช้ (public เป็นค่าเริ่มต้น)
            'sslmode' => 'prefer',                 // โหมด SSL (ควรใช้ใน production)
        ],

        // --------------------- SQL SERVER (sqlsrv) ---------------------
        'sqlsrv' => [
            'driver' => 'sqlsrv',                  // ใช้ driver sqlsrv (ของ Microsoft)
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '1433'),      // พอร์ต SQL Server default = 1433
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            // สามารถเปิดการเข้ารหัส / trust cert ได้ถ้าต้องการ
            // 'encrypt' => env('DB_ENCRYPT', 'yes'),
            // 'trust_server_certificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'false'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | ตั้งค่าเกี่ยวกับ "ตาราง migrations" ที่เก็บประวัติว่า migration ไหนรันแล้ว
    | เวลาเรารัน php artisan migrate ระบบจะเช็คจากตารางนี้ว่าต้องรันไฟล์ไหนอีก
    |
    */

    'migrations' => [
        // ชื่อตารางเก็บ log ของ migration (ปกติใช้ 'migrations' ตามค่า default)
        'table' => 'migrations',

        // ถ้าเป็น true เวลา publish migration ใหม่ (เช่นจากแพ็กเกจ)
        // Laravel จะอัปเดตวันที่ในชื่อไฟล์ migration ให้เป็นปัจจุบัน
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | ตั้งค่า Redis (ฐานข้อมูล key-value เร็วมาก ใช้แทน cache/session บางกรณี)
    | ถ้าโปรเจกต์ยังไม่ได้ใช้ Redis ก็ถือว่าส่วนนี้ยังไม่ถูกใช้งานจริง
    |
    */

    'redis' => [

        // client ที่ใช้เชื่อมต่อ redis: 'phpredis' หรือ 'predis'
        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            // โหมด cluster: 'redis' = ใช้ clustering ของ redis เอง
            'cluster' => env('REDIS_CLUSTER', 'redis'),

            // prefix ที่จะเติมหน้าทุก key ใน redis (กันชื่อชนกันกับแอปอื่น)
            'prefix' => env(
                'REDIS_PREFIX',
                Str::slug((string) env('APP_NAME', 'laravel')).'-database-'
            ),

            // persistent connection หรือไม่
            'persistent' => env('REDIS_PERSISTENT', false),
        ],

        // connection ชื่อ 'default' (มักใช้สำหรับ database / queue)
        'default' => [
            'url' => env('REDIS_URL'),                 // อาจตั้งเป็น URL รวมข้อมูลได้
            'host' => env('REDIS_HOST', '127.0.0.1'),  // ที่อยู่ redis server
            'username' => env('REDIS_USERNAME'),       // ถ้ามี auth เป็น user/pass
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),       // พอร์ต redis default = 6379
            'database' => env('REDIS_DB', '0'),        // เลข index database (0-15)
            'max_retries' => env('REDIS_MAX_RETRIES', 3),           // ลองใหม่กี่ครั้งถ้าพลาด
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),       // หน่วย ms
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

        // connection ชื่อ 'cache' (มักใช้กับระบบ cache แยกจาก default)
        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),   // ใช้ DB index 1 แยกกับ default (0)
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

    ],

];
