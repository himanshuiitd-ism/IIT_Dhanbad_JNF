"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import api from "@/lib/api";

const RED       = "#8B0000";
const RED_DARK  = "#5C0000";
const RED_LIGHT = "#C41230";
const CREAM     = "#FFF8E7";
const WHITE     = "#FFFFFF";

const steps = ["Account Details", "Organisation Info"];

export default function RegisterPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organisation: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.name || !formData.email || !formData.password) {
        setError("Please fill all account details.");
        return;
      }
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/register", formData);
      // After registration, redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. This email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>
      {/* ── LEFT PANEL ── Register form ──────────────────────────── */}
      <Box
        sx={{
          width: { xs: "100%", md: "45%" },
          bgcolor: RED_DARK,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 12px)",
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 4, md: 6 },
            py: 5,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            href="/login"
            sx={{
              color: "rgba(255,248,231,0.65)",
              textTransform: "none",
              fontWeight: 500,
              alignSelf: "flex-start",
              mb: 4,
              px: 0,
              "&:hover": { color: CREAM, bgcolor: "transparent" },
            }}
          >
            Back to Login
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: "50%", bgcolor: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AccountBalanceIcon sx={{ color: RED, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ color: WHITE, fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.2 }}>
                JNF Cell, IIT (ISM) Dhanbad
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <BusinessCenterIcon sx={{ color: "#FFD700", fontSize: 28 }} />
            <Typography variant="h4" sx={{ color: "#FFD700", fontWeight: 800, textTransform: "uppercase", fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
              New Registration
            </Typography>
          </Box>

          <Typography sx={{ color: "rgba(255,248,231,0.7)", mb: 4, fontSize: "0.92rem" }}>
            Join our recruitment network to reach India's finest minds.
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4, "& .MuiStepLabel-label": { color: "rgba(255,248,231,0.4)" }, "& .MuiStepLabel-label.Mui-active": { color: WHITE }, "& .MuiStepIcon-root": { color: "rgba(255,255,255,0.1)" }, "& .MuiStepIcon-root.Mui-active": { color: "#FFD700" }, "& .MuiStepIcon-root.Mui-completed": { color: "#FFD700" } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3, bgcolor: "rgba(255,50,50,0.15)", color: "#ffcdd2", border: "1px solid rgba(255,100,100,0.2)" }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {activeStep === 0 ? (
              <>
                <Box>
                  <Typography sx={{ color: "rgba(255,248,231,0.7)", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}>FULL NAME</Typography>
                  <TextField name="name" fullWidth required placeholder="John Doe" value={formData.name} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ color: "rgba(255,248,231,0.4)", fontSize: 20 }} /></InputAdornment>) }} sx={textFieldSx} />
                </Box>
                <Box>
                  <Typography sx={{ color: "rgba(255,248,231,0.7)", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}>EMAIL ADDRESS</Typography>
                  <TextField name="email" type="email" fullWidth required placeholder="john@company.com" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlinedIcon sx={{ color: "rgba(255,248,231,0.4)", fontSize: 20 }} /></InputAdornment>) }} sx={textFieldSx} />
                </Box>
                <Box>
                  <Typography sx={{ color: "rgba(255,248,231,0.7)", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}>PASSWORD</Typography>
                  <TextField name="password" type={showPass ? "text" : "password"} fullWidth required placeholder="Min 8 characters" value={formData.password} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ color: "rgba(255,248,231,0.4)", fontSize: 20 }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)} sx={{ color: "rgba(255,248,231,0.4)" }}>{showPass ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment>) }} sx={textFieldSx} />
                </Box>
                <Button variant="contained" fullWidth onClick={handleNext} sx={primaryBtnSx}>Next Step →</Button>
              </>
            ) : (
              <>
                <Box>
                  <Typography sx={{ color: "rgba(255,248,231,0.7)", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}>ORGANISATION NAME</Typography>
                  <TextField name="organisation" fullWidth required placeholder="Example Tech Corp" value={formData.organisation} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><CorporateFareIcon sx={{ color: "rgba(255,248,231,0.4)", fontSize: 20 }} /></InputAdornment>) }} sx={textFieldSx} />
                </Box>
                <Box>
                  <Typography sx={{ color: "rgba(255,248,231,0.7)", fontSize: "0.75rem", fontWeight: 600, mb: 1 }}>PHONE NUMBER</Typography>
                  <TextField name="phone" fullWidth required placeholder="+91 XXXXXXXXXX" value={formData.phone} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: "rgba(255,248,231,0.4)", fontSize: 20 }} /></InputAdornment>) }} sx={textFieldSx} />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" fullWidth onClick={handleBack} sx={secondaryBtnSx}>Back</Button>
                  <Button variant="contained" fullWidth type="submit" disabled={loading} sx={primaryBtnSx}>{loading ? <CircularProgress size={22} sx={{ color: WHITE }} /> : "Register →"}</Button>
                </Box>
              </>
            )}
            <Typography sx={{ textAlign: "center", color: "rgba(255,248,231,0.5)", fontSize: "0.8rem" }}>
              Already registered? <Link href="/login" sx={{ color: CREAM, fontWeight: 600 }}>Login here</Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── Campus photo ──────────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "flex" }, width: "55%", position: "relative" }}>
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(92,0,0,0.3) 0%, rgba(0,0,0,0) 60%)" }} />
      </Box>
    </Box>
  );
}

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    color: WHITE,
    "& fieldset": { borderColor: "rgba(255,248,231,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(255,248,231,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#FFD700" },
  },
  "& input::placeholder": { color: "rgba(255,248,231,0.25)", fontSize: "0.85rem" },
};

const primaryBtnSx = {
  mt: 1, py: 1.5, bgcolor: RED_LIGHT, color: WHITE, fontWeight: 700, borderRadius: 2, textTransform: "none",
  "&:hover": { bgcolor: "#9B1020", transform: "translateY(-1px)" }
};

const secondaryBtnSx = {
  py: 1.5, borderColor: "rgba(255,248,231,0.3)", color: CREAM, borderRadius: 2, textTransform: "none",
  "&:hover": { borderColor: CREAM, bgcolor: "rgba(255,248,231,0.05)" }
};
