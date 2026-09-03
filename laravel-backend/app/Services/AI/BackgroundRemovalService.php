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
        $rawUrl = config('services.python_ai.url', 'http://13.48.43.240:8000');
        if (str_contains($rawUrl, '51.20.42.164')) {
            $rawUrl = 'http://13.48.43.240:8000';
        }
        $this->baseUrl = rtrim($rawUrl, '/');
        $this->secret = config('services.python_ai.secret', 'dev_internal_secret_key_123');
        $this->timeout = (int) config('services.python_ai.timeout', 120);
    }

    /**
     * Return list of candidate base URLs (preferring port 8000 directly)
     */
    protected function getCandidateBaseUrls(): array
    {
        $urls = [];
        if (str_contains($this->baseUrl, ':8000')) {
            $urls[] = $this->baseUrl;
            $urls[] = preg_replace('/:8000$/', '', $this->baseUrl);
        } else {
            $urls[] = $this->baseUrl . ':8000';
            $urls[] = $this->baseUrl;
        }
        $urls[] = 'http://13.48.43.240:8000';
        return array_values(array_unique($urls));
    }

    /**
     * Send image to Python AI microservice for background removal
     *
     * @param UploadedFile $file
     * @return array
     */
    public function removeBackground(UploadedFile $file): array
    {
        $fileBytes = file_get_contents($file->getRealPath());
        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();

        $endpoints = ['/api/remove-background', '/api/v1/background/remove', '/api/v1/remove-background'];
        $lastException = null;
        $lastResponse = null;

        foreach ($this->getCandidateBaseUrls() as $base) {
            foreach ($endpoints as $ep) {
                try {
                    $response = Http::timeout($this->timeout)
                        ->withHeaders([
                            'X-Internal-Secret' => $this->secret,
                            'Accept' => 'application/json',
                        ])
                        ->attach('file', $fileBytes, $fileName, ['Content-Type' => $mimeType])
                        ->post("{$base}{$ep}");

                    if ($response->successful()) {
                        $data = $response->json();
                        $processedImage = $data['processed_image'] ?? ($data['data']['processed_image'] ?? null);
                        $imageDataUrl = $data['data']['image_data_url'] ?? ($processedImage ? (str_starts_with($processedImage, 'data:') ? $processedImage : 'data:image/png;base64,' . $processedImage) : null);

                        return [
                            'success' => true,
                            'data' => [
                                'image_data_url' => $imageDataUrl,
                                'processed_image' => $processedImage,
                            ],
                            'message' => $data['message'] ?? 'Background removed successfully',
                        ];
                    }

                    if ($response->status() !== 404) {
                        $lastResponse = $response;
                        break 2;
                    }
                } catch (Exception $e) {
                    $lastException = $e;
                }
            }
        }

        if ($lastResponse) {
            $errorData = $lastResponse->json();
            return [
                'success' => false,
                'message' => $errorData['detail'] ?? ($errorData['message'] ?? 'AI processing service error.'),
                'status' => $lastResponse->status(),
            ];
        }

        return [
            'success' => false,
            'message' => 'Cannot connect to AI service. ' . ($lastException?->getMessage() ?? 'Service unavailable.'),
            'status' => 503,
        ];
    }
}
