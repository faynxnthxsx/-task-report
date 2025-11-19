<?php

// import คลาส handler / processor ของ Monolog
// Monolog = ไลบรารีที่ Laravel ใช้เบื้องหลังระบบ logging
use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Log Channel
    |--------------------------------------------------------------------------
    |
    | กำหนด "ช่อง log" หลักที่ใช้โดยค่าเริ่มต้น
    | เวลาเราเรียก Log::info(), logger(), หรือเขียน log ทั่วไป
    | ชื่อ channel ต้องไปตรงกับ key ใน 'channels' ด้านล่าง
    |
    */

    // อ่านจาก .env: LOG_CHANNEL ถ้าไม่ตั้งไว้ ใช้ 'stack'
    'default' => env('LOG_CHANNEL', 'stack'),

    /*
    |--------------------------------------------------------------------------
    | Deprecations Log Channel
    |--------------------------------------------------------------------------
    |
    | กำหนดว่าจะให้ log "คำเตือนพวกของเก่า/deprecated" ไปที่ channel ไหน
    | เช่น ฟีเจอร์ PHP/Laravel ที่จะถูกเอาออกในอนาคต
    | จะได้เตรียม refactor โค้ดให้ทัน
    |
    */

    'deprecations' => [
        // channel ที่ใช้เก็บ log deprecation (ค่า default = 'null' = ทิ้งทิ้งไปเลย)
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),

        // ถ้า true = แนบ stack trace ใน log ด้วย (ดูละเอียดว่าเรียกจากไฟล์ไหนบรรทัดไหน)
        'trace' => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Channels
    |--------------------------------------------------------------------------
    |
    | ตรงนี้คือรายการ "ช่องทาง" ที่เราสามารถส่ง log ไปเขียนได้
    | แต่ละ channel มี driver / config ของตัวเอง
    |
    | Laravel ใช้ Monolog เบื้องหลัง จึงรองรับ driver หลายแบบ เช่น:
    |   "single", "daily", "slack", "syslog",
    |   "errorlog", "monolog", "custom", "stack"
    |
    */

    'channels' => [

        // ----------------- stack -----------------
        'stack' => [
            // driver 'stack' = รวมหลาย channel เข้าด้วยกัน
            // เวลา Log เข้าที่ 'stack' มันจะกระจายไปยังช่องอื่นใน 'channels' ด้วย
            'driver' => 'stack',

            // รายชื่อ channel ที่อยู่ใน stack แยกด้วย comma จาก ENV: LOG_STACK
            // ถ้าไม่ตั้งไว้ จะใช้ 'single' channel ตัวเดียว
            'channels' => explode(',', (string) env('LOG_STACK', 'single')),

            // ถ้า true = ถ้าเจอ exception ในช่องใดช่องหนึ่ง จะไม่โยนต่อ (มองข้าม)
            // ถ้า false = ถ้ามีช่องไหนพังจะโยน error ทิ้งออกมา
            'ignore_exceptions' => false,
        ],

        // ----------------- single -----------------
        'single' => [
            // driver 'single' = เขียน log ลงไฟล์เดียวตลอด
            'driver' => 'single',

            // path ของไฟล์ log หลัก
            // storage/logs/laravel.log
            'path' => storage_path('logs/laravel.log'),

            // level ต่ำสุดที่จะถูกเขียนลง log (debug, info, warning, error, critical, ...)
            'level' => env('LOG_LEVEL', 'debug'),

            // ให้ Monolog แทน placeholder ใน message ให้ (เช่น {id}, {user} ฯลฯ)
            'replace_placeholders' => true,
        ],

        // ----------------- daily -----------------
        'daily' => [
            // driver 'daily' = แยกไฟล์ log ตามวัน
            // เช่น laravel-2025-11-16.log ฯลฯ
            'driver' => 'daily',

            // path ตั้งต้นของไฟล์ log
            'path' => storage_path('logs/laravel.log'),

            // level ต่ำสุดที่จะเขียน
            'level' => env('LOG_LEVEL', 'debug'),

            // เก็บ log กี่วัน (default = 14 วัน)
            'days' => env('LOG_DAILY_DAYS', 14),

            'replace_placeholders' => true,
        ],

        // ----------------- slack -----------------
        'slack' => [
            // ส่ง log ไปที่ Slack channel ผ่าน webhook
            'driver' => 'slack',

            // URL ของ Slack webhook (ต้องตั้งใน .env: LOG_SLACK_WEBHOOK_URL)
            'url' => env('LOG_SLACK_WEBHOOK_URL'),

            // ชื่อ user ที่จะแสดงใน Slack
            'username' => env('LOG_SLACK_USERNAME', 'Laravel Log'),

            // emoji ที่จะแสดงใน Slack message
            'emoji' => env('LOG_SLACK_EMOJI', ':boom:'),

            // log เฉพาะระดับ critical ขึ้นไป (ค่า default นี้)
            'level' => env('LOG_LEVEL', 'critical'),

            'replace_placeholders' => true,
        ],

        // ----------------- papertrail -----------------
        'papertrail' => [
            // ใช้ driver 'monolog' แบบ custom handler
            'driver' => 'monolog',

            // level ต่ำสุดที่จะส่งไป
            'level' => env('LOG_LEVEL', 'debug'),

            // handler ที่ใช้ (ค่า default = SyslogUdpHandler)
            'handler' => env('LOG_PAPERTRAIL_HANDLER', SyslogUdpHandler::class),

            // config พิเศษสำหรับ handler เช่น host/port ของ Papertrail
            'handler_with' => [
                'host' => env('PAPERTRAIL_URL'),
                'port' => env('PAPERTRAIL_PORT'),
                // connection string ใช้ TLS
                'connectionString' => 'tls://'.env('PAPERTRAIL_URL').':'.env('PAPERTRAIL_PORT'),
            ],

            // processor ใช้จัด format message ตาม PSR-3
            'processors' => [PsrLogMessageProcessor::class],
        ],

        // ----------------- stderr -----------------
        'stderr' => [
            // ใช้ Monolog ตรง ๆ
            'driver' => 'monolog',

            'level' => env('LOG_LEVEL', 'debug'),

            // ใช้ StreamHandler เขียนไปที่ php://stderr
            'handler' => StreamHandler::class,

            'handler_with' => [
                // stream = standard error output (มักใช้ใน container / Docker)
                'stream' => 'php://stderr',
            ],

            // formatter = รูปแบบของข้อความ log (ถ้าตั้งใน ENV ไว้)
            'formatter' => env('LOG_STDERR_FORMATTER'),

            // processor สำหรับจัด format message
            'processors' => [PsrLogMessageProcessor::class],
        ],

        // ----------------- syslog -----------------
        'syslog' => [
            // เขียน log ไปที่ system logger ของ OS (syslog)
            'driver' => 'syslog',

            'level' => env('LOG_LEVEL', 'debug'),

            // facility = หมวดหมู่ของ syslog
            'facility' => env('LOG_SYSLOG_FACILITY', LOG_USER),

            'replace_placeholders' => true,
        ],

        // ----------------- errorlog -----------------
        'errorlog' => [
            // เขียนไปยัง "PHP error log" (ที่ตั้งใน php.ini)
            'driver' => 'errorlog',

            'level' => env('LOG_LEVEL', 'debug'),

            'replace_placeholders' => true,
        ],

        // ----------------- null -----------------
        'null' => [
            // ใช้ Monolog + NullHandler = ทิ้ง log ทั้งหมด (ไม่เก็บไหนเลย)
            'driver' => 'monolog',
            'handler' => NullHandler::class,
        ],

        // ----------------- emergency -----------------
        'emergency' => [
            // channel พิเศษใช้ในกรณีฉุกเฉินมาก ๆ ถ้า channel อื่นใช้ไม่ได้
            // เขียนลงไฟล์นี้โดยตรง
            'path' => storage_path('logs/laravel.log'),
        ],

    ],

];
