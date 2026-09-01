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
        $this->baseUrl = rtrim(config('services.python_ai.url', 'http://51.20.42.164'), '/');
        $this->secret = config('services.python_ai.secret', 'dev_internal_secret_key_123');
        $this->timeout = (int) config('services.python_ai.timeout', 60);
    }

    /**
     * Return list of candidate base URLs (e.g. port 80 and port 8000)
     */
    protected function getCandidateBaseUrls(): array
    {
        $urls = [$this->baseUrl];
        if (!str_contains($this->baseUrl, ':8000')) {
            $urls[] = $this->baseUrl . ':8000';
        } else {
            $urls[] = preg_replace('/:8000$/', '', $this->baseUrl);
        }
        return array_values(array_unique($urls));
    }

    /**
     * Get all supported country passport photo requirements
     */
    public function getRequirements(): array
    {
        $endpoints = ['/api/requirements', '/api/v1/requirements'];

        foreach ($this->getCandidateBaseUrls() as $base) {
            foreach ($endpoints as $ep) {
                try {
                    $response = Http::timeout(5)
                        ->withHeaders([
                            'X-Internal-Secret' => $this->secret,
                            'Accept' => 'application/json',
                        ])
                        ->get("{$base}{$ep}");

                    if ($response->successful()) {
                        return $response->json();
                    }
                } catch (Exception) {
                    continue;
                }
            }
        }

        return ['countries' => []];
    }

    /**
     * Process photo to exact compliance specifications
     */
    public function processPhoto(UploadedFile $file, string $documentType, string|array $options = '[]'): array
    {
        $optionsJson = is_string($options) ? $options : json_encode($options);
        $fileBytes = file_get_contents($file->getRealPath());
        $fileName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();

        $endpoints = ['/api/process', '/api/v1/process'];
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
                        ->post("{$base}{$ep}", [
                            'document_type' => $documentType,
                            'options' => $optionsJson,
                        ]);

                    if ($response->successful()) {
                        return [
                            'success' => true,
                            'data' => $response->json(),
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
                'message' => $errorData['detail'] ?? ($errorData['message'] ?? 'Photo processing failed.'),
                'status' => $lastResponse->status(),
            ];
        }

        return [
            'success' => false,
            'message' => 'Unable to reach AI photo processor. ' . ($lastException?->getMessage() ?? 'Service unavailable.'),
            'status' => 503,
        ];
    }
}
