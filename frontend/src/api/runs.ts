import { client } from './client'

export interface WorkflowRun {
  id: number
  business_type: string
  location: string
  status: 'running' | 'complete' | 'failed'
  total_found: number | null
  details_fetched: number | null
  enriched: number | null
  total_analyzed: number | null
  qualified_leads: number | null
  avg_priority_score: number | null
  top_score: number | null
  api_calls_used: number | null
  ai_model: string | null
  min_lead_score: number | null
  error_message: string | null
  triggered_by: string | null
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
}

export interface TopLead {
  crm_lead_id: number
  place_id: string
  status: string
  business_name: string | null
  phone_number: string | null
  website_url: string | null
  rating: number | null
  priority_score: number | null
  preferred_channel: string | null
}

export interface RunDetailResponse {
  run: WorkflowRun
  top_leads: TopLead[]
}

export interface RunsListResponse {
  data: WorkflowRun[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface TriggerPayload {
  business_type: string
  location: string
  max_results?: number
  min_lead_score?: number
  ai_model?: string
}

export interface TriggerResponse {
  run_id: number
  status: string
  message: string
}

export interface PollResponse {
  id: number
  status: 'running' | 'complete' | 'failed'
  total_found: number | null
  details_fetched: number | null
  enriched: number | null
  total_analyzed: number | null
  qualified_leads: number | null
  avg_priority_score: number | null
  started_at: string
}

export interface RunsFilters {
  status?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

export const runsApi = {
  list: (filters: RunsFilters = {}) =>
    client.get<RunsListResponse>('/workflows/runs', { params: filters }),

  show: (id: number) =>
    client.get<RunDetailResponse>(`/workflows/runs/${id}`),

  poll: (id: number) =>
    client.get<PollResponse>(`/workflows/runs/${id}/poll`),

  trigger: (payload: TriggerPayload) =>
    client.post<TriggerResponse>('/workflows/trigger', payload),
}
