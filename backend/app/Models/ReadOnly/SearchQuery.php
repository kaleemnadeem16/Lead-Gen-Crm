<?php

namespace App\Models\ReadOnly;

use Illuminate\Database\Eloquent\Model;

class SearchQuery extends Model
{
    protected $connection = 'n8n_pg';
    protected $table = 'search_queries';
    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn () => throw new \LogicException('SearchQuery is read-only.'));
        static::updating(fn () => throw new \LogicException('SearchQuery is read-only.'));
        static::deleting(fn () => throw new \LogicException('SearchQuery is read-only.'));
    }
}
