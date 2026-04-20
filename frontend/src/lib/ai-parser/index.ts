/**
 * AI Parser — API Client
 *
 * Calls the backend /api/parse-pdf endpoint.
 * The backend handles the actual AI provider logic (Gemini/Qwen/etc.),
 * so the frontend doesn't need to know which provider is active.
 *
 * Switching providers requires ZERO frontend changes.
 */

import type { ParsePdfResponse, JnfParsedData, InfParsedData } from "./types";

const API_BASE = "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("local_token")
    || localStorage.getItem("admin_token")
    || localStorage.getItem("auth_token")
    || null;
}

/**
 * Upload a PDF and get structured form data back.
 */
export async function parsePdf(
  file: File,
  formType: "jnf" | "inf",
  onProgress?: (stage: string) => void
): Promise<ParsePdfResponse> {
  onProgress?.("Uploading PDF…");

  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("form_type", formType);

  onProgress?.("Analyzing document with AI…");

  const response = await fetch(`${API_BASE}/parse-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(err.message || `Server error: ${response.status}`);
  }

  onProgress?.("Mapping fields to form…");

  const result: ParsePdfResponse = await response.json();

  if (!result.success) {
    throw new Error("AI parsing returned unsuccessful result");
  }

  return result;
}

/**
 * Apply parsed JNF data to form state setters.
 * Returns a list of field keys that were auto-filled.
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
  }

  return filledFields;
}

/**
 * Apply parsed INF data to INF form state.
 * Returns a list of field keys that were auto-filled.
 */
export function applyInfParsedData(
  data: InfParsedData,
  setFormData: (fn: (prev: any) => any) => void
): string[] {
  const filledFields: string[] = [];

  setFormData((prev: any) => {
    const updated = { ...prev };

    const stringFields = [
      "company_name", "website", "postal_address", "sector", "category",
      "primary_contact_name", "primary_contact_designation",
      "primary_contact_email", "primary_contact_phone",
      "internship_designation", "internship_description",
      "place_of_posting", "duration_weeks", "monthly_stipend", "ppo_ctc",
      "min_cutoff_cgpa",
    ] as const;

    stringFields.forEach((key) => {
      const value = data[key];
      if (value !== null && value !== undefined && value !== "") {
        updated[key] = String(value);
        filledFields.push(key);
      }
    });

    // Booleans
    if (data.ppo_provision !== null) {
      updated.ppo_provision = Boolean(data.ppo_provision);
      filledFields.push("ppo_provision");
    }
    if (data.selection_ppt !== null) {
      updated.selection_ppt = Boolean(data.selection_ppt);
      filledFields.push("selection_ppt");
    }

    // Arrays
    if (data.eligible_degrees?.length) {
      updated.eligible_degrees = data.eligible_degrees;
      filledFields.push("eligible_degrees");
    }
    if (data.eligible_departments?.length) {
      updated.eligible_departments = data.eligible_departments;
      filledFields.push("eligible_departments");
    }

    return updated;
  });

  return filledFields;
}
