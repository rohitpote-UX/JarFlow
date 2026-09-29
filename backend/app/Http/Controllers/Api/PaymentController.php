<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Ledger;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('customer:id,name,mobile,area');

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate($request->per_page ?? 25);

        return response()->json([
            'status' => 'success',
            'data' => $payments,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
            'amount' => 'required|numeric|min:1',
            'payment_mode' => 'required|in:CASH,UPI,BANK',
            'reference_no' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $result = DB::transaction(function () use ($validated, $request) {
            $customer = Customer::lockForUpdate()->findOrFail($validated['customer_id']);

            $previousPending = $customer->pending_amount;
            $remaining = max(0, $previousPending - $validated['amount']);

            // 1. Record Payment
            $payment = Payment::create([
                'customer_id' => $customer->id,
                'user_id' => $request->user()?->id,
                'payment_date' => now()->toDateString(),
                'amount' => $validated['amount'],
                'payment_mode' => $validated['payment_mode'],
                'reference_no' => $validated['reference_no'] ?? null,
                'previous_pending' => $previousPending,
                'remaining_balance' => $remaining,
                'notes' => $validated['notes'] ?? null,
            ]);

            // 2. Reduce Customer Pending Amount
            $customer->update(['pending_amount' => $remaining]);

            // 3. Record in Ledger
            Ledger::create([
                'customer_id' => $customer->id,
                'entry_date' => now()->toDateString(),
                'entry_type' => 'PAYMENT',
                'source_id' => $payment->id,
                'jars_given' => 0,
                'jars_returned' => 0,
                'net_jars' => 0,
                'debit_amount' => 0.00,
                'credit_amount' => $validated['amount'],
                'balance_after' => $remaining,
                'description' => "Payment via {$validated['payment_mode']}",
            ]);

            return [
                'payment' => $payment,
                'customer' => $customer->fresh(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Payment recorded successfully.',
            'data' => $result,
        ], 201);
    }
}
