<?php

namespace Backend\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Backend\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get authenticated user
     */
    public function show()
    {
        return response()->json(['user' => Auth::user()]);
    }

    /**
     * Search users
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1',
        ]);

        $currentUser = Auth::user();
        $users = $this->userRepository->search($request->q);

        // Filter out current user
        $users = $users->filter(function ($user) use ($currentUser) {
            return $user->id !== $currentUser->id;
        });

        // Add friendship status
        $users = $users->map(function ($user) use ($currentUser) {
            $user->is_friend = $currentUser->isFriendsWith($user->id);
            $user->pending_request = $currentUser->hasPendingRequestWith($user->id);
            return $user;
        });

        return response()->json(['users' => $users->values()]);
    }
}
