<?php

namespace App\Models\ReadOnly;

use Illuminate\Database\Eloquent\Model;

class AiAnalysis extends Model
{
    protected $connection = 'n8n_pg';
    protected $table = 'ai_analysis';
    protected $primaryKey = 'place_id';
    public $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'is_potential_client'  => 'boolean',
        'confidence_score'     => 'float',
        'target_pain_points'   => 'array',
        'contact_channels'     => 'array',
        'exported_to_sheets'   => 'boolean',
        'exported_at'          => 'datetime',
        'analyzed_at'          => 'datetime',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn () => throw new \LogicException('AiAnalysis is read-only.'));
        static::updating(fn () => throw new \LogicException('AiAnalysis is read-only.'));
        static::deleting(fn () => throw new \LogicException('AiAnalysis is read-only.'));
    }

    public function businessDetail()
    {
        return $this->belongsTo(BusinessDetail::class, 'place_id', 'place_id');
    }
}
