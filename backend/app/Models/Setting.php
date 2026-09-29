<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_name',
        'owner_name',
        'phone',
        'upi_id',
        'address',
        'default_jar_rate',
        'total_godown_jars',
        'low_stock_threshold',
        'default_language',
    ];

    protected $casts = [
        'default_jar_rate' => 'decimal:2',
        'total_godown_jars' => 'integer',
        'low_stock_threshold' => 'integer',
    ];
}
