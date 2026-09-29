<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\JarTransaction;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Dashboard KPI metrics dynamically calculated from live database records.
     * All values default to 0 for a new business with no records.
     */
    public function dashboardMetrics(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');
        $today = now()->toDateString();

        $business = $businessId ? Business::find($businessId) : null;
        $totalJars = $business ? (int) $business->total_godown_jars : 0;

        // Customer metrics
        $customerQuery = Customer::query();
        if ($businessId) {
            $customerQuery->where('business_id', $businessId);
        }
        $totalCustomers = (int) $customerQuery->count();
        $jarsWithCustomers = (int) $customerQuery->sum('current_jars');
        $totalPendingUdhari = (float) $customerQuery->sum('pending_amount');

        // Available godown stock
        $availableJars = max(0, $totalJars - $jarsWithCustomers);

        // Today's transaction metrics
        $txTodayQuery = JarTransaction::whereDate('transaction_date', $today);
        if ($businessId) {
            $txTodayQuery->where('business_id', $businessId);
        }
        $todayGiven = (int) (clone $txTodayQuery)->sum('jars_given');
        $todayReturned = (int) (clone $txTodayQuery)->sum('jars_returned');
        $todayUdhari = (float) (clone $txTodayQuery)->sum('udhari_amount');

        // Today's cash collection
        $cashPaymentsQuery = Payment::whereDate('payment_date', $today)->where('payment_mode', 'CASH');
        if ($businessId) {
            $cashPaymentsQuery->where('business_id', $businessId);
        }
        $todayCashFromPayments = (float) $cashPaymentsQuery->sum('amount');

        $todayCashFromTx = (float) (clone $txTodayQuery)->sum('cash_paid');
        $todayCashCollection = $todayCashFromPayments + $todayCashFromTx;

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_jars' => $totalJars,
                'available_godown_jars' => $availableJars,
                'jars_with_customers' => $jarsWithCustomers,
                'damaged_or_lost_jars' => 0,
                'total_customers' => $totalCustomers,
                'today_jars_given' => $todayGiven,
                'today_jars_returned' => $todayReturned,
                'today_cash_collection' => $todayCashCollection,
                'today_udhari' => $todayUdhari,
                'total_pending_udhari' => $totalPendingUdhari,
            ],
        ]);
    }

    /**
     * Daily summary breakdown
     */
    public function dailySummary(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');
        $date = $request->date ?? now()->toDateString();

        $txQuery = JarTransaction::with('customer:id,name,mobile')->whereDate('transaction_date', $date);
        if ($businessId) {
            $txQuery->where('business_id', $businessId);
        }
        $transactions = $txQuery->get();

        $paymentsQuery = Payment::with('customer:id,name,mobile')->whereDate('payment_date', $date);
        if ($businessId) {
            $paymentsQuery->where('business_id', $businessId);
        }
        $payments = $paymentsQuery->get();

        return response()->json([
            'status' => 'success',
            'date' => $date,
            'summary' => [
                'jars_given' => (int) $transactions->sum('jars_given'),
                'jars_returned' => (int) $transactions->sum('jars_returned'),
                'bill_amount' => (float) $transactions->sum('bill_amount'),
                'cash_collection' => (float) $transactions->sum('cash_paid') + (float) $payments->where('payment_mode', 'CASH')->sum('amount'),
                'upi_collection' => (float) $transactions->sum('upi_paid') + (float) $payments->where('payment_mode', 'UPI')->sum('amount'),
                'udhari_generated' => (float) $transactions->sum('udhari_amount'),
            ],
            'transactions' => $transactions,
            'payments' => $payments,
        ]);
    }

    /**
     * Udhari pending list
     */
    public function udhariSummary(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');

        $query = Customer::where('pending_amount', '>', 0);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $customers = $query->orderBy('pending_amount', 'desc')->get();
        $totalPending = (float) $customers->sum('pending_amount');

        return response()->json([
            'status' => 'success',
            'total_pending' => $totalPending,
            'total_customers' => $customers->count(),
            'customers' => $customers,
        ]);
    }

    /**
     * 7-day movement data for charts
     */
    public function weeklyJarMovement(Request $request)
    {
        $businessId = $request->user()?->business_id ?? $request->header('X-Business-Id');
        $startDate = now()->subDays(6)->toDateString();
        $endDate = now()->toDateString();

        $query = JarTransaction::whereBetween('transaction_date', [$startDate, $endDate]);
        if ($businessId) {
            $query->where('business_id', $businessId);
        }

        $dailyAggregates = $query->select(
            'transaction_date',
            DB::raw('SUM(jars_given) as given'),
            DB::raw('SUM(jars_returned) as returned'),
            DB::raw('SUM(cash_paid + upi_paid) as collected')
        )->groupBy('transaction_date')->orderBy('transaction_date', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $dailyAggregates,
        ]);
    }
}
