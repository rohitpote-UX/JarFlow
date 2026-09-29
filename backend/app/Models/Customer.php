<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'mobile',
        'area',
        'address',
        'active',
        'current_jars',
        'pending_amount',
        'default_rate',
        'notes',
    ];

    protected $casts = [
        'active' => 'boolean',
        'current_jars' => 'integer',
        'pending_amount' => 'decimal:2',
        'default_rate' => 'decimal:2',
    ];

    public function transactions()
    {
        return $this->hasMany(JarTransaction::class)->orderBy('transaction_date', 'desc');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class)->orderBy('payment_date', 'desc');
    }

    public function ledgers()
    {
        return $this->hasMany(Ledger::class)->orderBy('entry_date', 'desc');
    }

    public function jars()
    {
        return $this->hasMany(Jar::class, 'current_customer_id');
    }
}
