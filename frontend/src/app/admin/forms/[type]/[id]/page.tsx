"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box, Typography, Paper, Grid, Chip, Button,
  Divider, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert,
  Avatar, IconButton, Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import axios from "axios";

const MAROON = "#7B0000";
const DEEP_RED = "#4A0000";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  SUBMITTED: { bg: "#DBEAFE", color: "#1D4ED8" },
  APPROVED:  { bg: "#D1FAE5", color: "#065F46" },
  REJECTED:  { bg: "#FEE2E2", color: "#991B1B" },
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  LIVE:      { bg: "#ECFDF5", color: "#059669" },
  DRAFT:     { bg: "#F3F4F6", color: "#6B7280" },
};
const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status?.toUpperCase()] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.4, borderRadius: 10, bgcolor: s.bg }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.color }} />
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: s.color, textTransform: "uppercase" }}>{status}</Typography>
    </Box>
  );
};

// Fields to always hide (system/meta)
const SKIP_FIELDS = new Set([
  "id","user_id","created_at","updated_at","user","status","edit_count",
  "submitted_at","logo_path","brochure_path","jd_pdf_path",
]);

// ── Grouped field definitions ──────────────────────────────────────────
const JNF_SECTIONS: Array<{ title: string; fields: Array<{ key: string; label: string }> }> = [
  {
    title: "🏢 Company Information",
    fields: [
      { key: "company_name",        label: "Company Name" },
      { key: "sector",              label: "Sector" },
      { key: "nature_of_business",  label: "Nature of Business" },
      { key: "employees",           label: "Employees" },
      { key: "annual_turnover",     label: "Annual Turnover" },
      { key: "date_of_establishment", label: "Established" },
      { key: "hq_country",          label: "HQ Country" },
      { key: "industry_sectors",    label: "Industry Sectors" },
      { key: "website",             label: "Website" },
      { key: "linkedin",            label: "LinkedIn" },
      { key: "postal_address",      label: "Postal Address" },
      { key: "description",         label: "About Company" },
      { key: "category",            label: "Category" },
    ],
  },
  {
    title: "📞 Contact Details",
    fields: [
      { key: "head_ta",  label: "Head TA" },
      { key: "poc1",     label: "Point of Contact 1" },
      { key: "poc2",     label: "Point of Contact 2" },
    ],
  },
  {
    title: "💼 Job Profile",
    fields: [
      { key: "job_title",             label: "Job Title" },
      { key: "job_formal_designation",label: "Formal Designation" },
      { key: "job_designation",       label: "Designation" },
      { key: "job_description",       label: "Job Description" },
      { key: "job_type",              label: "Job Type" },
      { key: "work_mode",             label: "Work Mode" },
      { key: "place_of_posting",      label: "Place of Posting" },
      { key: "expected_hires",        label: "Expected Hires" },
      { key: "min_hires",             label: "Minimum Hires" },
      { key: "joining_month",         label: "Joining Month" },
      { key: "onboarding",            label: "Onboarding" },
      { key: "registration_link",     label: "Registration Link" },
      { key: "required_skills",       label: "Required Skills" },
      { key: "additional_info",       label: "Additional Info" },
      { key: "bond_details",          label: "Bond / Service Agreement" },
    ],
  },
  {
    title: "🎓 Eligibility Criteria",
    fields: [
      { key: "eligibility",           label: "Eligible Courses & Branches" },
      { key: "eligible_courses",      label: "Eligible Courses" },
      { key: "eligible_branches",     label: "Eligible Branches" },
      { key: "min_cgpa",              label: "Minimum CGPA" },
    ],
  },
  {
    title: "💰 Compensation & Benefits",
    fields: [
      { key: "currency",              label: "Currency" },
      { key: "salary",                label: "Salary Breakdown" },
      { key: "additional_salary",     label: "Additional Compensation" },
      { key: "ctc",                   label: "CTC" },
      { key: "stipend",               label: "Stipend" },
    ],
  },
  {
    title: "📋 Selection Process",
    fields: [
      { key: "selection_stages",      label: "Selection Stages" },
      { key: "selection_mode",        label: "Selection Mode" },
      { key: "test_rounds",           label: "Test Rounds" },
      { key: "test_type",             label: "Test Type" },
      { key: "interview_rounds",      label: "Interview Rounds" },
      { key: "interview_modes",       label: "Interview Modes" },
      { key: "psychometric_test",     label: "Psychometric Test Required" },
      { key: "medical_test",          label: "Medical Test Required" },
      { key: "infrastructure",        label: "Infrastructure Requirements" },
      { key: "other_screening",       label: "Other Screening" },
    ],
  },
  {
    title: "✍️ Declaration & Signature",
    fields: [
      { key: "signatory_name",        label: "Signatory Name" },
      { key: "signatory_designation", label: "Signatory Designation" },
      { key: "signatory_date",        label: "Signatory Date" },
      { key: "typed_signature",       label: "Digital Signature" },
      { key: "rti_nirf_consent",      label: "RTI / NIRF Consent" },
      { key: "declarations",          label: "Declarations" },
    ],
  },
];

const INF_SECTIONS: typeof JNF_SECTIONS = [
  {
    title: "🏢 Company Information",
    fields: [
      { key: "company_name",        label: "Company Name" },
      { key: "sector",              label: "Sector" },
      { key: "nature_of_business",  label: "Nature of Business" },
      { key: "employees",           label: "Employees" },
      { key: "annual_turnover",     label: "Annual Turnover" },
      { key: "date_of_establishment", label: "Established" },
      { key: "hq_country",          label: "HQ Country" },
      { key: "industry_sectors",    label: "Industry Sectors" },
      { key: "website",             label: "Website" },
      { key: "linkedin",            label: "LinkedIn" },
      { key: "postal_address",      label: "Postal Address" },
      { key: "description",         label: "About Company" },
      { key: "category",            label: "Category" },
    ],
  },
  {
    title: "📞 Contact Details",
    fields: [
      { key: "primary_contact_name",        label: "Primary Contact" },
      { key: "primary_contact_designation", label: "Designation" },
      { key: "primary_contact_email",       label: "Email" },
      { key: "primary_contact_phone",       label: "Phone" },
      { key: "head_hr",                     label: "Head HR" },
      { key: "poc1",                        label: "Point of Contact 1" },
      { key: "poc2",                        label: "Point of Contact 2" },
    ],
  },
  {
    title: "💼 Internship Profile",
    fields: [
      { key: "internship_designation",  label: "Internship Designation" },
      { key: "profile_name",            label: "Profile Name" },
      { key: "formal_title",            label: "Formal Title" },
      { key: "internship_description",  label: "Description" },
      { key: "work_mode",               label: "Work Mode" },
      { key: "place_of_posting",        label: "Place of Posting" },
      { key: "duration_weeks",          label: "Duration (Weeks)" },
      { key: "expected_interns",        label: "Expected Interns" },
      { key: "min_interns",             label: "Minimum Interns" },
      { key: "start_date",              label: "Start Date" },
      { key: "required_skills",         label: "Required Skills" },
      { key: "additional_info",         label: "Additional Info" },
      { key: "bond_details",            label: "Bond Details" },
      { key: "registration_link",       label: "Registration Link" },
    ],
  },
  {
    title: "🎓 Eligibility Criteria",
    fields: [
      { key: "eligibility",           label: "Eligible Courses (JSON)" },
      { key: "eligible_degrees",      label: "Eligible Degrees" },
      { key: "eligible_departments",  label: "Eligible Departments" },
      { key: "min_cutoff_cgpa",       label: "Min CGPA" },
      { key: "global_cgpa",           label: "Global CGPA" },
      { key: "global_backlogs",       label: "Allow Backlogs" },
      { key: "gender_filter",          label: "Gender Filter" },
    ],
  },
  {
    title: "💰 Stipend & Compensation",
    fields: [
      { key: "currency",              label: "Currency" },
      { key: "monthly_stipend",       label: "Monthly Stipend" },
      { key: "stipend",               label: "Stipend Details (JSON)" },
      { key: "per_prog_additional",   label: "Additional Perks" },
      { key: "ppo_provision",         label: "PPO Provision" },
      { key: "ppo_ctc",               label: "PPO CTC (if any)" },
    ],
  },
  {
    title: "📋 Selection Process",
    fields: [
      { key: "selection_ppt",         label: "Pre-Placement Talk" },
      { key: "selection_stages",      label: "Selection Stages" },
      { key: "selection_mode",        label: "Selection Mode" },
      { key: "test_type",             label: "Test Type" },
      { key: "interview_modes",       label: "Interview Modes" },
      { key: "test_rounds",           label: "Test Rounds" },
      { key: "interview_rounds",      label: "Interview Rounds" },
      { key: "psychometric_test",     label: "Psychometric Test" },
      { key: "medical_test",          label: "Medical Test" },
      { key: "infrastructure",        label: "Infrastructure" },
      { key: "other_screening",       label: "Other Screening" },
    ],
  },
  {
    title: "✍️ Declaration & Signature",
    fields: [
      { key: "signatory_name",        label: "Signatory Name" },
      { key: "signatory_designation", label: "Signatory Designation" },
      { key: "signatory_date",        label: "Signatory Date" },
      { key: "typed_signature",       label: "Digital Signature" },
      { key: "rti_nirf_consent",      label: "RTI / NIRF Consent" },
      { key: "declarations",          label: "Declarations" },
    ],
  },
];

// ── Smart value parser ─────────────────────────────────────────────────
function parseVal(raw: any): any {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    // Booleans stored as strings
    if (raw === "true" || raw === "1") return true;
    if (raw === "false" || raw === "0") return false;
    // Try JSON parse
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try { return JSON.parse(trimmed); } catch { /* not JSON */ }
    }
  }
  return raw;
}

// ── Smart value renderer ───────────────────────────────────────────────
function RenderValue({ value, label }: { value: any; label: string }) {
  const parsed = parseVal(value);

  // null / empty
  if (parsed === null || parsed === undefined || parsed === "") {
    return <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF", fontStyle: "italic" }}>—</Typography>;
  }

  // Boolean
  if (typeof parsed === "boolean") {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5,
        px: 1.2, py: 0.2, borderRadius: 10,
        bgcolor: parsed ? "#D1FAE5" : "#FEE2E2",
        color: parsed ? "#065F46" : "#991B1B", fontWeight: 700, fontSize: "0.75rem" }}>
        {parsed ? "✓ Yes" : "✗ No"}
      </Box>
    );
  }

  // Array
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>—</Typography>;
    // Array of objects (contacts, salary breakdown, etc.)
    if (typeof parsed[0] === "object" && parsed[0] !== null) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {parsed.map((item: any, i: number) => (
            <Box key={i} sx={{ p: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 1.5 }}>
              {Object.entries(item).map(([k, v]) => (
                String(v) && String(v) !== "" && v !== null ? (
                  <Box key={k} sx={{ display: "flex", gap: 1, mb: 0.3 }}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", minWidth: 90 }}>
                      {k.replace(/_/g, " ")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#374151" }}>{String(v)}</Typography>
                  </Box>
                ) : null
              ))}
            </Box>
          ))}
        </Box>
      );
    }
    // Array of primitives
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
        {parsed.map((item: any, i: number) => (
          <Box key={i} sx={{ px: 1.2, py: 0.2, bgcolor: "#F3F4F6", borderRadius: 1, border: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: "0.74rem", color: "#374151", fontWeight: 500 }}>
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  // Object (contacts, salary, etc.)
  if (typeof parsed === "object") {
    return (
      <Box sx={{ p: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 1.5 }}>
        {Object.entries(parsed).map(([k, v]) => (
          String(v) && v !== null ? (
            <Box key={k} sx={{ display: "flex", gap: 1, mb: 0.4 }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", minWidth: 100 }}>
                {k.replace(/_/g, " ")}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#374151", flex: 1 }}>
                {typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}
              </Typography>
            </Box>
          ) : null
        ))}
      </Box>
    );
  }

  // Date-ish string
  if (typeof parsed === "string" && /^\d{4}-\d{2}-\d{2}/.test(parsed)) {
    const d = new Date(parsed);
    if (!isNaN(d.getTime())) {
      return <Typography sx={{ fontSize: "0.82rem", color: "#1F2937" }}>
        {d.toLocaleDateString("en-IN", { dateStyle: "long" })}
      </Typography>;
    }
  }

  // URL
  if (typeof parsed === "string" && (parsed.startsWith("http://") || parsed.startsWith("https://"))) {
    return (
      <Typography component="a" href={parsed} target="_blank" rel="noopener noreferrer"
        sx={{ fontSize: "0.82rem", color: "#2563EB", wordBreak: "break-all", "&:hover": { textDecoration: "underline" } }}>
        {parsed}
      </Typography>
    );
  }

  // Plain string / number
  return (
    <Typography sx={{ fontSize: "0.82rem", color: "#1F2937", fontWeight: 500, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {String(parsed)}
    </Typography>
  );
}

type DialogMode = "approve" | "reject" | "edit_request" | "email" | null;

export default function AdminFormDetail() {
  const router = useRouter();
  const params = useParams();
  const type   = params.type as string;
  const id     = params.id as string;

  const [form, setForm]         = useState<any>(null);
  const [comms, setComms]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dlgMode, setDlgMode]   = useState<DialogMode>(null);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Admin edit mode ───────────────────────────────────────────────
  const [editMode, setEditMode]     = useState(false);
  const [editDraft, setEditDraft]   = useState<Record<string, any>>({});
  const [adminNote, setAdminNote]   = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("local_token") || ""}`,
  }), []);

  const fetchAll = useCallback(async () => {
    // Load form and comms independently — a failing comms should not kill the form view
    try {
      const formRes = await axios.get(
        `http://localhost:8000/api/admin/forms/${type}/${id}`,
        { headers: authHeaders() }
      );
      setForm(formRes.data);
    } catch {
      setForm(null);
    } finally {
      setLoading(false);
    }

    try {
      const commsRes = await axios.get(
        `http://localhost:8000/api/admin/forms/${type}/${id}/comms`,
        { headers: authHeaders() }
      );
      setComms(commsRes.data);
    } catch {
      setComms([]); // no comms yet — non-fatal
    }
  }, [type, id, authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusUpdate = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const status = dlgMode === "approve" ? "approved" : "rejected";
      await axios.patch(
        `http://localhost:8000/api/admin/forms/${type}/${id}`,
        { status, note: noteText },
        { headers: authHeaders() }
      );
      setAlertMsg({ type: "success", msg: `Form ${status} successfully. Recruiter has been notified.` });
      setDlgMode(null);
      setNoteText("");
      fetchAll();
    } catch (e: any) {
      setAlertMsg({ type: "error", msg: e.response?.data?.message || "Action failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminEdit = async () => {
    const changed: Record<string, any> = {};
    Object.keys(editDraft).forEach((k) => {
      if (editDraft[k] !== form[k]) changed[k] = editDraft[k];
    });
    if (Object.keys(changed).length === 0) {
      setEditMode(false);
      return;
    }
    setEditSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/admin/forms/${type}/${id}/edit`,
        { ...changed, admin_note: adminNote },
        { headers: { ...authHeaders(), "Content-Type": "application/json" } }
      );
      setForm(res.data.form);
      setAlertMsg({ type: "success", msg: "Form updated. Recruiter has been notified via notification and email." });
      setEditMode(false);
      setAdminNote("");
      fetchAll();
    } catch (e: any) {
      setAlertMsg({ type: "error", msg: e.response?.data?.message || "Failed to save edits." });
    } finally {
      setEditSaving(false);
    }
  };

  const handleCommunicate = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const isEmail = dlgMode === "email";
      await axios.post(
        "http://localhost:8000/api/admin/communicate",
        {
          user_id: form.user_id,
          type: isEmail ? "email" : "edit_request",
          title: isEmail
            ? "Message from CDC Admin re: your form"
            : "Admin has requested edits to your form",
          message: noteText,
          form_type: type,
          form_id: id,
          is_email: isEmail,
        },
        { headers: authHeaders() }
      );
      setAlertMsg({ type: "success", msg: isEmail ? "Email sent to recruiter." : "Edit request sent. Recruiter notified." });
      setDlgMode(null);
      setNoteText("");
      fetchAll();
    } catch (e: any) {
      setAlertMsg({ type: "error", msg: e.response?.data?.message || "Failed to send." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress sx={{ color: MAROON }} /></Box>;
  if (!form)  return <Box sx={{ p: 3 }}><Alert severity="error">Form not found.</Alert></Box>;

  // Choose either JNF or INF schema
  const sections = type === "inf" ? INF_SECTIONS : JNF_SECTIONS;
  const knownKeys = new Set(sections.flatMap(s => s.fields.map(f => f.key)));
  const otherFields = Object.keys(form || {}).filter(k => 
    !SKIP_FIELDS.has(k) && 
    !knownKeys.has(k) && 
    form[k] !== null && 
    form[k] !== "" && 
    form[k] !== undefined
  );

  return (
    <Box sx={{ pb: 8 }}>
      {/* Back + Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push(`/admin/forms/${type}`)}
          sx={{ color: "#6B7280", textTransform: "none", mb: 2, fontWeight: 600, fontSize: "0.82rem" }}
        >
          Back to {type.toUpperCase()} Queue
        </Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>
                {form.company_name || `${type.toUpperCase()} #${id}`}
              </Typography>
              <StatusBadge status={form.status || "DRAFT"} />
            </Box>
            <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
              {type.toUpperCase()} · Form ID #{id} · Submitted by{" "}
              <strong style={{ color: "#374151" }}>{form.user?.name || "—"}</strong>
              {" "}({form.user?.email})
            </Typography>
          </Box>
          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<CheckCircleRoundedIcon />}
              onClick={() => { setDlgMode("approve"); setNoteText(""); }}
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
              Approve
            </Button>
            <Button variant="outlined" startIcon={<CancelRoundedIcon />}
              onClick={() => { setDlgMode("reject"); setNoteText(""); }}
              sx={{ color: "#DC2626", borderColor: "#DC2626", "&:hover": { borderColor: "#B91C1C", bgcolor: "#FEF2F2" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
              Reject
            </Button>
            <Button variant="outlined" startIcon={<EditNoteRoundedIcon />}
              onClick={() => { setDlgMode("edit_request"); setNoteText(""); }}
              sx={{ color: "#D97706", borderColor: "#D97706", "&:hover": { borderColor: "#B45309", bgcolor: "#FFFBEB" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
              Request Edit
            </Button>
            <Button variant="outlined" startIcon={<MailOutlineRoundedIcon />}
              onClick={() => { setDlgMode("email"); setNoteText(""); }}
              sx={{ color: "#2563EB", borderColor: "#2563EB", "&:hover": { bgcolor: "#EFF6FF" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
              Email Recruiter
            </Button>
            {/* ── Edit Form (admin direct edit) ── */}
            {!editMode ? (
              <Button variant="outlined" startIcon={<EditNoteRoundedIcon />}
                onClick={() => { setEditDraft({...form}); setEditMode(true); }}
                sx={{ color: MAROON, borderColor: MAROON, "&:hover": { bgcolor: "rgba(123,0,0,0.04)" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
                Edit Form
              </Button>
            ) : (
              <>
                <Button variant="contained"
                  onClick={handleAdminEdit} disabled={editSaving}
                  sx={{ bgcolor: MAROON, "&:hover": { bgcolor: DEEP_RED }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
                  {editSaving ? <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} /> : null}
                  Save Changes
                </Button>
                <Button variant="outlined"
                  onClick={() => { setEditMode(false); setAdminNote(""); }}
                  sx={{ color: "#6B7280", borderColor: "#D1D5DB", textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {alertMsg && (
        <Alert severity={alertMsg.type} onClose={() => setAlertMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {alertMsg.msg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left — Sectioned Form Data */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {sections.map((section) => {
              // In view mode only show fields with data; in edit mode show all defined fields
              const fieldsToShow = editMode
                ? section.fields
                : section.fields.filter(({ key }) => {
                    const v = form[key];
                    return v !== null && v !== undefined && v !== "" && v !== "[]" && v !== "{}";
                  });
              if (fieldsToShow.length === 0) return null;

              return (
                <Paper key={section.title} elevation={0} sx={{ border: editMode ? `2px solid ${MAROON}` : "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
                  <Box sx={{ px: 3, py: 2, bgcolor: editMode ? MAROON : DEEP_RED }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "white" }}>
                      {editMode ? "✏️ " : ""}{section.title}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2.5}>
                      {fieldsToShow.map(({ key, label }) => {
                        const raw = form[key];
                        const parsed = parseVal(raw);
                        const isComplex = Array.isArray(parsed) || (typeof parsed === "object" && parsed !== null);
                        const isWide = isComplex || (typeof parsed === "string" && parsed.length > 80);
                        return (
                          <Grid item xs={12} sm={isWide ? 12 : 6} key={key}>
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: editMode ? MAROON : "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                              {label}
                            </Typography>
                            {editMode && !isComplex ? (
                              <TextField
                                fullWidth
                                size="small"
                                multiline={typeof parsed === "string" && parsed.length > 60}
                                rows={typeof parsed === "string" && parsed.length > 60 ? 3 : 1}
                                value={editDraft[key] ?? ""}
                                onChange={(e) => setEditDraft(prev => ({ ...prev, [key]: e.target.value }))}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "0.83rem", "&.Mui-focused fieldset": { borderColor: MAROON } } }}
                              />
                            ) : (
                              <RenderValue value={raw} label={label} />
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Paper>
              );
            })}

            {/* Other / unknown fields */}
            {otherFields.length > 0 && (
              <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2, bgcolor: "#374151" }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "white" }}>📄 Other Fields</Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2.5}>
                    {otherFields.map((key) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                          {key.replace(/_/g, " ")}
                        </Typography>
                        <RenderValue value={form[key]} label={key} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            )}

            {/* Admin note + rules info */}
            {editMode && (
              <Paper elevation={0} sx={{ border: `2px solid ${MAROON}`, borderRadius: 2.5, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2, bgcolor: MAROON }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "white" }}>
                    📬 Note to Recruiter (optional)
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)", mt: 0.3 }}>
                    This note will be included in the notification and email sent to the recruiter.
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <TextField
                    fullWidth multiline rows={3}
                    placeholder="e.g. We corrected the CTC breakdown based on your provided salary structure..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "0.85rem", "&.Mui-focused fieldset": { borderColor: MAROON } } }}
                  />
                </Box>
              </Paper>
            )}

            {!editMode && (
              <Paper elevation={0} sx={{ border: "1px solid #FEF3C7", borderRadius: 2, p: 2, bgcolor: "#FFFBEB" }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400E", mb: 0.5 }}>
                  📌 Edit Policy
                </Typography>
                <Typography sx={{ fontSize: "0.73rem", color: "#78350F", lineHeight: 1.6 }}>
                  • <strong>Admin</strong> can edit this form at any time (even after approval). Recruiter is notified each time.<br />
                  • <strong>Recruiter</strong> can submit edits <strong>at most 1 time</strong> before approval. They can <em>request</em> edits unlimited times — admin decides whether to unlock or edit directly.
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Right — Recruiter Info + Communication Log */}
        <Grid item xs={12} lg={4}>
          {/* Recruiter Card */}
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, mb: 3, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#111827" }}>Recruiter Profile</Typography>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: MAROON, width: 40, height: 40, fontWeight: 700 }}>{form.user?.name?.[0] || "R"}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{form.user?.name || "—"}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{form.user?.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Row label="Organisation" value={form.user?.organisation || "—"} />
                <Row label="Phone" value={form.user?.phone || "—"} />
                <Row label="Edits Used" value={`${form.edit_count || 0} / 1`} />
                <Row label="Submitted" value={form.submitted_at ? new Date(form.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} />
              </Box>
            </Box>
          </Paper>

          {/* Communication Log */}
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#111827" }}>
                Communication Log
              </Typography>
              <Chip label={`${comms.length} messages`} size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#F3F4F6", color: "#6B7280" }} />
            </Box>
            <Box sx={{ p: 2, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {comms.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem" }}>No messages yet</Typography>
                </Box>
              ) : (
                comms.map((c) => {
                  const isAdmin = c.sender_id !== form.user_id;
                  return (
                    <Box
                      key={c.id}
                      sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: isAdmin ? `${MAROON}08` : "#F9FAFB",
                        border: `1px solid ${isAdmin ? `${MAROON}18` : "#E5E7EB"}`,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: isAdmin ? MAROON : "#374151" }}>
                          {isAdmin ? "CDC Admin" : form.user?.name}
                        </Typography>
                        <Chip
                          label={c.type}
                          size="small"
                          sx={{ fontSize: "0.6rem", height: 16,
                            bgcolor: c.type === "email" ? "#EFF6FF" : c.type === "edit_request" ? "#FFFBEB" : "#F0FDF4",
                            color: c.type === "email" ? "#1D4ED8" : c.type === "edit_request" ? "#92400E" : "#065F46",
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#111827", mb: 0.3 }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: "0.73rem", color: "#4B5563", lineHeight: 1.5 }}>{c.message}</Typography>
                      <Typography sx={{ fontSize: "0.63rem", color: "#9CA3AF", mt: 0.8 }}>
                        {new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={dlgMode !== null} onClose={() => !submitting && setDlgMode(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "#111827", pb: 1 }}>
          {dlgMode === "approve" && "✅ Approve this Form"}
          {dlgMode === "reject" && "❌ Reject this Form"}
          {dlgMode === "edit_request" && "✏️ Request Edits from Recruiter"}
          {dlgMode === "email" && "📧 Send Email to Recruiter"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 1.5, fontSize: "0.8rem" }}>
            {dlgMode === "approve" && "The recruiter will be notified that their form has been approved."}
            {dlgMode === "reject" && "The recruiter will be notified with your rejection reason."}
            {dlgMode === "edit_request" && "The recruiter will receive an in-app notification and can unlock their form for edits."}
            {dlgMode === "email" && "This message will appear in the recruiter's notification inbox and be flagged as an email."}
          </Alert>
          <TextField
            autoFocus
            fullWidth
            label={
              dlgMode === "approve" ? "Approval note (optional)" :
              dlgMode === "reject" ? "Reason for rejection *" :
              dlgMode === "edit_request" ? "Specify what needs to be corrected *" :
              "Your message to the recruiter *"
            }
            multiline
            rows={4}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDlgMode(null)}
            disabled={submitting}
            sx={{ textTransform: "none", color: "#6B7280", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting || (dlgMode !== "approve" && !noteText.trim())}
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
            onClick={["approve","reject"].includes(dlgMode ?? "") ? handleStatusUpdate : handleCommunicate}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: 2,
              bgcolor: dlgMode === "approve" ? "#059669" : dlgMode === "reject" ? "#DC2626" : dlgMode === "email" ? "#2563EB" : "#D97706",
              "&:hover": {
                bgcolor: dlgMode === "approve" ? "#047857" : dlgMode === "reject" ? "#B91C1C" : dlgMode === "email" ? "#1D4ED8" : "#B45309",
              },
            }}
          >
            {dlgMode === "approve" ? "Confirm Approval" :
             dlgMode === "reject" ? "Confirm Rejection" :
             dlgMode === "email" ? "Send Email" :
             "Send Edit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper row component
const Row = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
    <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 600, textAlign: "right" }}>{value}</Typography>
  </Box>
);
