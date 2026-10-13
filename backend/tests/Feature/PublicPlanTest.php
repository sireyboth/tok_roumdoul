<?php

namespace Tests\Feature;

use App\Models\Plan;
use Database\Seeders\PlanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPlanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);
    }

    public function test_lists_active_plans_in_order(): void
    {
        $this->getJson('/api/public/plans')
            ->assertOk()
            ->assertJsonPath('data.*.code', ['starter', 'pro', 'chain'])
            ->assertJsonPath('data.2.max_branches', null);
    }

    public function test_admin_price_changes_show_up(): void
    {
        Plan::query()->where('code', 'starter')->update(['price_monthly_cents' => 999]);

        $this->getJson('/api/public/plans')
            ->assertJsonPath('data.0.price_monthly_cents', 999);
    }

    public function test_inactive_plans_are_hidden(): void
    {
        Plan::query()->where('code', 'chain')->update(['is_active' => false]);

        $this->getJson('/api/public/plans')
            ->assertJsonCount(2, 'data')
            ->assertJsonMissing(['code' => 'chain']);
    }
}
