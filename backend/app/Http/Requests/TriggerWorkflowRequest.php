<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TriggerWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_type'  => ['required', 'string', 'max:100'],
            'location'       => ['required', 'string', 'max:200'],
            'max_results'    => ['nullable', 'integer', 'min:1', 'max:100'],
            'min_lead_score' => ['nullable', 'integer', 'min:1', 'max:10'],
            'ai_model'       => ['nullable', 'string', 'max:50'],
        ];
    }
}
