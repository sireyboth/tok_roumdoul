<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;

/** The price list for the marketing site's pricing page. No login. */
class PublicPlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = Plan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Plan $plan) => [
                'code' => $plan->code,
                'name' => $plan->name,
                'description' => $plan->description,
                'currency' => $plan->currency,
                // Whole cents, like everywhere else: 999 = $9.99.
                'price_monthly_cents' => $plan->price_monthly_cents,
                'price_yearly_cents' => $plan->price_yearly_cents,
                // null = unlimited
                'max_branches' => $plan->max_branches,
                'max_tables' => $plan->max_tables,
                'max_staff' => $plan->max_staff,
                'features' => $plan->features ?? [],
            ])
            ->values();

        // Short cache: an edit in /admin > Plans shows on the site within a minute.
        return response()->json(['data' => $plans])
            ->header('Cache-Control', 'public, max-age=60');
    }
}
