<?php

namespace App\Services\AiParser;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Google Gemini implementation for PDF parsing.
 *
 * Uses the Gemini API to extract structured data from recruiter PDFs
 * and map them to JNF/INF form fields using intelligent field matching.
 */
class GeminiParser implements AiParserInterface
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.ai_parser.gemini_api_key');
        $this->model  = config('services.ai_parser.gemini_model', 'gemini-2.0-flash');
    }

    /**
     * Parse a PDF file using Gemini's vision/document understanding.
     */
    public function parsePdf(string $filePath, string $formType): array
    {
        $pdfContent = base64_encode(file_get_contents($filePath));

        $prompt = $this->buildPrompt($formType);

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::timeout(120)->post($url, [
            'contents' => [
                [
                    'parts' => [
                        [
                            'inline_data' => [
                                'mime_type' => 'application/pdf',
                                'data'      => $pdfContent,
                            ],
                        ],
                        [
                            'text' => $prompt,
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature'    => 0.1,
                'topP'           => 0.8,
                'responseMimeType' => 'application/json',
            ],
        ]);

        if (!$response->successful()) {
            Log::error('Gemini API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            throw new \RuntimeException('AI parsing failed: ' . $response->status());
        }

        $body = $response->json();

        // Extract the text content from Gemini response structure
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Parse the JSON from the response
        $parsed = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Gemini returned invalid JSON', ['raw' => $text]);
            throw new \RuntimeException('AI returned malformed data');
        }

        return $parsed;
    }

    /**
     * Build a detailed prompt that teaches the AI the exact form field schema.
     * This is the core intelligence — it maps recruiter language to form fields.
     */
    private function buildPrompt(string $formType): string
    {
        if ($formType === 'inf') {
            return $this->buildInfPrompt();
        }

        return $this->buildJnfPrompt();
    }

    private function buildJnfPrompt(): string
    {
        return <<<'PROMPT'
You are an expert data extraction assistant for IIT (ISM) Dhanbad's Career Development Centre.

TASK: Extract ALL relevant information from this recruiter PDF and map it to the JNF (Job Notification Form) fields below. The PDF may use different terminology than the form — you must intelligently match them.

FIELD MAPPING GUIDE (PDF term → form field):
- "company name" / "organization" / "firm" / "employer" → company_name
- "website" / "URL" / "web" / "homepage" → website
- "address" / "postal" / "office address" / "HQ" → postal_address
- "employees" / "team size" / "headcount" / "strength" → employees
- "sector" / "industry" / "domain" / "vertical" → sector
- "category" / "type of org" / "PSU" / "Private" / "MNC" / "Startup" → category
- "established" / "founded" / "inception" / "since" → date_of_establishment
- "turnover" / "revenue" / "annual revenue" → annual_turnover
- "LinkedIn" / "LinkedIn URL" → linkedin
- "headquarters country" / "HQ country" / "based in" → hq_country
- "nature of business" / "business type" / "about company" → nature_of_business
- "about" / "company description" / "overview" / "profile" → description
- "industry sectors" / "domains" / "verticals" → industry_sectors (array of strings)

CONTACTS:
- "HR head" / "TA head" / "head recruitment" → head_ta (object: name, designation, email, phone, landline)
- "contact person" / "POC 1" / "primary contact" → poc1 (same structure)
- "secondary contact" / "POC 2" / "alternate contact" → poc2 (same structure)

JOB DETAILS:
- "job title" / "role" / "position" / "profile" / "designation" → job_title
- "formal designation" / "official title" → job_formal_designation
- "location" / "posting" / "place of work" / "city" → place_of_posting
- "work mode" / "remote" / "on-site" / "hybrid" / "WFH" → work_mode (one of: "On-site", "Remote", "Hybrid")
- "openings" / "vacancies" / "positions" / "expected hires" → expected_hires
- "minimum hires" / "min positions" → min_hires
- "joining date" / "start date" / "joining month" → joining_month (YYYY-MM format)
- "JD" / "job description" / "responsibilities" / "role description" → job_description
- "additional info" / "perks" / "benefits" / "notes" → additional_info
- "bond" / "service agreement" / "lock-in" → bond_details
- "registration" / "apply link" / "application URL" → registration_link
- "onboarding" / "induction" → onboarding
- "skills" / "requirements" / "competencies" / "tech stack" → required_skills (array of strings)

SALARY (for each programme group: "B.Tech / Dual / Int. M.Tech", "M.Tech", "MBA", "M.Sc / M.Sc.Tech", "Ph.D"):
- "CTC" / "cost to company" / "total compensation" / "package" / "annual package" → ctc
- "base salary" / "base pay" / "fixed" / "fixed pay" → base
- "in-hand" / "take home" / "net" / "monthly in-hand" → inhand
- "currency" / "INR" / "USD" → currency

ADDITIONAL SALARY COMPONENTS (if mentioned, per programme group):
- "joining bonus" / "sign-on bonus" → joining_bonus
- "retention bonus" → retention_bonus
- "bond deductions" / "penalty" → bond_deductions
- "ESOPs" / "stock options" / "RSU" → esops
- "relocation" / "relocation allowance" / "shifting" → relocation

ELIGIBILITY:
- "CGPA" / "GPA" / "grade" / "minimum CGPA" / "cutoff" → globalCgpa
- "backlogs" / "active backlogs" / "arrears" → globalBacklogs (boolean)
- "eligible branches" / "departments" / "disciplines" → eligible_branches (list)
- "eligible degrees" / "courses" → eligible_degrees (list)

SELECTION PROCESS:
- "PPT" / "pre-placement talk" → pre_placement_talk (boolean)
- "resume shortlisting" / "CV screening" → resume_shortlisting (boolean)
- "written test" / "online test" / "aptitude" → online_written_test (boolean)
- "GD" / "group discussion" → group_discussion (boolean)
- "interview" / "personal interview" / "technical interview" → personal_tech_interview (boolean)
- "selection mode" / "campus virtual" → selection_mode
- "test type" / "online offline" → test_type
- "interview mode" / "in-person video" → interview_modes (array)

RESPOND WITH THIS EXACT JSON STRUCTURE (use null for fields not found in the PDF):

{
  "company": {
    "company_name": null,
    "website": null,
    "postal_address": null,
    "employees": null,
    "sector": null,
    "category": null,
    "date_of_establishment": null,
    "annual_turnover": null,
    "linkedin": null,
    "hq_country": null,
    "nature_of_business": null,
    "description": null
  },
  "industry_sectors": [],
  "contacts": {
    "head_ta": { "name": null, "designation": null, "email": null, "phone": null, "landline": null },
    "poc1":    { "name": null, "designation": null, "email": null, "phone": null, "landline": null },
    "poc2":    { "name": null, "designation": null, "email": null, "phone": null, "landline": null }
  },
  "job": {
    "job_title": null,
    "job_formal_designation": null,
    "place_of_posting": null,
    "work_mode": null,
    "expected_hires": null,
    "min_hires": null,
    "joining_month": null,
    "job_description": null,
    "additional_info": null,
    "bond_details": null,
    "registration_link": null,
    "onboarding": null
  },
  "required_skills": [],
  "eligibility": {
    "globalCgpa": null,
    "globalBacklogs": null,
    "eligible_branches": [],
    "eligible_degrees": []
  },
  "salary": {
    "currency": "INR",
    "programmes": {
      "B.Tech / Dual / Int. M.Tech": { "ctc": null, "base": null, "inhand": null },
      "M.Tech": { "ctc": null, "base": null, "inhand": null },
      "MBA": { "ctc": null, "base": null, "inhand": null },
      "M.Sc / M.Sc.Tech": { "ctc": null, "base": null, "inhand": null },
      "Ph.D": { "ctc": null, "base": null, "inhand": null }
    },
    "additional": {
      "joining_bonus": null,
      "retention_bonus": null,
      "bond_deductions": null,
      "esops": null,
      "relocation": null
    }
  },
  "selection": {
    "pre_placement_talk": null,
    "resume_shortlisting": null,
    "online_written_test": null,
    "group_discussion": null,
    "personal_tech_interview": null,
    "selection_mode": null,
    "test_type": null,
    "interview_modes": []
  },
  "confidence_scores": {
    "company": 0,
    "contacts": 0,
    "job": 0,
    "eligibility": 0,
    "salary": 0,
    "selection": 0
  }
}

IMPORTANT RULES:
1. Extract EXACTLY what's in the PDF — do NOT fabricate data
2. If a value doesn't exist in the PDF, use null (not empty string)
3. Phone numbers: include country code if available
4. Salary figures: extract numeric values only (e.g., "12 LPA" → "1200000")
5. confidence_scores: rate 0-100 how confident you are for each section based on how much data was found
6. For arrays, extract as many items as mentioned
7. Return ONLY valid JSON, no markdown formatting
PROMPT;
    }

    private function buildInfPrompt(): string
    {
        return <<<'PROMPT'
You are an expert data extraction assistant for IIT (ISM) Dhanbad's Career Development Centre.

TASK: Extract ALL relevant information from this recruiter PDF and map it to the INF (Internship Notification Form) fields.

FIELD MAPPING:
- "company name" / "organization" → company_name
- "website" / "URL" → website
- "address" / "postal" → postal_address
- "sector" / "industry" → sector
- "category" / "org type" → category
- "contact name" / "HR name" / "POC" → primary_contact_name
- "contact designation" / "title" → primary_contact_designation
- "contact email" → primary_contact_email
- "contact phone" / "mobile" → primary_contact_phone
- "internship title" / "role" / "position" → internship_designation
- "internship description" / "JD" / "responsibilities" → internship_description
- "location" / "posting" / "city" → place_of_posting
- "duration" / "weeks" / "months" → duration_weeks (convert to weeks if in months)
- "stipend" / "monthly stipend" / "compensation" → monthly_stipend
- "PPO" / "pre-placement offer" / "conversion" → ppo_provision (boolean)
- "PPO CTC" / "full-time CTC" → ppo_ctc
- "eligible degrees" / "courses" → eligible_degrees (array from: B.Tech, Dual Degree, Integrated M.Tech, M.Sc, M.Sc Tech, M.Tech, MBA, Ph.D)
- "eligible departments" / "branches" → eligible_departments (array)
- "CGPA" / "GPA" / "cutoff" → min_cutoff_cgpa
- "PPT" / "pre-placement talk" → selection_ppt (boolean)

RESPOND WITH THIS EXACT JSON STRUCTURE (use null for missing fields):

{
  "company_name": null,
  "website": null,
  "postal_address": null,
  "sector": null,
  "category": null,
  "primary_contact_name": null,
  "primary_contact_designation": null,
  "primary_contact_email": null,
  "primary_contact_phone": null,
  "internship_designation": null,
  "internship_description": null,
  "place_of_posting": null,
  "duration_weeks": null,
  "monthly_stipend": null,
  "ppo_provision": null,
  "ppo_ctc": null,
  "eligible_degrees": [],
  "eligible_departments": [],
  "min_cutoff_cgpa": null,
  "selection_ppt": null,
  "confidence_scores": {
    "company": 0,
    "contact": 0,
    "internship": 0,
    "eligibility": 0
  }
}

IMPORTANT:
1. Extract EXACTLY what's in the PDF — do NOT fabricate data
2. If a value doesn't exist, use null
3. Duration: always convert to weeks (1 month = 4 weeks)
4. Stipend: extract monthly figure
5. confidence_scores: rate 0-100 per section
6. Return ONLY valid JSON
PROMPT;
    }
}
