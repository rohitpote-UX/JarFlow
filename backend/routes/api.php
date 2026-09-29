<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\JarController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| JarFlow Water Jar Management REST API Routes
|--------------------------------------------------------------------------
*/

// Public / Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'JarFlow API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
    Route::get('customers/{customer}/ledger', [CustomerController::class, 'ledger']);
    Route::get('customers/{customer}/statement', [CustomerController::class, 'statementPdf']);

    // Transactions (Core speed entry)
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show']);

    // Payments
    Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show']);

    // Jars & Inventory
    Route::apiResource('jars', JarController::class);
    Route::post('jars/batch', [JarController::class, 'batchStore']);
    Route::get('jars/qr/{code}', [JarController::class, 'qrLookup']);

    // Reports & Dashboards
    Route::prefix('reports')->group(function () {
        Route::get('/dashboard', [ReportController::class, 'dashboardMetrics']);
        Route::get('/daily', [ReportController::class, 'dailySummary']);
        Route::get('/udhari', [ReportController::class, 'udhariSummary']);
        Route::get('/weekly-movement', [ReportController::class, 'weeklyJarMovement']);
        Route::get('/export/pdf', [ReportController::class, 'exportPdf']);
        Route::get('/export/excel', [ReportController::class, 'exportExcel']);
    });
});
