<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\WorkflowRunController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',     [AuthController::class, 'me']);

        Route::middleware('role:super_admin|admin')->group(function () {
            Route::get('/team/members',                    [TeamController::class, 'index']);
            Route::post('/team/members',                   [TeamController::class, 'invite']);
            Route::delete('/team/members/{user}',          [TeamController::class, 'remove']);
            Route::put('/team/members/{user}/roles',       [TeamMemberController::class, 'syncRoles']);
            Route::put('/team/members/{user}/permissions', [TeamMemberController::class, 'syncPermissions']);
        });

        Route::middleware('permission:workflows.view')->group(function () {
            Route::get('/workflows/runs',          [WorkflowRunController::class, 'index']);
            Route::get('/workflows/runs/{id}',     [WorkflowRunController::class, 'show']);
            Route::get('/workflows/runs/{id}/poll',[WorkflowRunController::class, 'poll']);
        });

        Route::post('/workflows/trigger', [WorkflowRunController::class, 'trigger'])
            ->middleware('permission:workflows.trigger');
    });

    // n8n calls this without a user token — authenticated by X-CRM-Secret header
    Route::post('/workflows/webhook-callback', [WorkflowRunController::class, 'webhookCallback'])
        ->middleware('n8n.webhook');
});
