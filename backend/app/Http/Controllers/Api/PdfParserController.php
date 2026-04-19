<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiParser\AiParserInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PdfParserController extends Controller
{
    private AiParserInterface $parser;

    public function __construct(AiParserInterface $parser)
    {
        $this->parser = $parser;
    }

    /**
     * POST /api/parse-pdf
     *
     * Accepts a PDF upload + form_type (jnf|inf).
     * Returns structured JSON matching the form fields.
     */
    public function parse(Request $request)
    {
        $request->validate([
            'pdf'       => 'required|file|mimes:pdf|max:10240', // 10 MB max
            'form_type' => 'required|in:jnf,inf',
        ]);

        try {
            $file     = $request->file('pdf');
            $filePath = $file->store('temp-pdfs', 'local');
            $fullPath = storage_path('app/private/' . $filePath);

            // If the file is stored under storage/app/ without /private/
            if (!file_exists($fullPath)) {
                $fullPath = storage_path('app/' . $filePath);
            }

            $formType = $request->input('form_type');

            Log::info('PDF parsing started', [
                'file'      => $file->getClientOriginalName(),
                'size'      => $file->getSize(),
                'form_type' => $formType,
            ]);

            $parsed = $this->parser->parsePdf($fullPath, $formType);

            // Cleanup temp file
            @unlink($fullPath);

            Log::info('PDF parsing completed', [
                'form_type' => $formType,
                'fields_found' => $this->countNonNull($parsed),
            ]);

            return response()->json([
                'success' => true,
                'data'    => $parsed,
                'meta'    => [
                    'provider'      => config('services.ai_parser.provider', 'gemini'),
                    'filename'      => $file->getClientOriginalName(),
                    'parsed_at'     => now()->toISOString(),
                ],
            ]);

        } catch (\Throwable $e) {
            Log::error('PDF parsing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to parse PDF: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Count non-null leaf values in parsed data (for logging).
     */
    private function countNonNull(array $data): int
    {
        $count = 0;
        array_walk_recursive($data, function ($value) use (&$count) {
            if ($value !== null && $value !== '' && $value !== []) {
                $count++;
            }
        });
        return $count;
    }
}
