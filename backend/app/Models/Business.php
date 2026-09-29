<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Business extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'owner_name',
        'phone',
        'area',
        'address',
        'upi_id',
        'default_jar_rate',
        'total_godown_jars',
        'low_stock_threshold',
        'default_language',
        'onboarding_completed',
    ];

    protected $casts = [
        'default_jar_rate' => 'decimal:2',
        'total_godown_jars' => 'integer',
        'low_stock_threshold' => 'integer',
        'onboarding_completed' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function jars()
    {
        return $this->hasMany(Jar::class);
    }

    public function transactions()
    {
        return $this->hasMany(JarTransaction::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function ledgers()
    {
        return $this->hasMany(Ledger::class);
    }
}
