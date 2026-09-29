<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ledger extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'customer_id',
        'entry_date',
        'entry_type',
        'source_id',
        'jars_given',
        'jars_returned',
        'net_jars',
        'debit_amount',
        'credit_amount',
        'balance_after',
        'description',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'jars_given' => 'integer',
        'jars_returned' => 'integer',
        'net_jars' => 'integer',
        'debit_amount' => 'decimal:2',
        'credit_amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
