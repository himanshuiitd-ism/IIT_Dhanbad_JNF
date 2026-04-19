<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AiParser\AiParserInterface;
use App\Services\AiParser\GeminiParser;

/**
 * Registers the AI parser service binding.
 *
 * To switch providers:
 *   1. Create a new parser class implementing AiParserInterface
 *   2. Set AI_PARSER_PROVIDER=qwen (or whatever) in .env
 *   3. Add the case below — done!
 */
class AiParserServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AiParserInterface::class, function ($app) {
            $provider = config('services.ai_parser.provider', 'gemini');

            return match ($provider) {
                // 'qwen'   => new \App\Services\AiParser\QwenParser(),
                default  => new GeminiParser(),
            };
        });
    }

    public function boot(): void
    {
        //
    }
}
