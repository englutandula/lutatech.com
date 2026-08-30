<?php

namespace App\Services\AI;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PassportPhotoService
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
     * Get all supported country passport photo requirements
     */
    public function getRequirements(): array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-Internal-Secret' => $this->secret,
                    'Accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/api/v1/requirements");

            if ($response->successful()) {
                return $response->json();
            }
            return ['countries' => []];
        } catch (Exception $e) {
            Log::error('Failed to get passport requirements', ['error' => $e->getMessage()]);
            return ['countries' => []];
        }
    }

    /**
     * Process photo to exact compliance specifications
     */
    public function processPhoto(UploadedFile $file, string $documentType, string|array $options = '[]'): array
    {
        try {
            $optionsJson = is_string($options) ? $options : json_encode($options);

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
                ->post("{$this->baseUrl}/api/v1/process", [
                    'document_type' => $documentType,
                    'options' => $optionsJson,
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('Passport photo processing failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $errorData = $response->json();
            return [
                'success' => false,
                'message' => $errorData['detail'] ?? ($errorData['message'] ?? 'Photo processing failed.'),
                'status' => $response->status(),
            ];
        } catch (Exception $e) {
            Log::error('Passport processing exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'An error occurred during photo processing: ' . $e->getMessage(),
                'status' => 500,
            ];
        }
    }
}
