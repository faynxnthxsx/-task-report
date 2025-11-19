<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Mailer
    |--------------------------------------------------------------------------
    |
    | กำหนดว่าให้ใช้ mailer ตัวไหนเป็น "ค่าเริ่มต้น"
    | เวลาเราเรียกส่งอีเมลโดยไม่ระบุ mailer เอง
    |
    */

    // อ่านจาก .env: MAIL_MAILER
    // ถ้าไม่ตั้ง ใช้ 'log' = เขียนเนื้อหาเมลลง log แทนการส่งจริง (ดีสำหรับ dev)
    'default' => env('MAIL_MAILER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Mailer Configurations
    |--------------------------------------------------------------------------
    |
    | กำหนด mailer ต่าง ๆ ที่แอปเราจะใช้ได้
    | แต่ละ mailer มี transport (วิธีส่ง) และ config ของตัวเอง
    |
    | ตัวอย่าง transport ที่รองรับ:
    |   "smtp", "sendmail", "mailgun", "ses", "ses-v2",
    |   "postmark", "resend", "log", "array",
    |   "failover", "roundrobin"
    |
    */

    'mailers' => [

        // ---------- SMTP ----------
        // ใช้ส่งอีเมลผ่าน SMTP server (Gmail SMTP, Mailtrap, ฯลฯ)
        'smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'), // เช่น tls / ssl ถ้าบริการกำหนด
            'url' => env('MAIL_URL'),       // บางบริการอาจให้เป็น URL เดียว
            'host' => env('MAIL_HOST', '127.0.0.1'),  // โฮสต์ SMTP server
            'port' => env('MAIL_PORT', 2525),         // พอร์ต SMTP (เช่น 587, 465, 2525)
            'username' => env('MAIL_USERNAME'),       // user สำหรับ auth SMTP
            'password' => env('MAIL_PASSWORD'),       // password สำหรับ auth SMTP
            'timeout' => null,                        // timeout (วินาที) ถ้า null ใช้ default
            // ชื่อโดเมนที่ใช้ในคำสั่ง EHLO/HELO (ถ้าไม่ตั้ง ใช้ host จาก APP_URL)
            'local_domain' => env(
                'MAIL_EHLO_DOMAIN',
                parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)
            ),
        ],

        // ---------- Amazon SES ----------
        'ses' => [
            'transport' => 'ses',
        ],

        // ---------- Postmark ----------
        'postmark' => [
            'transport' => 'postmark',
            // ตัวอย่าง option เพิ่มเติม ที่คอมเมนต์ไว้
            // 'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
            // 'client' => [
            //     'timeout' => 5,
            // ],
        ],

        // ---------- Resend ----------
        'resend' => [
            'transport' => 'resend',
        ],

        // ---------- sendmail (บน Linux server) ----------
        'sendmail' => [
            'transport' => 'sendmail',
            // path ของคำสั่ง sendmail บนระบบ (ใช้ default ถ้ายังไม่รู้)
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ],

        // ---------- log ----------
        // ไม่ส่งเมลจริง แต่เขียนเนื้อหาเมลลง log (ใช้ debug)
        'log' => [
            'transport' => 'log',
            // ระบุ log channel ถ้ามี (ถ้าไม่ตั้ง จะใช้ default logging channel)
            'channel' => env('MAIL_LOG_CHANNEL'),
        ],

        // ---------- array ----------
        // เก็บเมลที่ส่งไว้ใน array ใน memory ใช้สำหรับการทดสอบ (PHPUnit, ฯลฯ)
        'array' => [
            'transport' => 'array',
        ],

        // ---------- failover ----------
        // พยายามส่งผ่าน smtp ก่อน ถ้าล้มเหลว fallback ไป log
        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'smtp',
                'log',
            ],
            // รอ 60 วินาทีก่อนจะลองส่งซ้ำ (กรณีทำงานเบื้องหลัง)
            'retry_after' => 60,
        ],

        // ---------- roundrobin ----------
        // สลับใช้งาน mailers หลายตัววนไป (เช่น ses กับ postmark)
        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
            'retry_after' => 60,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Global "From" Address
    |--------------------------------------------------------------------------
    |
    | ตั้งค่า From: ทั่วทั้งระบบ
    | ถ้าเราไม่กำหนดจาก Mailable เอง จะใช้ค่าจากตรงนี้
    |
    */

    'from' => [
        // อีเมลผู้ส่ง เช่น no-reply@myapp.com
        'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),

        // ชื่อผู้ส่ง เช่น "Task Report System"
        'name' => env('MAIL_FROM_NAME', 'Example'),
    ],

];
