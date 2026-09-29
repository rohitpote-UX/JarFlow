<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Immutable Ledger history for audit trails (tenant-scoped).
     */
    public function up(): void
    {
        Schema::create('ledgers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete()->index();
            $table->foreignUuid('customer_id')->constrained('customers')->cascadeOnDelete()->index();
            $table->date('entry_date')->index();
            $table->enum('entry_type', ['TRANSACTION', 'PAYMENT'])->index();
            $table->uuid('source_id')->nullable();
            
            $table->integer('jars_given')->default(0);
            $table->integer('jars_returned')->default(0);
            $table->integer('net_jars')->default(0);
            
            $table->decimal('debit_amount', 12, 2)->default(0.00);
            $table->decimal('credit_amount', 12, 2)->default(0.00);
            $table->decimal('balance_after', 12, 2)->default(0.00);
            
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledgers');
    }
};
