"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import Link from "next/link";
import axios from "axios";

// ─── Design Tokens ───────────────────────────────────────────
const RED = "#d20000ff";
const RED_LIGHT = "#C41230";
const RED_DARK = "#b60000ff";
const CREAM = "#FFF8E7";
const CREAM_DARK = "#F5EDD5";
const WHITE = "#FFFFFF";
const TEXT_DARK = "#2D1B00";
const TEXT_MUTED = "#6B5B45";
const FORM_BG = "#fdf6ec";
const CARD_BG = "#FFFFFF";
const ACCENT_GOLD = "#FFD700";

// ─── Branch options ──────────────────────────────────────────
const branches = [
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Electronics Engineering",
  "Environmental Science & Engineering",
  "Fuel, Minerals & Metallurgical Engineering",
  "Mechanical Engineering",
  "Mining Engineering",
  "Mining Machinery Engineering",
  "Petroleum Engineering",
  "Applied Mathematics",
  "Applied Physics",
  "Applied Chemistry",
  "Applied Geology",
  "Applied Geophysics",
  "Management Studies",
  "Humanities & Social Sciences",
  "Other",
];

// ─── Degree options ──────────────────────────────────────────
const degreeOptions = [
  "BE / BTech / B.Arch",
  "ME / MTech / M.Arch",
  "Integrated Dual Degree",
  "MBA",
  "MSc",
  "PhD",
  "Other",
];

interface FormData {
  email: string;
  name: string;
  phone: string;
  yearOfCompletion: string;
  degree: string;
  branch: string;
  currentJob: string;
  areasOfInterest: string;
  linkedinProfile: string;
  generalComments: string;
}

export default function AlumniMentorshipPage() {
  const [form, setForm] = useState<FormData>({
    email: "",
    name: "",
    phone: "",
    yearOfCompletion: "",
    degree: "",
    branch: "",
    currentJob: "",
    areasOfInterest: "",
    linkedinProfile: "",
    generalComments: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.email.trim()) newErrors.email = "This is a required question";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address";

    if (!form.name.trim()) newErrors.name = "This is a required question";
    if (!form.phone.trim()) newErrors.phone = "This is a required question";
    if (!form.yearOfCompletion.trim()) newErrors.yearOfCompletion = "This is a required question";
    else if (!/^\d{4}$/.test(form.yearOfCompletion)) newErrors.yearOfCompletion = "Please enter a valid year (e.g. 1997)";
    if (!form.degree) newErrors.degree = "This is a required question";
    if (!form.branch) newErrors.branch = "This is a required question";
    if (!form.currentJob.trim()) newErrors.currentJob = "This is a required question";
    if (!form.areasOfInterest.trim()) newErrors.areasOfInterest = "This is a required question";
    if (!form.linkedinProfile.trim()) newErrors.linkedinProfile = "This is a required question";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.post("http://localhost:8000/api/alumni-mentorship", {
        email:              form.email,
        name:               form.name,
        phone:              form.phone,
        year_of_completion: form.yearOfCompletion,
        degree:             form.degree,
        branch:             form.branch,
        current_job:        form.currentJob,
        areas_of_interest:  form.areasOfInterest,
        linkedin_profile:   form.linkedinProfile,
        general_comments:   form.generalComments || null,
      });
      setSubmitted(true);
      setSnackbar({ open: true, message: "Your response has been recorded!", severity: "success" });
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = errData?.errors
        ? Object.values(errData.errors as Record<string, string[]>).flat().join(" ")
        : errData?.message || "Submission failed. Please try again.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm({
      email: "",
      name: "",
      phone: "",
      yearOfCompletion: "",
      degree: "",
      branch: "",
      currentJob: "",
      areasOfInterest: "",
      linkedinProfile: "",
      generalComments: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  // ─── Shared field card style ───────────────────────────────
  const fieldCardSx = {
    bgcolor: CARD_BG,
    borderRadius: 3,
    p: { xs: 2.5, md: 3.5 },
    mb: 2.5,
    border: `1px solid ${CREAM_DARK}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    "&:hover": {
      boxShadow: "0 2px 12px rgba(139,0,0,0.08)",
      borderColor: "rgba(210,0,0,0.2)",
    },
  };

  const requiredStar = (
    <Box component="span" sx={{ color: RED, ml: 0.3 }}>
      *
    </Box>
  );

  if (submitted) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: FORM_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container maxWidth="sm">
          <Box sx={{ ...fieldCardSx, textAlign: "center", py: 6 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(210,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <SchoolIcon sx={{ color: RED, fontSize: 40 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} color={TEXT_DARK} mb={1.5}>
              Thank You!
            </Typography>
            <Typography color={TEXT_MUTED} mb={4} lineHeight={1.7}>
              Your Alumni Mentorship Application has been submitted successfully.
              <br />A copy of your responses will be emailed to the address you provided.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                onClick={handleClear}
                variant="outlined"
                sx={{
                  color: RED,
                  borderColor: RED,
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: "rgba(210,0,0,0.04)", borderColor: RED_DARK },
                }}
              >
                Submit another response
              </Button>
              <Button
                href="/"
                variant="contained"
                sx={{
                  bgcolor: RED,
                  color: WHITE,
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: RED_DARK },
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: FORM_BG, fontFamily: "var(--font-inter)" }}>
      {/* ── Top accent bar ──────────────────────────────────────── */}
      <Box
        sx={{
          height: 8,
          background: `linear-gradient(90deg, ${RED_DARK} 0%, ${RED} 40%, ${RED_LIGHT} 100%)`,
        }}
      />

      {/* ── Back navigation ─────────────────────────────────────── */}
      <Container maxWidth="sm" sx={{ pt: 2.5 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              color: TEXT_MUTED,
              cursor: "pointer",
              transition: "color 0.2s",
              "&:hover": { color: RED },
              mb: 2,
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>
              Back to Home
            </Typography>
          </Box>
        </Link>
      </Container>

      <Container maxWidth="sm" sx={{ pb: 6 }}>
        {/* ── Header Card ───────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: CARD_BG,
            borderRadius: 3,
            overflow: "hidden",
            mb: 2.5,
            border: `1px solid ${CREAM_DARK}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {/* Banner strip */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${RED_DARK} 0%, ${RED} 60%, ${RED_LIGHT} 100%)`,
              py: 4,
              px: { xs: 2.5, md: 3.5 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -20,
                left: "50%",
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.04)",
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, position: "relative" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,248,231,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountBalanceIcon sx={{ color: ACCENT_GOLD, fontSize: 24 }} />
              </Box>
              <Typography sx={{ color: WHITE, fontWeight: 700, fontSize: "0.85rem", letterSpacing: 1 }}>
                IIT (ISM) DHANBAD
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                color: WHITE,
                fontWeight: 800,
                fontFamily: "var(--font-manrope)",
                position: "relative",
                lineHeight: 1.3,
              }}
            >
              Alumni Mentorship Application Form
              <br />
              <Box component="span" sx={{ fontSize: "0.85em", fontWeight: 600, opacity: 0.9 }}>
                (Mentors)
              </Box>
            </Typography>
          </Box>

          {/* Description */}
          <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3 }}>
            <Typography variant="body2" color={TEXT_DARK} lineHeight={1.8} mb={2}>
              This form is exclusively for the Alumni of IIT (ISM) Dhanbad who wish to mentor current
              students/alumni of IIT (ISM) Dhanbad.
            </Typography>
            <Typography variant="body2" color={TEXT_MUTED} lineHeight={1.8} mb={2}>
              For more details about the programme, visit:{" "}
              <Box
                component="a"
                href="https://www.iitism.ac.in/alumni"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: RED, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                https://www.iitism.ac.in/alumni
              </Box>
            </Typography>
            <Typography variant="body2" color={TEXT_MUTED} lineHeight={1.8} mb={2}>
              If you have trouble filling this form, please email{" "}
              <Box
                component="a"
                href="mailto:alumni@iitism.ac.in"
                sx={{ color: RED, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                alumni@iitism.ac.in
              </Box>
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${CREAM_DARK}`,
              }}
            >
              <Box component="span" sx={{ color: RED, fontWeight: 700, fontSize: "0.85rem" }}>
                *
              </Box>
              <Typography variant="body2" color={TEXT_MUTED} fontSize="0.8rem">
                Indicates required question
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Email Field ───────────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Email {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your email
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Name Field ────────────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Name {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your answer
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Phone Number ──────────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Phone Number (e.g. +91-1234512345). Will not be shared publicly. {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Please enter a full international number, e.g. +91-12345-12345
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.phone}
            onChange={handleChange("phone")}
            error={!!errors.phone}
            helperText={errors.phone}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Year of Degree Completion ─────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Year of degree completion (Eg. 1997) {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your answer
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.yearOfCompletion}
            onChange={handleChange("yearOfCompletion")}
            error={!!errors.yearOfCompletion}
            helperText={errors.yearOfCompletion}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Degree at IIT (ISM) Dhanbad ───────────────────────── */}
        <Box sx={fieldCardSx}>
          <FormControl component="fieldset" error={!!errors.degree} fullWidth>
            <FormLabel
              sx={{
                color: `${TEXT_DARK} !important`,
                fontWeight: 600,
                fontSize: "0.95rem",
                mb: 2,
                "&.Mui-focused": { color: `${TEXT_DARK} !important` },
              }}
            >
              Degree at IIT (ISM) Dhanbad {requiredStar}
            </FormLabel>
            <RadioGroup value={form.degree} onChange={handleChange("degree")}>
              {degreeOptions.map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: TEXT_MUTED,
                        "&.Mui-checked": { color: RED },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color={TEXT_DARK}>
                      {opt}
                    </Typography>
                  }
                  sx={{ mb: 0.3 }}
                />
              ))}
            </RadioGroup>
            {errors.degree && (
              <Typography variant="body2" color="error" mt={0.5} fontSize="0.75rem">
                {errors.degree}
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* ── Branch ────────────────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={1.5} fontSize="0.95rem">
            Branch {requiredStar}
          </Typography>
          <FormControl fullWidth error={!!errors.branch} variant="outlined" size="small">
            <Select
              value={form.branch}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, branch: e.target.value }));
                if (errors.branch) setErrors((prev) => ({ ...prev, branch: "" }));
              }}
              displayEmpty
              sx={{
                borderRadius: 2,
                fontSize: "0.92rem",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: CREAM_DARK },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: RED },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: RED },
              }}
            >
              <MenuItem value="" disabled>
                <Typography color={TEXT_MUTED} fontSize="0.9rem">
                  Choose
                </Typography>
              </MenuItem>
              {branches.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
            {errors.branch && (
              <Typography variant="body2" color="error" mt={0.5} fontSize="0.75rem">
                {errors.branch}
              </Typography>
            )}
          </FormControl>
        </Box>

        {/* ── Current Job ───────────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Current Job {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your answer
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.currentJob}
            onChange={handleChange("currentJob")}
            error={!!errors.currentJob}
            helperText={errors.currentJob}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Areas of Interest ─────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            Areas of Interest {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem" lineHeight={1.6}>
            Will be used to match with mentees. Examples: Entrepreneurship, Career Guidance, Life
            Skills, Research, Civil Engineering, Robotics, Finance and so on. Please use words that
            students can relate to.
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            multiline
            minRows={2}
            value={form.areasOfInterest}
            onChange={handleChange("areasOfInterest")}
            error={!!errors.areasOfInterest}
            helperText={errors.areasOfInterest}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── LinkedIn Profile Link ─────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            LinkedIn Profile Link {requiredStar}
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your answer
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            value={form.linkedinProfile}
            onChange={handleChange("linkedinProfile")}
            error={!!errors.linkedinProfile}
            helperText={errors.linkedinProfile}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── General Comments ──────────────────────────────────── */}
        <Box sx={fieldCardSx}>
          <Typography fontWeight={600} color={TEXT_DARK} mb={0.5} fontSize="0.95rem">
            General comments
          </Typography>
          <Typography variant="body2" color={TEXT_MUTED} mb={1.5} fontSize="0.78rem">
            Your answer
          </Typography>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="standard"
            multiline
            minRows={2}
            value={form.generalComments}
            onChange={handleChange("generalComments")}
            InputProps={{
              sx: {
                fontSize: "0.92rem",
                "&:before": { borderBottomColor: CREAM_DARK },
                "&:hover:not(.Mui-disabled):before": { borderBottomColor: RED },
                "&.Mui-focused:after": { borderBottomColor: RED },
              },
            }}
          />
        </Box>

        {/* ── Info note ─────────────────────────────────────────── */}
        <Box sx={{ ...fieldCardSx, bgcolor: "rgba(210,0,0,0.03)", borderColor: "rgba(210,0,0,0.12)" }}>
          <Typography variant="body2" color={TEXT_MUTED} lineHeight={1.7}>
            Having trouble filling this form?
            <br />
            Please email{" "}
            <Box
              component="a"
              href="mailto:alumni@iitism.ac.in"
              sx={{ color: RED, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              alumni@iitism.ac.in
            </Box>
          </Typography>
        </Box>

        {/* ── Disclaimer ────────────────────────────────────────── */}
        <Typography variant="body2" color={TEXT_MUTED} mb={3} lineHeight={1.7} fontSize="0.78rem">
          A copy of your responses will be emailed to the address you provided.
        </Typography>

        {/* ── Actions ───────────────────────────────────────────── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="contained"
            sx={{
              bgcolor: RED,
              color: WHITE,
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "0.92rem",
              px: 4,
              py: 1.2,
              minWidth: 120,
              boxShadow: "0 2px 8px rgba(210,0,0,0.25)",
              "&:hover": { bgcolor: RED_DARK, boxShadow: "0 4px 16px rgba(210,0,0,0.35)" },
              "&:disabled": { bgcolor: "rgba(210,0,0,0.5)", color: "rgba(255,255,255,0.8)" },
            }}
          >
            {submitting ? <CircularProgress size={22} sx={{ color: WHITE }} /> : "Submit"}
          </Button>
          <Button
            onClick={handleClear}
            variant="text"
            sx={{
              color: RED,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            Clear form
          </Button>
        </Box>

        {/* ── Footer ────────────────────────────────────────────── */}
        <Box sx={{ textAlign: "center", pb: 4 }}>
          <Typography variant="body2" color={TEXT_MUTED} fontSize="0.72rem" mb={0.5}>
            This form was created by IIT (ISM) Dhanbad — Alumni Mentorship Programme
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 1 }}>
            <AccountBalanceIcon sx={{ color: RED, fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color={TEXT_DARK} fontSize="0.82rem">
              IIT (ISM) Dhanbad
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* ── Snackbar ────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
