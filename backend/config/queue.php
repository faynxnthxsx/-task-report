<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | ตั้งค่า "queue connection" หลักที่ Laravel จะใช้
    | เวลาเรา dispatch job โดยไม่ระบุ connection เอง
    | เช่น dispatch(new SendEmailJob());
    |
    */

    // อ่านจาก .env: QUEUE_CONNECTION (เช่น sync, database, redis)
    // ถ้าไม่ตั้งค่า → ใช้ 'database' เป็นค่าเริ่มต้น
    'default' => env('QUEUE_CONNECTION', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    |
    | กำหนด connection สำหรับ queue backend แต่ละแบบ
    | แต่ละตัวมี driver และ option ของตัวเอง เช่น database, redis, sqs
    |
    | Drivers ที่รองรับ: "sync", "database", "beanstalkd", "sqs", "redis",
    |                     "deferred", "failover", "null"
    |
    */

    'connections' => [

        // ---------- sync ----------
        // ทำงาน job "ทันที" ใน request เดียว (ไม่เข้าคิวจริงๆ)
        // เหมาะกับ dev / เวลาไม่อยากตั้งคิวจริง
        'sync' => [
            'driver' => 'sync',
        ],

        // ---------- database ----------
        // เก็บงานคิวในตารางฐานข้อมูล
        'database' => [
            'driver' => 'database',

            // ใช้ connection DB ตัวไหน (ปล่อยว่าง = ใช้ default DB)
            'connection' => env('DB_QUEUE_CONNECTION'),

            // ชื่อตารางที่เก็บ job (default = jobs)
            'table' => env('DB_QUEUE_TABLE', 'jobs'),

            // ชื่อ queue (เผื่อแยกคิวหลายประเภท เช่น default, emails ฯลฯ)
            'queue' => env('DB_QUEUE', 'default'),

            // เวลากี่วินาทีที่ job ถือว่าติดค้างแล้วให้ปล่อยให้ worker ตัวอื่นดึงไปทำ
            'retry_after' => (int) env('DB_QUEUE_RETRY_AFTER', 90),

            // after_commit = false แปลว่า job จะ dispatch ทันที
            // ถ้า true = รอให้ transaction DB commit ก่อนค่อยส่งเข้า queue
            'after_commit' => false,
        ],

        // ---------- beanstalkd ----------
        'beanstalkd' => [
            'driver' => 'beanstalkd',
            'host' => env('BEANSTALKD_QUEUE_HOST', 'localhost'),
            'queue' => env('BEANSTALKD_QUEUE', 'default'),
            'retry_after' => (int) env('BEANSTALKD_QUEUE_RETRY_AFTER', 90),
            'block_for' => 0,       // รอ block นานเท่าไหร่ตอนดึงงาน (0 = ไม่ block)
            'after_commit' => false,
        ],

        // ---------- Amazon SQS ----------
        'sqs' => [
            'driver' => 'sqs',

            // key/secret AWS
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),

            // prefix URL ของ SQS queue
            'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),

            // ชื่อ queue ใน SQS
            'queue' => env('SQS_QUEUE', 'default'),

            // suffix เพิ่มท้ายชื่อ (ถ้าต้องการ)
            'suffix' => env('SQS_SUFFIX'),

            // region ของ AWS
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),

            'after_commit' => false,
        ],

        // ---------- Redis ----------
        'redis' => [
            'driver' => 'redis',

            // ใช้ redis connection ชื่ออะไร (ไปดูใน config/database.php)
            'connection' => env('REDIS_QUEUE_CONNECTION', 'default'),

            // ชื่อ queue
            'queue' => env('REDIS_QUEUE', 'default'),

            // วินาทีที่ retry หลังจากถือว่าทำงานนานผิดปกติ
            'retry_after' => (int) env('REDIS_QUEUE_RETRY_AFTER', 90),

            // block นานเท่าไหร่ตอนรอดึงงาน (null = ใช้ default)
            'block_for' => null,

            'after_commit' => false,
        ],

        // ---------- deferred ----------
        // โหมดพิเศษ (เลื่อนการทำงานไปทีหลังตามกลไกภายใน)
        'deferred' => [
            'driver' => 'deferred',
        ],

        // ---------- failover ----------
        // ถ้า connection แรกพัง → fallback ไปอีกตัว
        'failover' => [
            'driver' => 'failover',

            // เรียงลำดับ connection ที่จะลองใช้
            // พยายามใช้ 'database' ก่อน ถ้าพังค่อยใช้ 'deferred'
            'connections' => [
                'database',
                'deferred',
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    |
    | กำหนด DB และตารางสำหรับเก็บข้อมูล "batch" ของ job
    | ใช้ตอนเราส่งงานทีละหลาย job แล้ว track รวมกันเป็น batch เดียว
    |
    */

    'batching' => [
        // connection ฐานข้อมูลที่ใช้เก็บข้อมูล batch
        'database' => env('DB_CONNECTION', 'sqlite'),

        // ชื่อตารางเก็บ batch (ต้องมี migration สร้าง table นี้)
        'table' => 'job_batches',
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    |
    | ตั้งค่าการเก็บ "job ที่ล้มเหลว" (failed jobs)
    | มีหลาย driver เช่น 'database-uuids', 'dynamodb', 'file', 'null'
    |
    */

    'failed' => [
        // วิธีเก็บ failed jobs (ค่า default = database-uuids)
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),

        // ใช้ DB connection ไหนเก็บข้อมูล failed jobs
        'database' => env('DB_CONNECTION', 'sqlite'),

        // ชื่อตารางเก็บข้อมูล failed jobs (ปกติใช้ 'failed_jobs')
        'table' => 'failed_jobs',
    ],

];
