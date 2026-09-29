<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new business owner with isolated business environment (Starts at 0 jars/customers!)
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'business_name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'area' => 'nullable|string|max:100',
            'initial_jars' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // 1. Create fresh isolated business entity (ZERO pre-populated data)
        $business = Business::create([
            'name' => $validated['business_name'],
            'owner_name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'area' => $validated['area'] ?? null,
            'default_jar_rate' => 35.00,
            'total_godown_jars' => $validated['initial_jars'] ?? 0, // Fresh start at 0
            'onboarding_completed' => isset($validated['initial_jars']),
        ]);

        // 2. Create owner user linked to this business
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'business_id' => $business->id,
            'role' => 'ADMIN',
        ]);

        // 3. Issue Sanctum token
        $token = $user->createToken('jarflow_api_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'तुमचा व्यवसाय यशस्वीरीत्या तयार झाला आहे!',
            'token' => $token,
            'user' => $user,
            'business' => $business,
        ], 201);
    }

    /**
     * Authenticate existing business owner
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::with('business')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'चुकीचा ईमेल किंवा पासवर्ड. कृपया पुन्हा तपासा.',
            ], 401);
        }

        $token = $user->createToken('jarflow_api_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'लॉगिन यशस्वी!',
            'token' => $token,
            'user' => $user,
            'business' => $user->business,
        ]);
    }

    /**
     * Get authenticated user profile with business details
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('business');

        return response()->json([
            'status' => 'success',
            'user' => $user,
            'business' => $user->business,
        ]);
    }

    /**
     * Revoke current token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'लॉगआउट यशस्वी झाले.',
        ]);
    }
}
