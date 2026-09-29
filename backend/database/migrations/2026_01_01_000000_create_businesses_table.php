<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Multi-tenant businesses table. Every business has isolated data.
     */
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->index();
            $table->string('owner_name')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('area', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('upi_id', 100)->nullable();
            
            // Core initial inventory settings (starts at 0!)
            $table->decimal('default_jar_rate', 8, 2)->default(35.00);
            $table->integer('total_godown_jars')->default(0); // STRICT REQUIREMENT: Starts at 0 for new business!
            $table->integer('low_stock_threshold')->default(20);
            $table->string('default_language', 5)->default('mr');
            $table->boolean('onboarding_completed')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
        });

        // Add business_id to users
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignUuid('business_id')->nullable()->constrained('businesses')->nullOnDelete();
                $table->string('role', 30)->default('ADMIN');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
