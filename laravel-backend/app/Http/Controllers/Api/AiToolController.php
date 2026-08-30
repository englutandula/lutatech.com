<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AI\BackgroundRemovalService;
use App\Services\AI\PassportPhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiToolController extends Controller
{
    protected BackgroundRemovalService $bgRemovalService;
    protected PassportPhotoService $passportPhotoService;

    public function __construct(
        BackgroundRemovalService $bgRemovalService,
        PassportPhotoService $passportPhotoService
    ) {
        $this->bgRemovalService = $bgRemovalService;
        $this->passportPhotoService = $passportPhotoService;
    }

    /**
     * Get passport photo specifications for all countries
     */
    public function getRequirements(): JsonResponse
    {
        $requirements = $this->passportPhotoService->getRequirements();
        return response()->json($requirements);
    }

    /**
     * Handle AI Passport Photo Processing Request
     */
    public function processPassport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp,heic',
                'max:20480', // 20 MB max limit
            ],
            'document_type' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $documentType = $request->input('document_type', 'US_PASSPORT_VISA');
        $options = $request->input('options', '{}');

        $result = $this->passportPhotoService->processPhoto($file, $documentType, $options);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 500);
        }

        // Return processed response (matching previous model structure)
        return response()->json($result['data']);
    }

    /**
     * Handle AI Background Removal Request
     */
    public function removeBackground(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:15360', // 15 MB max limit
            ],
        ], [
            'file.required' => 'Please provide an image file to process.',
            'file.image' => 'The uploaded file must be a valid image.',
            'file.mimes' => 'Supported formats are JPEG, PNG, JPG, and WEBP.',
            'file.max' => 'The image size cannot exceed 15 MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $result = $this->bgRemovalService->removeBackground($file);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status'] ?? 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Background removed successfully',
            'data' => $result['data'],
        ]);
    }
}
