<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Payments collection table (tenant-scoped).
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete()->index();
            $table->foreignUuid('customer_id')->constrained('customers')->cascadeOnDelete()->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->date('payment_date')->index();
            $table->decimal('amount', 12, 2);
            $table->enum('payment_mode', ['CASH', 'UPI', 'BANK'])->default('CASH');
            $table->string('reference_no')->nullable();
            
            $table->decimal('previous_pending', 12, 2)->default(0.00);
            $table->decimal('remaining_balance', 12, 2)->default(0.00);
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
