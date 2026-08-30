<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class NormalToolController extends Controller
{
    /**
     * Generate QR Code entirely within PHP/Laravel
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generateQr(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:2000',
            'size' => 'nullable|integer|min:100|max:1000',
            'margin' => 'nullable|integer|min:0|max:10',
            'format' => 'nullable|string|in:svg,png',
            'color' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
            'background_color' => 'nullable|string|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $text = $request->input('text');
        $size = (int) $request->input('size', 300);
        $margin = (int) $request->input('margin', 1);

        try {
            // Generate clean SVG QR code
            $qrBuilder = QrCode::size($size)->margin($margin);

            if ($request->filled('color')) {
                $hex = ltrim($request->input('color'), '#');
                $r = hexdec(substr($hex, 0, 2));
                $g = hexdec(substr($hex, 2, 2));
                $b = hexdec(substr($hex, 4, 2));
                $qrBuilder->color($r, $g, $b);
            }

            if ($request->filled('background_color')) {
                $hex = ltrim($request->input('background_color'), '#');
                $r = hexdec(substr($hex, 0, 2));
                $g = hexdec(substr($hex, 2, 2));
                $b = hexdec(substr($hex, 4, 2));
                $qrBuilder->backgroundColor($r, $g, $b);
            }

            $svg = $qrBuilder->generate($text);

            return response()->json([
                'success' => true,
                'message' => 'QR Code generated successfully',
                'data' => [
                    'svg' => (string) $svg,
                    'text' => $text,
                    'size' => $size,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage(),
            ], 500);
        }
    }
}
