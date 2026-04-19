<?php

namespace App\Services\AiParser;

/**
 * Provider-agnostic interface for AI-powered document parsing.
 *
 * To switch from Gemini to Qwen (or any other provider):
 *   1. Create a new class implementing this interface (e.g., QwenParser)
 *   2. Update AI_PARSER_PROVIDER in .env to "qwen"
 *   3. Register the binding in AiParserServiceProvider
 *
 * No other code changes are needed.
 */
interface AiParserInterface
{
    /**
     * Parse a PDF file and extract structured form data.
     *
     * @param  string  $filePath     Absolute path to uploaded PDF
     * @param  string  $formType     "jnf" or "inf"
     * @return array                 Structured JSON mapping to form fields
     */
    public function parsePdf(string $filePath, string $formType): array;
}
