<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Production database starts completely clean with ZERO records.
     * Demo data is strictly opt-in and restricted to local development.
     */
    public function run(): void
    {
        // Production: DO NOT load demo data!
        if (App::environment('production')) {
            $this->command?->info('Production environment detected. Skipping demo seeds for clean multi-tenant start.');
            return;
        }

        // In local development, DemoSeeder can only be invoked explicitly
        // Example: php artisan db:seed --class=DemoSeeder
    }
}
