<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AI PDF Parser Configuration
    |--------------------------------------------------------------------------
    |
    | Provider-agnostic AI config. To switch from Gemini to Qwen:
    |   1. Set AI_PARSER_PROVIDER=qwen in .env
    |   2. Add QWEN_API_KEY and QWEN_MODEL
    |   3. Create QwenParser.php implementing AiParserInterface
    |
    */
    'ai_parser' => [
        'provider'       => env('AI_PARSER_PROVIDER', 'gemini'),
        'gemini_api_key' => env('GEMINI_API_KEY'),
        'gemini_model'   => env('GEMINI_MODEL', 'gemini-2.0-flash'),
        // Future: Qwen config
        // 'qwen_api_key' => env('QWEN_API_KEY'),
        // 'qwen_model'   => env('QWEN_MODEL', 'qwen-plus'),
    ],

];
