<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskStoreRequest extends FormRequest
{
    /**
     * ตอนนี้ให้ทุกคนยิงได้ก่อน (ถ้ามี Auth ค่อยมาเปลี่ยนทีหลัง)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * กฎ validate ตอน "สร้าง" Task ใหม่
     */
    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'deadline'    => ['nullable', 'date'],
            'priority'    => ['nullable', 'string', 'in:low,normal,high'],
        ];
    }
}
