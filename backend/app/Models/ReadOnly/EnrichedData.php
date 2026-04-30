<?php

namespace App\Models\ReadOnly;

use Illuminate\Database\Eloquent\Model;

class EnrichedData extends Model
{
    protected $connection = 'n8n_pg';
    protected $table = 'enriched_data';
    public $timestamps = false;

    protected $casts = [
        'has_social_media'    => 'boolean',
        'emails'              => 'array',
        'additional_phones'   => 'array',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn () => throw new \LogicException('EnrichedData is read-only.'));
        static::updating(fn () => throw new \LogicException('EnrichedData is read-only.'));
        static::deleting(fn () => throw new \LogicException('EnrichedData is read-only.'));
    }
}
