<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Core daily transactions table (tenant-scoped).
     */
    public function up(): void
    {
        Schema::create('jar_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete()->index();
            $table->foreignUuid('customer_id')->constrained('customers')->cascadeOnDelete()->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->date('transaction_date')->index();
            
            // Jar movements
            $table->integer('jars_given')->default(0);
            $table->integer('jars_returned')->default(0);
            $table->integer('net_jars_change')->default(0); // jars_given - jars_returned
            
            // Financials
            $table->decimal('rate_per_jar', 8, 2)->default(35.00);
            $table->decimal('bill_amount', 12, 2)->default(0.00);
            $table->decimal('cash_paid', 12, 2)->default(0.00);
            $table->decimal('upi_paid', 12, 2)->default(0.00);
            $table->decimal('total_paid', 12, 2)->default(0.00);
            $table->decimal('udhari_amount', 12, 2)->default(0.00);
            
            $table->enum('payment_mode', ['CASH', 'UPI', 'SPLIT', 'UDHARI', 'NONE'])->default('CASH');
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jar_transactions');
    }
};
