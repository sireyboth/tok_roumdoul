<?php

namespace Tests\Feature;

use App\Enums\StaffRole;
use App\Models\Company;
use App\Models\User;
use App\Services\CompanyProvisioner;
use Database\Seeders\DatabaseSeeder;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackOfficeAccessTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->company = Company::query()->where('slug', 'demo-cafe')->firstOrFail();
        $this->owner = User::query()->where('email', 'owner@tok.test')->firstOrFail();
    }

    public function test_owner_can_open_every_back_office_page(): void
    {
        $this->actingAs($this->owner);

        foreach (['', '/branches', '/dining-tables', '/categories', '/menu-items', '/option-groups', '/staff', '/profile'] as $path) {
            $this->get('/app/demo-cafe'.$path)->assertOk();
        }
    }

    public function test_branch_edit_page_with_menu_availability_loads(): void
    {
        $branch = $this->company->branches()->first();

        $this->actingAs($this->owner)
            ->get("/app/demo-cafe/branches/{$branch->id}/edit")
            ->assertOk();
    }

    public function test_owner_cannot_open_another_restaurant(): void
    {
        app(CompanyProvisioner::class)->create(['name' => 'Rival Café', 'slug' => 'rival'], User::factory()->create());

        $this->actingAs($this->owner)->get('/app/rival')->assertNotFound();
    }

    public function test_kitchen_staff_cannot_use_the_back_office(): void
    {
        $cook = User::factory()->create();
        $this->company->memberships()->create(['user_id' => $cook->id, 'role' => StaffRole::Kitchen]);

        $this->assertFalse($cook->canAccessTenant($this->company));
        $this->assertCount(0, $cook->getTenants(Filament::getPanel('app')));
    }

    public function test_only_platform_admins_open_admin_panel(): void
    {
        $this->actingAs($this->owner)->get('/admin')->assertForbidden();

        $admin = User::query()->where('email', 'admin@tok.test')->firstOrFail();
        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->actingAs($admin)->get('/admin/companies')->assertOk();
        $this->actingAs($admin)->get('/admin/plans')->assertOk();
    }

    public function test_plan_limit_blocks_extra_tables(): void
    {
        $plan = $this->company->subscription->plan;
        $plan->update(['max_tables' => $this->company->diningTables()->count()]);

        $this->assertTrue($this->company->fresh()->hasReachedLimit('tables'));
    }
}
