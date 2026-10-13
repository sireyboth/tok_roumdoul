<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use App\Models\Concerns\BelongsToCompany;
use App\Services\MenuSync;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use Auditable, BelongsToCompany, SoftDeletes;

    protected $fillable = [
        'company_id', 'name', 'code', 'address', 'phone', 'latitude', 'longitude',
        'day_ends_at', 'opening_hours', 'is_active', 'sort_order', 'coreos_branch_id',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'opening_hours' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // A new branch starts with the whole company menu available.
        static::created(fn (self $branch) => app(MenuSync::class)->ensureRowsForBranch($branch));
    }

    public function tableAreas(): HasMany
    {
        return $this->hasMany(TableArea::class)->orderBy('sort_order');
    }

    public function diningTables(): HasMany
    {
        return $this->hasMany(DiningTable::class)->orderBy('sort_order')->orderBy('name');
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(BranchMenuItem::class);
    }

    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
