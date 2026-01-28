<?php

namespace Backend\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Backend\Application\UseCases\CreatePrivateConversationUseCase;
use Backend\Application\UseCases\SendMessageUseCase;
use Backend\Application\UseCases\CreateAIChatUseCase;
use Backend\Domain\Repositories\ConversationRepositoryInterface;
use Backend\Domain\Repositories\MessageRepositoryInterface;
use Backend\Application\Jobs\ProcessBotResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function __construct(
        private ConversationRepositoryInterface $conversationRepository,
        private MessageRepositoryInterface $messageRepository,
        private CreatePrivateConversationUseCase $createPrivateConversation,
        private SendMessageUseCase $sendMessage,
        private CreateAIChatUseCase $createAIChat
    ) {}

    // Get all user conversations
    public function index()
    {
        $user = Auth::user();
        
        $conversations = $this->conversationRepository
            ->getUserConversations($user->id)
            ->map(function ($conversation) use ($user) {
                $otherParticipants = $conversation->participants
                    ->where('id', '!=', $user->id);

                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'name' => $conversation->type === 'private' 
                        ? $otherParticipants->first()->name ?? 'Unknown'
                        : $conversation->name,
                    'participants' => $otherParticipants->values(),
                    'latest_message' => $conversation->latestMessage,
                    'unread_count' => $conversation->getUnreadCountFor($user->id),
                    'updated_at' => $conversation->updated_at,
                ];
            });

        return response()->json(['conversations' => $conversations]);
    }

    // Get or create conversation with friend
    public function getOrCreate(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $result = $this->createPrivateConversation->execute($user->id, $request->friend_id);

        return response()->json([
            'conversation' => $result['conversation']->load('participants', 'latestMessage')
        ]);
    }

    // Get single conversation
    public function show($id)
    {
        $user = Auth::user();
        
        $conversation = $this->conversationRepository->findById($id);

        if (!$conversation || !$conversation->participants->contains($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($conversation->type === 'private') {
            $otherParticipant = $conversation->participants->where('id', '!=', $user->id)->first();
            $conversation->display_name = $otherParticipant ? $otherParticipant->name : 'Unknown';
        } else {
            $conversation->display_name = $conversation->name;
        }

        return response()->json(['conversation' => $conversation]);
    }

    // Get messages for a conversation
    public function getMessages($id)
    {
        $user = Auth::user();
        
        $conversation = $this->conversationRepository->findById($id);

        if (!$conversation || !$conversation->participants->contains($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $this->messageRepository->getConversationMessages($id);

        // Mark as read
        $this->conversationRepository->markAsRead($id, $user->id);

        return response()->json(['messages' => $messages]);
    }

    // Send message
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $user = Auth::user();
        
        $conversation = $this->conversationRepository->findById($id);

        if (!$conversation || !$conversation->participants->contains($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $this->sendMessage->execute($id, $user->id, $request->content);
        $message = $result['message'];

        // If AI conversation, dispatch bot response
        if ($conversation->type === 'ai') {
            $conversationHistory = $this->messageRepository
                ->getRecentMessages($id, 10)
                ->map(fn($m) => [
                    'role' => $m->type === 'bot' ? 'assistant' : 'user',
                    'content' => $m->content
                ])
                ->toArray();

            ProcessBotResponse::dispatch(
                $conversation->id,
                $request->content,
                $user,
                $conversationHistory
            );
        }

        return response()->json(['message' => $message]);
    }

    // Create AI conversation
    public function createAIChat()
    {
        $user = Auth::user();
        $result = $this->createAIChat->execute($user->id);

        return response()->json(['conversation' => $result['conversation']]);
    }

    // Search messages across conversations
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1',
        ]);

        $user = Auth::user();

        $conversations = $this->conversationRepository->getUserConversations($user->id);
        $conversationIds = $conversations->pluck('id')->values();

        if ($conversationIds->isEmpty()) {
            return response()->json(['conversations' => []]);
        }

        $messages = $this->messageRepository
            ->searchMessages($request->q, 100)
            ->filter(fn($message) => $conversationIds->contains($message->conversation_id));

        $conversationMap = $conversations->keyBy('id');

        $results = $messages
            ->groupBy('conversation_id')
            ->map(function ($group, $conversationId) use ($conversationMap, $user) {
                $conversation = $conversationMap->get((int) $conversationId);

                if (!$conversation) {
                    return null;
                }

                $otherParticipants = $conversation->participants->where('id', '!=', $user->id);
                $name = $conversation->type === 'private'
                    ? ($otherParticipants->first()->name ?? 'Unknown')
                    : $conversation->name;

                $matchedMessage = $group->sortByDesc('created_at')->first();

                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'name' => $name,
                    'participants' => $otherParticipants->values(),
                    'matched_message' => $matchedMessage ? [
                        'id' => $matchedMessage->id,
                        'content' => $matchedMessage->content,
                        'created_at' => $matchedMessage->created_at,
                        'user' => $matchedMessage->user ? [
                            'id' => $matchedMessage->user->id,
                            'name' => $matchedMessage->user->name,
                        ] : null,
                    ] : null,
                    'updated_at' => $conversation->updated_at,
                ];
            })
            ->filter()
            ->values();

        return response()->json(['conversations' => $results]);
    }

    // Delete conversation
    public function destroy($id)
    {
        $user = Auth::user();
        
        $conversation = $this->conversationRepository->findById($id);

        if (!$conversation || !$conversation->participants->contains($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->conversationRepository->delete($id);

        return response()->json(['message' => 'Conversa excluída com sucesso']);
    }
}
