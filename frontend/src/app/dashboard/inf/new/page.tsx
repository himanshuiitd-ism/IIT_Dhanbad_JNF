"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Divider,
  Container,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";

// Constants
const RED = "#8B0000";
const RED_DARK = "#5C0000";
const WHITE = "#FFFFFF";

const steps = [
  "Company Overview",
  "Contact Info",
  "Internship Profile",
  "Eligibility & Selection",
  "Review"
];

const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Mathematics and Computing",
  "Electrical Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mining Engineering",
  "Petroleum Engineering",
  "Chemical Engineering",
  "Applied Geology",
  "Applied Geophysics",
  "Environmental Engineering",
  "Fuel, Mineral and Metallurgical Engineering",
  "Physics",
  "Chemistry",
  "Management Studies",
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
    
    eligible_degrees: [],
    eligible_departments: [],
    min_cutoff_cgpa: "",
    
    selection_ppt: false,
    selection_shortlisting: [],
    selection_tests: [],
    selection_rounds: [],
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Address" name="postal_address" value={formData.postal_address} onChange={handleChange} multiline rows={2} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Sector" name="sector" value={formData.sector} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} size="small" /></Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="HR Name" name="primary_contact_name" value={formData.primary_contact_name} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Designation" name="primary_contact_designation" value={formData.primary_contact_designation} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="primary_contact_email" value={formData.primary_contact_email} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="primary_contact_phone" value={formData.primary_contact_phone} onChange={handleChange} size="small" /></Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Internship Role" name="internship_designation" value={formData.internship_designation} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Posting Location" name="place_of_posting" value={formData.place_of_posting} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Brief Description" name="internship_description" value={formData.internship_description} onChange={handleChange} multiline rows={3} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Duration (Weeks)" name="duration_weeks" value={formData.duration_weeks} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Stipend (Monthly)" name="monthly_stipend" value={formData.monthly_stipend} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><FormControlLabel control={<Checkbox name="ppo_provision" checked={formData.ppo_provision} onChange={handleChange} />} label={<Typography sx={{ fontSize: "0.85rem" }}>PPO Provision?</Typography>} /></Grid>
            {formData.ppo_provision && (
                <Grid item xs={12}><TextField fullWidth label="Expected PPO CTC" name="ppo_ctc" value={formData.ppo_ctc} onChange={handleChange} size="small" /></Grid>
            )}
          </Grid>
        );
      case 3:
        return (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Target Departments</Typography>
            <FormGroup sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", mb: 3 }}>
              {DEPARTMENTS.map((dept) => (
                <FormControlLabel
                  key={dept}
                  control={<Checkbox size="small" checked={formData.eligible_departments.includes(dept as never)} onChange={() => handleCheckboxChange("eligible_departments", dept)} />}
                  label={<Typography sx={{ fontSize: "0.75rem" }}>{dept}</Typography>}
                />
              ))}
            </FormGroup>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Selection Details</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Min CGPA" name="min_cutoff_cgpa" value={formData.min_cutoff_cgpa} onChange={handleChange} size="small" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox name="selection_ppt" checked={formData.selection_ppt} onChange={handleChange} />} label="PPT required?" /></Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Paper variant="outlined" sx={{ p: 3, bgcolor: "#FAFAFA" }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Review details for INF</Typography>
            <Grid container spacing={1.5} sx={{ mt: 1 }}>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Company</Typography></Grid>
              <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{formData.company_name}</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Stipend</Typography></Grid>
              <Grid item xs={8}><Typography variant="body2" fontWeight={600}>₹{formData.monthly_stipend} / month</Typography></Grid>
              <Grid item xs={4}><Typography variant="caption" color="text.secondary">Duration</Typography></Grid>
              <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{formData.duration_weeks} Weeks</Typography></Grid>
            </Grid>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F9FAFB", py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ bgcolor: WHITE, border: "1px solid #E5E7EB" }}><ArrowBackIcon fontSize="small" /></IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827" }}>Internship Notification Form (INF)</Typography>
            <Typography variant="body2" color="text.secondary">Summer / Seasonal Internship Season 2024-25</Typography>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}><StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "0.7rem", fontWeight: 700 } }}>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{ minHeight: 250 }}>{renderStepContent(activeStep)}</Box>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "space-between" }}>
            <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ textTransform: "none", fontWeight: 600 }}>Back</Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: RED, color: WHITE, textTransform: "none", fontWeight: 600, px: 4 }}>
                   {loading ? <CircularProgress size={24} color="inherit" /> : "Submit INF"}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained" sx={{ bgcolor: "#111827", color: WHITE, textTransform: "none", fontWeight: 600, px: 4 }}>Next Stage</Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
