"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
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
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RED       = "#8B0000";
const RED_DARK  = "#5C0000";
const RED_LIGHT = "#C41230";
const CREAM     = "#FFF8E7";
const WHITE     = "#FFFFFF";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_email");
    const savedPass  = localStorage.getItem("saved_pass");
    if (savedEmail) setEmail(savedEmail);
    if (savedPass) setPassword(savedPass);
    if (savedEmail || savedPass) setRemember(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Save to localhost if remember is checked
    if (remember) {
      localStorage.setItem("saved_email", email);
      localStorage.setItem("saved_pass", password);
    } else {
      localStorage.removeItem("saved_email");
      localStorage.removeItem("saved_pass");
    }

    // ── BYPASS LOGIC ──────────────────────────────────────────
    if (email === "admin@iitism.ac.in" && password === "admin") {
      setLoading(false);
      router.push("/dashboard");
      return;
    }
    // ──────────────────────────────────────────────────────────

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── Login form ─────────────────────────────── */}
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
        {/* Subtle diagonal pattern overlay */}
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
          {/* Back button */}
          <Button
            startIcon={<ArrowBackIcon />}
            href="/"
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
            Back to Home
          </Button>

          {/* Logo + Institute name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: CREAM,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AccountBalanceIcon sx={{ color: RED, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{ color: WHITE, fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.2 }}
              >
                JNF Cell, IIT (ISM) Dhanbad
              </Typography>
              <Typography
                sx={{ color: "rgba(255,248,231,0.6)", fontSize: "0.68rem", fontStyle: "italic" }}
              >
                Legacy that Inspires the Future
              </Typography>
            </Box>
          </Box>

          {/* ── "Recruiters" heading ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <BusinessCenterIcon sx={{ color: "#FFD700", fontSize: 28 }} />
            <Typography
              variant="h4"
              sx={{
                color: "#FFD700",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: { xs: "1.6rem", md: "2rem" },
              }}
            >
              Recruiters
            </Typography>
          </Box>

          <Typography sx={{ color: "rgba(255,248,231,0.7)", mb: 5, fontSize: "0.92rem" }}>
            Sign in to your recruiter account to post jobs, manage applications and connect
            with talented students of IIT (ISM) Dhanbad.
          </Typography>

          {/* ── Error ── */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: "rgba(255,50,50,0.18)",
                color: "#ffcdd2",
                border: "1px solid rgba(255,100,100,0.3)",
                "& .MuiAlert-icon": { color: "#ef9a9a" },
              }}
            >
              {error}
            </Alert>
          )}

          {/* ── Form ── */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography sx={{ color: "rgba(255,248,231,0.75)", fontSize: "0.78rem", fontWeight: 600, mb: 0.8, letterSpacing: 0.5 }}>
                EMAIL ADDRESS
              </Typography>
              <TextField
                type="email"
                fullWidth
                required
                placeholder="recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "rgba(255,248,231,0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.07)",
                    borderRadius: 2,
                    color: WHITE,
                    "& fieldset": { borderColor: "rgba(255,248,231,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,248,231,0.45)" },
                    "&.Mui-focused fieldset": { borderColor: CREAM, borderWidth: 2 },
                  },
                  "& input::placeholder": { color: "rgba(255,248,231,0.35)", fontSize: "0.88rem" },
                  "& input": { py: 1.5 },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ color: "rgba(255,248,231,0.75)", fontSize: "0.78rem", fontWeight: 600, mb: 0.8, letterSpacing: 0.5 }}>
                PASSWORD
              </Typography>
              <TextField
                type={showPass ? "text" : "password"}
                fullWidth
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "rgba(255,248,231,0.5)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass(!showPass)}
                        edge="end"
                        sx={{ color: "rgba(255,248,231,0.45)" }}
                      >
                        {showPass
                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                          : <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.07)",
                    borderRadius: 2,
                    color: WHITE,
                    "& fieldset": { borderColor: "rgba(255,248,231,0.2)" },
                    "&:hover fieldset": { borderColor: "rgba(255,248,231,0.45)" },
                    "&.Mui-focused fieldset": { borderColor: CREAM, borderWidth: 2 },
                  },
                  "& input::placeholder": { color: "rgba(255,248,231,0.35)", fontSize: "0.88rem" },
                  "& input": { py: 1.5 },
                }}
              />
            </Box>

            {/* Remember & Forgot password */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box 
                onClick={() => setRemember(!remember)}
                sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }}
              >
                <Box 
                  sx={{ 
                    width: 18, 
                    height: 18, 
                    borderRadius: 0.5, 
                    border: `2px solid ${remember ? RED_LIGHT : "rgba(255,248,231,0.3)"}`,
                    bgcolor: remember ? RED_LIGHT : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}
                >
                  {remember && <Box sx={{ width: 8, height: 8, bgcolor: WHITE, borderRadius: "50%" }} />}
                </Box>
                <Typography sx={{ color: "rgba(255,248,231,0.65)", fontSize: "0.8rem", fontWeight: 500 }}>
                  Remember me
                </Typography>
              </Box>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "#FFD700", fontSize: "0.8rem", fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </Box>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                bgcolor: RED_LIGHT,
                color: WHITE,
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 16px rgba(196,18,48,0.4)",
                transition: "all 0.25s",
                "&:hover": {
                  bgcolor: "#9B1020",
                  boxShadow: "0 6px 20px rgba(196,18,48,0.55)",
                  transform: "translateY(-1px)",
                },
                "&:disabled": { bgcolor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.4)" },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: WHITE }} /> : "Sign In →"}
            </Button>

            {/* Register link */}
            <Typography sx={{ textAlign: "center", color: "rgba(255,248,231,0.55)", fontSize: "0.82rem", mt: 1 }}>
              New recruiter?{" "}
              <Link href="/register" underline="hover" sx={{ color: CREAM, fontWeight: 600 }}>
                Register your organisation
              </Link>
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ mt: "auto", pt: 6 }}>
            <Box sx={{ height: 1, bgcolor: "rgba(255,248,231,0.12)", mb: 3 }} />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {["Student Login", "Coordinator Login", "Verifier Login"].map((role) => (
                <Button
                  key={role}
                  href="/login"
                  size="small"
                  sx={{
                    color: "rgba(255,248,231,0.5)",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    px: 0,
                    "&:hover": { color: CREAM, bgcolor: "transparent" },
                  }}
                >
                  {role} →
                </Button>
              ))}
            </Box>
            <Typography sx={{ color: "rgba(255,248,231,0.28)", fontSize: "0.7rem", mt: 2 }}>
              © {new Date().getFullYear()} JNF Cell, IIT (ISM) Dhanbad
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── Campus photo ──────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "55%",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Campus image */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/campus-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Subtle overlay so edges blend */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(92,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.2) 100%)",
          }}
        />

        {/* Floating badge */}
        <Box
          sx={{
            position: "absolute",
            bottom: 48,
            left: 48,
            bgcolor: "rgba(92,0,0,0.82)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,248,231,0.2)",
            borderRadius: 3,
            px: 3,
            py: 2,
            color: WHITE,
            maxWidth: 340,
          }}
        >
          <Typography sx={{ fontSize: "0.72rem", color: "#FFD700", fontWeight: 700, letterSpacing: 1.5, mb: 0.5 }}>
            IIT (ISM) DHANBAD · EST. 1926
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.4, mb: 0.5 }}>
            "Legacy that Inspires the Future"
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,248,231,0.65)", lineHeight: 1.6 }}>
            One of India's oldest and most prestigious technical institutions,
            connecting industry with India's brightest minds since 1926.
          </Typography>

          {/* Mini stats */}
          <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
            {[
              { v: "1926", l: "Founded" },
              { v: "8,600+", l: "Students" },
              { v: "420+", l: "Faculty" },
            ].map((s) => (
              <Box key={s.l}>
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#FFD700" }}>{s.v}</Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "rgba(255,248,231,0.6)" }}>{s.l}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
