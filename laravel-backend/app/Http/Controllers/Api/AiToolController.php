<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AI\BackgroundRemovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiToolController extends Controller
{
    protected BackgroundRemovalService $bgRemovalService;

    public function __construct(BackgroundRemovalService $bgRemovalService)
    {
        $this->bgRemovalService = $bgRemovalService;
    }

    /**
     * Handle AI Background Removal Request
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function removeBackground(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,jpg,webp',
                'max:12288', // 12 MB max limit
            ],
        ], [
            'file.required' => 'Please provide an image file to process.',
            'file.image' => 'The uploaded file must be a valid image.',
            'file.mimes' => 'Supported formats are JPEG, PNG, JPG, and WEBP.',
            'file.max' => 'The image size cannot exceed 12 MB.',
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
