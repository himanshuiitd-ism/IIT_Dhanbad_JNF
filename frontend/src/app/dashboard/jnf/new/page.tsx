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
  "Contact Person",
  "Job Profile",
  "Compensation",
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

export default function NewJNFPage() {
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
    secondary_contact_name: "",
    secondary_contact_designation: "",
    secondary_contact_email: "",
    secondary_contact_phone: "",
    
    job_designation: "",
    job_description: "",
    place_of_posting: "",
    training_period: "",
    service_bond: "",
    
    ctc_total: "",
    ctc_fixed: "",
    ctc_variable: "",
    ctc_bonus: "",
    ctc_esops: "",
    ctc_perks: "",
    
    eligible_degrees: [],
    eligible_departments: [],
    min_cutoff_cgpa: "",
    
    selection_ppt: false,
    selection_shortlisting: [],
    selection_tests: [],
    selection_rounds: [],
    medical_requirements: "",
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
      // In a real environment, you'd handle the token from session
      await axios.post("http://localhost:8000/api/jnfs", formData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit JNF. Please ensure backend is running.");
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Postal Address" name="postal_address" value={formData.postal_address} onChange={handleChange} multiline rows={2} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sector" name="sector" value={formData.sector} onChange={handleChange} placeholder="e.g. IT, Finance" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Private, PSU" size="small" />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: RED }}>Primary Contact</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Name" name="primary_contact_name" value={formData.primary_contact_name} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Designation" name="primary_contact_designation" value={formData.primary_contact_designation} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="primary_contact_email" value={formData.primary_contact_email} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="primary_contact_phone" value={formData.primary_contact_phone} onChange={handleChange} size="small" /></Grid>
            </Grid>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "text.secondary" }}>Secondary Contact (Optional)</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Name" name="secondary_contact_name" value={formData.secondary_contact_name} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Designation" name="secondary_contact_designation" value={formData.secondary_contact_designation} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="secondary_contact_email" value={formData.secondary_contact_email} onChange={handleChange} size="small" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="secondary_contact_phone" value={formData.secondary_contact_phone} onChange={handleChange} size="small" /></Grid>
            </Grid>
          </>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Job Designation" name="job_designation" value={formData.job_designation} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Place of Posting" name="place_of_posting" value={formData.place_of_posting} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Job Description" name="job_description" value={formData.job_description} onChange={handleChange} multiline rows={4} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Training Period" name="training_period" value={formData.training_period} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Service Bond (if any)" name="service_bond" value={formData.service_bond} onChange={handleChange} size="small" />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Total CTC" name="ctc_total" value={formData.ctc_total} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Fixed Pay" name="ctc_fixed" value={formData.ctc_fixed} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Variable Pay" name="ctc_variable" value={formData.ctc_variable} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Joining Bonus" name="ctc_bonus" value={formData.ctc_bonus} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="ESOPs" name="ctc_esops" value={formData.ctc_esops} onChange={handleChange} size="small" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Other Perks" name="ctc_perks" value={formData.ctc_perks} onChange={handleChange} size="small" /></Grid>
          </Grid>
        );
      case 4:
        return (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Eligible Departments</Typography>
            <FormGroup sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, mb: 4 }}>
              {DEPARTMENTS.map((dept) => (
                <FormControlLabel
                  key={dept}
                  control={<Checkbox size="small" checked={formData.eligible_departments.includes(dept as never)} onChange={() => handleCheckboxChange("eligible_departments", dept)} />}
                  label={<Typography sx={{ fontSize: "0.8rem" }}>{dept}</Typography>}
                />
              ))}
            </FormGroup>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Min Cutoff CGPA" name="min_cutoff_cgpa" value={formData.min_cutoff_cgpa} onChange={handleChange} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Checkbox name="selection_ppt" checked={formData.selection_ppt} onChange={handleChange} />} label="Pre-Placement Talk required?" />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Selection Rounds</Typography>
            <FormGroup sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 3 }}>
              {["PPT", "Technical Test", "Aptitude Test", "Group Discussion", "Interview"].map((r) => (
                <FormControlLabel
                  key={r}
                  control={<Checkbox size="small" checked={formData.selection_rounds.includes(r as never)} onChange={() => handleCheckboxChange("selection_rounds", r)} />}
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{r}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color={RED}>Final Review</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Please verify all the details before final submission to the CDC office.</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#FAFAFA" }}>
               <Grid container spacing={1}>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">Organization</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{formData.company_name}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">Designation</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{formData.job_designation}</Typography></Grid>
                  <Grid item xs={4}><Typography variant="caption" color="text.secondary">CTC</Typography></Grid>
                  <Grid item xs={8}><Typography variant="body2" fontWeight={600}>{formData.ctc_total}</Typography></Grid>
               </Grid>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F9FAFB", py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ bgcolor: WHITE, border: "1px solid #E5E7EB" }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>Job Notification Form (JNF)</Typography>
            <Typography variant="body2" color="text.secondary">Fill the details for the 2024-25 placement season</Typography>
          </Box>
        </Box>

        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label} sx={{ "& .MuiStepLabel-label": { fontSize: "0.7rem", fontWeight: 700 } }}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{ minHeight: 300 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ mt: 6, display: "flex", justifyContent: "space-between" }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ color: "#374151", borderColor: "#E5E7EB", textTransform: "none", fontWeight: 600 }}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                  sx={{ bgcolor: RED, color: WHITE, textTransform: "none", fontWeight: 600, px: 4, "&:hover": { bgcolor: RED_DARK } }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Submit JNF"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{ bgcolor: "#111827", color: WHITE, textTransform: "none", fontWeight: 600, px: 4 }}
                >
                  Next Stage
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
