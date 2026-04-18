"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Container,
  IconButton,
  Alert,
  CircularProgress,
  Switch,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

// ─── Design Tokens (The Heritage Modernist) ───────────────────
const MAROON = "#860000ff";
const RED = "#c00000ff";
const SURFACE = "#FFFFFF"; // Changed to white
const GREY_RED = "#FBF8F8"; // Little grey-red
const WHITE = "#FFFFFF";
const BORDER_GHOST = "rgba(128, 0, 0, 0.08)";

const steps = [
  "Company Overview",
  "Contact Person",
  "Internship Profile",
  "Eligibility & Selection",
  "Final Review"
];

const DEPARTMENTS = [
  "Applied Geology",
  "Applied Geophysics",
  "Chemistry and Chemical Biology",
  "Chemical Engineering",
  "Computer Science and Engineering",
  "Civil Engineering",
  "Electronics Engineering",
  "Electrical Engineering",
  "Environmental Science & Engineering",
  "Fuel, Minerals and Metallurgical Engineering",
  "Humanities and Social Sciences",
  "Mathematics and Computing",
  "Mining Engineering",
  "Mechanical Engineering",
  "Management Studies and Industrial Engineering",
  "Petroleum Engineering",
  "Physics",
];

const COURSES = [
  "B.Tech",
  "Dual Degree",
  "Integrated M.Tech",
  "M.Sc",
  "M.Sc Tech",
  "M.Tech",
  "MBA",
  "Ph.D"
];

export default function NewINFPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    postal_address: "",
    sector: "",
    category: "",
    
    primary_contact_name: "",
    primary_contact_designation: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    
    internship_designation: "",
    internship_description: "",
    place_of_posting: "",
    duration_weeks: "",
    monthly_stipend: "",
    ppo_provision: false,
    ppo_ctc: "",
    
    eligible_degrees: [] as string[],
    eligible_departments: [] as string[],
    min_cutoff_cgpa: "",
    
    selection_ppt: false,
    selection_rounds: [] as string[],
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" || type === "button-switch" ? checked : value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCheckboxChange = (group: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[group] || [];
      const updated = current.includes(value)
        ? current.filter((i: string) => i !== value)
        : [...current, value];
      return { ...prev, [group]: updated };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:8000/api/infs", formData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit INF. Please ensure backend is running.");
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Postal Address" name="postal_address" value={formData.postal_address} onChange={handleChange} multiline rows={2} variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sector" name="sector" value={formData.sector} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} variant="filled" />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontFamily: "var(--font-manrope)", color: MAROON }}>Primary Contact</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Name" name="primary_contact_name" value={formData.primary_contact_name} onChange={handleChange} variant="filled" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Designation" name="primary_contact_designation" value={formData.primary_contact_designation} onChange={handleChange} variant="filled" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="primary_contact_email" value={formData.primary_contact_email} onChange={handleChange} variant="filled" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="primary_contact_phone" value={formData.primary_contact_phone} onChange={handleChange} variant="filled" /></Grid>
            </Grid>
          </>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Internship Designation" name="internship_designation" value={formData.internship_designation} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Place of Posting" name="place_of_posting" value={formData.place_of_posting} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Internship Description" name="internship_description" value={formData.internship_description} onChange={handleChange} multiline rows={4} variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Duration (Weeks)" name="duration_weeks" value={formData.duration_weeks} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Monthly Stipend" name="monthly_stipend" value={formData.monthly_stipend} onChange={handleChange} variant="filled" />
            </Grid>
            <Grid item xs={12}>
               <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: SURFACE, p: 2, borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>PPO Provision?</Typography>
                  <Switch name="ppo_provision" checked={formData.ppo_provision} onChange={handleSwitchChange} color="primary" />
               </Box>
            </Grid>
            {formData.ppo_provision && (
               <Grid item xs={12}>
                  <TextField fullWidth label="CTC if PPO is offered" name="ppo_ctc" value={formData.ppo_ctc} onChange={handleChange} variant="filled" helperText="Approximate CTC after conversion to Full Time" />
               </Grid>
            )}
          </Grid>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontFamily: "var(--font-manrope)", color: MAROON }}>Eligible Degrees</Typography>
            <FormGroup sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 1, mb: 4 }}>
              {COURSES.map((course) => (
                <FormControlLabel
                  key={course}
                  control={<Checkbox size="small" checked={formData.eligible_degrees.includes(course)} onChange={() => handleCheckboxChange("eligible_degrees", course)} />}
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{course}</Typography>}
                />
              ))}
            </FormGroup>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontFamily: "var(--font-manrope)", color: MAROON }}>Eligible Departments</Typography>
            <FormGroup sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mb: 4 }}>
              {DEPARTMENTS.map((dept) => (
                <FormControlLabel
                  key={dept}
                  control={<Checkbox size="small" checked={formData.eligible_departments.includes(dept)} onChange={() => handleCheckboxChange("eligible_departments", dept)} />}
                  label={<Typography sx={{ fontSize: "0.8rem" }}>{dept}</Typography>}
                />
              ))}
            </FormGroup>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Min Cutoff CGPA" name="min_cutoff_cgpa" value={formData.min_cutoff_cgpa} onChange={handleChange} variant="filled" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Checkbox name="selection_ppt" checked={formData.selection_ppt} onChange={handleChange} />} label="Pre-Placement Talk required?" />
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 800, fontFamily: "var(--font-manrope)", color: MAROON }}>Final Review (INF)</Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>Please verify Internship details.</Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
               <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, border: `1px solid ${SURFACE}` }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Organization</Typography>
                  <Typography variant="h6" fontWeight={700} color={MAROON}>{formData.company_name}</Typography>
               </Paper>
               <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, border: `1px solid ${SURFACE}` }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Role & Duration</Typography>
                  <Typography variant="h6" fontWeight={700} color={MAROON}>{formData.internship_designation} ({formData.duration_weeks} Weeks)</Typography>
                  <Typography variant="body1">Stipend: {formData.monthly_stipend} / month</Typography>
               </Paper>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: GREY_RED, pb: 10 }}>
      {/* ── HEADER ───────────────────────────────────────────── */}
      <Box sx={{ bgcolor: MAROON, py: 2, mb: 4, borderBottom: `1px solid ${BORDER_GHOST}` }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box sx={{ position: "relative", width: 60, height: 60, bgcolor: WHITE, borderRadius: "50%", p: 0.5 }}>
                <Image src="/logo.png" alt="Logo" width={60} height={60} style={{ objectFit: "contain" }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ color: WHITE, fontWeight: 900, fontFamily: "var(--font-manrope)" }}>
                  IIT Dhanbad
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Career Development Centre
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => router.back()} sx={{ color: WHITE, border: `1px solid rgba(255,255,255,0.2)` }}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: "var(--font-manrope)", color: MAROON, mb: 4 }}>
          INF 2024-25
        </Typography>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, bgcolor: WHITE, boxShadow: "0 20px 50px rgba(87, 0, 0, 0.05)" }}>
          <Stepper activeStep={activeStep} sx={{ mb: 8, "& .MuiStepIcon-root.Mui-active": { color: RED } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-manrope)" } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ mt: 8, display: "flex", justifyContent: "space-between" }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: MAROON, fontWeight: 700 }}>Back</Button>
            <Box sx={{ display: "flex", gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: RED, color: WHITE, fontWeight: 800, px: 6, py: 1.5, borderRadius: 2, "&:hover": { bgcolor: MAROON } }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Submit INF"}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained" sx={{ bgcolor: RED, color: WHITE, fontWeight: 700, px: 6, py: 1.5, borderRadius: 2, "&:hover": { bgcolor: MAROON } }}>Next Section</Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
