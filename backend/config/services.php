<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | ไฟล์นี้ไว้เก็บ "ข้อมูลเชื่อมต่อ" (credentials) ของบริการภายนอก
    | เช่น Mailgun, Postmark, AWS, Slack ฯลฯ
    |
    | ข้อดีคือ:
    | - รวมไว้ที่เดียว ดูง่าย
    | - โค้ดส่วนอื่น (หรือแพ็กเกจ) จะรู้ว่าถ้าจะใช้บริการอะไร
    |   ให้มาอ่านค่า config จากไฟล์นี้
    |
    */

    // ----------------- Postmark -----------------
    'postmark' => [
        // token ที่ใช้ auth กับบริการส่งเมล Postmark
        // เก็บใน .env: POSTMARK_TOKEN
        'token' => env('POSTMARK_TOKEN'),
    ],

    // ----------------- Resend -----------------
    'resend' => [
        // key ที่ใช้ auth กับ Resend (บริการส่งเมลอีกตัวหนึ่ง)
        // เก็บใน .env: RESEND_KEY
        'key' => env('RESEND_KEY'),
    ],

    // ----------------- Amazon SES -----------------
    'ses' => [
        // key / secret ของ AWS (ใช้ร่วมกับ SES)
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),

        // region ของ AWS ถ้าไม่ระบุใน .env จะใช้ us-east-1 เป็นค่า default
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // ----------------- Slack -----------------
    'slack' => [
        'notifications' => [
            // token ของ Slack bot (ใช้ส่ง notification)
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),

            // ชื่อช่อง (channel) ใน Slack ที่จะส่งข้อความไป
            // เช่น #alerts, #errors ฯลฯ
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
