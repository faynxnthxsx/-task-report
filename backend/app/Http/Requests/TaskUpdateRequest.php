<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * กฎ validate ตอน "แก้ไข" Task
     * ใช้ sometimes = ส่งมาก็ค่อยเช็ก ไม่ได้ส่งมาก็ไม่บังคับ
     */
    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'deadline'    => ['sometimes', 'nullable', 'date'],
            'priority'    => ['sometimes', 'nullable', 'string', 'in:low,normal,high'],
        ];
    }
}
