<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JarTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_id',
        'customer_id',
        'user_id',
        'transaction_date',
        'jars_given',
        'jars_returned',
        'net_jars_change',
        'rate_per_jar',
        'bill_amount',
        'cash_paid',
        'upi_paid',
        'total_paid',
        'udhari_amount',
        'payment_mode',
        'reference_no',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'jars_given' => 'integer',
        'jars_returned' => 'integer',
        'net_jars_change' => 'integer',
        'rate_per_jar' => 'decimal:2',
        'bill_amount' => 'decimal:2',
        'cash_paid' => 'decimal:2',
        'upi_paid' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'udhari_amount' => 'decimal:2',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
