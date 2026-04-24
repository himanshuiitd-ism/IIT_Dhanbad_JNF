/**
 * AI Parser — Type definitions
 *
 * Provider-agnostic types for the PDF parsing feature.
 * These types define the shape of data flowing between
 * the PDF upload → AI extraction → form auto-fill pipeline.
 *
 * When switching from Gemini to Qwen, these types stay the same.
 */

// ── JNF Parsed Data Structure ────────────────────────────────────
export interface JnfParsedData {
  company: {
    company_name: string | null;
    website: string | null;
    postal_address: string | null;
    employees: string | null;
    sector: string | null;
    category: string | null;
    date_of_establishment: string | null;
    annual_turnover: string | null;
    linkedin: string | null;
    hq_country: string | null;
    nature_of_business: string | null;
    description: string | null;
  };
  industry_sectors: string[];
  contacts: {
    head_ta: ContactParsed;
    poc1: ContactParsed;
    poc2: ContactParsed;
  };
  job: {
    job_title: string | null;
    job_formal_designation: string | null;
    place_of_posting: string | null;
    work_mode: string | null;
    expected_hires: string | null;
    min_hires: string | null;
    joining_month: string | null;
    job_description: string | null;
    additional_info: string | null;
    bond_details: string | null;
    registration_link: string | null;
    onboarding: string | null;
  };
  required_skills: string[];
  eligibility: {
    globalCgpa: string | null;
    globalBacklogs: boolean | null;
    eligible_branches: string[];
    eligible_degrees: string[];
  };
  salary: {
    currency: string;
    programmes: Record<string, { ctc: string | null; base: string | null; inhand: string | null }>;
    additional: {
      joining_bonus: string | null;
      retention_bonus: string | null;
      bond_deductions: string | null;
      esops: string | null;
      relocation: string | null;
    };
  };
  selection: {
    pre_placement_talk: boolean | null;
    resume_shortlisting: boolean | null;
    online_written_test: boolean | null;
    group_discussion: boolean | null;
    personal_tech_interview: boolean | null;
    selection_mode: string | null;
    test_type: string | null;
    interview_modes: string[];
    test_rounds: Array<{ name: string; duration: string; type: string }>;
    interview_rounds: Array<{ name: string; duration: string; mode: string }>;
    psychometric_test: boolean | null;
    medical_test: boolean | null;
    infrastructure: string | null;
    other_screening: string | null;
  };
  confidence_scores: Record<string, number>;
}

export interface ContactParsed {
  name: string | null;
  designation: string | null;
  email: string | null;
  phone: string | null;
  landline: string | null;
}

// ── INF Parsed Data Structure ────────────────────────────────────
export interface InfParsedData {
  company: {
    company_name: string | null;
    website: string | null;
    postal_address: string | null;
    employees: string | null;
    sector: string | null;
    category: string | null;
    date_of_establishment: string | null;
    annual_turnover: string | null;
    linkedin: string | null;
    hq_country: string | null;
    nature_of_business: string | null;
    description: string | null;
  };
  industry_sectors: string[];
  contacts: {
    head_hr: ContactParsed;
    poc1: ContactParsed;
    poc2: ContactParsed;
  };
  internship: {
    profile_name: string | null;
    formal_title: string | null;
    location: string | null;
    work_mode: string | null;
    expected_interns: string | null;
    min_interns: string | null;
    start_date: string | null;
    duration_weeks: string | null;
    description: string | null;
    additional_info: string | null;
    bond_details: string | null;
    registration_link: string | null;
    ppo_provision: boolean | null;
    ppo_ctc: string | null;
  };
  required_skills: string[];
  eligibility: {
    globalCgpa: string | null;
    globalBacklogs: boolean | null;
    eligible_branches: string[];
    eligible_degrees: string[];
  };
  stipend: {
    currency: string;
    programmes: Record<string, { monthly: string | null; base: string | null; takehome: string | null }>;
    additional: {
      joining_bonus: string | null;
      retention_bonus: string | null;
      accommodation: string | null;
      relocation: string | null;
    };
  };
  selection: {
    pre_placement_talk: boolean | null;
    resume_shortlisting: boolean | null;
    online_written_test: boolean | null;
    group_discussion: boolean | null;
    personal_tech_interview: boolean | null;
    selection_mode: string | null;
    test_type: string | null;
    interview_modes: string[];
    test_rounds: Array<{ name: string; duration: string; type: string }>;
    interview_rounds: Array<{ name: string; duration: string; mode: string }>;
    psychometric_test: boolean | null;
    medical_test: boolean | null;
    infrastructure: string | null;
    other_screening: string | null;
  };
  confidence_scores: Record<string, number>;
}

// ── API Response ─────────────────────────────────────────────────
export interface ParsePdfResponse<T = JnfParsedData | InfParsedData> {
  success: boolean;
  data: T;
  meta: {
    provider: string;
    filename: string;
    parsed_at: string;
  };
}

// ── Form Tracker Types ───────────────────────────────────────────
export type FieldStatus = "filled" | "empty" | "partial";

export interface TrackerField {
  key: string;
  label: string;
  status: FieldStatus;
  autoFilled?: boolean;  // Was this filled by AI?
}

export interface TrackerSection {
  stepIndex: number;
  stepName: string;
  fields: TrackerField[];
  filledCount: number;
  totalCount: number;
  percentage: number;
}
