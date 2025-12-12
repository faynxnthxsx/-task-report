<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login แล้วคืน token + user
     */
    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required"
        ]);

        $user = User::where("email", $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                "message" => "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            ], 401);
        }

        // สร้าง token ด้วย Sanctum
        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            "token" => $token,
            "user" => $user
        ]);
    }

    /**
     * คืนข้อมูลผู้ใช้ที่ login อยู่
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout – ลบ token ปัจจุบัน
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(["message" => "Logged out"]);
    }
}
