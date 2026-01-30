<?php

namespace Backend\Application\Services;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;

class LLMBotService
{
    public function generateResponse(string $message, array $conversationHistory = []): string
    {
        try {
            $apiKey = env('OPENAI_API_KEY');
            if (empty($apiKey) || strpos($apiKey, 'COLOQUE_SUA_CHAVE_AQUI') !== false) {
                return $this->getFallbackResponse($message);
            }
            $messages = $this->formatMessages($conversationHistory);
            $messages[] = ['role' => 'user', 'content' => $message];
            $result = OpenAI::chat()->create([
                'model' => env('OPENAI_MODEL', 'gpt-3.5-turbo'),
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);
            $response = $result->choices[0]->message->content ?? 'Sorry, I could not generate a response.';
            return $response;
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'quota') !== false || strpos($e->getMessage(), 'billing') !== false) {
                return "🤖 A chave da OpenAI não tem créditos disponíveis. Usando resposta simulada:\n\n" . $this->getFallbackResponse($message);
            }
            return $this->getFallbackResponse($message);
        }
    }

    // Se a IA não responder, não te deixo na mão!
    private function getFallbackResponse(string $message): string
    {
        $responses = [
            'olá' => "👋 Olá! Como posso ajudar você hoje?",
            'oi' => "👋 Oi! Sou seu assistente de IA. No que posso ajudar?",
            'como você está' => "😊 Estou funcionando perfeitamente! Como posso ajudar você?",
            'quem é você' => "🤖 Sou um assistente de IA integrado neste sistema de chat. Posso conversar sobre diversos assuntos!",
            'o que você faz' => "💬 Posso responder perguntas, ajudar com informações e manter conversas interessantes com você!",
        ];
        $messageLower = strtolower($message);
        foreach ($responses as $keyword => $response) {
            if (strpos($messageLower, $keyword) !== false) {
                return $response;
            }
        }
        return "🤖 Recebi sua mensagem: \"$message\"\n\nEu sou um assistente de IA simulado (a chave OpenAI real está sem créditos). Posso:\n\n✅ Responder saudações\n✅ Manter conversas básicas\n✅ Demonstrar o funcionamento do sistema\n\nPara respostas reais da IA, adicione créditos na sua conta OpenAI em: https://platform.openai.com/account/billing";
    }

    private function formatMessages(array $history): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a helpful AI assistant. Be concise, friendly, and informative.'
            ]
        ];
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $msg['content']
            ];
        }
        return $messages;
    }

    // Stream de resposta: futuro promissor!
    public function streamResponse(string $message, callable $callback): void
    {
        $stream = OpenAI::chat()->createStreamed([
            'model' => env('OPENAI_MODEL', 'gpt-3.5-turbo'),
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful assistant.'],
                ['role' => 'user', 'content' => $message],
            ],
        ]);
        foreach ($stream as $response) {
            $text = $response->choices[0]->delta->content ?? '';
            if ($text) {
                $callback($text);
            }
        }
    }
}
