<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_workflow_runs', function (Blueprint $table) {
            $table->id();
            $table->string('n8n_execution_id')->nullable();
            // search_query_id lives in n8n_db — no FK constraint possible across DBs
            $table->unsignedBigInteger('search_query_id')->nullable();
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('business_type');
            $table->string('location');
            $table->string('status')->default('running'); // running|complete|failed
            $table->integer('total_found')->default(0);
            $table->integer('details_fetched')->default(0);
            $table->integer('enriched')->default(0);
            $table->integer('total_analyzed')->default(0);
            $table->integer('qualified_leads')->default(0);
            $table->decimal('avg_priority_score', 3, 1)->nullable();
            $table->integer('top_score')->nullable();
            $table->integer('api_calls_used')->default(0);
            $table->string('ai_model')->nullable();
            $table->integer('min_lead_score')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_workflow_runs');
    }
};
