/**
 * AI Parser — Client-Side Gemini API
 *
 * Parses PDFs directly from the browser using the Gemini API.
 * This removes the dependency on the Laravel backend for PDF parsing,
 * so it works even when the backend is offline.
 *
 * The Gemini API key is embedded here for local dev convenience.
 * In production, move this to a Next.js API route.
 */

import type { ParsePdfResponse, JnfParsedData, InfParsedData } from "./types";
// ── Gemini config ──────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
// Fallback model if primary is overloaded (503)
const GEMINI_FALLBACK_MODEL = "gemini-2.0-flash";

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

/**
 * Call Gemini with automatic retry + model fallback.
 * Retries up to 3 times with exponential backoff on 503/429.
 * If primary model keeps failing, falls back to GEMINI_FALLBACK_MODEL.
 */
async function callGeminiWithRetry(
  requestBody: any,
  onProgress?: (stage: string) => void,
  maxRetries = 3
): Promise<any> {
  const modelsToTry = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(geminiUrl(model), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          return await response.json();
        }

        // Retryable errors: 503 (overloaded) or 429 (rate limited)
        if (response.status === 503 || response.status === 429) {
          const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000); // 1s, 2s, 4s
          onProgress?.(`Model busy, retrying in ${waitMs / 1000}s… (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        // Non-retryable error
        const errBody = await response.text().catch(() => "");
        throw new Error(`Gemini API error (${response.status}): ${errBody.slice(0, 200)}`);
      } catch (err: any) {
        // Network errors are retryable
        if (err.name === "TypeError" && attempt < maxRetries - 1) {
          const waitMs = 1000 * Math.pow(2, attempt);
          onProgress?.(`Network error, retrying in ${waitMs / 1000}s…`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        // If it's our thrown error (non-retryable), or last attempt, propagate
        if (err.message?.includes("Gemini API error")) throw err;
        if (attempt === maxRetries - 1 && model === GEMINI_FALLBACK_MODEL) throw err;
      }
    }
    // If primary model exhausted retries, try fallback
    if (model === GEMINI_MODEL) {
      onProgress?.(`Switching to fallback model (${GEMINI_FALLBACK_MODEL})…`);
    }
  }

  throw new Error("All Gemini models are currently unavailable. Please try again in a few minutes.");
}

/**
 * Upload a PDF and get structured form data back via Gemini.
 */
export async function parsePdf(
  file: File,
  formType: "jnf" | "inf",
  onProgress?: (stage: string) => void
): Promise<ParsePdfResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local and restart the dev server.");
  }

  onProgress?.("Uploading PDF…");

  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  onProgress?.("Analyzing document with AI…");

  const prompt = formType === "inf" ? buildInfPrompt() : buildJnfPrompt();

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "application/pdf",
              data: base64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      responseMimeType: "application/json",
    },
  };

  const body = await callGeminiWithRetry(requestBody, onProgress);

  onProgress?.("Mapping fields to form…");

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("AI returned malformed JSON. Please try a different PDF.");
  }

  return {
    success: true,
    data: parsed,
    meta: {
      provider: "gemini",
      filename: file.name,
      parsed_at: new Date().toISOString(),
    },
  };
}

// ── JNF Prompt ─────────────────────────────────────────────────────
function buildJnfPrompt(): string {
  return `You are an expert data extraction assistant for IIT (ISM) Dhanbad's Career Development Centre.

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

ADDITIONAL SALARY COMPONENTS:
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

DYNAMIC ROUNDS (important — extract ALL rounds mentioned):
- test_rounds: array of test rounds with { name, duration, type } e.g. [{ "name": "Aptitude Test", "duration": "60 mins", "type": "MCQ" }]
- interview_rounds: array of interview rounds with { name, duration, mode } e.g. [{ "name": "Technical Interview", "duration": "45 mins", "mode": "In-Person" }]
- psychometric_test: boolean — whether psychometric/personality test is mentioned
- medical_test: boolean — whether medical/health test is mentioned
- other_screening: string — any other screening steps mentioned
- infrastructure: string — infrastructure/facility requirements for selection process

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
    "interview_modes": [],
    "test_rounds": [],
    "interview_rounds": [],
    "psychometric_test": null,
    "medical_test": null,
    "other_screening": null,
    "infrastructure": null
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
8. For test_rounds and interview_rounds: extract every single round mentioned with as much detail as possible
9. If multiple job profiles or roles are mentioned, extract the primary one`;
}

// ── INF Prompt ─────────────────────────────────────────────────────
function buildInfPrompt(): string {
  return `You are an expert data extraction assistant for IIT (ISM) Dhanbad's Career Development Centre.

TASK: Extract ALL relevant information from this recruiter PDF and map it to the INF (Internship Notification Form) fields below.

FIELD MAPPING GUIDE:
- "company name" / "organization" → company_name
- "website" / "URL" → website
- "address" / "postal" → postal_address
- "sector" / "industry" → sector
- "category" / "org type" → category
- "established" / "founded" → date_of_establishment
- "turnover" / "revenue" → annual_turnover
- "nature of business" / "business type" → nature_of_business
- "description" / "about organization" → description
- "industry sectors" / "verticals" → industry_sectors (array)

CONTACTS:
- "Head HR" / "HR Lead" → head_hr (object: name, designation, email, phone, landline)
- "primary contact" / "POC 1" → poc1 (same structure)
- "secondary contact" / "POC 2" → poc2 (same structure)

INTERNSHIP DETAILS:
- "internship title" / "role" / "position" → profile_name
- "formal designation" / "official title" → formal_title
- "location" / "posting" / "city" → location
- "work mode" / "remote" / "on-site" / "hybrid" → work_mode (one of: "On-site", "Remote", "Hybrid")
- "interns" / "vacancies" / "positions" → expected_interns
- "minimum interns" → min_interns
- "start date" → start_date (YYYY-MM-DD)
- "duration" / "weeks" / "months" → duration_weeks
- "description" / "JD" / "responsibilities" → description
- "additional info" → additional_info
- "bond" / "lock-in" → bond_details
- "registration link" → registration_link
- "PPO" / "pre-placement offer" → ppo_provision (boolean)
- "PPO CTC" / "full-time salary" → ppo_ctc
- "skills" / "requirements" → required_skills (array)

STIPEND:
- "monthly stipend" / "monthly compensation" → monthly
- "fixed" / "base" → base
- "take home" / "in hand" → takehome
- "currency" / "INR" / "USD" → currency

ELIGIBILITY:
- "CGPA" / "GPA" / "cutoff" → globalCgpa
- "backlogs" / "arrears" → globalBacklogs (boolean)
- "eligible branches" → eligible_branches
- "eligible degrees" → eligible_degrees

SELECTION PROCESS:
- "PPT" / "pre-placement talk" → pre_placement_talk (boolean)
- "resume shortlisting" → resume_shortlisting (boolean)
- "online test" / "written test" → online_written_test (boolean)
- "group discussion" → group_discussion (boolean)
- "interview" → personal_tech_interview (boolean)
- "selection mode" / "campus virtual" → selection_mode
- "test type" → test_type
- "interview mode" / "video in-person" → interview_modes (array)
- "test rounds" / "interview rounds" → extract as objects with name, duration, type/mode

RESPOND WITH THIS EXACT JSON STRUCTURE (use null for missing fields):

{
  "company": {
    "company_name": null, "website": null, "postal_address": null, "employees": null,
    "sector": null, "category": null, "date_of_establishment": null,
    "annual_turnover": null, "linkedin": null, "hq_country": null,
    "nature_of_business": null, "description": null
  },
  "industry_sectors": [],
  "contacts": {
    "head_hr": { "name": null, "designation": null, "email": null, "phone": null, "landline": null },
    "poc1":    { "name": null, "designation": null, "email": null, "phone": null, "landline": null },
    "poc2":    { "name": null, "designation": null, "email": null, "phone": null, "landline": null }
  },
  "internship": {
    "profile_name": null, "formal_title": null, "location": null, "work_mode": null,
    "expected_interns": null, "min_interns": null, "start_date": null,
    "duration_weeks": null, "description": null, "additional_info": null,
    "bond_details": null, "registration_link": null, "ppo_provision": null, "ppo_ctc": null
  },
  "required_skills": [],
  "eligibility": { "globalCgpa": null, "globalBacklogs": null, "eligible_branches": [], "eligible_degrees": [] },
  "stipend": {
    "currency": "INR",
    "programmes": { "All": { "monthly": null, "base": null, "takehome": null } },
    "additional": { "joining_bonus": null, "retention_bonus": null, "accommodation": null, "relocation": null }
  },
  "selection": {
    "pre_placement_talk": null, "resume_shortlisting": null, "online_written_test": null,
    "group_discussion": null, "personal_tech_interview": null, "selection_mode": null,
    "test_type": null, "interview_modes": [], "test_rounds": [], "interview_rounds": [],
    "psychometric_test": null, "medical_test": null, "infrastructure": null, "other_screening": null
  },
  "confidence_scores": { "company": 0, "contacts": 0, "internship": 0, "eligibility": 0, "stipend": 0, "selection": 0 }
}`;
}

/**
 * Apply parsed JNF data to form state setters.
 * Returns a list of field keys that were auto-filled.
 * Now also handles dynamic rounds (test_rounds, interview_rounds) and
 * automatically triggers "add" functionality.
 */
export function applyJnfParsedData(
  data: JnfParsedData,
  setters: {
    setCompany: (fn: (prev: any) => any) => void;
    setIndustrySectors: (v: string[]) => void;
    setHeadTA: (fn: (prev: any) => any) => void;
    setPoc1: (fn: (prev: any) => any) => void;
    setPoc2: (fn: (prev: any) => any) => void;
    setJob: (fn: (prev: any) => any) => void;
    setSkills: (v: string[]) => void;
    setGlobalCgpa: (v: string) => void;
    setGlobalBacklogs: (v: boolean) => void;
    setCurrency: (v: string) => void;
    setSalary: (fn: (prev: any) => any) => void;
    setStages: (fn: (prev: any) => any) => void;
    setSelectionMode: (v: string) => void;
    setTestType: (v: string) => void;
    setInterviewModes: (v: string[]) => void;
    // Dynamic round setters
    setTestRounds?: (v: any[]) => void;
    setInterviewRounds?: (v: any[]) => void;
    setPsychometricTest?: (v: boolean) => void;
    setMedicalTest?: (v: boolean) => void;
    setOtherScreening?: (v: string) => void;
    setInfrastructure?: (v: string) => void;
  }
): string[] {
  const filledFields: string[] = [];

  // ── Company ────────────────────────────────────────────────────
  if (data.company) {
    setters.setCompany((prev: any) => {
      const updated = { ...prev };
      Object.entries(data.company).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          updated[key] = String(value);
          filledFields.push(`company.${key}`);
        }
      });
      return updated;
    });
  }

  if (data.industry_sectors?.length) {
    setters.setIndustrySectors(data.industry_sectors);
    filledFields.push("industry_sectors");
  }

  // ── Contacts ───────────────────────────────────────────────────
  const applyContact = (
    parsed: typeof data.contacts.head_ta,
    setter: typeof setters.setHeadTA,
    prefix: string
  ) => {
    if (!parsed) return;
    setter((prev: any) => {
      const updated = { ...prev };
      Object.entries(parsed).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          updated[key] = String(value);
          filledFields.push(`${prefix}.${key}`);
        }
      });
      return updated;
    });
  };

  if (data.contacts) {
    applyContact(data.contacts.head_ta, setters.setHeadTA, "head_ta");
    applyContact(data.contacts.poc1, setters.setPoc1, "poc1");
    applyContact(data.contacts.poc2, setters.setPoc2, "poc2");
  }

  // ── Job Details ────────────────────────────────────────────────
  if (data.job) {
    setters.setJob((prev: any) => {
      const updated = { ...prev };
      Object.entries(data.job).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          updated[key] = String(value);
          filledFields.push(`job.${key}`);
        }
      });
      return updated;
    });
  }

  if (data.required_skills?.length) {
    setters.setSkills(data.required_skills);
    filledFields.push("required_skills");
  }

  // ── Eligibility ────────────────────────────────────────────────
  if (data.eligibility) {
    if (data.eligibility.globalCgpa) {
      setters.setGlobalCgpa(String(data.eligibility.globalCgpa));
      filledFields.push("eligibility.globalCgpa");
    }
    if (data.eligibility.globalBacklogs !== null) {
      setters.setGlobalBacklogs(data.eligibility.globalBacklogs);
      filledFields.push("eligibility.globalBacklogs");
    }
  }

  // ── Salary ─────────────────────────────────────────────────────
  if (data.salary) {
    if (data.salary.currency) {
      setters.setCurrency(data.salary.currency);
      filledFields.push("salary.currency");
    }

    if (data.salary.programmes) {
      setters.setSalary((prev: any) => {
        const updated = { ...prev };
        Object.entries(data.salary.programmes).forEach(([prog, vals]) => {
          if (updated[prog]) {
            Object.entries(vals).forEach(([k, v]) => {
              if (v !== null && v !== undefined && v !== "") {
                updated[prog][k] = String(v);
                filledFields.push(`salary.${prog}.${k}`);
              }
            });
          }
        });
        return updated;
      });
    }
  }

  // ── Selection Process ──────────────────────────────────────────
  if (data.selection) {
    const stageKeys = [
      "pre_placement_talk",
      "resume_shortlisting",
      "online_written_test",
      "group_discussion",
      "personal_tech_interview",
    ] as const;

    setters.setStages((prev: any) => {
      const updated = { ...prev };
      stageKeys.forEach((key) => {
        const val = data.selection[key];
        if (val !== null && val !== undefined) {
          updated[key] = Boolean(val);
          filledFields.push(`selection.${key}`);
        }
      });
      return updated;
    });

    if (data.selection.selection_mode) {
      setters.setSelectionMode(data.selection.selection_mode);
      filledFields.push("selection.selection_mode");
    }
    if (data.selection.test_type) {
      setters.setTestType(data.selection.test_type);
      filledFields.push("selection.test_type");
    }
    if (data.selection.interview_modes?.length) {
      setters.setInterviewModes(data.selection.interview_modes);
      filledFields.push("selection.interview_modes");
    }

    // ── Dynamic Rounds: AI auto-adds rows ──────────────────────
    // Test rounds — automatically populate from AI data
    if (data.selection.test_rounds?.length && setters.setTestRounds) {
      const rounds = data.selection.test_rounds.map((r) => ({
        name: r.name || "",
        duration: r.duration || "",
        type: r.type || "",
      }));
      setters.setTestRounds(rounds);
      filledFields.push("selection.test_rounds");
    }

    // Interview rounds — automatically populate from AI data
    if (data.selection.interview_rounds?.length && setters.setInterviewRounds) {
      const rounds = data.selection.interview_rounds.map((r) => ({
        name: r.name || "",
        duration: r.duration || "",
        mode: r.mode || "",
      }));
      setters.setInterviewRounds(rounds);
      filledFields.push("selection.interview_rounds");
    }

    // Additional selection fields
    if (data.selection.psychometric_test !== null && data.selection.psychometric_test !== undefined && setters.setPsychometricTest) {
      setters.setPsychometricTest(Boolean(data.selection.psychometric_test));
      filledFields.push("selection.psychometric_test");
    }
    if (data.selection.medical_test !== null && data.selection.medical_test !== undefined && setters.setMedicalTest) {
      setters.setMedicalTest(Boolean(data.selection.medical_test));
      filledFields.push("selection.medical_test");
    }
    if (data.selection.other_screening && setters.setOtherScreening) {
      setters.setOtherScreening(String(data.selection.other_screening));
      filledFields.push("selection.other_screening");
    }
    if (data.selection.infrastructure && setters.setInfrastructure) {
      setters.setInfrastructure(String(data.selection.infrastructure));
      filledFields.push("selection.infrastructure");
    }
  }

  return filledFields;
}

/**
 * Apply parsed INF data to INF form state.
 * Returns a list of field keys that were auto-filled.
 */
export function applyInfParsedData(
  data: InfParsedData,
  setters: {
    setCompany: (fn: (prev: any) => any) => void;
    setIndustrySectors: (v: string[]) => void;
    setHeadHR: (fn: (prev: any) => any) => void;
    setPoc1: (fn: (prev: any) => any) => void;
    setPoc2: (fn: (prev: any) => any) => void;
    setInternship: (fn: (prev: any) => any) => void;
    setSkills: (v: string[]) => void;
    setGlobalCgpa: (v: string) => void;
    setGlobalBacklogs: (v: boolean) => void;
    setCurrency: (v: string) => void;
    setStipend: (fn: (prev: any) => any) => void;
    setStages: (fn: (prev: any) => any) => void;
    setSelectionMode: (v: string) => void;
    setTestType: (v: string) => void;
    setInterviewModes: (v: string[]) => void;
    // Dynamic round setters
    setTestRounds?: (v: any[]) => void;
    setInterviewRounds?: (v: any[]) => void;
    setPsychometricTest?: (v: boolean) => void;
    setMedicalTest?: (v: boolean) => void;
    setOtherScreening?: (v: string) => void;
    setInfrastructure?: (v: string) => void;
  }
): string[] {
  const filledFields: string[] = [];

  // ── Company ────────────────────────────────────────────────────
  if (data.company) {
    setters.setCompany((prev: any) => {
      const updated = { ...prev };
      Object.entries(data.company).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          updated[key] = String(value);
          filledFields.push(`company.${key}`);
        }
      });
      return updated;
    });
  }

  if (data.industry_sectors?.length) {
    setters.setIndustrySectors(data.industry_sectors);
    filledFields.push("industry_sectors");
  }

  // ── Contacts ───────────────────────────────────────────────────
  const applyContact = (parsed: any, setter: any, prefix: string) => {
    if (!parsed) return;
    setter((prev: any) => {
      const updated = { ...prev };
      Object.entries(parsed).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          updated[key] = String(value);
          filledFields.push(`${prefix}.${key}`);
        }
      });
      return updated;
    });
  };

  if (data.contacts) {
    applyContact(data.contacts.head_hr, setters.setHeadHR, "head_hr");
    applyContact(data.contacts.poc1, setters.setPoc1, "poc1");
    applyContact(data.contacts.poc2, setters.setPoc2, "poc2");
  }

  // ── Internship Profile ─────────────────────────────────────────
  if (data.internship) {
    setters.setInternship((prev: any) => {
      const updated = { ...prev };
      Object.entries(data.internship).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "ppo_provision") updated[key] = Boolean(value);
          else updated[key] = String(value);
          filledFields.push(`internship.${key}`);
        }
      });
      return updated;
    });
  }

  if (data.required_skills?.length) {
    setters.setSkills(data.required_skills);
    filledFields.push("required_skills");
  }

  // ── Eligibility ────────────────────────────────────────────────
  if (data.eligibility) {
    if (data.eligibility.globalCgpa) {
      setters.setGlobalCgpa(String(data.eligibility.globalCgpa));
      filledFields.push("eligibility.globalCgpa");
    }
    if (data.eligibility.globalBacklogs !== null) {
      setters.setGlobalBacklogs(data.eligibility.globalBacklogs);
      filledFields.push("eligibility.globalBacklogs");
    }
  }

  // ── Stipend ────────────────────────────────────────────────────
  if (data.stipend) {
    if (data.stipend.currency) {
      setters.setCurrency(data.stipend.currency);
      filledFields.push("stipend.currency");
    }

    if (data.stipend.programmes) {
      setters.setStipend((prev: any) => {
        const updated = { ...prev };
        // If AI returned "All", apply to all programmes
        if (data.stipend.programmes["All"]) {
          const vals = data.stipend.programmes["All"];
          Object.keys(updated).forEach((p) => {
            Object.entries(vals).forEach(([k, v]) => {
              if (v !== null && v !== "") {
                updated[p][k] = String(v);
                filledFields.push(`stipend.${p}.${k}`);
              }
            });
          });
        }
        return updated;
      });
    }
  }

  // ── Selection Process ──────────────────────────────────────────
  if (data.selection) {
    const stageKeys = [
      "pre_placement_talk",
      "resume_shortlisting",
      "online_written_test",
      "group_discussion",
      "personal_tech_interview",
    ] as const;
    setters.setStages((prev: any) => {
      const updated = { ...prev };
      stageKeys.forEach((key) => {
        const val = (data.selection as any)[key];
        if (val !== null && val !== undefined) {
          updated[key === "pre_placement_talk" ? "ppt" : key] = Boolean(val);
          filledFields.push(`selection.${key}`);
        }
      });
      return updated;
    });

    if (data.selection.selection_mode) {
      setters.setSelectionMode(data.selection.selection_mode);
      filledFields.push("selection.selection_mode");
    }
    if (data.selection.test_type) {
      setters.setTestType(data.selection.test_type);
      filledFields.push("selection.test_type");
    }
    if (data.selection.interview_modes?.length) {
      setters.setInterviewModes(data.selection.interview_modes);
      filledFields.push("selection.interview_modes");
    }

    // Dynamic Rounds
    if (data.selection.test_rounds?.length && setters.setTestRounds) {
      setters.setTestRounds(
        data.selection.test_rounds.map((r) => ({ name: r.name || "", duration: r.duration || "", type: r.type || "" }))
      );
      filledFields.push("selection.test_rounds");
    }
    if (data.selection.interview_rounds?.length && setters.setInterviewRounds) {
      setters.setInterviewRounds(
        data.selection.interview_rounds.map((r) => ({ name: r.name || "", duration: r.duration || "", mode: r.mode || "" }))
      );
      filledFields.push("selection.interview_rounds");
    }

    if (data.selection.psychometric_test !== null && setters.setPsychometricTest) {
      setters.setPsychometricTest(Boolean(data.selection.psychometric_test));
      filledFields.push("selection.psychometric_test");
    }
    if (data.selection.medical_test !== null && setters.setMedicalTest) {
      setters.setMedicalTest(Boolean(data.selection.medical_test));
      filledFields.push("selection.medical_test");
    }
    if (data.selection.other_screening && setters.setOtherScreening) {
      setters.setOtherScreening(String(data.selection.other_screening));
      filledFields.push("selection.other_screening");
    }
    if (data.selection.infrastructure && setters.setInfrastructure) {
      setters.setInfrastructure(String(data.selection.infrastructure));
      filledFields.push("selection.infrastructure");
    }
  }

  return filledFields;
}
