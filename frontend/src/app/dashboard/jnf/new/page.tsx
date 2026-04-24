"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDraft, loadDraft, clearDraft } from "@/lib/use-draft";
import Image from "next/image";
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel, MenuItem,
  Select, Chip, Paper, Stepper, Step, StepLabel, Divider, IconButton,
  Alert, InputAdornment, Accordion, AccordionSummary, AccordionDetails,
  FormControl, InputLabel, Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Snackbar, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

// ─── AI Parser ───────────────────────────────────────────────────────
import { parsePdf, applyJnfParsedData } from "@/lib/ai-parser";
import type { JnfParsedData, TrackerSection, TrackerField, FieldStatus } from "@/lib/ai-parser/types";
import PdfUploadDialog from "@/components/PdfUploadDialog";
import FormTracker from "@/components/FormTracker";

// ─── Tokens ──────────────────────────────────────────────────────────
const MAROON = "#850000ff";
const RED = "#b90000ff";
const SURFACE = "#FBF8F8";
const WHITE = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.09)";

// ─── Re-usable styled input ──────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, bgcolor: WHITE, fontSize: "0.85rem",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MAROON },
    "&.Mui-focused fieldset": { borderColor: MAROON, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: MAROON },
};

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
      <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", width: 180, flexShrink: 0, fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.78rem", color: "#111827", fontWeight: 500, wordBreak: "break-word" }}>{String(value)}</Typography>
    </Box>
  ) : null;

// ── Programmes & branches ────────────────────────────────────────────
const PROGRAMMES: Record<string, string[]> = {
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
    "Power System Engineering", "Pharmaceutical Science & Engineering",
    "RF & Microwave Engineering", "VLSI Design",
  ],
  "M.Sc JAM (2-Year)": ["Chemistry", "Mathematics", "Physics", "Statistics"],
  "M.Sc.Tech JAM (3-Year)": ["Applied Geology", "Applied Geophysics", "Geo-Exploration"],
  "MBA (CAT)": ["MBA (General)", "MBA (Business Analytics)", "Operation Management", "Financial Management"],
  "Ph.D (GATE/NET)": [
    "Chemical Engineering", "Chemistry", "Civil Engineering",
    "Computer Science and Engineering", "Earthquake Science & Engineering",
    "Electrical Engineering", "Environmental Science", "Fuel Engineering",
    "Humanities & Social Sciences", "Management", "Mathematics",
    "Mechanical Engineering", "Mineral Engineering", "Mining Engineering",
    "Petroleum Engineering", "Physics", "Pharmaceutical Science & Engineering",
  ],
};

const SALARY_PROGS = ["B.Tech / Dual / Int. M.Tech", "M.Tech", "MBA", "M.Sc / M.Sc.Tech", "Ph.D"];

const SELECTION_STAGES_LIST = [
  { key: "pre_placement_talk", label: "Pre-Placement\nTalk" },
  { key: "resume_shortlisting", label: "Resume\nShortlisting" },
  { key: "online_written_test", label: "Online /\nWritten Test" },
  { key: "group_discussion", label: "Group\nDiscussion" },
  { key: "personal_tech_interview", label: "Personal /\nTechnical Interview" },
];

const DECLARATION_ITEMS = [
  "AIPC guidelines — thoroughly read & agreed to abide during entire placement/internship process",
  "Shortlisting criteria to be provided; final shortlist within 24–48 hours after written test",
  "Information in posted profiles is verified & correct; no new clauses in final offer",
  "Consent to share company name, logo & email with national ranking agencies & media",
  "Confirm accuracy of job profile; adhere to T&C; strict action in case of discrepancy",
  "Results will be shared to CDC and not directly to students",
];

// ── Helpers ──────────────────────────────────────────────────────────
const initContact = () => ({ name: "", designation: "", email: "", phone: "", landline: "" });
const initElig = () => {
  const out: Record<string, Record<string, { checked: boolean; cgpa: string; backlogs: boolean }>> = {};
  Object.entries(PROGRAMMES).forEach(([p, bs]) => {
    out[p] = {};
    bs.forEach(b => { out[p][b] = { checked: false, cgpa: "", backlogs: true }; });
  });
  return out;
};
const initSalary = () => {
  const out: Record<string, { ctc: string; base: string; inhand: string }> = {};
  SALARY_PROGS.forEach(p => { out[p] = { ctc: "", base: "", inhand: "" }; });
  return out;
};
const initAdditional = () => ({
  joining_bonus: "", retention_bonus: "", bond_deductions: "", esops: "", relocation: "",
});

const TOKEN = () => typeof window !== "undefined"
  ? (localStorage.getItem("local_token") || localStorage.getItem("admin_token") || localStorage.getItem("auth_token"))
  : null;
const API = "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function JnfNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [jnfId, setJnfId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: "success" | "error" }>({ open: false, msg: "", type: "success" });
  const [backDialog, setBackDialog] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ open: true, msg, type });

  // ── STEP 1: Company ──────────────────────────────────────────────
  const [company, setCompany] = useState({
    company_name: "", website: "", postal_address: "", employees: "", sector: "",
    category: "", date_of_establishment: "", annual_turnover: "", linkedin: "",
    hq_country: "", nature_of_business: "", description: "",
  });
  const [industrySectors, setIndustrySectors] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // ── STEP 2: Contacts ─────────────────────────────────────────────
  const [headTA, setHeadTA] = useState(initContact());
  const [poc1, setPoc1] = useState(initContact());
  const [poc2, setPoc2] = useState(initContact());

  // ── STEP 3: Job ──────────────────────────────────────────────────
  const [job, setJob] = useState({
    job_title: "", job_formal_designation: "", place_of_posting: "", work_mode: "",
    expected_hires: "", min_hires: "", joining_month: "",
    job_description: "", additional_info: "",
    bond_details: "", registration_link: "", onboarding: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [jdPdf, setJdPdf] = useState<File | null>(null);

  // ── STEP 4: Eligibility ──────────────────────────────────────────
  const [eligibility, setEligibility] = useState(initElig());
  const [globalCgpa, setGlobalCgpa] = useState("");
  const [globalBacklogs, setGlobalBacklogs] = useState(false);

  const toggleBranch = (prog: string, b: string) =>
    setEligibility(p => ({ ...p, [prog]: { ...p[prog], [b]: { ...p[prog][b], checked: !p[prog][b].checked } } }));
  const setBranchCgpa = (prog: string, b: string, v: string) =>
    setEligibility(p => ({ ...p, [prog]: { ...p[prog], [b]: { ...p[prog][b], cgpa: v } } }));
  const setBranchBacklogs = (prog: string, b: string, v: boolean) =>
    setEligibility(p => ({ ...p, [prog]: { ...p[prog], [b]: { ...p[prog][b], backlogs: v } } }));

  // ── STEP 5: Salary ───────────────────────────────────────────────
  const [salary, setSalary] = useState(initSalary());
  const [currency, setCurrency] = useState("INR");
  const [additionalSalary, setAdditionalSalary] = useState<Record<string, typeof initAdditional>>(
    () => { const o: any = {}; SALARY_PROGS.forEach(p => { o[p] = initAdditional(); }); return o; }
  );

  // ── STEP 6: Selection ────────────────────────────────────────────
  const [stages, setStages] = useState<Record<string, boolean>>(
    () => { const o: any = {}; SELECTION_STAGES_LIST.forEach(s => { o[s.key] = false; }); return o; }
  );
  const [selectionMode, setSelectionMode] = useState("");
  const [testType, setTestType] = useState("");
  const [interviewModes, setInterviewModes] = useState<string[]>([]);
  const [psychometricTest, setPsychometricTest] = useState(false);
  const [medicalTest, setMedicalTest] = useState(false);
  const [otherScreening, setOtherScreening] = useState("");
  const [infrastructure, setInfrastructure] = useState("");
  const [testRounds, setTestRounds] = useState([{ name: "", duration: "", type: "" }]);
  const [interviewRounds, setInterviewRounds] = useState([{ name: "", duration: "", mode: "" }]);

  const addTestRound = () => setTestRounds(p => [...p, { name: "", duration: "", type: "" }]);
  const addInterviewRound = () => setInterviewRounds(p => [...p, { name: "", duration: "", mode: "" }]);

  // ── STEP 7: Declaration ──────────────────────────────────────────
  const [declarations, setDeclarations] = useState<boolean[]>(DECLARATION_ITEMS.map(() => false));
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryDesignation, setSignatoryDesignation] = useState("");
  const [signatoryDate, setSignatoryDate] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [rtiNirf, setRtiNirf] = useState(false);
  const allDeclared = declarations.every(Boolean) && !!signatoryName && !!typedSignature;

  // ── AI PDF Parser state ─────────────────────────────────────────
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<string>>(new Set());
  const [trackerOpen, setTrackerOpen] = useState(false);

  // ── Draft: restore from localStorage on mount ────────────────────
  useEffect(() => {
    const resume = searchParams.get("resume");
    if (resume === "1" && !draftLoaded) {
      const saved = loadDraft("jnf");
      if (saved) {
        const d = saved.data;
        if (d.company) setCompany(d.company);
        if (d.industrySectors) setIndustrySectors(d.industrySectors);
        if (d.headTA) setHeadTA(d.headTA);
        if (d.poc1) setPoc1(d.poc1);
        if (d.poc2) setPoc2(d.poc2);
        if (d.job) setJob(d.job);
        if (d.skills) setSkills(d.skills);
        if (d.globalCgpa) setGlobalCgpa(d.globalCgpa);
        if (d.globalBacklogs !== undefined) setGlobalBacklogs(d.globalBacklogs);
        if (d.currency) setCurrency(d.currency);
        if (d.salary) setSalary(d.salary);
        if (d.additionalSalary) setAdditionalSalary(d.additionalSalary);
        if (d.stages) setStages(d.stages);
        if (d.selectionMode) setSelectionMode(d.selectionMode);
        if (d.testType) setTestType(d.testType);
        if (d.interviewModes) setInterviewModes(d.interviewModes);
        if (d.psychometricTest !== undefined) setPsychometricTest(d.psychometricTest);
        if (d.medicalTest !== undefined) setMedicalTest(d.medicalTest);
        if (d.otherScreening) setOtherScreening(d.otherScreening);
        if (d.infrastructure) setInfrastructure(d.infrastructure);
        if (d.testRounds) setTestRounds(d.testRounds);
        if (d.interviewRounds) setInterviewRounds(d.interviewRounds);
        if (d.declarations) setDeclarations(d.declarations);
        if (d.signatoryName) setSignatoryName(d.signatoryName);
        if (d.signatoryDesignation) setSignatoryDesignation(d.signatoryDesignation);
        if (d.signatoryDate) setSignatoryDate(d.signatoryDate);
        if (d.typedSignature) setTypedSignature(d.typedSignature);
        if (d.rtiNirf !== undefined) setRtiNirf(d.rtiNirf);
        if (d.jnfId) setJnfId(d.jnfId);
        setStep(saved.meta.step || 0);
        showToast("Draft restored — continue from where you left off ✓");
      }
      setDraftLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Load company profile from localStorage ───────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("recruiter_company_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCompany((prev) => ({
        ...prev,
        company_name: parsed.company_name || prev.company_name,
        website: parsed.website || prev.website,
        postal_address: parsed.postal_address || prev.postal_address,
        employees: parsed.employees || prev.employees,
        sector: parsed.sector || prev.sector,
        category: parsed.category || prev.category,
        date_of_establishment: parsed.date_of_establishment || prev.date_of_establishment,
        annual_turnover: parsed.annual_turnover || prev.annual_turnover,
        linkedin: parsed.linkedin || prev.linkedin,
        hq_country: parsed.hq_country || prev.hq_country,
        nature_of_business: parsed.nature_of_business || prev.nature_of_business,
        description: parsed.description || prev.description,
      }));
      if (parsed.industry_sectors?.length) setIndustrySectors(parsed.industry_sectors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Count filled fields for completion % (synced with tracker) ──────────
  // NOTE: We derive completionPct from trackerSections so dashboard % and
  // form tracker % always show the same value.
  // completionPct is computed AFTER trackerSections below, so we use a
  // separate simple tally here that mirrors exactly the tracker fields.
  const completionPct = useMemo(() => {
    let filled = 0; let total = 0;
    const check = (v: any) => {
      total++;
      if (v && String(v).trim() && v !== false) filled++;
    };
    // Company (auto-filled from profile — include in total but it's always counted)
    Object.values(company).forEach(check);
    // Contact
    [headTA.name, headTA.email, headTA.phone, poc1.name, poc1.email, poc1.phone].forEach(check);
    // Job
    [job.job_title, job.place_of_posting, job.work_mode, job.expected_hires, job.joining_month, job.job_description].forEach(check);
    // Skills — only filled if at least one tag added
    total++; if (skills.length > 0) filled++;
    // Eligibility — only filled if globalCgpa is explicitly set
    total++; if (globalCgpa.trim()) filled++;
    // Salary
    check(currency);
    SALARY_PROGS.forEach(p => check(salary[p]?.ctc));
    // Selection
    check(selectionMode);
    // Declaration
    check(signatoryName);
    check(typedSignature);
    total++; if (declarations.every(Boolean)) filled++;
    return total ? Math.round((filled / total) * 100) : 0;
  }, [company, headTA, poc1, job, skills, globalCgpa, currency, salary, selectionMode, signatoryName, typedSignature, declarations]);

  // ── Auto-save to localStorage ────────────────────────────────────
  useDraft(
    "jnf",
    {
      company, industrySectors, headTA, poc1, poc2, job, skills, globalCgpa,
      globalBacklogs, currency, salary, additionalSalary, stages, selectionMode,
      testType, interviewModes, psychometricTest, medicalTest, otherScreening,
      infrastructure, testRounds, interviewRounds, declarations,
      signatoryName, signatoryDesignation, signatoryDate, typedSignature,
      rtiNirf, jnfId
    },
    { formType: "jnf", title: company.company_name || "Untitled JNF", step, completion: completionPct, id: jnfId },
  );

  // ── Tracker computation ─────────────────────────────────────────
  const trackerSections: TrackerSection[] = useMemo(() => {
    const f = (key: string, label: string, value: any): TrackerField => {
      let status: FieldStatus = "empty";
      if (typeof value === "string" && value.trim()) status = "filled";
      else if (typeof value === "number" && value > 0) status = "filled";
      else if (typeof value === "boolean") status = value ? "filled" : "empty";
      else if (Array.isArray(value) && value.length > 0) status = "filled";
      else if (value && typeof value === "object") {
        const vals = Object.values(value);
        const filled = vals.filter((v: any) => v && String(v).trim()).length;
        if (filled === vals.length) status = "filled";
        else if (filled > 0) status = "partial";
      }
      return { key, label, status, autoFilled: autoFilledKeys.has(key) };
    };

    const mkSection = (stepIndex: number, stepName: string, fields: TrackerField[]): TrackerSection => {
      const filledCount = fields.filter(fi => fi.status === "filled").length;
      return {
        stepIndex, stepName, fields,
        filledCount,
        totalCount: fields.length,
        percentage: fields.length ? Math.round((filledCount / fields.length) * 100) : 0,
      };
    };

    return [
      // Company Profile is displayed as a banner (not a form step).
      // stepIndex: -1 so tracker never highlights it as "current step".
      mkSection(-1, "Company Profile", [
        f("company.company_name", "Company Name", company.company_name),
        f("company.website", "Website", company.website),
        f("company.postal_address", "Postal Address", company.postal_address),
        f("company.employees", "Employees", company.employees),
        f("company.sector", "Sector", company.sector),
        f("company.category", "Category", company.category),
        f("company.date_of_establishment", "Date of Establishment", company.date_of_establishment),
        f("company.linkedin", "LinkedIn", company.linkedin),
        f("company.description", "Description", company.description),
        f("industry_sectors", "Industry Sectors", industrySectors),
      ]),
      mkSection(0, "Contact & HR", [
        f("head_ta.name", "Head TA - Name", headTA.name),
        f("head_ta.email", "Head TA - Email", headTA.email),
        f("head_ta.phone", "Head TA - Phone", headTA.phone),
        f("poc1.name", "PoC 1 - Name", poc1.name),
        f("poc1.email", "PoC 1 - Email", poc1.email),
        f("poc1.phone", "PoC 1 - Phone", poc1.phone),
      ]),
      mkSection(1, "Job Profile", [
        f("job.job_title", "Job Title", job.job_title),
        f("job.place_of_posting", "Place of Posting", job.place_of_posting),
        f("job.work_mode", "Work Mode", job.work_mode),
        f("job.expected_hires", "Expected Hires", job.expected_hires),
        f("job.joining_month", "Joining Month", job.joining_month),
        f("job.job_description", "Job Description", job.job_description),
        // Skills: only "filled" if at least one tag is added
        { key: "required_skills", label: "Skills", status: skills.length > 0 ? "filled" as FieldStatus : "empty" as FieldStatus, autoFilled: autoFilledKeys.has("required_skills") },
      ]),
      mkSection(2, "Eligibility", [
        // CGPA: only "filled" if explicitly set (not default empty)
        { key: "eligibility.globalCgpa", label: "CGPA Cutoff", status: globalCgpa.trim() ? "filled" as FieldStatus : "empty" as FieldStatus, autoFilled: autoFilledKeys.has("eligibility.globalCgpa") },
        // Branches: only "filled" if at least one branch is checked
        { key: "eligibility.branches", label: "Programmes / Branches", status: Object.values(eligibility).some(prog => Object.values(prog).some(b => b.checked)) ? "filled" as FieldStatus : "empty" as FieldStatus, autoFilled: false },
      ]),
      mkSection(3, "Salary Details", [
        f("salary.currency", "Currency", currency),
        ...SALARY_PROGS.map(p => f(`salary.${p}.ctc`, `${p} CTC`, salary[p]?.ctc)),
      ]),
      mkSection(4, "Selection Process", [
        f("selection.selection_mode", "Selection Mode", selectionMode),
        ...SELECTION_STAGES_LIST.map(s => f(`selection.${s.key}`, s.label.replace("\n", " "), stages[s.key])),
      ]),
      mkSection(5, "Declaration", [
        f("signatory_name", "Signatory Name", signatoryName),
        f("typed_signature", "Typed Signature", typedSignature),
        { key: "declarations", label: "All Declarations", status: declarations.every(Boolean) ? "filled" as FieldStatus : "empty" as FieldStatus, autoFilled: false },
      ]),
    ];
  }, [company, industrySectors, headTA, poc1, poc2, job, skills, globalCgpa, eligibility, currency, salary, selectionMode, stages, signatoryName, typedSignature, declarations, autoFilledKeys]);

  // ── PDF Parse handler ───────────────────────────────────────────
  const handlePdfParse = useCallback(async (file: File, onProgress: (s: string) => void) => {
    const result = await parsePdf(file, "jnf", onProgress);
    const data = result.data as JnfParsedData;

    const filledFields = applyJnfParsedData(data, {
      setCompany: (fn) => setCompany(fn),
      setIndustrySectors,
      setHeadTA: (fn) => setHeadTA(fn),
      setPoc1: (fn) => setPoc1(fn),
      setPoc2: (fn) => setPoc2(fn),
      setJob: (fn) => setJob(fn),
      setSkills,
      setGlobalCgpa,
      setGlobalBacklogs,
      setCurrency,
      setSalary: (fn) => setSalary(fn),
      setStages: (fn) => setStages(fn),
      setSelectionMode,
      setTestType,
      setInterviewModes,
      // Dynamic round setters — AI auto-adds rows
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

  // ─────────────────────────────────────────────────────────────────
  //  API: create draft on first "Save & Continue"
  // ─────────────────────────────────────────────────────────────────
  const ensureDraftCreated = async () => {
    if (jnfId) return jnfId;
    const res = await fetch(`${API}/jnfs`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${TOKEN()}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ company_name: company.company_name || "Draft" }),
    });
    if (!res.ok) throw new Error("Could not create draft");
    const j = await res.json();
    setJnfId(j.data.id);
    return j.data.id;
  };

  const buildFormData = () => {
    const fd = new FormData();
    // Step 1
    Object.entries(company).forEach(([k, v]) => fd.append(k, v));
    fd.append("industry_sectors", JSON.stringify(industrySectors));
    if (logoFile) fd.append("logo", logoFile);
    if (pdfFile) fd.append("brochure_pdf", pdfFile);
    // Step 2
    fd.append("head_ta", JSON.stringify(headTA));
    fd.append("poc1", JSON.stringify(poc1));
    fd.append("poc2", JSON.stringify(poc2));
    // Step 3
    Object.entries(job).forEach(([k, v]) => fd.append(k, v));
    fd.append("required_skills", JSON.stringify(skills));
    if (jdPdf) fd.append("jd_pdf", jdPdf);
    // Step 4
    fd.append("eligibility", JSON.stringify(eligibility));
    // Step 5
    fd.append("currency", currency);
    fd.append("salary", JSON.stringify(salary));
    fd.append("additional_salary", JSON.stringify(additionalSalary));
    // Step 6
    fd.append("selection_stages", JSON.stringify(stages));
    fd.append("test_rounds", JSON.stringify(testRounds));
    fd.append("interview_rounds", JSON.stringify(interviewRounds));
    fd.append("selection_mode", selectionMode);
    fd.append("test_type", testType);
    fd.append("interview_modes", JSON.stringify(interviewModes));
    fd.append("psychometric_test", String(psychometricTest));
    fd.append("medical_test", String(medicalTest));
    fd.append("infrastructure", infrastructure);
    fd.append("other_screening", otherScreening);
    // Step 7
    const declObj: Record<string, boolean> = {};
    DECLARATION_ITEMS.forEach((_, i) => { declObj[`d${i}`] = declarations[i]; });
    fd.append("declarations", JSON.stringify(declObj));
    fd.append("signatory_name", signatoryName);
    fd.append("signatory_designation", signatoryDesignation);
    fd.append("signatory_date", signatoryDate);
    fd.append("typed_signature", typedSignature);
    fd.append("rti_nirf_consent", String(rtiNirf));
    return fd;
  };

  const saveCurrentStep = async () => {
    setSaving(true);
    try {
      const id = await ensureDraftCreated();
      const fd = buildFormData();
      const res = await fetch(`${API}/jnfs/${id}/draft`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${TOKEN()}`, Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Step saved ✓");
    } catch (e: any) {
      showToast(e.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveCurrentStep();
    if (step < 7) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const id = await ensureDraftCreated();
      const fd = buildFormData();
      const submitRes = await fetch(`${API}/jnfs/${id}/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${TOKEN()}`, Accept: "application/json" },
        body: fd,
      });
      if (!submitRes.ok) {
        const err = await submitRes.json();
        throw new Error(err.message || "Submission failed");
      }
      clearDraft("jnf");
      showToast("JNF submitted successfully! Confirmation email sent. ✓");
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (e: any) {
      showToast(e.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  const STEPS = [
    "Contact & HR", "Job Profile",
    "Eligibility", "Salary Details", "Selection Process",
    "Declaration", "Review & Submit",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: SURFACE }}>
      {/* Top bar */}
      <Box sx={{ bgcolor: MAROON, px: { xs: 2, md: 4 }, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton size="small" onClick={() => router.push("/dashboard")} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.95rem", lineHeight: 1 }}>Job Notification Form</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
              IIT (ISM) Dhanbad · CDC Portal {jnfId ? `· Ref: JNF-${String(jnfId).padStart(5, "0")}` : "· New Draft"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* AI Auto-Fill Button */}
          <Tooltip title="Upload a recruiter PDF to auto-fill form fields with AI">
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
              onClick={() => setPdfDialogOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: WHITE,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.72rem",
                borderRadius: 2,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                px: 2,
                py: 0.6,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.4)",
                },
              }}
            >
              AI Auto-Fill
            </Button>
          </Tooltip>
          {/* Tracker toggle */}
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

      {/* Stepper */}
      <Box sx={{ bgcolor: WHITE, borderBottom: `1px solid ${BORDER}`, px: { xs: 1, md: 4 }, py: 1.5, overflowX: "auto" }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < step}>
              <StepLabel
                onClick={() => i < step && setStep(i)}
                sx={{
                  cursor: i < step ? "pointer" : "default",
                  "& .MuiStepIcon-root.Mui-active": { color: MAROON },
                  "& .MuiStepIcon-root.Mui-completed": { color: MAROON },
                  "& .MuiStepLabel-label": { fontSize: "0.65rem", fontWeight: 600 },
                  "& .MuiStepLabel-label.Mui-active": { color: MAROON },
                  "& .MuiStepLabel-label.Mui-completed": { color: MAROON },
                }}
              >{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <InstitutionalHeader type="JNF" />

        {/* ══ COMPANY PROFILE BANNER (auto-filled, read-only) ══════════ */}
        {(() => {
          const stored = typeof window !== "undefined" ? localStorage.getItem("recruiter_company_profile") : null;
          const cp = stored ? JSON.parse(stored) : null;
          return cp ? (
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 3 }}>
              <Box sx={{ bgcolor: "rgba(134,0,0,0.06)", px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineIcon sx={{ color: MAROON, fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 800, color: MAROON, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Company Profile — Auto-filled
                  </Typography>
                </Box>
                <Button
                  href="/company-profile"
                  startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                  sx={{ color: MAROON, fontWeight: 700, fontSize: "0.72rem", textTransform: "none", bgcolor: "rgba(134,0,0,0.06)", borderRadius: 1.5, px: 2, py: 0.5, "&:hover": { bgcolor: "rgba(134,0,0,0.12)" } }}
                >
                  Edit Company Profile
                </Button>
              </Box>
              <Box sx={{ px: 3, py: 2, display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[{ l: "Company", v: cp.company_name }, { l: "Website", v: cp.website }, { l: "Sector", v: cp.sector }, { l: "Category", v: cp.category }, { l: "Employees", v: cp.employees }].map(({ l, v }) =>
                  v ? <Box key={l}>
                    <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>{l}</Typography>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#111827" }}>{v}</Typography>
                  </Box> : null
                )}
              </Box>
            </Paper>
          ) : (
            <Alert severity="warning" action={<Button href="/company-profile" size="small" sx={{ color: MAROON, fontWeight: 700 }}>Set Up Now</Button>} sx={{ mb: 3, fontSize: "0.8rem" }}>
              Company profile not found. Please set it up before submitting.
            </Alert>
          );
        })()}

        {/* ══════════════════ STEP 1: CONTACT & HR ═════════════════════ */}
        {step === 0 && (
          <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem" }}>★ Landline per contact · All Primary Contact fields are mandatory.</Alert>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {[
                  { title: "Head Talent Acquisition *", req: true, val: headTA, set: setHeadTA },
                  { title: "Primary Contact (PoC 1) *", req: true, val: poc1, set: setPoc1 },
                  { title: "Secondary Contact (PoC 2) — Optional", req: false, val: poc2, set: setPoc2 },
                ].map(({ title, req, val, set }) => (
                  <Paper key={title} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", flex: 1, minWidth: 240 }}>
                    <Box sx={{ bgcolor: req ? MAROON : "#374151", px: 2, py: 1 }}>
                      <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.78rem" }}>{title}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.2 }}>
                      {[["name", "Full Name", req], ["designation", "Designation", req], ["email", "Email Address", req], ["phone", "Mobile (+91)", req], ["landline", "Landline (Optional)", false]].map(([k, l, r]) => (
                        <Box key={k as string}>
                          <FieldLabel required={!!r}>{l as string}</FieldLabel>
                          <TextField fullWidth size="small" placeholder="Click to enter…" value={(val as any)[k as string]} onChange={e => set((p: any) => ({ ...p, [k as string]: e.target.value }))} sx={inputSx} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {/* ══════════════════ STEP 3: JOB PROFILE ═══════════════════════ */}
        {step === 1 && (
          <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
            {/* <SectionHeader title="JOB PROFILE" /> */}
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                {[["job_title", "Profile Name / Job Title", true], ["job_formal_designation", "Job Designation (Formal)"], ["place_of_posting", "Place of Posting", true], ["registration_link", "Registration Link (If Any)"], ["bond_details", "Bond Details (If Any)"], ["onboarding", "Onboarding to Company"]].map(([k, l, r]) => (
                  <Box key={k as string}>
                    <FieldLabel required={!!r}>{l as string}</FieldLabel>
                    <TextField fullWidth size="small" value={(job as any)[k as string]} onChange={e => setJob(p => ({ ...p, [k as string]: e.target.value }))} sx={inputSx} />
                  </Box>
                ))}
                <Box>
                  <FieldLabel>Work Location Mode</FieldLabel>
                  <Select fullWidth size="small" value={job.work_mode} onChange={e => setJob(p => ({ ...p, work_mode: e.target.value }))} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.85rem", bgcolor: WHITE }}>
                    <MenuItem value="" disabled><em>Select</em></MenuItem>
                    {["On-site", "Remote", "Hybrid"].map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                  </Select>
                </Box>
                <Box>
                  <FieldLabel required>Tentative Joining Month</FieldLabel>
                  <TextField fullWidth size="small" type="month" value={job.joining_month} onChange={e => setJob(p => ({ ...p, joining_month: e.target.value }))} sx={inputSx} />
                </Box>
                <Box>
                  <FieldLabel required>Expected Hires</FieldLabel>
                  <TextField fullWidth size="small" type="number" value={job.expected_hires} onChange={e => setJob(p => ({ ...p, expected_hires: e.target.value }))} sx={inputSx} />
                </Box>
                <Box>
                  <FieldLabel>Minimum Hires</FieldLabel>
                  <TextField fullWidth size="small" type="number" value={job.min_hires} onChange={e => setJob(p => ({ ...p, min_hires: e.target.value }))} sx={inputSx} />
                </Box>
              </Box>
              {/* Skills tags */}
              <Box>
                <FieldLabel>Required Skills (Tags)</FieldLabel>
                <Box sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                  <TextField fullWidth size="small" placeholder="Type skill, press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills(p => [...p, skillInput.trim()]); } setSkillInput(""); } }} sx={inputSx} />
                  <Button variant="contained" size="small" onClick={() => { if (skillInput.trim()) { setSkills(p => [...p, skillInput.trim()]); setSkillInput(""); } }} sx={{ bgcolor: MAROON, color: WHITE, minWidth: 36, "&:hover": { bgcolor: RED } }}><AddIcon sx={{ fontSize: 18 }} /></Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {skills.map(s => <Chip key={s} label={s} size="small" onDelete={() => setSkills(p => p.filter(x => x !== s))} sx={{ fontSize: "0.7rem", bgcolor: "rgba(87,0,0,0.07)", color: MAROON, fontWeight: 700 }} />)}
                </Box>
              </Box>
              <Box>
                <FieldLabel>Job Description</FieldLabel>
                <TextField fullWidth multiline rows={5} size="small" value={job.job_description} onChange={e => setJob(p => ({ ...p, job_description: e.target.value }))} sx={inputSx} />
              </Box>
              <Box component="label" htmlFor="jd-up" sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, border: `1.5px dashed ${jdPdf ? MAROON : BORDER}`, borderRadius: 1.5, cursor: "pointer", bgcolor: jdPdf ? "rgba(87,0,0,0.03)" : SURFACE, "&:hover": { borderColor: MAROON } }}>
                <CloudUploadIcon sx={{ fontSize: 18, color: jdPdf ? MAROON : "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.78rem", color: jdPdf ? MAROON : "#6B7280" }}>{jdPdf ? jdPdf.name : "Upload JD as PDF (optional)"}</Typography>
                <input id="jd-up" type="file" accept="application/pdf" hidden onChange={e => setJdPdf(e.target.files?.[0] || null)} />
              </Box>
              <Box>
                <FieldLabel>Additional Job Info (1000 chars)</FieldLabel>
                <TextField fullWidth multiline rows={3} size="small" inputProps={{ maxLength: 1000 }} helperText={`${job.additional_info.length}/1000`} value={job.additional_info} onChange={e => setJob(p => ({ ...p, additional_info: e.target.value }))} sx={inputSx} />
              </Box>
            </Box>
          </Paper>
        )}

        {/* ══════════════════ STEP 4: ELIGIBILITY ════════════════════════ */}
        {step === 2 && (
          <Box>
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2.5 }}>
              {/* <SectionHeader title="ELIGIBILITY & COURSES" /> */}
              {/* Global controls */}
              <Box sx={{ p: 2, bgcolor: "#111827", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.62rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>Global Controls</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>Min CGPA:</Typography>
                  <TextField size="small" value={globalCgpa} onChange={e => setGlobalCgpa(e.target.value)} placeholder="e.g. 6.5" inputProps={{ style: { textAlign: "center" } }} sx={{ width: 80, "& .MuiOutlinedInput-root": { bgcolor: WHITE, borderRadius: 1, fontSize: "0.85rem", fontWeight: 800 } }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>Backlogs:</Typography>
                  <Box onClick={() => setGlobalBacklogs(!globalBacklogs)} sx={{ px: 1.5, py: 0.4, borderRadius: 1, cursor: "pointer", fontWeight: 800, fontSize: "0.72rem", bgcolor: globalBacklogs ? "#DCFCE7" : "#FEE2E2", color: globalBacklogs ? "#059669" : "#C41230", border: `1px solid ${globalBacklogs ? "#A7F3D0" : "#FECACA"}` }}>
                    {globalBacklogs ? "✓ YES" : "✗ NO"}
                  </Box>
                </Box>
                <Button variant="contained" size="small"
                  onClick={() => setEligibility(prev => { const n = { ...prev }; Object.keys(n).forEach(p => Object.keys(n[p]).forEach(b => { if (n[p][b].checked) n[p][b] = { ...n[p][b], cgpa: globalCgpa, backlogs: globalBacklogs }; })); return n; })}
                  sx={{ bgcolor: "#B45309", color: WHITE, textTransform: "none", fontWeight: 800, fontSize: "0.72rem", "&:hover": { bgcolor: "#92400E" } }}>
                  ▶ Apply Global to Selected
                </Button>
              </Box>
            </Paper>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
              {Object.entries(PROGRAMMES).map(([prog, branches]) => {
                const allChecked = branches.length > 0 && branches.every(b => eligibility[prog]?.[b]?.checked);
                return (
                  <Paper key={prog} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
                    <Box sx={{ px: 2, py: 1.2, bgcolor: MAROON, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.78rem" }}>{prog}</Typography>
                      <Button size="small" onClick={() => { if (allChecked) { branches.filter(b => eligibility[prog]?.[b]?.checked).forEach(b => toggleBranch(prog, b)); } else { branches.filter(b => !eligibility[prog]?.[b]?.checked).forEach(b => toggleBranch(prog, b)); } }} sx={{ color: WHITE, textTransform: "none", fontSize: "0.68rem", fontWeight: 700, py: 0.2, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
                        {allChecked ? "Deselect All" : "Select All"}
                      </Button>
                    </Box>
                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#F9FAFB", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 2 }}>
                      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#9CA3AF", flex: 1, textTransform: "uppercase", letterSpacing: 0.3 }}>Branch / Specialisation</Typography>
                      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#9CA3AF", width: 64, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.3 }}>CGPA</Typography>
                      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#9CA3AF", width: 52, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.3 }}>Backlogs</Typography>
                    </Box>
                    {branches.map(b => {
                      const d = eligibility[prog]?.[b] ?? { checked: false, cgpa: "", backlogs: true };
                      return (
                        <Box key={b} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.7, px: 1.5, bgcolor: d.checked ? "rgba(87,0,0,0.03)" : WHITE, borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: 0 } }}>
                          <Checkbox size="small" checked={d.checked} onChange={() => toggleBranch(prog, b)} sx={{ color: MAROON, "&.Mui-checked": { color: MAROON }, p: 0.4 }} />
                          <Typography sx={{ fontSize: "0.75rem", flex: 1, color: d.checked ? "#111827" : "#6B7280", fontWeight: d.checked ? 600 : 400 }}>{b}</Typography>
                          <TextField size="small" placeholder="7.0" value={d.cgpa} onChange={e => setBranchCgpa(prog, b, e.target.value)} disabled={!d.checked} sx={{ width: 60, "& .MuiOutlinedInput-root": { fontSize: "0.72rem", borderRadius: 1, bgcolor: d.checked ? WHITE : SURFACE } }} />
                          <Box onClick={() => d.checked && setBranchBacklogs(prog, b, !d.backlogs)} sx={{ minWidth: 48, px: 0.8, py: 0.25, borderRadius: 1, textAlign: "center", bgcolor: d.backlogs ? "#DCFCE7" : "#FEE2E2", color: d.backlogs ? "#059669" : "#C41230", fontWeight: 800, fontSize: "0.6rem", cursor: d.checked ? "pointer" : "default", opacity: d.checked ? 1 : 0.4, userSelect: "none", border: `1px solid ${d.backlogs ? "#A7F3D0" : "#FECACA"}` }}>
                            {d.backlogs ? "✓ YES" : "✗ NO"}
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ══════════════════ STEP 5: SALARY ════════════════════════════ */}
        {step === 3 && (
          <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
            {/* <SectionHeader title="SALARY DETAILS" /> */}
            <Box sx={{ p: 3 }}>
              {/* Currency */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#374151" }}>★ Currency:</Typography>
                {["INR", "USD", "EUR"].map(c => <Chip key={c} label={c} size="small" onClick={() => setCurrency(c)} sx={{ fontWeight: 800, fontSize: "0.7rem", bgcolor: currency === c ? MAROON : SURFACE, color: currency === c ? WHITE : "#374151", border: `1px solid ${currency === c ? MAROON : BORDER}`, cursor: "pointer" }} />)}
              </Box>
              {/* Table header */}
              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr", gap: 1, py: 1, mb: 0.5, bgcolor: MAROON, px: 1.5, borderRadius: 1 }}>
                {["Programme", "CTC (Annual)", "Base / Fixed", "In Hand"].map(h => <Typography key={h} sx={{ color: WHITE, fontWeight: 800, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</Typography>)}
              </Box>
              <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", p: 1.5 }}>
                {SALARY_PROGS.map(prog => (
                  <Box key={prog} sx={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr", gap: 1, alignItems: "center", py: 1, borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: 0 } }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{prog}</Typography>
                    {["ctc", "base", "inhand"].map(k => (
                      <TextField key={k} size="small" placeholder="e.g. 12 LPA" value={(salary[prog] as any)[k]} onChange={e => setSalary(p => ({ ...p, [prog]: { ...(p[prog] as any), [k]: e.target.value } }))} sx={inputSx} />
                    ))}
                  </Box>
                ))}
              </Box>
              {/* Additional Salary Components — accordion per programme */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ bgcolor: MAROON, px: 2, py: 1.2, borderRadius: "8px 8px 0 0" }}>
                  <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.8rem" }}>ADDITIONAL SALARY COMPONENTS</Typography>
                </Box>
                {SALARY_PROGS.map((prog, idx) => (
                  <Accordion key={prog} defaultExpanded={idx === 0} disableGutters elevation={0} sx={{ border: `1px solid ${BORDER}`, borderTop: 0, "&:before": { display: "none" } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                      sx={{ bgcolor: idx === 0 ? "rgba(87,0,0,0.05)" : "#F9FAFB", "& .MuiAccordionSummary-content": { my: 0.5 } }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: MAROON }}>{prog}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        {[["joining_bonus", "Joining Bonus"], ["esops", "ESOPs + Vest Period"], ["retention_bonus", "Retention Bonus"], ["relocation", "Relocation Allowance"], ["bond_deductions", "Bond / Deductions"]].map(([k, l]) => (
                          <Box key={k}>
                            <FieldLabel>{l}</FieldLabel>
                            <TextField fullWidth size="small" placeholder="Amount or details" value={(additionalSalary[prog] as any)?.[k] || ""} onChange={e => setAdditionalSalary(p => ({ ...p, [prog]: { ...(p[prog] as any), [k]: e.target.value } }))} sx={inputSx} />
                          </Box>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {/* ══════════════════ STEP 6: SELECTION PROCESS ═════════════════ */}
        {step === 4 && (
          <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
            {/* <SectionHeader title="SELECTION PROCESS" /> */}
            <Box sx={{ p: 3 }}>
              {/* Existing stages */}
              <Box sx={{ mb: 2, bgcolor: "rgba(87,0,0,0.04)", border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, textTransform: "uppercase", letterSpacing: 0.5, mb: 2 }}>EXISTING STAGES (Retained from current JNF)</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                  {SELECTION_STAGES_LIST.map(s => (
                    <Box key={s.key} onClick={() => setStages(p => ({ ...p, [s.key]: !p[s.key] }))} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, cursor: "pointer", userSelect: "none" }}>
                      <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: stages[s.key] ? MAROON : "#374151", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: stages[s.key] ? `0 0 0 3px rgba(87,0,0,0.3)` : "none", transition: "all 0.2s" }}>
                        {stages[s.key]
                          ? <CheckCircleOutlineIcon sx={{ color: WHITE, fontSize: 28 }} />
                          : <Box sx={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.4)", borderRadius: 0.5 }} />}
                      </Box>
                      <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: stages[s.key] ? MAROON : "#6B7280", textAlign: "center", maxWidth: 80, whiteSpace: "pre-line" }}>{s.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* New additions */}
              <Box sx={{ mb: 2, bgcolor: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 1.5, px: 2, py: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: "#B45309", textTransform: "uppercase", letterSpacing: 0.5 }}>★ NEW ADDITIONS FROM GAP ANALYSIS</Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                <Box>
                  <FieldLabel>Selection Mode (per stage)</FieldLabel>
                  <Select fullWidth size="small" value={selectionMode} onChange={e => setSelectionMode(e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.85rem", bgcolor: WHITE }}>
                    <MenuItem value="" disabled><em>Select</em></MenuItem>
                    {["Online", "Offline", "Hybrid"].map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                  </Select>
                </Box>
                <Box>
                  <FieldLabel>Test Type</FieldLabel>
                  <Select fullWidth size="small" value={testType} onChange={e => setTestType(e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.85rem", bgcolor: WHITE }}>
                    <MenuItem value="" disabled><em>Select</em></MenuItem>
                    {["Aptitude", "Technical", "Written", "Aptitude + Technical", "Other"].map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                  </Select>
                </Box>
              </Box>

              {/* Interview Modes */}
              <Box sx={{ mb: 2 }}>
                <FieldLabel>Interview Modes</FieldLabel>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {["On-campus", "Online", "Telephonic", "Video Conferencing (Zoom/Teams)"].map(m => (
                    <FormControlLabel key={m} control={<Checkbox size="small" checked={interviewModes.includes(m)} onChange={() => setInterviewModes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m])} sx={{ color: MAROON, "&.Mui-checked": { color: MAROON } }} />} label={<Typography sx={{ fontSize: "0.8rem" }}>{m}</Typography>} />
                  ))}
                </Box>
              </Box>

              {/* Toggles */}
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 2 }}>
                {[["Psychometric Test (before offer)", psychometricTest, setPsychometricTest], ["Medical Test (before offer)", medicalTest, setMedicalTest]].map(([l, v, s]) => (
                  <Box key={l as string} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch checked={!!v} onChange={e => (s as any)(e.target.checked)} size="small" sx={{ "& .MuiSwitch-thumb": { bgcolor: v ? MAROON : undefined }, "& .MuiSwitch-track": { bgcolor: v ? "rgba(87,0,0,0.4)!important" : undefined } }} />
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{l as string}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Dynamic rounds */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <FieldLabel>Test Rounds (up to 10)</FieldLabel>
                  <Button size="small" startIcon={<AddIcon />} onClick={addTestRound} disabled={testRounds.length >= 10} sx={{ textTransform: "none", color: MAROON, fontSize: "0.72rem" }}>Add Round</Button>
                </Box>
                {testRounds.map((r, i) => (
                  <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 36px", gap: 1, mb: 1, alignItems: "center" }}>
                    <TextField size="small" placeholder={`Round ${i + 1} name`} value={r.name} onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} sx={inputSx} />
                    <TextField size="small" placeholder="Mins" value={r.duration} onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} sx={inputSx} />
                    <Select size="small" value={r.type} onChange={e => setTestRounds(p => p.map((x, j) => j === i ? { ...x, type: e.target.value } : x))} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.82rem", bgcolor: WHITE }}>
                      <MenuItem value="" disabled><em>Type</em></MenuItem>
                      {["Aptitude", "Technical", "Written", "Other"].map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.82rem" }}>{v}</MenuItem>)}
                    </Select>
                    {i > 0 && <IconButton size="small" onClick={() => setTestRounds(p => p.filter((_, j) => j !== i))} sx={{ color: "#EF4444" }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton>}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <FieldLabel>Interview Rounds (up to 10)</FieldLabel>
                  <Button size="small" startIcon={<AddIcon />} onClick={addInterviewRound} disabled={interviewRounds.length >= 10} sx={{ textTransform: "none", color: MAROON, fontSize: "0.72rem" }}>Add Round</Button>
                </Box>
                {interviewRounds.map((r, i) => (
                  <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 36px", gap: 1, mb: 1, alignItems: "center" }}>
                    <TextField size="small" placeholder={`Round ${i + 1} name`} value={r.name} onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} sx={inputSx} />
                    <TextField size="small" placeholder="Mins" value={r.duration} onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, duration: e.target.value } : x))} sx={inputSx} />
                    <Select size="small" value={r.mode} onChange={e => setInterviewRounds(p => p.map((x, j) => j === i ? { ...x, mode: e.target.value } : x))} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.82rem", bgcolor: WHITE }}>
                      <MenuItem value="" disabled><em>Mode</em></MenuItem>
                      {["On-campus", "Online", "Telephonic", "Video Conferencing"].map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.82rem" }}>{v}</MenuItem>)}
                    </Select>
                    {i > 0 && <IconButton size="small" onClick={() => setInterviewRounds(p => p.filter((_, j) => j !== i))} sx={{ color: "#EF4444" }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton>}
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <FieldLabel>Infrastructure Required (on campus)</FieldLabel>
                  <TextField fullWidth size="small" multiline rows={2} placeholder="e.g. 2 interview rooms, 1 PPT hall" value={infrastructure} onChange={e => setInfrastructure(e.target.value)} sx={inputSx} />
                </Box>
                <Box>
                  <FieldLabel>Other Screening (free text)</FieldLabel>
                  <TextField fullWidth size="small" multiline rows={2} placeholder="Any additional screening steps..." value={otherScreening} onChange={e => setOtherScreening(e.target.value)} sx={inputSx} />
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* ══════════════════ STEP 7: DECLARATION ════════════════════════ */}
        {step === 5 && (
          <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
            {/* <SectionHeader title="DECLARATION & SUBMIT" /> */}
            <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              {/* Left */}
              <Box>
                <Box sx={{ bgcolor: MAROON, color: WHITE, px: 2, py: 1, borderRadius: 1, mb: 2, fontSize: "0.72rem", fontWeight: 800, letterSpacing: 0.4 }}>
                  UNIFORM DECLARATION (Retained from current form)
                </Box>
                {DECLARATION_ITEMS.map((item, i) => (
                  <FormControlLabel key={i} control={<Checkbox checked={declarations[i]} onChange={() => setDeclarations(p => { const n = [...p]; n[i] = !n[i]; return n; })} sx={{ color: MAROON, "&.Mui-checked": { color: MAROON } }} />}
                    label={<Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{item}</Typography>}
                    sx={{ display: "flex", alignItems: "flex-start", mb: 1, border: `1px solid ${BORDER}`, borderRadius: 1, px: 1.5, py: 1, bgcolor: declarations[i] ? "rgba(87,0,0,0.03)" : WHITE }} />
                ))}
              </Box>
              {/* Right */}
              <Box>
                <Box sx={{ bgcolor: "#B45309", color: WHITE, px: 2, py: 1, borderRadius: 1, mb: 2, fontSize: "0.72rem", fontWeight: 800, letterSpacing: 0.4 }}>
                  ★ NEW ADDITIONS
                </Box>
                <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 2, mb: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1.5, textTransform: "uppercase", letterSpacing: 0.4 }}>Self-Declaration (Authorised Signatory)</Typography>
                  {[["signatoryName", "Authorised Signatory Name", setSignatoryName, true], ["signatoryDesignation", "Designation", setSignatoryDesignation, true]].map(([k, l, s, r]) => (
                    <Box key={k as string} sx={{ mb: 1.5 }}>
                      <FieldLabel required={!!r}>{l as string}</FieldLabel>
                      <TextField fullWidth size="small" value={k === "signatoryName" ? signatoryName : signatoryDesignation} onChange={e => (s as any)(e.target.value)} sx={inputSx} />
                    </Box>
                  ))}
                  <Box sx={{ mb: 1.5 }}>
                    <FieldLabel required>Date</FieldLabel>
                    <TextField fullWidth size="small" type="date" value={signatoryDate} onChange={e => setSignatoryDate(e.target.value)} sx={inputSx} />
                  </Box>
                  <Box>
                    <FieldLabel required>Typed Signature (Full Name)</FieldLabel>
                    <TextField fullWidth size="small" placeholder="Type your full name as signature" value={typedSignature} onChange={e => setTypedSignature(e.target.value)} sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontFamily: "cursive", fontSize: "1rem" } }} />
                  </Box>
                </Box>
                <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, p: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 1, textTransform: "uppercase", letterSpacing: 0.4 }}>RTI / NIRF Consent</Typography>
                  <FormControlLabel control={<Switch checked={rtiNirf} onChange={e => setRtiNirf(e.target.checked)} sx={{ "& .MuiSwitch-thumb": { bgcolor: rtiNirf ? MAROON : undefined }, "& .MuiSwitch-track": { bgcolor: rtiNirf ? "rgba(87,0,0,0.4)!important" : undefined } }} />} label={<Typography sx={{ fontSize: "0.78rem" }}>I consent to share data with RTI / ranking agencies (NIRF)</Typography>} />
                  <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", mt: 1 }}>
                    📧 A confirmation email will be sent to your registered address upon successful submission.
                  </Typography>
                </Box>
                {!allDeclared && (
                  <Alert severity="warning" sx={{ mt: 2, fontSize: "0.75rem" }}>
                    Please check all declaration boxes, fill signatory name, and type your signature to proceed.
                  </Alert>
                )}
              </Box>
            </Box>
          </Paper>
        )}

        {/* ══════════════════ STEP 8: REVIEW & CONFIRM ══════════════════ */}
        {step === 6 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, fontSize: "0.78rem" }}>
              This is a read-only preview of your JNF. To make changes, click <strong>"← Go Back to Edit"</strong> and navigate to any step. Once confirmed, the form will be submitted.
            </Alert>

            {/* Company */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Company Profile</Typography>
                <IconButton size="small" onClick={() => setStep(0)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <ReviewRow label="Company Name" value={company.company_name} />
                <ReviewRow label="Website" value={company.website} />
                <ReviewRow label="Postal Address" value={company.postal_address} />
                <ReviewRow label="Sector" value={company.sector} />
                <ReviewRow label="Category / Org Type" value={company.category} />
                <ReviewRow label="Employees" value={company.employees} />
                <ReviewRow label="Annual Turnover" value={company.annual_turnover} />
                <ReviewRow label="Industry Sectors" value={industrySectors.join(", ")} />
                <ReviewRow label="Nature of Business" value={company.nature_of_business} />
                <ReviewRow label="LinkedIn" value={company.linkedin} />
                <ReviewRow label="HQ Country / City" value={company.hq_country} />
                <ReviewRow label="Description" value={company.description} />
                {logoFile && <ReviewRow label="Logo" value={logoFile.name} />}
                {pdfFile && <ReviewRow label="Brochure" value={pdfFile.name} />}
              </Box>
            </Paper>

            {/* Contacts */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Contact & HR Details</Typography>
                <IconButton size="small" onClick={() => setStep(1)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                {[["Head Talent Acquisition", headTA], ["Primary Contact (PoC 1)", poc1], ["Secondary Contact (PoC 2)", poc2]].map(([title, c]) => (
                  <Box key={title as string}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 0.8, textTransform: "uppercase" }}>{title as string}</Typography>
                    {Object.entries(c as any).map(([k, v]) => v ? <ReviewRow key={k} label={k} value={v as string} /> : null)}
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Job */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Job Profile</Typography>
                <IconButton size="small" onClick={() => setStep(2)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <ReviewRow label="Job Title" value={job.job_title} />
                <ReviewRow label="Designation" value={job.job_formal_designation} />
                <ReviewRow label="Place of Posting" value={job.place_of_posting} />
                <ReviewRow label="Work Mode" value={job.work_mode} />
                <ReviewRow label="Expected Hires" value={job.expected_hires} />
                <ReviewRow label="Min Hires" value={job.min_hires} />
                <ReviewRow label="Joining Month" value={job.joining_month} />
                <ReviewRow label="Required Skills" value={skills.join(", ")} />
                <ReviewRow label="Bond Details" value={job.bond_details} />
                <ReviewRow label="Reg. Link" value={job.registration_link} />
                {job.job_description && <Box sx={{ py: 0.5, borderBottom: `1px solid ${BORDER}` }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, mb: 0.3 }}>Job Description</Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: "#374151", whiteSpace: "pre-wrap" }}>{job.job_description}</Typography>
                </Box>}
              </Box>
            </Paper>

            {/* Eligibility summary */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Eligibility & Courses</Typography>
                <IconButton size="small" onClick={() => setStep(3)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                {Object.entries(eligibility).map(([prog, branches]) => {
                  const selected = Object.entries(branches).filter(([, d]) => d.checked);
                  if (!selected.length) return null;
                  return (
                    <Box key={prog} sx={{ mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, mb: 0.5, textTransform: "uppercase" }}>{prog}</Typography>
                      {selected.map(([b, d]) => (
                        <Box key={b} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.3, pl: 1. }}>
                          <Typography sx={{ fontSize: "0.75rem", flex: 1 }}>• {b}</Typography>
                          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>CGPA: {d.cgpa}</Typography>
                          <Box sx={{ px: 0.8, py: 0.1, borderRadius: 0.5, bgcolor: d.backlogs ? "#DCFCE7" : "#FEE2E2", color: d.backlogs ? "#059669" : "#C41230", fontSize: "0.6rem", fontWeight: 800 }}>{d.backlogs ? "YES" : "NO"}</Box>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Salary */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Salary Details ({currency})</Typography>
                <IconButton size="small" onClick={() => setStep(4)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr", gap: 1, py: 0.8, borderBottom: `1px solid ${BORDER}`, mb: 0.5 }}>
                  {["Programme", "CTC", "Base", "In Hand"].map(h => <Typography key={h} sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase" }}>{h}</Typography>)}
                </Box>
                {SALARY_PROGS.map(p => (salary[p]?.ctc || salary[p]?.base || salary[p]?.inhand) && (
                  <Box key={p} sx={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr", gap: 1, py: 0.5, borderBottom: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>{p}</Typography>
                    {["ctc", "base", "inhand"].map(k => <Typography key={k} sx={{ fontSize: "0.78rem", color: "#374151" }}>{(salary[p] as any)[k] || "—"}</Typography>)}
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Selection */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 2 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>Selection Process</Typography>
                <IconButton size="small" onClick={() => setStep(5)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <ReviewRow label="Stages" value={SELECTION_STAGES_LIST.filter(s => stages[s.key]).map(s => s.label.replace("\n", " ")).join(", ")} />
                <ReviewRow label="Selection Mode" value={selectionMode} />
                <ReviewRow label="Test Type" value={testType} />
                <ReviewRow label="Interview Modes" value={interviewModes.join(", ")} />
                <ReviewRow label="Psychometric" value={psychometricTest ? "Yes" : "No"} />
                <ReviewRow label="Medical Test" value={medicalTest ? "Yes" : "No"} />
                <ReviewRow label="Infrastructure" value={infrastructure} />
                <ReviewRow label="Other Screening" value={otherScreening} />
                {testRounds.some(r => r.name) && <ReviewRow label="Test Rounds" value={testRounds.filter(r => r.name).map(r => `${r.name}${r.duration ? " (" + r.duration + " min)" : ""}${r.type ? " — " + r.type : ""}`).join("; ")} />}
                {interviewRounds.some(r => r.name) && <ReviewRow label="Interview Rounds" value={interviewRounds.filter(r => r.name).map(r => `${r.name}${r.duration ? " (" + r.duration + " min)" : ""}${r.mode ? " — " + r.mode : ""}`).join("; ")} />}
              </Box>
            </Paper>

            {/* Declaration */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden", mb: 3 }}>
              <Box sx={{ bgcolor: MAROON, px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ color: WHITE, fontWeight: 800, fontSize: "0.82rem" }}>09 — Declaration</Typography>
                <IconButton size="small" onClick={() => setStep(6)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: WHITE } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
              <Box sx={{ p: 2 }}>
                <ReviewRow label="Signatory Name" value={signatoryName} />
                <ReviewRow label="Signatory Designation" value={signatoryDesignation} />
                <ReviewRow label="Date" value={signatoryDate} />
                <ReviewRow label="Typed Signature" value={typedSignature} />
                <ReviewRow label="RTI/NIRF Consent" value={rtiNirf ? "Consented" : "Not consented"} />
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600 }}>
                    Declarations: {declarations.filter(Boolean).length}/{DECLARATION_ITEMS.length} accepted
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Final CTA */}
            <Box sx={{ border: `2px solid ${MAROON}`, borderRadius: 2, p: 3, bgcolor: "rgba(87,0,0,0.02)" }}>
              <Typography sx={{ fontWeight: 900, fontSize: "0.9rem", color: MAROON, mb: 0.5 }}>✅ Ready to Submit</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mb: 2 }}>
                By clicking "Confirm & Submit JNF", the form will be finalized and sent to the CDC team. A confirmation email will be sent to your registered email address.
              </Typography>
              {!allDeclared && <Alert severity="warning" sx={{ mb: 2, fontSize: "0.75rem" }}>Please go back to Declaration step and complete all required fields before submitting.</Alert>}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setStep(5)} sx={{ textTransform: "none", color: MAROON, borderColor: MAROON, fontWeight: 700, "&:hover": { bgcolor: "rgba(87,0,0,0.04)" } }}>
                  ← Go Back to Edit
                </Button>
                <Button variant="contained" endIcon={submitting ? <CircularProgress size={14} sx={{ color: WHITE }} /> : <SendIcon />}
                  disabled={!allDeclared || submitting}
                  onClick={handleSubmit}
                  sx={{ textTransform: "none", bgcolor: "#14532D", color: WHITE, fontWeight: 900, px: 4, "&:hover": { bgcolor: "#166534" }, "&.Mui-disabled": { bgcolor: "#D1D5DB" } }}>
                  {submitting ? "Submitting…" : "Confirm & Submit JNF"}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Navigation ─────────────────────────────────────────── */}
        {step < 6 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setStep(s => s - 1)} disabled={step === 0}
              sx={{ textTransform: "none", color: MAROON, borderColor: MAROON, fontWeight: 700, "&:hover": { bgcolor: "rgba(87,0,0,0.04)" } }}>
              Back
            </Button>
            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600 }}>Step {step + 1} of {STEPS.length}</Typography>
            <Button variant="contained" endIcon={saving ? <CircularProgress size={14} sx={{ color: WHITE }} /> : <ArrowForwardIcon />}
              onClick={step === 6 ? handleNext : handleNext}
              disabled={saving || (step === 5 && !allDeclared)}
              sx={{ textTransform: "none", bgcolor: MAROON, color: WHITE, fontWeight: 800, px: 3, "&:hover": { bgcolor: RED } }}>
              {saving ? "Saving…" : step === 5 ? "Save & Review" : "Save & Continue"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={toast.type} sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{toast.msg}</Alert>
      </Snackbar>

      {/* AI PDF Upload Dialog */}
      <PdfUploadDialog
        open={pdfDialogOpen}
        onClose={() => setPdfDialogOpen(false)}
        onParse={handlePdfParse}
        formType="jnf"
      />

      {/* Cross-Page Form Tracker */}
      <FormTracker
        sections={trackerSections}
        currentStep={step}
        onJumpToStep={setStep}
        autoFilledKeys={autoFilledKeys}
        open={trackerOpen}
        onToggle={() => setTrackerOpen(!trackerOpen)}
      />
    </Box>
  );
}
