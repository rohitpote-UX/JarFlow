<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run development demo seeder only when explicitly called in non-production environments.
     * NEVER runs automatically in production.
     */
    public function run(): void
    {
        if (App::environment('production')) {
            $this->command?->error('CRITICAL: DemoSeeder cannot be executed in production environment!');
            return;
        }

        // Demo business for local experimentation
        $business = Business::create([
            'name' => 'साई अमृत वॉटर सप्लायर्स',
            'owner_name' => 'डेमो मालक',
            'phone' => '9876543210',
            'area' => 'शिवाजी चौक, पुणे',
            'default_jar_rate' => 35.00,
            'total_godown_jars' => 100,
            'onboarding_completed' => true,
        ]);

        $user = User::create([
            'name' => 'डेमो मालक',
            'email' => 'demo@jarflow.local',
            'password' => Hash::make('password123'),
            'business_id' => $business->id,
            'role' => 'ADMIN',
        ]);

        $customer1 = Customer::create([
            'business_id' => $business->id,
            'name' => 'राहुल पाटील (हॉटेल समृद्धी)',
            'mobile' => '9822011223',
            'area' => 'मेन रोड',
            'current_jars' => 5,
            'pending_amount' => 175.00,
            'default_rate' => 35.00,
        ]);

        $this->command?->info('Development Demo data seeded successfully for local testing.');
    }
}
