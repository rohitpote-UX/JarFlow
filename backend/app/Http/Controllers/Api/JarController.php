<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\Jar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class JarController extends Controller
{
    /**
     * Get jar inventory summary and list scoped to tenant business
     */
    public function index(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $business = $businessId ? Business::find($businessId) : null;
        $totalGodownFleet = $business ? $business->total_godown_jars : 0;

        // Count jars held by customers
        $customerJarsQuery = Customer::query();
        if ($businessId) {
            $customerJarsQuery->where('business_id', $businessId);
        }
        $withCustomers = (int) $customerJarsQuery->sum('current_jars');

        // Damaged / Lost jars count
        $jarsQuery = Jar::query();
        if ($businessId) {
            $jarsQuery->where('business_id', $businessId);
        }
        $damagedCount = (clone $jarsQuery)->where('status', 'DAMAGED')->count();
        $lostCount = (clone $jarsQuery)->where('status', 'LOST')->count();

        // Total tracked fleet
        $totalJars = $totalGodownFleet > 0 ? $totalGodownFleet : ($withCustomers + $damagedCount + $lostCount);
        $availableGodown = max(0, $totalJars - $withCustomers - $damagedCount - $lostCount);

        $jarsList = $jarsQuery->with('currentCustomer:id,name,mobile')
                              ->orderBy('serial_number', 'asc')
                              ->paginate($request->per_page ?? 50);

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_jars' => $totalJars,
                'available_godown' => $availableGodown,
                'with_customers' => $withCustomers,
                'damaged_or_lost' => $damagedCount + $lostCount,
            ],
            'data' => $jarsList,
        ]);
    }

    /**
     * Initialize or update total jar quantity for the business
     */
    public function batchStore(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $validator = Validator::make($request->all(), [
            'total_quantity' => 'required|integer|min:0|max:10000',
            'create_individual_serials' => 'nullable|boolean',
            'prefix' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $qty = $validated['total_quantity'];

        if ($businessId) {
            $business = Business::find($businessId);
            if ($business) {
                $business->update([
                    'total_godown_jars' => $qty,
                    'onboarding_completed' => true,
                ]);
            }
        }

        // If user requests individual serial IDs
        if (!empty($validated['create_individual_serials']) && $qty > 0) {
            $prefix = $validated['prefix'] ?? 'JAR-';
            DB::transaction(function () use ($qty, $prefix, $businessId) {
                // Delete existing unassigned jars before batch generation if re-initializing
                Jar::where('business_id', $businessId)->whereNull('current_customer_id')->delete();

                $inserts = [];
                for ($i = 1; $i <= $qty; $i++) {
                    $serial = $prefix . str_pad($i, 4, '0', STR_PAD_LEFT);
                    $inserts[] = [
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'business_id' => $businessId,
                        'serial_number' => $serial,
                        'qr_code' => $serial,
                        'status' => 'GODOWN',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                foreach (array_chunk($inserts, 250) as $chunk) {
                    Jar::insert($chunk);
                }
            });
        }

        return response()->json([
            'status' => 'success',
            'message' => "जार इन्व्हेंटरी यशस्वीरीत्या सेव्ह केली गेली ({$qty} जार).",
            'total_jars' => $qty,
        ]);
    }

    /**
     * Lookup individual Jar by QR code or serial
     */
    public function qrLookup(Request $request, string $code)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Jar::with('currentCustomer:id,name,mobile,area')
                    ->where(function ($q) use ($code) {
                        $q->where('qr_code', $code)
                          ->orWhere('serial_number', $code);
                    });

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $jar = $query->first();

        if (!$jar) {
            return response()->json([
                'status' => 'error',
                'message' => 'या बारकोड/सिरियलचा जार सापडला नाही.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $jar,
        ]);
    }
}
