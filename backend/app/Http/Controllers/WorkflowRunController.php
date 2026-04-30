<?php

namespace App\Http\Controllers;

use App\Http\Requests\TriggerWorkflowRequest;
use App\Models\CrmLead;
use App\Models\CrmWorkflowRun;
use App\Services\N8nService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkflowRunController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CrmWorkflowRun::query()
            ->with('triggeredBy:id,name')
            ->orderByDesc('started_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(business_type) LIKE ?', ['%' . strtolower($term) . '%'])
                  ->orWhereRaw('LOWER(location) LIKE ?', ['%' . strtolower($term) . '%']);
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('started_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('started_at', '<=', $request->date_to);
        }

        $runs = $query->paginate($request->integer('per_page', 20));

        $runs->through(fn ($run) => $this->runSummary($run));

        return response()->json($runs);
    }

    public function show(int $id): JsonResponse
    {
        $run = CrmWorkflowRun::with('triggeredBy:id,name')->findOrFail($id);

        $leads = CrmLead::where('source_run_id', $id)
            ->with(['businessDetail', 'businessDetail.aiAnalysis'])
            ->get()
            ->sortByDesc(fn ($l) => $l->businessDetail?->aiAnalysis?->priority_score ?? 0)
            ->take(10)
            ->values()
            ->map(fn ($l) => [
                'crm_lead_id'   => $l->id,
                'place_id'      => $l->place_id,
                'status'        => $l->status,
                'business_name' => $l->businessDetail?->name,
                'phone_number'  => $l->businessDetail?->phone_number,
                'website_url'   => $l->businessDetail?->website_url,
                'rating'        => $l->businessDetail?->rating,
                'priority_score'=> $l->businessDetail?->aiAnalysis?->priority_score,
                'preferred_channel' => $l->businessDetail?->aiAnalysis?->preferred_channel,
            ]);

        return response()->json([
            'run'       => $this->runSummary($run),
            'top_leads' => $leads,
        ]);
    }

    public function poll(int $id): JsonResponse
    {
        $run = CrmWorkflowRun::select([
            'id', 'status', 'total_found', 'details_fetched',
            'enriched', 'total_analyzed', 'qualified_leads',
            'avg_priority_score', 'started_at',
        ])->findOrFail($id);

        return response()->json($run);
    }

    public function trigger(TriggerWorkflowRequest $request, N8nService $n8n): JsonResponse
    {
        $this->authorize('workflows.trigger');

        $run = CrmWorkflowRun::create([
            'triggered_by'   => $request->user()->id,
            'business_type'  => $request->business_type,
            'location'       => $request->location,
            'max_results'    => $request->max_results ?? 20,
            'min_lead_score' => $request->min_lead_score ?? 6,
            'ai_model'       => $request->ai_model ?? 'gpt-4o-mini',
            'status'         => 'running',
            'started_at'     => now(),
        ]);

        $n8n->triggerOrchestrator($request->validated());

        return response()->json([
            'run_id'  => $run->id,
            'status'  => 'running',
            'message' => "Run started. Poll GET /workflows/runs/{$run->id}/poll for status.",
        ], 202);
    }

    public function webhookCallback(Request $request): JsonResponse
    {
        $request->validate([
            'n8n_execution_id' => ['nullable', 'string'],
            'search_query_id'  => ['nullable', 'integer'],
            'status'           => ['required', 'in:complete,failed'],
            'total_found'      => ['nullable', 'integer'],
            'details_fetched'  => ['nullable', 'integer'],
            'enriched'         => ['nullable', 'integer'],
            'total_analyzed'   => ['nullable', 'integer'],
            'qualified_leads'  => ['nullable', 'integer'],
            'avg_priority_score' => ['nullable', 'numeric'],
            'top_score'        => ['nullable', 'integer'],
            'api_calls_used'   => ['nullable', 'integer'],
            'error_message'    => ['nullable', 'string'],
        ]);

        // Match by n8n_execution_id if provided, otherwise take the last running run
        $run = $request->filled('n8n_execution_id')
            ? CrmWorkflowRun::where('n8n_execution_id', $request->n8n_execution_id)->firstOrFail()
            : CrmWorkflowRun::where('status', 'running')->latest('started_at')->firstOrFail();

        $run->update([
            'n8n_execution_id'   => $request->n8n_execution_id ?? $run->n8n_execution_id,
            'search_query_id'    => $request->search_query_id ?? $run->search_query_id,
            'status'             => $request->status,
            'total_found'        => $request->total_found ?? 0,
            'details_fetched'    => $request->details_fetched ?? 0,
            'enriched'           => $request->enriched ?? 0,
            'total_analyzed'     => $request->total_analyzed ?? 0,
            'qualified_leads'    => $request->qualified_leads ?? 0,
            'avg_priority_score' => $request->avg_priority_score,
            'top_score'          => $request->top_score,
            'api_calls_used'     => $request->api_calls_used ?? 0,
            'error_message'      => $request->error_message,
            'completed_at'       => now(),
        ]);

        return response()->json(['message' => 'Run updated.']);
    }

    private function runSummary(CrmWorkflowRun $run): array
    {
        $duration = null;
        if ($run->started_at && $run->completed_at) {
            $duration = $run->completed_at->diffInSeconds($run->started_at);
        }

        return [
            'id'                 => $run->id,
            'business_type'      => $run->business_type,
            'location'           => $run->location,
            'status'             => $run->status,
            'total_found'        => $run->total_found,
            'details_fetched'    => $run->details_fetched,
            'enriched'           => $run->enriched,
            'total_analyzed'     => $run->total_analyzed,
            'qualified_leads'    => $run->qualified_leads,
            'avg_priority_score' => $run->avg_priority_score,
            'top_score'          => $run->top_score,
            'api_calls_used'     => $run->api_calls_used,
            'ai_model'           => $run->ai_model,
            'min_lead_score'     => $run->min_lead_score,
            'error_message'      => $run->error_message,
            'triggered_by'       => $run->triggeredBy?->name,
            'started_at'         => $run->started_at,
            'completed_at'       => $run->completed_at,
            'duration_seconds'   => $duration,
        ];
    }
}
