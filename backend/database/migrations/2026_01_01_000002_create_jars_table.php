<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Individual Jar inventory & QR tracking table (tenant-scoped).
     */
    public function up(): void
    {
        Schema::create('jars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->constrained('businesses')->cascadeOnDelete()->index();
            $table->string('serial_number', 50)->index();
            $table->string('qr_code', 100)->nullable()->index();
            $table->enum('status', ['available', 'with_customer', 'damaged', 'lost'])->default('available')->index();
            
            // Current assignment
            $table->foreignUuid('current_customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->timestamp('date_given')->nullable();
            $table->timestamp('date_returned')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'serial_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jars');
    }
};
