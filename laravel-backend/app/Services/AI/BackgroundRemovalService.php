<?php

namespace App\Services\AI;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class BackgroundRemovalService
{
    protected string $baseUrl;
    protected string $secret;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.python_ai.url', 'http://127.0.0.1:8001'), '/');
        $this->secret = config('services.python_ai.secret', 'dev_internal_secret_key_123');
        $this->timeout = (int) config('services.python_ai.timeout', 60);
    }

    /**
     * Send image to Python AI microservice for background removal
     *
     * @param UploadedFile $file
     * @return array
     * @throws Exception
     */
    public function removeBackground(UploadedFile $file): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'X-Internal-Secret' => $this->secret,
                    'Accept' => 'application/json',
                ])
                ->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName(),
                    ['Content-Type' => $file->getMimeType()]
                )
                ->post("{$this->baseUrl}/api/v1/background/remove");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data['data'] ?? $data,
                    'message' => $data['message'] ?? 'Background removed successfully',
                ];
            }

            Log::error('Python AI background removal failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $errorData = $response->json();
            $errorMessage = $errorData['message'] ?? 'AI processing service error.';

            return [
                'success' => false,
                'message' => $errorMessage,
                'status' => $response->status(),
            ];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Cannot connect to Python AI microservice', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'AI processing service is temporarily unavailable. Please try again later.',
                'status' => 503,
            ];
        } catch (Exception $e) {
            Log::error('Background removal exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'An unexpected error occurred while processing the image.',
                'status' => 500,
            ];
        }
    }
}
