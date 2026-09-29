<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\JarTransaction;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    /**
     * Get transactions with filters (today, customer, date range)
     */
    public function index(Request $request)
    {
        $query = JarTransaction::with('customer:id,name,mobile,area');

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
     * Store new daily entry in < 1 second with atomic DB::transaction
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
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

        $transaction = DB::transaction(function () use ($validated, $request) {
            $customer = Customer::lockForUpdate()->findOrFail($validated['customer_id']);

            $rate = $validated['rate_per_jar'] ?? $customer->default_rate ?? 35.00;
            $billAmount = $validated['jars_given'] * $rate;
            $cashPaid = $validated['cash_paid'] ?? 0.00;
            $upiPaid = $validated['upi_paid'] ?? 0.00;
            $totalPaid = $cashPaid + $upiPaid;
            $udhariAmount = max(0, $billAmount - $totalPaid);
            $netJars = $validated['jars_given'] - $validated['jars_returned'];

            // 1. Create Transaction
            $tx = JarTransaction::create([
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

            // 2. Update Customer Balances
            $newJars = max(0, $customer->current_jars + $netJars);
            $newPending = max(0, $customer->pending_amount + $udhariAmount);

            $customer->update([
                'current_jars' => $newJars,
                'pending_amount' => $newPending,
            ]);

            // 3. Write Immutable Ledger Entry
            Ledger::create([
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
                'description' => "Given: {$validated['jars_given']}, Returned: {$validated['jars_returned']}",
            ]);

            return [
                'transaction' => $tx,
                'customer' => $customer->fresh(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Daily entry saved successfully in milliseconds.',
            'data' => $transaction,
        ], 201);
    }
}
