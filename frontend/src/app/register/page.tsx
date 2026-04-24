"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

// ─── Design Tokens ────────────────────────────────────────────────────
const MAROON = "#b60000ff";
const RED = "#d20000ff";
const SURFACE = "#FBF8F8";
const WHITE = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.1)";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const steps = ["Email Verification", "Recruiter Details", "Company Profile"];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: WHITE,
    fontSize: "0.9rem",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MAROON },
    "&.Mui-focused fieldset": { borderColor: MAROON, borderWidth: 2 },
  },
};

// ── OTP Input component ──────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").padEnd(6, " ").slice(0, 6).trimEnd();
    onChange(arr.slice(0, 6).join(""));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          component="input"
          ref={(el: HTMLInputElement | null) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKey(i, e)}
          onPaste={handlePaste}
          sx={{
            width: 44,
            height: 52,
            textAlign: "center",
            fontSize: "1.3rem",
            fontWeight: 800,
            border: `2px solid ${value[i] ? MAROON : BORDER}`,
            borderRadius: 1.5,
            bgcolor: value[i] ? "rgba(87,0,0,0.03)" : WHITE,
            outline: "none",
            color: MAROON,
            transition: "border-color 0.2s",
            "&:focus": { borderColor: MAROON, boxShadow: `0 0 0 3px rgba(87,0,0,0.08)` },
            cursor: "text",
          }}
        />
      ))}
    </Box>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0); // 0 = email+OTP, 1 = profile details
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registrationToken, setRegistrationToken] = useState(""); // temp token from verify-otp

  // Step 1 state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [devOtp, setDevOtp] = useState("");  // visible only in dev

  // Step 2 state
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  // ── Step 1a: Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email) { setError("Please enter your company email address."); return; }
    setError(""); setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/send-otp`, { email });
      setOtpSent(true);
      setOtpTimer(300); // 5 min countdown
      setSuccess("OTP sent to " + email);
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp); // dev only
    } catch (err: any) {
      const msg = err.response?.data?.message
        || (err.code === "ERR_NETWORK" ? "Cannot connect to server. Make sure the backend is running (php artisan serve)." : "Failed to send OTP. Check the email and try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1b: Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError("Please enter the complete 6-digit OTP."); return; }
    setError(""); setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-otp`, { email, otp });
      setRegistrationToken(res.data.token);
      setOtpVerified(true);
      setStep(1);
      setSuccess("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Complete Profile ────────────────────────────────────────
  const handleCompleteProfile = async () => {
    setError("");
    if (!name || !designation || !phone || !password) {
      setError("Please fill in all required fields."); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/complete-profile`,
        { name, designation, phone, alt_phone: altPhone, password, password_confirmation: confirmPassword },
        { headers: { Authorization: `Bearer ${registrationToken}` } }
      );
      // Persist auth data so company-profile page doesn't redirect away
      const token = res.data.token || registrationToken;
      localStorage.setItem("local_token", token);
      localStorage.setItem("local_user_role", res.data.user?.role || "recruiter");
      localStorage.setItem("local_user_email", email);
      router.push("/company-profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: SURFACE }}>
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <Box
        sx={{
          width: { xs: "100%", lg: "55%" },
          display: "flex",
          flexDirection: "column",
          p: { xs: 3, sm: 5, lg: 7 },
          borderRight: `1px solid ${BORDER}`,
          bgcolor: WHITE,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: MAROON, borderRadius: 1, p: 0.4, display: "flex" }}>
              <Image src="/logo.png" alt="IIT Dhanbad" width={30} height={30} />
            </Box>
            <Box>
              <Typography sx={{ color: MAROON, fontWeight: 900, fontSize: "0.95rem", lineHeight: 1 }}>IIT Dhanbad</Typography>
              <Typography sx={{ color: RED, fontWeight: 600, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.8 }}>
                Career Development Centre
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            href="/login"
            sx={{ color: "#6B7280", textTransform: "none", fontSize: "0.78rem", fontWeight: 600 }}
          >
            Back to Login
          </Button>
        </Box>

        {/* Page Title */}
        <Box sx={{ mb: 4, maxWidth: 500 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: MAROON, mb: 0.5, letterSpacing: -0.5 }}>
            {step === 0 ? "Create Recruiter Account" : "Complete Your Profile"}
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
            {step === 0
              ? "Verify your company email to get started. We'll send a 6-digit OTP."
              : step === 1
              ? "Enter your recruiter details to finish setting up your account."
              : "Almost done — set up your company profile and start recruiting."}
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={step} sx={{ "& .MuiStepIcon-root.Mui-active": { color: MAROON }, "& .MuiStepIcon-root.Mui-completed": { color: MAROON } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": { fontSize: "0.75rem", fontWeight: 700 },
                    "& .MuiStepLabel-label.Mui-active": { color: MAROON },
                    "& .MuiStepLabel-label.Mui-completed": { color: MAROON },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.8rem", borderRadius: 1.5 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: "0.8rem", borderRadius: 1.5 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* ── STEP 1: Email Verification ────────────────────────────── */}
        {step === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 480 }}>
            {/* Email field */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Company Email Address *
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="recruiter@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent && !otpVerified}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment>,
                  }}
                  sx={inputSx}
                />
                <Button
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={loading || !!otpTimer || !email}
                  sx={{
                    whiteSpace: "nowrap",
                    bgcolor: MAROON,
                    color: WHITE,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 2.5,
                    borderRadius: 2,
                    minWidth: 110,
                    "&:hover": { bgcolor: RED },
                  }}
                >
                  {loading ? <CircularProgress size={16} color="inherit" /> : otpSent ? "Resend" : "Send OTP"}
                </Button>
              </Box>
              {otpTimer > 0 && (
                <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.5 }}>
                  Resend available in <strong>{formatTimer(otpTimer)}</strong>
                </Typography>
              )}
            </Box>

            {/* Dev OTP hint */}
            {devOtp && (
              <Alert severity="info" sx={{ fontSize: "0.78rem", "& .MuiAlert-message": { fontWeight: 700 } }}>
                Dev mode — Your OTP: <strong>{devOtp}</strong>
              </Alert>
            )}

            {/* OTP Entry */}
            {otpSent && (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Enter 6-Digit OTP (5 min expiry)
                </Typography>
                <OtpInput value={otp} onChange={setOtp} />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  sx={{
                    mt: 2,
                    bgcolor: MAROON,
                    color: WHITE,
                    py: 1.3,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    borderRadius: 2,
                    "&:hover": { bgcolor: RED },
                  }}
                >
                  {loading
                    ? <CircularProgress size={20} color="inherit" />
                    : <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> Verify & Proceed</Box>}
                </Button>
              </Box>
            )}

            {!otpSent && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOtp}
                disabled={loading || !email}
                sx={{
                  bgcolor: MAROON,
                  color: WHITE,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  borderRadius: 2,
                  "&:hover": { bgcolor: RED },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : "Send OTP →"}
              </Button>
            )}
          </Box>
        )}

        {/* ── STEP 2: Recruiter Details ────────────────────────────── */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
            {/* Verified email banner */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: 1.5, p: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#059669" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "#065F46", fontWeight: 600 }}>
                Email verified: <strong>{email}</strong>
              </Typography>
            </Box>

            {/* Full Name */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Full Name of Recruiter *
              </Typography>
              <TextField
                fullWidth placeholder="John Smith"
                value={name} onChange={(e) => setName(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlinedIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment> }}
                sx={inputSx}
              />
            </Box>

            {/* Designation */}
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Designation *
              </Typography>
              <TextField
                fullWidth placeholder="e.g. HR Manager, Campus Recruiter"
                value={designation} onChange={(e) => setDesignation(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><WorkOutlineIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment> }}
                sx={inputSx}
              />
            </Box>

            {/* Phone numbers */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Contact Number *
                </Typography>
                <TextField
                  fullWidth placeholder="+91 98765 43210"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment> }}
                  sx={inputSx}
                />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Alternative Mobile
                </Typography>
                <TextField
                  fullWidth placeholder="+91 98765 43210"
                  value={altPhone} onChange={(e) => setAltPhone(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: "#9CA3AF", fontSize: 18 }} /></InputAdornment> }}
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Password */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Password *
                </Typography>
                <TextField
                  type={showPass ? "text" : "password"}
                  fullWidth placeholder="Min. 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                          {showPass ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.75, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Confirm Password *
                </Typography>
                <TextField
                  type={showConfirmPass ? "text" : "password"}
                  fullWidth placeholder="Repeat password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!confirmPassword && confirmPassword !== password}
                  helperText={confirmPassword && confirmPassword !== password ? "Passwords do not match" : ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: MAROON, fontSize: 18 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                          {showConfirmPass ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Button
              fullWidth variant="contained"
              onClick={handleCompleteProfile}
              disabled={loading}
              sx={{
                mt: 1,
                bgcolor: MAROON,
                color: WHITE,
                py: 1.4,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.9rem",
                borderRadius: 2,
                "&:hover": { bgcolor: RED },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Complete Registration →"}
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: "auto", pt: 5 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
            Already have an account?{" "}
            <Button href="/login" variant="text" sx={{ color: MAROON, fontWeight: 800, textTransform: "none", fontSize: "0.72rem", p: 0, minWidth: 0 }}>
              Sign In
            </Button>
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "#D1D5DB", mt: 1 }}>
            © {new Date().getFullYear()} IIT (ISM) Dhanbad • Established 1926
          </Typography>
        </Box>
      </Box>

      {/* ── Right Panel ────────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          width: "45%",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          bgcolor: MAROON,
          p: 7,
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.35, mixBlendMode: "luminosity" }} />
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(87,0,0,0.5)" }} />
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 2, mb: 2 }}>
            Career Development Centre
          </Typography>
          <Typography variant="h3" sx={{ color: WHITE, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1, mb: 2 }}>
            {step === 0 ? "Join India's Finest\nEngineering Talent" : "One Step Away\nFrom Top Talent"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.7, maxWidth: 380, mb: 4 }}>
            {step === 0
              ? "IIT (ISM) Dhanbad's placement portal connects you with over 8,600 scholars across 17 departments. Begin your journey with a simple email verification."
              : "Fill in your details to complete registration. You'll have immediate access to post JNFs, submit INFs, and coordinate with our placement office."}
          </Typography>

          <Box sx={{ display: "flex", gap: 4 }}>
            {[
              { val: "8600+", label: "Scholars" },
              { val: "17", label: "Departments" },
              { val: "1926", label: "Established" },
            ].map(s => (
              <Box key={s.label}>
                <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "1.3rem", lineHeight: 1 }}>{s.val}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
