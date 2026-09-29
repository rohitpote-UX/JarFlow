<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jar extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'serial_number',
        'qr_code',
        'status',
        'current_customer_id',
        'date_given',
        'date_returned',
        'notes',
    ];

    protected $casts = [
        'date_given' => 'datetime',
        'date_returned' => 'datetime',
    ];

    public function currentCustomer()
    {
        return $this->belongsTo(Customer::class, 'current_customer_id');
    }
}
