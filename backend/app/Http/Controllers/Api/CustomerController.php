<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * List customers strictly scoped to authenticated business tenant
     */
    public function index(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Customer::query();

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('area', 'like', "%{$search}%");
            });
        }

        if ($request->has('filter')) {
            if ($request->filter === 'has_udhari') {
                $query->where('pending_amount', '>', 0);
            } elseif ($request->filter === 'has_jars') {
                $query->where('current_jars', '>', 0);
            }
        }

        $customers = $query->orderBy('name', 'asc')->paginate($request->per_page ?? 50);

        return response()->json([
            'status' => 'success',
            'data' => $customers,
        ]);
    }

    /**
     * Store new customer scoped to business
     */
    public function store(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:150',
            'mobile' => 'required|string|max:20',
            'area' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:300',
            'default_rate' => 'nullable|numeric|min:0',
            'current_jars' => 'nullable|integer|min:0',
            'pending_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $validated['business_id'] = $businessId;
        $validated['current_jars'] = $validated['current_jars'] ?? 0;
        $validated['pending_amount'] = $validated['pending_amount'] ?? 0;
        $validated['default_rate'] = $validated['default_rate'] ?? 35.00;

        $customer = Customer::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'ग्राहक यशस्वीरीत्या जोडला गेला.',
            'data' => $customer,
        ], 201);
    }

    /**
     * Show customer details
     */
    public function show(Request $request, string $id)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Customer::with(['transactions' => function ($q) {
            $q->latest()->limit(10);
        }, 'payments' => function ($q) {
            $q->latest()->limit(10);
        }])->where('id', $id);

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $customer = $query->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $customer,
        ]);
    }

    /**
     * Update customer details
     */
    public function update(Request $request, string $id)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Customer::where('id', $id);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }
        $customer = $query->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:150',
            'mobile' => 'sometimes|required|string|max:20',
            'area' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:300',
            'default_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customer->update($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'ग्राहक माहिती अपडेट केली गेली.',
            'data' => $customer,
        ]);
    }

    /**
     * Soft delete customer
     */
    public function destroy(Request $request, string $id)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Customer::where('id', $id);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }
        $customer = $query->firstOrFail();

        if ($customer->current_jars > 0 || $customer->pending_amount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => "या ग्राहकाकडे {$customer->current_jars} जार आणि ₹{$customer->pending_amount} उधारी बाकी आहे. आधी हिशोब पूर्ण करा.",
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'ग्राहक यशस्वीरीत्या काढला गेला.',
        ]);
    }

    /**
     * Get customer ledger statement
     */
    public function ledger(Request $request, string $id)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Ledger::where('customer_id', $id);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $ledgerEntries = $query->orderBy('entry_date', 'desc')
                               ->orderBy('created_at', 'desc')
                               ->paginate($request->per_page ?? 50);

        return response()->json([
            'status' => 'success',
            'data' => $ledgerEntries,
        ]);
    }
}
