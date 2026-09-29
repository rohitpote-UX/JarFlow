<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Business settings & parameters.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('business_name')->default('PureFlow Waters');
            $table->string('owner_name')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('upi_id', 100)->nullable();
            $table->text('address')->nullable();
            
            $table->decimal('default_jar_rate', 8, 2)->default(35.00);
            $table->integer('total_godown_jars')->default(500);
            $table->integer('low_stock_threshold')->default(40);
            $table->string('default_language', 5)->default('mr');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
