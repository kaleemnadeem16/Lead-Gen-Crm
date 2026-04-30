<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_leads', function (Blueprint $table) {
            $table->id();
            // place_id matches business_details.place_id in n8n_db — no FK (cross-DB)
            $table->string('place_id')->unique();
            $table->string('status')->default('new'); // new|contacted|interested|proposal|closed_won|closed_lost
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('deal_value', 10, 2)->nullable();
            $table->string('pipeline_stage')->default('discovery'); // discovery|qualification|proposal|negotiation|closed
            $table->integer('priority_override')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('next_followup_at')->nullable();
            $table->foreignId('source_run_id')->nullable()->constrained('crm_workflow_runs')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('crm_leads', function (Blueprint $table) {
            $table->index('status');
            $table->index('next_followup_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_leads');
    }
};
