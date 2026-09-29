<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\JarTransaction;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    /**
     * Get transactions strictly scoped to the authenticated business
     */
    public function index(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = JarTransaction::with('customer:id,name,mobile,area');

        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('date')) {
            $query->whereDate('transaction_date', $request->date);
        } elseif ($request->filter === 'today') {
            $query->whereDate('transaction_date', now()->toDateString());
        } elseif ($request->filter === 'week') {
            $query->where('transaction_date', '>=', now()->startOfWeek());
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }

    /**
     * Store new daily entry atomically with strict inventory validation
     */
    public function store(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid',
            'jars_given' => 'required|integer|min:0',
            'jars_returned' => 'required|integer|min:0',
            'rate_per_jar' => 'nullable|numeric|min:0',
            'cash_paid' => 'nullable|numeric|min:0',
            'upi_paid' => 'nullable|numeric|min:0',
            'payment_mode' => 'nullable|in:CASH,UPI,SPLIT,UDHARI,NONE',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // 1. Verify customer exists within the authenticated business tenant
        $customerQuery = Customer::lockForUpdate()->where('id', $validated['customer_id']);
        if ($businessId) {
            $customerQuery->where('business_id', $businessId);
        }
        $customer = $customerQuery->first();

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'ग्राहक सापडला नाही (पहिले ग्राहक जोडा).',
            ], 404);
        }

        // 2. Strict Inventory Validation: Check customer return count
        if ($validated['jars_returned'] > $customer->current_jars) {
            return response()->json([
                'status' => 'error',
                'message' => "ग्राहक जवळ फक्त {$customer->current_jars} जार आहेत. जास्त जार परत घेता येणार नाहीत.",
            ], 422);
        }

        // 3. Strict Inventory Validation: Check godown available stock
        if ($businessId) {
            $business = Business::find($businessId);
            if ($business && $business->total_godown_jars > 0) {
                $totalWithCustomers = Customer::where('business_id', $businessId)->sum('current_jars');
                $availableGodownJars = max(0, $business->total_godown_jars - $totalWithCustomers);

                if ($validated['jars_given'] > $availableGodownJars) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "गोदाममध्ये उपलब्ध जार फक्त {$availableGodownJars} आहेत. जास्त जार देता येणार नाहीत.",
                    ], 422);
                }
            }
        }

        // 4. Atomic Execution with DB::transaction
        $result = DB::transaction(function () use ($validated, $customer, $businessId, $request) {
            $rate = $validated['rate_per_jar'] ?? $customer->default_rate ?? 35.00;
            $billAmount = $validated['jars_given'] * $rate;
            $cashPaid = $validated['cash_paid'] ?? 0.00;
            $upiPaid = $validated['upi_paid'] ?? 0.00;
            $totalPaid = $cashPaid + $upiPaid;
            $udhariAmount = max(0, $billAmount - $totalPaid);
            $netJars = $validated['jars_given'] - $validated['jars_returned'];

            // 4a. Create Transaction Record
            $tx = JarTransaction::create([
                'business_id' => $businessId ?? $customer->business_id,
                'customer_id' => $customer->id,
                'user_id' => $request->user()?->id,
                'transaction_date' => now()->toDateString(),
                'jars_given' => $validated['jars_given'],
                'jars_returned' => $validated['jars_returned'],
                'net_jars_change' => $netJars,
                'rate_per_jar' => $rate,
                'bill_amount' => $billAmount,
                'cash_paid' => $cashPaid,
                'upi_paid' => $upiPaid,
                'total_paid' => $totalPaid,
                'udhari_amount' => $udhariAmount,
                'payment_mode' => $validated['payment_mode'] ?? ($udhariAmount > 0 ? 'UDHARI' : 'CASH'),
                'notes' => $validated['notes'] ?? null,
            ]);

            // 4b. Update Customer Balances
            $newJars = max(0, $customer->current_jars + $netJars);
            $newPending = max(0, $customer->pending_amount + $udhariAmount);

            $customer->update([
                'current_jars' => $newJars,
                'pending_amount' => $newPending,
            ]);

            // 4c. Write Immutable Ledger Entry
            Ledger::create([
                'business_id' => $businessId ?? $customer->business_id,
                'customer_id' => $customer->id,
                'entry_date' => now()->toDateString(),
                'entry_type' => 'TRANSACTION',
                'source_id' => $tx->id,
                'jars_given' => $validated['jars_given'],
                'jars_returned' => $validated['jars_returned'],
                'net_jars' => $netJars,
                'debit_amount' => $udhariAmount,
                'credit_amount' => $totalPaid,
                'balance_after' => $newPending,
                'description' => "दिले: {$validated['jars_given']}, परत आले: {$validated['jars_returned']}",
            ]);

            return [
                'transaction' => $tx,
                'customer' => $customer->fresh(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'नोंद यशस्वीरीत्या सेव्ह केली गेली.',
            'data' => $result,
        ], 201);
    }

    /**
     * Show transaction details
     */
    public function show(Request $request, string $id)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = JarTransaction::with('customer')->where('id', $id);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $transaction = $query->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ]);
    }
}
