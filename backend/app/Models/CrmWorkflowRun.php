<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CrmWorkflowRun extends Model
{
    use HasFactory;

    protected $table = 'crm_workflow_runs';

    protected $fillable = [
        'n8n_execution_id', 'search_query_id', 'triggered_by',
        'business_type', 'location', 'status',
        'total_found', 'details_fetched', 'enriched', 'total_analyzed',
        'qualified_leads', 'avg_priority_score', 'top_score',
        'api_calls_used', 'ai_model', 'min_lead_score',
        'error_message', 'started_at', 'completed_at',
    ];

    protected $casts = [
        'started_at'          => 'datetime',
        'completed_at'        => 'datetime',
        'avg_priority_score'  => 'decimal:1',
    ];

    public function triggeredBy()
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    public function leads()
    {
        return $this->hasMany(CrmLead::class, 'source_run_id');
    }
}
