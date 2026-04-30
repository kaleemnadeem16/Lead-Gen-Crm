<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteMemberRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $members = User::with('roles', 'permissions')
            ->get()
            ->map(fn (User $u) => $this->memberPayload($u));

        return response()->json(['data' => $members]);
    }

    public function invite(InviteMemberRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make(Str::password(16)),
            'timezone' => $request->timezone ?? 'UTC',
        ]);

        $user->assignRole($request->role ?? 'member');

        return response()->json(['data' => $this->memberPayload($user)], 201);
    }

    public function remove(Request $request, User $user): JsonResponse
    {
        if ($user->hasRole('super_admin') && ! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Cannot remove a super admin.'], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Member removed.']);
    }

    private function memberPayload(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'timezone'    => $user->timezone,
            'roles'       => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ];
    }
}
