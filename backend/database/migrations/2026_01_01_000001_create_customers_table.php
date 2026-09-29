<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Customers table for water jar distribution business.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->index();
            $table->string('mobile', 15)->index();
            $table->string('area', 100)->index();
            $table->text('address')->nullable();
            $table->boolean('active')->default(true)->index();
            
            // Smart tracking balances
            $table->integer('current_jars')->default(0); // Jars currently in customer possession
            $table->decimal('pending_amount', 12, 2)->default(0.00); // Udhari balance
            $table->decimal('default_rate', 8, 2)->default(35.00); // Rate per 20L jar for this customer
            
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
