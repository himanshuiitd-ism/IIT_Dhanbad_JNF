"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Paper, Select, MenuItem, Chip, Divider, InputAdornment,
  LinearProgress, Snackbar,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import LinkIcon from "@mui/icons-material/Link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// ─── Tokens ────────────────────────────────────────────────────
const MAROON = "#860000";
const RED    = "#b90000";
const YELLOW = "#FFD700";
const SURFACE = "#FBF8F8";
const WHITE  = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.09)";

export const COMPANY_PROFILE_KEY = "recruiter_company_profile";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, bgcolor: WHITE, fontSize: "0.88rem",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MAROON },
    "&.Mui-focused fieldset": { borderColor: MAROON, borderWidth: 2 },
  },
};

const Label = ({ children, required }: { children: string; required?: boolean }) => (
  <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.6, textTransform: "uppercase", letterSpacing: 0.4 }}>
    {children}{required && <span style={{ color: "#C41230", marginLeft: 2 }}>*</span>}
  </Typography>
);

const SECTOR_OPTIONS = [
  "Core Engineering", "IT / Software", "Consulting", "Finance / BFSI",
  "Research & Development", "Government / PSU", "Manufacturing",
  "Analytics / Data Science", "Energy & Power", "FMCG", "Healthcare / Pharma", "Other",
];
const CATEGORY_OPTIONS = [
  "MNC", "Indian Private", "Indian Public (Listed)", "PSU",
  "Startup", "Government / Defence", "NGO", "Research Institute", "Other",
];
const TURNOVER_OPTIONS = [
  "< ₹100 Crore", "₹100–500 Crore", "₹500–2,000 Crore",
  "₹2,000–10,000 Crore", "> ₹10,000 Crore", "Not Disclosed",
];
const EMPLOYEES_OPTIONS = ["< 50", "50–200", "200–1,000", "1,000–10,000", "10,000+"];
const NATURE_OPTIONS = ["Product", "Service", "Product + Service", "Consulting"];

const EMPTY_PROFILE = {
  company_name: "", website: "", postal_address: "", employees: "",
  sector: "", category: "", date_of_establishment: "", annual_turnover: "",
  linkedin: "", hq_country: "", nature_of_business: "", description: "",
  industry_sectors: [] as string[],
  logo_url: "",
};

export type CompanyProfile = typeof EMPTY_PROFILE;

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY_PROFILE);
  const [sectorInput, setSectorInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState("");

  // Load existing profile on mount
  useEffect(() => {
    const stored = localStorage.getItem(COMPANY_PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile(parsed);
      setIsEditMode(true); // They already have a profile — they're editing
    }
  }, []);

  // ── Auth guard: redirect unauthenticated users to landing page ──
  // During registration flow, users have a token but no role yet,
  // so we check for any auth indicator (role OR token).
  useEffect(() => {
    const localRole = localStorage.getItem("local_user_role");
    const localToken = localStorage.getItem("local_token");
    const authToken = localStorage.getItem("auth_token");
    if (!localRole && !localToken && !authToken) {
      router.replace("/");
    }
  }, [router]);

  const set = (k: keyof CompanyProfile, v: any) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const addSector = () => {
    if (sectorInput.trim() && !profile.industry_sectors.includes(sectorInput.trim())) {
      set("industry_sectors", [...profile.industry_sectors, sectorInput.trim()]);
    }
    setSectorInput("");
  };

  const validate = () => {
    if (!profile.company_name.trim()) return "Company name is required.";
    if (!profile.website.trim()) return "Website is required.";
    if (!profile.sector) return "Sector is required.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);

    // Save to localStorage
    localStorage.setItem(COMPANY_PROFILE_KEY, JSON.stringify(profile));

    // Try to save to backend (non-blocking — works even if backend is offline)
    try {
      const token = localStorage.getItem("local_token") || localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
      if (token) {
        await fetch("http://localhost:8000/api/company-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(profile),
        });
      }
    } catch {
      // Backend offline — OK, localStorage is the source of truth for now
    }

    setSaving(false);
    setToast("Company profile saved successfully!");
    setTimeout(() => router.push("/dashboard"), 1200);
  };

  const progress = [
    profile.company_name, profile.website, profile.sector,
    profile.category, profile.employees, profile.description,
  ].filter(Boolean).length / 6 * 100;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: SURFACE }}>
      {/* Top bar */}
      <Box sx={{ bgcolor: MAROON, px: { xs: 3, md: 6 }, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ bgcolor: WHITE, borderRadius: 1, p: 0.4 }}>
            <Image src="/logo.png" alt="IIT Dhanbad" width={28} height={28} />
          </Box>
          <Box>
            <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.9rem", lineHeight: 1 }}>IIT (ISM) Dhanbad</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem", fontWeight: 500 }}>Career Development Centre</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ color: YELLOW, fontWeight: 800, fontSize: "0.78rem" }}>
            {isEditMode ? "✏️ Edit Company Profile" : "Step 3 of Registration"}
          </Typography>
          {isEditMode && (
            <Button
              href="/dashboard"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", textTransform: "none", fontWeight: 600, "&:hover": { color: WHITE } }}
            >
              ← Back to Dashboard
            </Button>
          )}
        </Box>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 3, bgcolor: "rgba(134,0,0,0.15)", "& .MuiLinearProgress-bar": { bgcolor: YELLOW } }}
      />

      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Page header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <BusinessIcon sx={{ color: MAROON, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: MAROON, letterSpacing: -0.5 }}>
              Company Profile
            </Typography>
          </Box>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
            {isEditMode
              ? "Update your company information. This will be pre-filled in all future JNF / INF submissions."
              : "Fill in your company details once — we'll automatically use them in all your JNF and INF forms. You can edit this anytime from the dashboard."}
          </Typography>
        </Box>

        {/* One-time notice */}
        {!isEditMode && (
          <Alert
            icon={<CheckCircleIcon />}
            severity="success"
            sx={{ mb: 3, borderRadius: 2, fontSize: "0.8rem", fontWeight: 600 }}
          >
            You only need to fill this <strong>once</strong>. Future JNF/INF forms will be pre-filled with this data automatically.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: "0.8rem" }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ bgcolor: MAROON, px: 3, py: 1.8 }}>
            <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.95rem", letterSpacing: 0.5 }}>
              COMPANY INFORMATION
            </Typography>
          </Box>

          <Box sx={{ p: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            {/* Left column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Label required>Company Name</Label>
                <TextField fullWidth size="small" placeholder="e.g. Tata Consultancy Services" value={profile.company_name} onChange={e => set("company_name", e.target.value)} sx={inputSx} />
              </Box>
              <Box>
                <Label required>Website</Label>
                <TextField fullWidth size="small" placeholder="https://www.company.com" value={profile.website} onChange={e => set("website", e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></InputAdornment> }}
                  sx={inputSx} />
              </Box>
              <Box>
                <Label>Postal Address</Label>
                <TextField fullWidth size="small" multiline rows={2} placeholder="Corporate headquarters address" value={profile.postal_address} onChange={e => set("postal_address", e.target.value)} sx={inputSx} />
              </Box>
              <Box>
                <Label>No. of Employees</Label>
                <Select fullWidth size="small" value={profile.employees} onChange={e => set("employees", e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.88rem", bgcolor: WHITE }}>
                  <MenuItem value="" disabled><em>Select range</em></MenuItem>
                  {EMPLOYEES_OPTIONS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Label required>Sector</Label>
                <Select fullWidth size="small" value={profile.sector} onChange={e => set("sector", e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.88rem", bgcolor: WHITE }}>
                  <MenuItem value="" disabled><em>Select sector</em></MenuItem>
                  {SECTOR_OPTIONS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Label>Company Logo</Label>
                <Box component="label" htmlFor="logo-up" sx={{
                  display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                  border: `1.5px dashed ${logoFile ? MAROON : BORDER}`, borderRadius: 1.5,
                  cursor: "pointer", bgcolor: logoFile ? "rgba(134,0,0,0.03)" : SURFACE,
                  "&:hover": { borderColor: MAROON },
                }}>
                  <CloudUploadIcon sx={{ fontSize: 18, color: logoFile ? MAROON : "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "0.78rem", color: logoFile ? MAROON : "#6B7280" }}>
                    {logoFile ? logoFile.name : "Upload logo (PNG/JPG · max 2 MB)"}
                  </Typography>
                  <input id="logo-up" type="file" accept="image/*" hidden onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                </Box>
              </Box>
              <Box component="label" htmlFor="pdf-up" sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5,
                p: 1.5, bgcolor: "#14532D", color: WHITE, borderRadius: 1.5,
                cursor: "pointer", "&:hover": { bgcolor: "#166534" },
              }}>
                <CloudUploadIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.8rem" }}>
                  {pdfFile ? pdfFile.name : "UPLOAD COMPANY BROCHURE / PDF"}
                </Typography>
                <input id="pdf-up" type="file" accept="application/pdf" hidden onChange={e => setPdfFile(e.target.files?.[0] || null)} />
              </Box>
            </Box>

            {/* Right column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Label>Category / Org Type</Label>
                <Select fullWidth size="small" value={profile.category} onChange={e => set("category", e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.88rem", bgcolor: WHITE }}>
                  <MenuItem value="" disabled><em>Select type</em></MenuItem>
                  {CATEGORY_OPTIONS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Label>Date of Establishment</Label>
                <TextField fullWidth size="small" type="date" value={profile.date_of_establishment} onChange={e => set("date_of_establishment", e.target.value)} sx={inputSx} />
              </Box>
              <Box>
                <Label>Annual Turnover (NIRF)</Label>
                <Select fullWidth size="small" value={profile.annual_turnover} onChange={e => set("annual_turnover", e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.88rem", bgcolor: WHITE }}>
                  <MenuItem value="" disabled><em>Select range</em></MenuItem>
                  {TURNOVER_OPTIONS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Label>Social Media / LinkedIn URL</Label>
                <TextField fullWidth size="small" value={profile.linkedin} onChange={e => set("linkedin", e.target.value)} sx={inputSx} placeholder="https://linkedin.com/company/..." />
              </Box>
              <Box>
                <Label>Industry Sector Tags</Label>
                <Box sx={{ display: "flex", gap: 1, mb: 0.8 }}>
                  <TextField fullWidth size="small" placeholder="Add tag, press Enter" value={sectorInput}
                    onChange={e => setSectorInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSector(); } }}
                    sx={inputSx} />
                  <Button variant="contained" size="small" onClick={addSector} sx={{ bgcolor: MAROON, color: WHITE, minWidth: 36, "&:hover": { bgcolor: RED } }}>
                    <AddIcon sx={{ fontSize: 18 }} />
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {profile.industry_sectors.map(t => (
                    <Chip key={t} label={t} size="small"
                      onDelete={() => set("industry_sectors", profile.industry_sectors.filter(x => x !== t))}
                      sx={{ fontSize: "0.7rem", bgcolor: "rgba(134,0,0,0.07)", color: MAROON, fontWeight: 700 }} />
                  ))}
                </Box>
              </Box>
              <Box>
                <Label>If MNC — HQ Country / City</Label>
                <TextField fullWidth size="small" value={profile.hq_country} onChange={e => set("hq_country", e.target.value)} sx={inputSx} />
              </Box>
              <Box>
                <Label>Nature of Business</Label>
                <Select fullWidth size="small" value={profile.nature_of_business} onChange={e => set("nature_of_business", e.target.value)} displayEmpty sx={{ borderRadius: 1.5, fontSize: "0.88rem", bgcolor: WHITE }}>
                  <MenuItem value="" disabled><em>Select</em></MenuItem>
                  {NATURE_OPTIONS.map(v => <MenuItem key={v} value={v} sx={{ fontSize: "0.85rem" }}>{v}</MenuItem>)}
                </Select>
              </Box>
              <Box>
                <Label>Company Description</Label>
                <TextField fullWidth size="small" multiline rows={4}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${profile.description.length}/1000`}
                  value={profile.description} onChange={e => set("description", e.target.value)} sx={inputSx} />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Action buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          {isEditMode && (
            <Button
              href="/dashboard"
              variant="outlined"
              sx={{ color: MAROON, borderColor: MAROON, fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            endIcon={saving ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
            sx={{
              bgcolor: MAROON, color: WHITE, fontWeight: 800, textTransform: "none",
              fontSize: "0.95rem", borderRadius: 2, px: 4, py: 1.4,
              "&:hover": { bgcolor: RED },
            }}
          >
            {saving ? "Saving…" : isEditMode ? "Update Profile" : "Save & Proceed to Dashboard →"}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={1500}
        onClose={() => setToast("")}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
