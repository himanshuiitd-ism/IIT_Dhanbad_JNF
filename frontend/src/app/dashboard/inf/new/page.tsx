"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDraft, loadDraft, clearDraft } from "@/lib/use-draft";
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  MenuItem, Select, Chip, Paper, Stepper, Step, StepLabel, Divider,
  IconButton, Alert, FormControl, InputLabel,
  Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Accordion, AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LinkIcon from "@mui/icons-material/Link";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";

// ─── AI Parser ────────────────────────────────────────────────────────
import { parsePdf, applyInfParsedData } from "@/lib/ai-parser";
import type { InfParsedData, TrackerSection, TrackerField, FieldStatus } from "@/lib/ai-parser/types";
import PdfUploadDialog from "@/components/PdfUploadDialog";
import FormTracker from "@/components/FormTracker";

// ─── Design Tokens ────────────────────────────────────────────────────
const MAROON = "#850000ff";
const RED = "#b90000ff";
const SURFACE = "#FBF8F8";
const WHITE   = "#FFFFFF";
const BORDER  = "rgba(0,0,0,0.09)";

// ─── Shared Sx ────────────────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, bgcolor: WHITE, fontSize: "0.85rem",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MAROON },
    "&.Mui-focused fieldset": { borderColor: MAROON, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: MAROON },
};

// ─── Sub-components ───────────────────────────────────────────────────
const FieldLabel = ({ children, required }: { children: string; required?: boolean }) => (
  <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
    {children}{required && <span style={{ color: "#C41230", marginLeft: 2 }}>*</span>}
  </Typography>
);

const SectionHeader = ({ title, extra }: { title: string; extra?: React.ReactNode }) => (
  <Box sx={{ bgcolor: MAROON, px: 3, py: 1.8, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "1rem", letterSpacing: 0.5 }}>{title}</Typography>
    {extra}
  </Box>
);

const SectionCard = ({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) => (
  <Box sx={{ borderRadius: 2, overflow: "hidden", border: `1px solid ${BORDER}`, mb: 3 }}>
    <SectionHeader title={title} extra={extra} />
    <Box sx={{ p: 3, bgcolor: WHITE }}>{children}</Box>
  </Box>
);

const SubSectionCard = ({ title, children, color = MAROON }: { title: string; children: React.ReactNode; color?: string }) => (
  <Box sx={{ borderRadius: 2, overflow: "hidden", border: `1px solid ${BORDER}`, flex: 1, minWidth: 220 }}>
    <Box sx={{ bgcolor: color, px: 2.5, py: 1.4 }}>
      <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.85rem" }}>{title}</Typography>
    </Box>
    <Box sx={{ p: 2.5, bgcolor: WHITE, display: "flex", flexDirection: "column", gap: 2 }}>{children}</Box>
  </Box>
);

const InstitutionalHeader = ({ type }: { type: "JNF" | "INF" }) => (
  <Box sx={{ bgcolor: WHITE, border: `1px solid ${BORDER}`, borderRadius: 2, p: 3, mb: 3, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
    <Box sx={{ position: "absolute", left: 24, display: "flex", alignItems: "center" }}>
      <Image src="/logo.png" alt="IIT (ISM) Dhanbad" width={80} height={80} priority />
    </Box>
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h5" sx={{ fontWeight: 900, color: MAROON, letterSpacing: 1, mb: 0.5 }}>
        CAREER DEVELOPMENT CENTRE
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, color: "#374151", letterSpacing: 0.5, mb: 1 }}>
        INDIAN INSTITUTE OF TECHNOLOGY (INDIAN SCHOOL OF MINES) DHANBAD
      </Typography>
      <Box sx={{ width: 100, height: 3, bgcolor: MAROON, mx: "auto", mb: 1.5 }} />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: WHITE, bgcolor: MAROON, px: 3, py: 0.5, borderRadius: 1, textTransform: "uppercase", letterSpacing: 2 }}>
          {type === "JNF" ? "Job Notification Form (JNF)" : "Internship Notification Form (INF)"}
        </Typography>
      </Box>
    </Box>
  </Box>
);

const ReviewRow = ({ label, value }: { label: string; value?: string | number | null }) =>
  value ? (
    <Box sx={{ display: "flex", py: 0.5, borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: 0 } }}>
      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", width: 200, flexShrink: 0, fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.78rem", color: "#111827", fontWeight: 500, wordBreak: "break-word" }}>{String(value)}</Typography>
    </Box>
  ) : null;

// ─── Static Data ──────────────────────────────────────────────────────
const PROGRAMMES_INF: Record<string, string[]> = {
  "B.Tech / Dual Degree (JEE Advanced)": [
    "Chemical Engineering", "Civil Engineering", "Computer Science and Engineering",
    "CS & Engineering (AI & Data Science)", "Electronics and Communication Engineering",
    "Electrical Engineering", "Environmental Engineering", "Engineering Physics",
    "Fuel & Energy Engineering", "Mechanical Engineering", "Mining Engineering",
    "Mining Machinery Engineering", "Minerals and Metallurgical Engineering",
    "Petroleum Engineering", "Mathematics and Computing",
  ],
  "Integrated M.Tech (JEE Advanced)": [
    "Applied Geology", "Applied Geophysics", "Mathematics and Computing",
  ],
  "M.Tech GATE (2-Year)": [
    "Chemical Engineering", "Civil Engg (Geotechnical)", "Civil Engg (Structural)",
    "Civil Engg (Water Resources)", "Communication & Signal Processing",
    "Computer Science and Engineering", "Data Analytics", "Earthquake Science & Engineering",
    "Electronics & Instrumentation", "Environmental Science and Engineering", "Fuel Engineering",
    "Industrial Engineering and Management", "Machine Design", "Mechanical Engg (Manufacturing)",
    "Mechanical Engg (Thermal)", "Mineral Engineering", "Mining Engineering",
    "Mining Engg (Geomatics & Tunnelling)", "Mineral Exploration", "Opencast Mining",
    "Petroleum Engineering", "Petroleum Exploration", "Power Electronics & Electrical Drives",
    "Power System Engineering", "Pharmaceutical Science & Engineering", "RF & Microwave Engineering", "VLSI Design",
  ],
  "M.Sc JAM (2-Year)": ["Chemistry", "Mathematics", "Physics", "Statistics"],
  "M.Sc.Tech JAM (3-Year)": ["Applied Geology", "Applied Geophysics", "Geo-Exploration"],
  "MBA (CAT)": ["MBA (General)", "MBA (Business Analytics)", "Operation Management", "Financial Management"],
};

const STIPEND_PROGS = ["B.Tech / Dual / Int. M.Tech", "M.Tech", "MBA", "M.Sc / M.Sc.Tech", "Ph.D"];
const WORK_MODES    = ["On-site", "Remote", "Hybrid"];
const CATEGORIES    = ["MNC", "Indian MNC", "Indian Company", "PSU", "Start-up", "Govt / Public Sector", "Other"];
const SECTORS_LIST  = [
  "IT / Software", "Finance / Banking", "Core Engineering", "Consulting", "Analytics / Data Science",
  "E-commerce", "FMCG", "Pharma / Healthcare", "Infrastructure / Real Estate", "Energy / Power",
  "Manufacturing", "Research / R&D", "Media / Entertainment", "Education", "Other",
];
const SELECTION_STAGE_LIST = [
  { key: "ppt",                label: "Pre-Placement\nTalk" },
  { key: "resume_shortlisting", label: "Resume\nShortlisting" },
  { key: "online_test",        label: "Online /\nWritten Test" },
  { key: "group_discussion",   label: "Group\nDiscussion" },
  { key: "tech_interview",     label: "Personal /\nTechnical Interview" },
];
const TEST_TYPES       = ["Aptitude", "Technical", "Written", "Psychometric", "Coding", "Other"];
const INTERVIEW_MODES  = ["On Campus", "Telephonic", "Video Conferencing"];
const SELECTION_MODES  = ["Online", "Offline", "Hybrid"];

const DECLARATION_ITEMS = [
  "AIPC guidelines — thoroughly read & agreed to abide during entire internship process",
  "Shortlisting criteria to be provided; final shortlist within 24–48 hours after written test",
  "Information in posted profiles is verified & correct; no new clauses in final offer letter",
  "Consent to share company name, logo & email with national ranking agencies & media",
  "Confirm accuracy of internship profile; adhere to T&C; strict action in case of discrepancy",
  "Results (selection/rejection) will be shared to CDC and not directly to students",
];

const initContact = () => ({ name: "", designation: "", email: "", phone: "", landline: "" });
const initStipend = () => ({ monthly: "", base: "", takehome: "", ug: "", pg: "" });
const initPerProgAdditional = () => ({
  joining_bonus: "", retention_bonus: "", bond_return: "",
  accommodation: "", relocation: "", variable_bonus: "",
  medical: "", deductions: "", stocks: "", gross: "",
});
const initEligibility = () => {
  const out: Record<string, Record<string, { checked: boolean; cgpa: string; backlogs: boolean }>> = {};
  Object.entries(PROGRAMMES_INF).forEach(([p, bs]) => {
    out[p] = {};
    bs.forEach(b => { out[p][b] = { checked: false, cgpa: "7.0", backlogs: true }; });
  });
  return out;
};

const STEPS = [
  "Company Profile",
  "Contact & HR",
  "Internship Profile",
  "Eligibility & Courses",
  "Stipend Details",
  "Selection Process",
  "Declaration & Submit",
];

const API = "http://localhost:8000/api";
const TOKEN = () => typeof window !== "undefined"
  ? (localStorage.getItem("local_token") || localStorage.getItem("admin_token") || localStorage.getItem("auth_token"))
  : null;

// ═══════════════════════════════════════════════════════════════════
export default function InfNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep]         = useState(0);
  const [infId, setInfId]       = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [backDialog, setBackDialog] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: "success" | "error" }>({ open: false, msg: "", type: "success" });
  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ open: true, msg, type });

  // ── STEP 1: Company ───────────────────────────────────────────────
  const [company, setCompany] = useState({
    company_name: "", website: "", postal_address: "", employees: "", sector: "",
    category: "", date_of_establishment: "", annual_turnover: "", linkedin: "",
    hq_country: "", nature_of_business: "", description: "",
  });
  const [industrySectors, setIndustrySectors] = useState<string[]>([]);
  const [sectorInput, setSectorInput]         = useState("");
  const [logoFile, setLogoFile]               = useState<File | null>(null);

  // ── STEP 2: Contacts ─────────────────────────────────────────────
  const [headHr, setHeadHr] = useState(initContact());
  const [poc1, setPoc1]     = useState(initContact());
  const [poc2, setPoc2]     = useState(initContact());

  // ── STEP 3: Internship Profile ───────────────────────────────────
  const [internship, setInternship] = useState({
    profile_name: "", formal_title: "", location: "", work_mode: "",
    expected_interns: "", min_interns: "", start_date: "",
    description: "", additional_info: "", bond_details: "",
    registration_link: "", duration_weeks: "", ppo_provision: false, ppo_ctc: "",
  });
  const [skills, setSkills]       = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [jdPdf, setJdPdf]         = useState<File | null>(null);

  // ── STEP 4: Eligibility ──────────────────────────────────────────
  const [eligibility, setEligibility] = useState(initEligibility());
  const [globalCgpa, setGlobalCgpa]   = useState("7.0");
  const [globalBacklogs, setGlobalBacklogs] = useState(true);
  const [genderFilter, setGenderFilter]     = useState("All");

  const toggleBranch = (prog: string, b: string) =>
    setEligibility(p => ({ ...p, [prog]: { ...p[prog], [b]: { ...p[prog][b], checked: !p[prog][b].checked } } }));
  const selectAllProg = (prog: string, val: boolean) =>
    setEligibility(p => {
      const updated = { ...p[prog] };
      Object.keys(updated).forEach(b => { updated[b] = { ...updated[b], checked: val }; });
      return { ...p, [prog]: updated };
    });

  // ── STEP 5: Stipend ──────────────────────────────────────────────
  const [stipend, setStipend] = useState<Record<string, ReturnType<typeof initStipend>>>(
    () => { const o: any = {}; STIPEND_PROGS.forEach(p => { o[p] = initStipend(); }); return o; }
  );
  const [currency, setCurrency] = useState("INR");
  const [perProgAdditional, setPerProgAdditional] = useState<Record<string, ReturnType<typeof initPerProgAdditional>>>(
    () => { const o: any = {}; STIPEND_PROGS.forEach(p => { o[p] = initPerProgAdditional(); }); return o; }
  );
  const [diffStructure, setDiffStructure] = useState(false);

  // ── STEP 6: Selection Process ────────────────────────────────────
  const [stages, setStages] = useState<Record<string, boolean>>(
    () => { const o: any = {}; SELECTION_STAGE_LIST.forEach(s => { o[s.key] = false; }); return o; }
  );
  const [selectionMode, setSelectionMode]       = useState("");
  const [testType, setTestType]                 = useState("");
  const [interviewModes, setInterviewModes]     = useState<string[]>([]);
  const [psychometricTest, setPsychometricTest] = useState(false);
  const [medicalTest, setMedicalTest]           = useState(false);
  const [otherScreening, setOtherScreening]     = useState("");
  const [infrastructure, setInfrastructure]     = useState("");
  const [testRounds, setTestRounds]             = useState([{ name: "", duration: "", type: "" }]);
  const [interviewRounds, setInterviewRounds]   = useState([{ name: "", duration: "", mode: "" }]);

  const addTestRound = () => setTestRounds(p => [...p, { name: "", duration: "", type: "" }]);
  const addInterviewRound = () => setInterviewRounds(p => [...p, { name: "", duration: "", mode: "" }]);

  // ── STEP 7: Declaration ──────────────────────────────────────────
  const [declarations, setDeclarations] = useState<boolean[]>(DECLARATION_ITEMS.map(() => false));
  const [signatory, setSignatory] = useState({ name: "", designation: "", date: "", signature: "" });
  const [rtiConsent, setRtiConsent] = useState(false);
  const allDeclared = declarations.every(Boolean) && rtiConsent && signatory.name.trim() !== "" && signatory.signature.trim() !== "";

  // ── AI Parser ────────────────────────────────────────────────────
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set());
  const [trackerOpen, setTrackerOpen] = useState(false);

  // ── Tracker ──────────────────────────────────────────────────────
  const trackerSections: TrackerSection[] = useMemo(() => {
    const f = (key: string, label: string, value: any): TrackerField => {
      let status: FieldStatus = "empty";
      if (typeof value === "string" && value.trim()) status = "filled";
      else if (typeof value === "boolean") status = value ? "filled" : "empty";
      else if (Array.isArray(value) && value.length > 0) status = "filled";
      return { key, label, status, autoFilled: autoFilledKeys.has(key) };
    };
    const mkSection = (stepIndex: number, stepName: string, fields: TrackerField[]): TrackerSection => {
      const filledCount = fields.filter(fi => fi.status === "filled").length;
      return { stepIndex, stepName, fields, filledCount, totalCount: fields.length, percentage: fields.length ? Math.round((filledCount / fields.length) * 100) : 0 };
    };
    const anyElig = Object.values(eligibility).some(prog => Object.values(prog).some(b => b.checked));
    const anyStage = Object.values(stages).some(Boolean);
    return [
      mkSection(0, "Company Profile", [
        f("company_name", "Company Name", company.company_name),
        f("website", "Website", company.website),
        f("postal_address", "Postal Address", company.postal_address),
        f("sector", "Sector", company.sector),
        f("category", "Category", company.category),
        f("nature_of_business", "Nature of Business", company.nature_of_business),
      ]),
      mkSection(1, "Contact & HR", [
        f("headhr_name", "Head HR Name", headHr.name),
        f("headhr_email", "Head HR Email", headHr.email),
        f("poc1_name", "PoC1 Name", poc1.name),
        f("poc1_email", "PoC1 Email", poc1.email),
      ]),
      mkSection(2, "Internship Profile", [
        f("profile_name", "Profile / Title", internship.profile_name),
        f("location", "Location", internship.location),
        f("work_mode", "Work Mode", internship.work_mode),
        f("expected_interns", "Expected Interns", internship.expected_interns),
        f("start_date", "Start Date", internship.start_date),
        f("duration_weeks", "Duration", internship.duration_weeks),
        f("description", "Description", internship.description),
      ]),
      mkSection(3, "Eligibility", [
        f("eligibility_any", "Branches selected", anyElig ? "yes" : ""),
        f("global_cgpa", "Min CGPA", globalCgpa),
      ]),
      mkSection(4, "Stipend", [
        f("stipend_btech", "B.Tech Stipend", stipend["B.Tech / Dual / Int. M.Tech"]?.monthly),
      ]),
      mkSection(5, "Selection Process", [
        f("selection_stages", "Stages selected", anyStage ? "yes" : ""),
        f("selection_mode", "Selection Mode", selectionMode),
      ]),
      mkSection(6, "Declaration", [
        f("declarations", "All declared", declarations.every(Boolean) && rtiConsent ? "yes" : ""),
        f("signatory_name", "Signatory", signatory.name),
        f("typed_signature", "Signature", signatory.signature),
      ]),
    ];
  }, [company, headHr, poc1, internship, eligibility, globalCgpa, stipend, stages, selectionMode, declarations, rtiConsent, signatory, autoFilledKeys]);

  const handlePdfParse = useCallback(async (file: File, onProgress: (s: string) => void) => {
    const result = await parsePdf(file, "inf", onProgress);
    const data = result.data as InfParsedData;
    const filledFields = applyInfParsedData(data, {
      setCompany,
      setIndustrySectors,
      setHeadHR: setHeadHr,
      setPoc1,
      setPoc2,
      setInternship,
      setSkills,
      setGlobalCgpa,
      setGlobalBacklogs,
      setCurrency,
      setStipend,
      setStages: setStages as any,
      setSelectionMode,
      setTestType,
      setInterviewModes,
      setTestRounds,
      setInterviewRounds,
      setPsychometricTest,
      setMedicalTest,
      setOtherScreening,
      setInfrastructure,
    });
    setAutoFilledKeys(new Set(filledFields));
    setTrackerOpen(true);
    showToast(`AI auto-filled ${filledFields.length} fields from PDF ✓`);
    return { fieldsCount: filledFields.length };
  }, []);

  // ── Payload & save ────────────────────────────────────────────────
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("company_name", company.company_name);
    fd.append("website", company.website);
    fd.append("postal_address", company.postal_address);
    fd.append("employees", company.employees);
    fd.append("sector", company.sector);
    fd.append("category", company.category);
    fd.append("date_of_establishment", company.date_of_establishment);
    fd.append("annual_turnover", company.annual_turnover);
    fd.append("linkedin", company.linkedin);
    fd.append("hq_country", company.hq_country);
    fd.append("nature_of_business", company.nature_of_business);
    fd.append("description", company.description);
    fd.append("industry_sectors", JSON.stringify(industrySectors));

    if (logoFile) fd.append("logo", logoFile);

    fd.append("head_hr", JSON.stringify(headHr));
    fd.append("poc1", JSON.stringify(poc1));
    fd.append("poc2", JSON.stringify(poc2));

    fd.append("profile_name", internship.profile_name);
    fd.append("formal_title", internship.formal_title);
    fd.append("location", internship.location);
    fd.append("work_mode", internship.work_mode);
    fd.append("expected_interns", internship.expected_interns);
    fd.append("min_interns", internship.min_interns);
    fd.append("start_date", internship.start_date);
    fd.append("duration_weeks", internship.duration_weeks);
    fd.append("description", internship.description);
    fd.append("additional_info", internship.additional_info);
    fd.append("bond_details", internship.bond_details);
    fd.append("registration_link", internship.registration_link);
    fd.append("ppo_provision", internship.ppo_provision ? "1" : "0");
    fd.append("ppo_ctc", internship.ppo_ctc);

    if (jdPdf) fd.append("jd_pdf", jdPdf);

    fd.append("required_skills", JSON.stringify(skills));
    fd.append("eligibility", JSON.stringify(eligibility));
    fd.append("global_cgpa", globalCgpa);
    fd.append("global_backlogs", globalBacklogs ? "1" : "0");
    fd.append("gender_filter", genderFilter);

    fd.append("stipend", JSON.stringify(stipend));
    fd.append("currency", currency);
    fd.append("per_prog_additional", JSON.stringify(perProgAdditional));

    fd.append("selection_stages", JSON.stringify(stages));
    fd.append("selection_mode", selectionMode);
    fd.append("test_type", testType);
    fd.append("interview_modes", JSON.stringify(interviewModes));
    fd.append("test_rounds", JSON.stringify(testRounds));
    fd.append("interview_rounds", JSON.stringify(interviewRounds));
    fd.append("psychometric_test", psychometricTest ? "1" : "0");
    fd.append("medical_test", medicalTest ? "1" : "0");
    fd.append("infrastructure", infrastructure);
    fd.append("other_screening", otherScreening);

    fd.append("declarations", JSON.stringify(declarations));
    fd.append("signatory_name", signatory.name);
    fd.append("signatory_designation", signatory.designation);
    fd.append("signatory_date", signatory.date);
    fd.append("typed_signature", signatory.signature);
    fd.append("rti_nirf_consent", rtiConsent ? "1" : "0");

    return fd;
  };

  const saveStep = async (nextStep: number) => {
    setSaving(true);
    try {
      const fd = buildFormData();
      const headers = { "Authorization": `Bearer ${TOKEN()}`, "Accept": "application/json" };
      if (!infId) {
        const res = await fetch(`${API}/infs`, { method: "POST", headers, body: fd });
        if (res.ok) { const d = await res.json(); setInfId(d.data?.id || d.id); }
      } else {
        fd.append("_method", "PATCH");
        await fetch(`${API}/infs/${infId}`, { method: "POST", headers, body: fd });
      }
      showToast("Progress saved ✓");
    } catch { /* backend offline */ }
    setSaving(false);
    setStep(nextStep);
  };

  const handleSubmit = async () => {
    if (!allDeclared) { showToast("Complete all declarations & signatory fields first.", "error"); return; }
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const headers = { "Authorization": `Bearer ${TOKEN()}`, "Accept": "application/json" };
      
      const targetId = infId;
      if (!targetId) {
        const createRes = await fetch(`${API}/infs`, { method: "POST", headers, body: fd });
        if (!createRes.ok) throw new Error("Draft creation failed");
        const d = await createRes.json();
        const newId = d.data?.id || d.id;
        setInfId(newId);
        await fetch(`${API}/infs/${newId}/submit`, { method: "POST", headers });
      } else {
        // Save current state first
        fd.append("_method", "PATCH");
        await fetch(`${API}/infs/${targetId}`, { method: "POST", headers, body: fd });
        // Then submit
        const submitRes = await fetch(`${API}/infs/${targetId}/submit`, { method: "POST", headers });
        if (!submitRes.ok) throw new Error("Submission failed");
      }
      
      clearDraft("inf");
      showToast("INF submitted successfully! ✓");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e: any) {
      showToast(e.message || "Submit failed — please retry.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ═════════════════════════════════════════════════════════════════

  // ── Step 0: Company Profile ───────────────────────────────────────
  const renderCompanyProfile = () => (
    <>
      <SectionCard title="Company / Organisation Details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <FieldLabel required>Company Name</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. Tata Consultancy Services" value={company.company_name}
              onChange={e => setCompany(p => ({ ...p, company_name: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel required>Website</FieldLabel>
            <TextField fullWidth size="small" placeholder="https://" value={company.website}
              onChange={e => setCompany(p => ({ ...p, website: e.target.value }))} sx={inputSx} />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <FieldLabel>Postal Address</FieldLabel>
            <TextField fullWidth size="small" multiline rows={2} placeholder="Registered / communication address"
              value={company.postal_address} onChange={e => setCompany(p => ({ ...p, postal_address: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>No. of Employees</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. 5000+" value={company.employees}
              onChange={e => setCompany(p => ({ ...p, employees: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel required>Sector</FieldLabel>
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select value={company.sector} displayEmpty onChange={e => setCompany(p => ({ ...p, sector: e.target.value }))}>
                <MenuItem disabled value=""><em>Select sector…</em></MenuItem>
                {SECTORS_LIST.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Category / Org Type</FieldLabel>
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select value={company.category} displayEmpty onChange={e => setCompany(p => ({ ...p, category: e.target.value }))}>
                <MenuItem disabled value=""><em>Select category…</em></MenuItem>
                {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Date of Establishment</FieldLabel>
            <TextField fullWidth size="small" placeholder="YYYY" value={company.date_of_establishment}
              onChange={e => setCompany(p => ({ ...p, date_of_establishment: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Annual Turnover (NIRF)</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. ₹ 50,000 Cr" value={company.annual_turnover}
              onChange={e => setCompany(p => ({ ...p, annual_turnover: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Social Media / LinkedIn URL</FieldLabel>
            <TextField fullWidth size="small" placeholder="https://linkedin.com/company/…" value={company.linkedin}
              onChange={e => setCompany(p => ({ ...p, linkedin: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>If MNC — HQ Country / City</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. USA, San Francisco" value={company.hq_country}
              onChange={e => setCompany(p => ({ ...p, hq_country: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Nature of Business</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. Product, Service, Both" value={company.nature_of_business}
              onChange={e => setCompany(p => ({ ...p, nature_of_business: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Industry Sector Tags</FieldLabel>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              {industrySectors.map(s => (
                <Chip key={s} label={s} size="small" onDelete={() => setIndustrySectors(p => p.filter(x => x !== s))}
                  sx={{ bgcolor: `${MAROON}15`, color: MAROON, fontWeight: 700 }} />
              ))}
            </Box>
            <TextField size="small" placeholder="Type & press Enter to add…" value={sectorInput} sx={{ ...inputSx, width: 300 }}
              onChange={e => setSectorInput(e.target.value)}
              onKeyDown={e => { if ((e.key === "Enter" || e.key === ",") && sectorInput.trim()) { e.preventDefault(); setIndustrySectors(p => [...new Set([...p, sectorInput.trim()])]); setSectorInput(""); } }} />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <FieldLabel>Company Description</FieldLabel>
            <TextField fullWidth size="small" multiline rows={3} placeholder="Brief description of your company, culture, and domain…"
              value={company.description} onChange={e => setCompany(p => ({ ...p, description: e.target.value }))} sx={inputSx} />
          </Box>
        </Box>
      </SectionCard>

      <SectionCard title="Company Logo">
        <Box sx={{ border: `2px dashed ${BORDER}`, borderRadius: 2, p: 4, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: MAROON, bgcolor: `${MAROON}04` } }}
          onClick={() => document.getElementById("inf-logo-upload")?.click()}>
          <input id="inf-logo-upload" type="file" accept="image/*" hidden onChange={e => setLogoFile(e.target.files?.[0] || null)} />
          <CloudUploadIcon sx={{ fontSize: 36, color: MAROON, opacity: 0.5, mb: 1 }} />
          <Typography sx={{ color: "#6B7280", fontSize: "0.82rem" }}>
            {logoFile ? logoFile.name : "Click or drag to upload company logo (PNG/JPG, max 2 MB)"}
          </Typography>
        </Box>
      </SectionCard>
    </>
  );

  // ── Step 1: Contact & HR ─────────────────────────────────────────
  const renderContact = () => {
    const ContactFields = ({
      data, onChange, title, required = false, color = MAROON,
    }: { data: ReturnType<typeof initContact>; onChange: (k: string, v: string) => void; title: string; required?: boolean; color?: string }) => (
      <SubSectionCard title={title} color={color}>
        {[
          { key: "name", label: "Full Name", req: required },
          { key: "designation", label: "Designation", req: required },
          { key: "email", label: "Email Address", req: required },
          { key: "phone", label: "Mobile Number (+91)", req: required },
          { key: "landline", label: "Landline (Optional)", req: false },
        ].map(f => (
          <Box key={f.key}>
            <FieldLabel required={f.req}>{f.label}</FieldLabel>
            <TextField fullWidth size="small" placeholder="Click to enter…"
              value={(data as any)[f.key]} onChange={e => onChange(f.key, e.target.value)} sx={inputSx} />
          </Box>
        ))}
      </SubSectionCard>
    );
    return (
      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
        <ContactFields title="Head HR *" data={headHr} required onChange={(k, v) => setHeadHr(p => ({ ...p, [k]: v }))} />
        <ContactFields title="Primary Contact (PoC 1) *" data={poc1} required onChange={(k, v) => setPoc1(p => ({ ...p, [k]: v }))} color="#3D0000" />
        <ContactFields title="Secondary Contact (PoC 2) — Optional" data={poc2} onChange={(k, v) => setPoc2(p => ({ ...p, [k]: v }))} color="#4B5563" />
      </Box>
    );
  };

  // ── Step 2: Internship Profile ───────────────────────────────────
  const renderInternshipProfile = () => (
    <SectionCard title="Internship Details">
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel required>Profile Name / Internship Title</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. Software Development Intern"
            value={internship.profile_name} onChange={e => setInternship(p => ({ ...p, profile_name: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel>Internship Role / Formal Title</FieldLabel>
          <TextField fullWidth size="small" placeholder="Formal designation on offer letter"
            value={internship.formal_title} onChange={e => setInternship(p => ({ ...p, formal_title: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel required>Internship Location</FieldLabel>
          <TextField fullWidth size="small" placeholder="City, State"
            value={internship.location} onChange={e => setInternship(p => ({ ...p, location: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel>Work Location Mode</FieldLabel>
          <FormControl fullWidth size="small" sx={inputSx}>
            <Select value={internship.work_mode} displayEmpty onChange={e => setInternship(p => ({ ...p, work_mode: e.target.value }))}>
              <MenuItem disabled value=""><em>Select…</em></MenuItem>
              {WORK_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FieldLabel>Expected Interns</FieldLabel>
          <TextField fullWidth size="small" type="number" placeholder="e.g. 10"
            value={internship.expected_interns} onChange={e => setInternship(p => ({ ...p, expected_interns: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel>Minimum Interns</FieldLabel>
          <TextField fullWidth size="small" type="number" placeholder="e.g. 3"
            value={internship.min_interns} onChange={e => setInternship(p => ({ ...p, min_interns: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel required>Internship Start Date</FieldLabel>
          <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
            value={internship.start_date} onChange={e => setInternship(p => ({ ...p, start_date: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel required>Duration (Weeks)</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. 8"
            value={internship.duration_weeks} onChange={e => setInternship(p => ({ ...p, duration_weeks: e.target.value }))} sx={inputSx} />
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Required Skills (Tag Input)</FieldLabel>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
            {skills.map(s => (<Chip key={s} label={s} size="small" onDelete={() => setSkills(p => p.filter(x => x !== s))} sx={{ bgcolor: `${MAROON}15`, color: MAROON, fontWeight: 700 }} />))}
          </Box>
          <TextField size="small" placeholder="Type skill & press Enter…" value={skillInput} sx={{ ...inputSx, width: 360 }}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) { e.preventDefault(); setSkills(p => [...new Set([...p, skillInput.trim()])]); setSkillInput(""); } }} />
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Internship Description</FieldLabel>
          <TextField fullWidth size="small" multiline rows={5} placeholder="Describe the internship role, responsibilities, and what interns will learn…"
            value={internship.description} onChange={e => setInternship(p => ({ ...p, description: e.target.value }))} sx={inputSx} />
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Upload JD as PDF</FieldLabel>
          <Box sx={{ border: `2px dashed ${BORDER}`, borderRadius: 2, p: 3, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: MAROON, bgcolor: `${MAROON}04` } }}
            onClick={() => document.getElementById("inf-jd-upload")?.click()}>
            <input id="inf-jd-upload" type="file" accept="application/pdf" hidden onChange={e => setJdPdf(e.target.files?.[0] || null)} />
            <CloudUploadIcon sx={{ fontSize: 28, color: MAROON, opacity: 0.5, mb: 0.5 }} />
            <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>{jdPdf ? jdPdf.name : "Upload Job Description PDF (optional)"}</Typography>
          </Box>
        </Box>
        <Box sx={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Additional Info (max 1000 chars)</FieldLabel>
          <TextField fullWidth size="small" multiline rows={3} inputProps={{ maxLength: 1000 }}
            placeholder="Any additional information for candidates…"
            value={internship.additional_info} onChange={e => setInternship(p => ({ ...p, additional_info: e.target.value }))} sx={inputSx}
            helperText={`${internship.additional_info.length}/1000`} />
        </Box>
        <Box>
          <FieldLabel>Bond Details (if any)</FieldLabel>
          <TextField fullWidth size="small" placeholder="e.g. 6-month post-internship bond"
            value={internship.bond_details} onChange={e => setInternship(p => ({ ...p, bond_details: e.target.value }))} sx={inputSx} />
        </Box>
        <Box>
          <FieldLabel>Registration Link (if any)</FieldLabel>
          <TextField fullWidth size="small" placeholder="https://"
            value={internship.registration_link} onChange={e => setInternship(p => ({ ...p, registration_link: e.target.value }))} sx={inputSx} />
        </Box>
        <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: SURFACE, borderRadius: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem" }}>PPO Provision?</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>Will a Pre-Placement Offer be extended to exceptional interns?</Typography>
          </Box>
          <Switch checked={internship.ppo_provision} onChange={e => setInternship(p => ({ ...p, ppo_provision: e.target.checked }))}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: MAROON }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: MAROON } }} />
        </Box>
        {internship.ppo_provision && (
          <Box>
            <FieldLabel>CTC if PPO Offered</FieldLabel>
            <TextField fullWidth size="small" placeholder="Approximate on-roll CTC"
              value={internship.ppo_ctc} onChange={e => setInternship(p => ({ ...p, ppo_ctc: e.target.value }))} sx={inputSx} />
          </Box>
        )}
      </Box>
    </SectionCard>
  );

  // ── Step 3: Eligibility ──────────────────────────────────────────
  const renderEligibility = () => (
    <>
      <Box sx={{ mb: 3, p: 2.5, bgcolor: WHITE, border: `1px solid ${BORDER}`, borderRadius: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2.5 }}>
        <Box>
          <FieldLabel>Global Min CGPA</FieldLabel>
          <TextField fullWidth size="small" type="number" inputProps={{ min: 0, max: 10, step: 0.1 }}
            value={globalCgpa} onChange={e => setGlobalCgpa(e.target.value)} sx={inputSx} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1, bgcolor: SURFACE, borderRadius: 1.5 }}>
          <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Backlogs Allowed?</Typography></Box>
          <Switch checked={globalBacklogs} onChange={e => setGlobalBacklogs(e.target.checked)}
            sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: MAROON }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: MAROON } }} />
        </Box>
        <Box>
          <FieldLabel>Gender Filter</FieldLabel>
          <FormControl fullWidth size="small" sx={inputSx}>
            <Select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              {["All", "Male Only", "Female Only", "Others"].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {Object.entries(PROGRAMMES_INF).map(([prog, branches]) => {
        const selectedCount = branches.filter(b => eligibility[prog]?.[b]?.checked).length;
        return (
          <Box key={prog} sx={{ mb: 3, border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ bgcolor: MAROON, px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.85rem" }}>{prog}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {selectedCount > 0 && <Chip label={`${selectedCount} selected`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: WHITE, fontWeight: 700, fontSize: "0.7rem" }} />}
                <Button size="small" sx={{ color: WHITE, textTransform: "none", fontSize: "0.72rem", minWidth: 0, p: 0.5 }}
                  onClick={() => selectAllProg(prog, selectedCount !== branches.length)}>
                  [ {selectedCount === branches.length ? "✗ Deselect All" : "✓ Select All"} ]
                </Button>
              </Box>
            </Box>
            {prog === "M.Tech GATE (2-Year)" ? (
              <Box sx={{ p: 2, bgcolor: WHITE, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {branches.map(b => (
                  <Chip key={b} label={b} size="small" clickable onClick={() => toggleBranch(prog, b)}
                    sx={{ bgcolor: eligibility[prog]?.[b]?.checked ? MAROON : SURFACE, color: eligibility[prog]?.[b]?.checked ? WHITE : "#374151", fontWeight: 600, fontSize: "0.72rem", transition: "all 0.2s" }} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, bgcolor: WHITE }}>
                {branches.map(b => {
                  const checked = eligibility[prog]?.[b]?.checked || false;
                  return (
                    <Box key={b} sx={{ p: 1.5, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, bgcolor: checked ? `${MAROON}06` : WHITE, transition: "background 0.2s" }}>
                      <FormControlLabel
                        control={<Checkbox size="small" checked={checked} onChange={() => toggleBranch(prog, b)} sx={{ color: MAROON, "&.Mui-checked": { color: MAROON }, p: 0.5 }} />}
                        label={<Typography sx={{ fontSize: "0.78rem", fontWeight: checked ? 700 : 400, color: checked ? MAROON : "#374151" }}>{b}</Typography>}
                        sx={{ m: 0 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );

  // ── Step 4: Stipend ──────────────────────────────────────────────
  const renderStipend = () => (
    <>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <FieldLabel>Currency</FieldLabel>
        {["INR", "USD", "EUR"].map(c => (
          <Chip key={c} label={c} size="small" clickable onClick={() => setCurrency(c)}
            sx={{ bgcolor: currency === c ? MAROON : SURFACE, color: currency === c ? WHITE : "#374151", fontWeight: 700 }} />
        ))}
      </Box>

      <SectionCard title="Stipend per Programme">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: SURFACE }}>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, width: 180 }}>Programme</TableCell>
                {["Stipend (Monthly)", "Base / Fixed", "Monthly Take-home", "UG Stipend", "PG Stipend"].map(col => (
                  <TableCell key={col} sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563", textAlign: "center" }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {STIPEND_PROGS.map(prog => (
                <TableRow key={prog} sx={{ "&:hover": { bgcolor: `${MAROON}04` } }}>
                  <TableCell><Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: MAROON }}>{prog}</Typography></TableCell>
                  {(["monthly", "base", "takehome", "ug", "pg"] as const).map(col => (
                    <TableCell key={col} sx={{ px: 1 }}>
                      <TextField size="small" type="number" placeholder="—"
                        value={stipend[prog]?.[col] || ""}
                        onChange={e => setStipend(p => ({ ...p, [prog]: { ...p[prog], [col]: e.target.value } }))}
                        sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: "0.8rem" } }}
                        inputProps={{ style: { textAlign: "center" } }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden", mb: 3 }}>
        <Box sx={{ bgcolor: MAROON, px: 3, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "1rem" }}>Additional Stipend Components</Typography>
          <FormControlLabel
            control={<Switch size="small" checked={diffStructure} onChange={e => setDiffStructure(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: WHITE }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "rgba(255,255,255,0.4)" } }} />}
            label={<Typography sx={{ color: WHITE, fontSize: "0.75rem", fontWeight: 700 }}>Different structure per programme</Typography>}
            sx={{ m: 0 }}
          />
        </Box>
        <Box sx={{ p: 0 }}>
          {STIPEND_PROGS.map((prog, idx) => {
            const fields = [
              { key: "joining_bonus",    label: "Joining Bonus" },
              { key: "retention_bonus",  label: "Retention Bonus" },
              { key: "bond_return",      label: "Bond / Return Obligation" },
              { key: "accommodation",    label: "Accommodation Allowance" },
              { key: "relocation",       label: "Relocation Allowance" },
              { key: "variable_bonus",   label: "Variable / Performance Bonus" },
              { key: "medical",          label: "Medical Allowance" },
              { key: "deductions",       label: "Deductions" },
              { key: "stocks",           label: "Stocks / Options" },
              { key: "gross",            label: "Gross Stipend" },
            ];
            if (!diffStructure && idx > 0) return null;
            return (
              <Accordion key={prog} defaultExpanded={idx === 0} disableGutters elevation={0}
                sx={{ borderBottom: `1px solid ${BORDER}`, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: idx === 0 ? WHITE : "#374151" }} />}
                  sx={{ bgcolor: idx === 0 ? `${MAROON}14` : SURFACE, px: 3, minHeight: 48, "&.Mui-expanded": { minHeight: 48 } }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: idx === 0 ? MAROON : "#374151" }}>
                    {diffStructure ? prog : `All Programmes`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, bgcolor: WHITE }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {fields.map(f => (
                      <Box key={f.key}>
                        <FieldLabel>{f.label}</FieldLabel>
                        <TextField fullWidth size="small" placeholder="Amount or details"
                          value={(perProgAdditional[prog] as any)?.[f.key] || ""}
                          onChange={e => {
                            if (diffStructure) {
                              setPerProgAdditional(p => ({ ...p, [prog]: { ...p[prog], [f.key]: e.target.value } }));
                            } else {
                              const updated = { ...perProgAdditional };
                              STIPEND_PROGS.forEach(pr => { updated[pr] = { ...updated[pr], [f.key]: e.target.value }; });
                              setPerProgAdditional(updated);
                            }
                          }} sx={inputSx} />
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Box>
    </>
  );

  // ── Step 5: Selection Process ────────────────────────────────────
  const renderSelectionProcess = () => (
    <>
      <SectionCard title="Selection Stages">
        <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mb: 3 }}>Click to toggle the stages that will be part of your selection process.</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mb: 4 }}>
          {SELECTION_STAGE_LIST.map(s => {
            const active = stages[s.key];
            return (
              <Box key={s.key} onClick={() => setStages(p => ({ ...p, [s.key]: !p[s.key] }))}
                sx={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 1.5, minWidth: 100 }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: "50%",
                  bgcolor: active ? MAROON : SURFACE,
                  border: `2px solid ${active ? MAROON : BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s",
                  boxShadow: active ? `0 4px 16px ${MAROON}40` : "none",
                }}>
                  <Typography sx={{ fontSize: "1.6rem" }}>{active ? "☑" : "☐"}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: active ? 800 : 500, color: active ? MAROON : "#6B7280", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.3 }}>
                  {s.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <FieldLabel>Selection Mode</FieldLabel>
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select value={selectionMode} displayEmpty onChange={e => setSelectionMode(e.target.value)}>
                <MenuItem disabled value=""><em>Select…</em></MenuItem>
                {SELECTION_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Test Type</FieldLabel>
            <FormControl fullWidth size="small" sx={inputSx}>
              <Select value={testType} displayEmpty onChange={e => setTestType(e.target.value)}>
                <MenuItem disabled value=""><em>Select…</em></MenuItem>
                {TEST_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Interview Modes</FieldLabel>
            <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mt: 0.5 }}>
              {INTERVIEW_MODES.map(m => (
                <Chip key={m} label={m} size="small" clickable onClick={() => setInterviewModes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])}
                  sx={{ bgcolor: interviewModes.includes(m) ? MAROON : SURFACE, color: interviewModes.includes(m) ? WHITE : "#374151", fontWeight: 600, fontSize: "0.72rem" }} />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, bgcolor: SURFACE, borderRadius: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Psychometric Test</Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>Before offer letter</Typography>
            </Box>
            <Switch checked={psychometricTest} onChange={e => setPsychometricTest(e.target.checked)}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: MAROON }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: MAROON } }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, bgcolor: SURFACE, borderRadius: 1.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Medical Test</Typography>
              <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>Before offer letter</Typography>
            </Box>
            <Switch checked={medicalTest} onChange={e => setMedicalTest(e.target.checked)}
              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: MAROON }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: MAROON } }} />
          </Box>
          <Box>
            <FieldLabel>Other Screening</FieldLabel>
            <TextField fullWidth size="small" multiline rows={2} placeholder="Any other mode of screening…"
              value={otherScreening} onChange={e => setOtherScreening(e.target.value)} sx={inputSx} />
          </Box>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <FieldLabel>Infrastructure Required on Campus</FieldLabel>
            <TextField fullWidth size="small" multiline rows={2} placeholder="e.g. 2 interview rooms, LAN connectivity, projector…"
              value={infrastructure} onChange={e => setInfrastructure(e.target.value)} sx={inputSx} />
          </Box>
        </Box>
      </SectionCard>

      {/* Test Rounds */}
      <SectionCard title="Test Rounds" extra={
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addTestRound} disabled={testRounds.length >= 10}
          sx={{ color: WHITE, textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}>
          Add Round
        </Button>
      }>
        {testRounds.map((r, i) => (
          <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 2, mb: 2, p: 2, bgcolor: SURFACE, borderRadius: 1.5 }}>
            <Box>
              <FieldLabel>Round Name</FieldLabel>
              <TextField fullWidth size="small" placeholder={`Test Round ${i + 1}`} value={r.name}
                onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} sx={inputSx} />
            </Box>
            <Box>
              <FieldLabel>Duration (min)</FieldLabel>
              <TextField fullWidth size="small" type="number" placeholder="60" value={r.duration}
                onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} sx={inputSx} />
            </Box>
            <Box>
              <FieldLabel>Type</FieldLabel>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={r.type} displayEmpty onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}>
                  <MenuItem disabled value=""><em>Select…</em></MenuItem>
                  {TEST_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end", pb: 0.5 }}>
              <IconButton size="small" onClick={() => setTestRounds(p => p.filter((_, j) => j !== i))} disabled={testRounds.length === 1} sx={{ color: "#DC2626" }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </SectionCard>

      {/* Interview Rounds */}
      <SectionCard title="Interview Rounds" extra={
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addInterviewRound} disabled={interviewRounds.length >= 10}
          sx={{ color: WHITE, textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}>
          Add Round
        </Button>
      }>
        {interviewRounds.map((r, i) => (
          <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 2, mb: 2, p: 2, bgcolor: SURFACE, borderRadius: 1.5 }}>
            <Box>
              <FieldLabel>Round Name</FieldLabel>
              <TextField fullWidth size="small" placeholder={`Interview Round ${i + 1}`} value={r.name}
                onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} sx={inputSx} />
            </Box>
            <Box>
              <FieldLabel>Duration (min)</FieldLabel>
              <TextField fullWidth size="small" type="number" placeholder="45" value={r.duration}
                onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} sx={inputSx} />
            </Box>
            <Box>
              <FieldLabel>Mode</FieldLabel>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={r.mode} displayEmpty onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, mode: e.target.value } : x))}>
                  <MenuItem disabled value=""><em>Select…</em></MenuItem>
                  {INTERVIEW_MODES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end", pb: 0.5 }}>
              <IconButton size="small" onClick={() => setInterviewRounds(p => p.filter((_, j) => j !== i))} disabled={interviewRounds.length === 1} sx={{ color: "#DC2626" }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </SectionCard>
    </>
  );

  // ── Step 6: Declaration & Submit ─────────────────────────────────
  const renderDeclaration = () => (
    <>
      <SectionCard title="Uniform Declaration">
        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280", mb: 3 }}>
          Please read and accept each of the following declarations before submitting.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
          {DECLARATION_ITEMS.map((item, idx) => (
            <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, borderRadius: 1.5, bgcolor: declarations[idx] ? `${MAROON}06` : SURFACE, border: `1px solid ${declarations[idx] ? MAROON + "30" : BORDER}`, transition: "all 0.2s" }}>
              <Checkbox size="small" checked={declarations[idx]} onChange={e => setDeclarations(p => p.map((v, i) => i === idx ? e.target.checked : v))}
                sx={{ color: MAROON, "&.Mui-checked": { color: MAROON }, mt: -0.3, p: 0 }} />
              <Typography sx={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.6 }}>{item}</Typography>
            </Box>
          ))}

          {/* RTI / NIRF Consent */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2, borderRadius: 1.5, bgcolor: rtiConsent ? `${MAROON}06` : SURFACE, border: `1px solid ${rtiConsent ? MAROON + "30" : BORDER}`, transition: "all 0.2s" }}>
            <Checkbox size="small" checked={rtiConsent} onChange={e => setRtiConsent(e.target.checked)}
              sx={{ color: MAROON, "&.Mui-checked": { color: MAROON }, mt: -0.3, p: 0 }} />
            <Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.6, fontWeight: 700 }}>RTI / NIRF Consent</Typography>
              <Typography sx={{ fontSize: "0.76rem", color: "#6B7280" }}>I consent to share organisation data with RTI/NIRF ranking agencies as per IIT (ISM) Dhanbad policy. (IIT Delhi ★, current form retained)</Typography>
            </Box>
          </Box>
        </Box>

        {/* Policy Links */}
        <Box sx={{ p: 2, bgcolor: `${MAROON}06`, borderRadius: 1.5, border: `1px solid ${MAROON}20`, mb: 3 }}>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: MAROON, mb: 1 }}>Policy References</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#374151" }}>
            Please review:{" "}
            <Typography component="a" href="#" sx={{ color: MAROON, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>AIPC Guidelines</Typography>
            {" · "}
            <Typography component="a" href="#" sx={{ color: MAROON, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>IIT (ISM) Recruiter Policy</Typography>
          </Typography>
        </Box>
      </SectionCard>

      <SectionCard title="Self-Declaration — Authorised Signatory">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Box>
            <FieldLabel required>Authorised Signatory Name</FieldLabel>
            <TextField fullWidth size="small" placeholder="Full name of signatory"
              value={signatory.name} onChange={e => setSignatory(p => ({ ...p, name: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Designation</FieldLabel>
            <TextField fullWidth size="small" placeholder="e.g. Head – Talent Acquisition"
              value={signatory.designation} onChange={e => setSignatory(p => ({ ...p, designation: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel>Date</FieldLabel>
            <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
              value={signatory.date} onChange={e => setSignatory(p => ({ ...p, date: e.target.value }))} sx={inputSx} />
          </Box>
          <Box>
            <FieldLabel required>Typed Signature</FieldLabel>
            <TextField fullWidth size="small" placeholder="Type your full name as signature"
              value={signatory.signature} onChange={e => setSignatory(p => ({ ...p, signature: e.target.value }))} sx={{ ...inputSx, "& .MuiOutlinedInput-input": { fontStyle: "italic", fontFamily: "Georgia, serif", letterSpacing: 1 } }} />
          </Box>
        </Box>
      </SectionCard>

      {/* Preview Summary */}
      <SectionCard title="Form Preview — Quick Review">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1, textTransform: "uppercase" }}>Company</Typography>
            <ReviewRow label="Name" value={company.company_name} />
            <ReviewRow label="Sector" value={company.sector} />
            <ReviewRow label="Category" value={company.category} />
            <ReviewRow label="Website" value={company.website} />
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1, textTransform: "uppercase" }}>Internship</Typography>
            <ReviewRow label="Title" value={internship.profile_name} />
            <ReviewRow label="Location" value={internship.location} />
            <ReviewRow label="Duration" value={internship.duration_weeks ? `${internship.duration_weeks} weeks` : undefined} />
            <ReviewRow label="Work Mode" value={internship.work_mode} />
            <ReviewRow label="Start Date" value={internship.start_date} />
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1, textTransform: "uppercase" }}>Selection</Typography>
            <ReviewRow label="Mode" value={selectionMode} />
            <ReviewRow label="Test Type" value={testType} />
            <ReviewRow label="Test Rounds" value={testRounds.length.toString()} />
            <ReviewRow label="Interview Rounds" value={interviewRounds.length.toString()} />
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1, textTransform: "uppercase" }}>Signatory</Typography>
            <ReviewRow label="Name" value={signatory.name} />
            <ReviewRow label="Designation" value={signatory.designation} />
            <ReviewRow label="Date" value={signatory.date} />
          </Paper>
        </Box>
      </SectionCard>

      {!allDeclared && (
        <Alert severity="warning" sx={{ fontSize: "0.78rem" }}>
          Please accept all declarations, fill signatory name & signature, and provide RTI consent to enable submission.
        </Alert>
      )}
    </>
  );

  const renderStep = (s: number) => {
    switch (s) {
      case 0: return renderCompanyProfile();
      case 1: return renderContact();
      case 2: return renderInternshipProfile();
      case 3: return renderEligibility();
      case 4: return renderStipend();
      case 5: return renderSelectionProcess();
      case 6: return renderDeclaration();
      default: return null;
    }
  };

  // ═════════════════════════════════════════════════════════════════
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: SURFACE }}>
      {/* ── Maroon top bar (identical chrome to JNF) ── */}
      <Box sx={{ bgcolor: MAROON, px: { xs: 2, md: 4 }, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton size="small" onClick={() => setBackDialog(true)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.95rem", lineHeight: 1 }}>Internship Notification Form</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
              IIT (ISM) Dhanbad · CDC Portal {infId ? `· Ref: INF-${String(infId).padStart(5, "0")}` : "· New Draft"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Upload a recruiter PDF to auto-fill form fields with AI">
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
              onClick={() => setPdfDialogOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)", color: WHITE, textTransform: "none",
                fontWeight: 800, fontSize: "0.72rem", borderRadius: 2,
                backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)",
                px: 2, py: 0.6,
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" },
              }}
            >
              AI Auto-Fill
            </Button>
          </Tooltip>
          <Tooltip title={trackerOpen ? "Hide form tracker" : "Show form tracker"}>
            <IconButton size="small" onClick={() => setTrackerOpen(!trackerOpen)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800 }}>📋</Typography>
            </IconButton>
          </Tooltip>
          {saving && <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, bgcolor: "rgba(255,255,255,0.1)", borderRadius: 10, px: 1.5, py: 0.4 }}>
            <CircularProgress size={10} sx={{ color: WHITE }} />
            <Typography sx={{ color: WHITE, fontSize: "0.7rem" }}>Saving…</Typography>
          </Box>}
        </Box>
      </Box>

      {/* ── White stepper strip ── */}
      <Box sx={{ bgcolor: WHITE, borderBottom: `1px solid ${BORDER}`, px: { xs: 1, md: 4 }, py: 1.5, overflowX: "auto" }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < step}>
              <StepLabel
                onClick={() => i < step && setStep(i)}
                sx={{
                  cursor: i < step ? "pointer" : "default",
                  "& .MuiStepIcon-root.Mui-active":     { color: MAROON },
                  "& .MuiStepIcon-root.Mui-completed":  { color: MAROON },
                  "& .MuiStepLabel-label":               { fontSize: "0.65rem", fontWeight: 600 },
                  "& .MuiStepLabel-label.Mui-active":   { color: MAROON },
                  "& .MuiStepLabel-label.Mui-completed": { color: MAROON },
                }}
              >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* ── Content area ── */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <InstitutionalHeader type="INF" />

        <Box sx={{ minHeight: 400 }}>{renderStep(step)}</Box>

        {/* ── Navigation row ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, pt: 2.5, borderTop: `1px solid ${BORDER}` }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            disabled={step === 0}
            onClick={() => setStep(s => s - 1)}
            sx={{ color: MAROON, fontWeight: 700, textTransform: "none", fontSize: "0.82rem" }}
          >
            Previous
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {saving && <CircularProgress size={14} sx={{ color: MAROON }} />}
            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Step {step + 1} of {STEPS.length}</Typography>
          </Box>
          {step < STEPS.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => saveStep(step + 1)}
              sx={{ bgcolor: MAROON, color: WHITE, fontWeight: 800, textTransform: "none", fontSize: "0.82rem", px: 3.5, py: 1, borderRadius: 2, "&:hover": { bgcolor: RED } }}>
              Save &amp; Continue
            </Button>
          ) : (
            <Button variant="contained" disabled={submitting || !allDeclared}
              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />} onClick={handleSubmit}
              sx={{ bgcolor: MAROON, color: WHITE, fontWeight: 800, textTransform: "none", fontSize: "0.82rem", px: 4, py: 1, borderRadius: 2, "&:hover": { bgcolor: RED } }}>
              {submitting ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Submitting...</> : "Submit INF"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Back Dialog */}
      <Dialog open={backDialog} onClose={() => setBackDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: MAROON, fontSize: "1rem" }}>Leave form?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>You'll lose unsaved progress. Go back to the dashboard?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setBackDialog(false)} sx={{ color: MAROON, fontWeight: 700, textTransform: "none" }}>Stay</Button>
          <Button variant="contained" onClick={() => router.push("/dashboard")}
            sx={{ bgcolor: MAROON, color: WHITE, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: RED } }}>Leave</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={toast.type} sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{toast.msg}</Alert>
      </Snackbar>

      <PdfUploadDialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} onParse={handlePdfParse} formType="inf" />
      <FormTracker sections={trackerSections} currentStep={step} onJumpToStep={setStep}
        autoFilledKeys={autoFilledKeys} open={trackerOpen} onToggle={() => setTrackerOpen(!trackerOpen)} />
    </Box>
  );
}