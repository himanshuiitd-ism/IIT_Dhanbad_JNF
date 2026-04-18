"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Container,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// ─── Design Tokens (The Heritage Modernist) ───────────────────
const MAROON = "#860000ff";
const RED = "#c00000ff";
const YELLOW = "#FFD700";
const CREAM = "#FFF8E7";
const WHITE = "#FFFFFF";

// Demo accounts for local testing
const DEMO_ACCOUNTS = [
  { label: "Admin",    email: "admin@iitism.ac.in",  password: "admin",   role: "Admin" },
  { label: "Recruiter", email: "recruiter@tcs.com", password: "password", role: "Recruiter" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_email");
    const savedPass = localStorage.getItem("saved_pass");
    if (savedEmail) setEmail(savedEmail);
    if (savedPass) setPassword(savedPass);
    if (savedEmail || savedPass) setRemember(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (remember) {
      localStorage.setItem("saved_email", email);
      localStorage.setItem("saved_pass", password);
    } else {
      localStorage.removeItem("saved_email");
      localStorage.removeItem("saved_pass");
    }

    if (email === "admin@iitism.ac.in" && password === "admin") {
      setLoading(false);
      router.push("/dashboard");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("The credentials provided do not match our institutional records.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: WHITE }}>
      
      {/* ── LEFT: AUTH FORM ─────────────────────────────────────── */}
      <Box sx={{ width: { xs: "100%", md: "45%" }, display: "flex", flexDirection: "column", p: { xs: 4, md: 8 }, borderRight: `1px solid ${CREAM}` }}>
        <Box sx={{ mb: 8 }}>
            <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                href="/"
                sx={{ color: MAROON, fontWeight: 800, textTransform: "none", fontSize: "0.85rem", mb: 4, p: 0, "&:hover": { bgcolor: "transparent", opacity: 0.7 } }}
            >
                Return to Institution
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ bgcolor: MAROON, p: 0.5, borderRadius: "50%", display: "flex" }}>
                    <Image src="/logo.png" alt="IIT Dhanbad" width={40} height={40} />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ color: MAROON, fontWeight: 900, fontFamily: "var(--font-manrope)", fontSize: "1.2rem", lineHeight: 1 }}>
                        IIT Dhanbad
                    </Typography>
                    <Typography sx={{ color: RED, fontWeight: 500, fontSize: "0.75rem", letterSpacing: 1, textTransform: "uppercase" }}>
                        Placement Portal
                    </Typography>
                </Box>
            </Box>
        </Box>

        <Box sx={{ flexGrow: 1, maxWidth: 440 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: MAROON, fontFamily: "var(--font-manrope)", mb: 1, letterSpacing: -1.5 }}>
                Recruiter Access
            </Typography>
            <Typography sx={{ color: "#6B7280", mb: 5, fontSize: "1rem", lineHeight: 1.6 }}>
                Welcome to the official Career Development Centre portal. Please authenticate to manage your recruitment lifecycle.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2, bgcolor: "#FFF5F5", color: "#C53030", fontWeight: 600 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: MAROON, textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>
                        Institutional Email
                    </Typography>
                    <TextField
                        fullWidth
                        required
                        placeholder="recruiter@industry.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: MAROON, fontSize: 20 }} /></InputAdornment>
                        }}
                        sx={inputSx}
                    />
                </Box>

                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: MAROON, textTransform: "uppercase", letterSpacing: 1, mb: 1.5 }}>
                        Secure Password
                    </Typography>
                    <TextField
                        type={showPass ? "text" : "password"}
                        fullWidth
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: MAROON, fontSize: 20 }} /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: "#9CA3AF" }}>
                                        {showPass ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={inputSx}
                    />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Link href="#" underline="none" sx={{ color: MAROON, fontWeight: 700, fontSize: "0.85rem" }}>Trouble accessing account?</Link>
                </Box>

                {/* ── Demo Credentials ── */}
                <Box sx={{ border: "1px solid rgba(87,0,0,0.15)", borderRadius: 2, overflow: "hidden", mb: 1 }}>
                  <Box
                    onClick={() => setDemoOpen(!demoOpen)}
                    sx={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      px: 2, py: 1, bgcolor: "rgba(87,0,0,0.04)", cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(87,0,0,0.07)" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      🔑 Demo Credentials
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{demoOpen ? "▲ hide" : "▼ show"}</Typography>
                  </Box>
                  {demoOpen && (
                    <Box sx={{ p: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {DEMO_ACCOUNTS.map((acc) => (
                        <Box
                          key={acc.label}
                          onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                          sx={{
                            flex: 1, minWidth: 160, p: 1.2, borderRadius: 1.5,
                            border: "1px solid rgba(87,0,0,0.12)", cursor: "pointer",
                            bgcolor: WHITE, "&:hover": { bgcolor: "rgba(87,0,0,0.03)", borderColor: MAROON },
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: MAROON }}>{acc.label}</Typography>
                            <Box sx={{ bgcolor: MAROON, color: WHITE, borderRadius: 10, px: 0.8, py: 0.1, fontSize: "0.58rem", fontWeight: 700 }}>{acc.role}</Box>
                          </Box>
                          <Typography sx={{ fontSize: "0.68rem", color: "#6B7280", fontFamily: "monospace" }}>{acc.email}</Typography>
                          <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", fontFamily: "monospace" }}>pw: {acc.password}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                        py: 2,
                        bgcolor: YELLOW,
                        color: MAROON,
                        fontWeight: 900,
                        fontSize: "1rem",
                        letterSpacing: 0.5,
                        borderRadius: 3,
                        boxShadow: "0 10px 25px rgba(255, 215, 0, 0.2)",
                        "&:hover": { bgcolor: "#E6C200", transform: "translateY(-2px)" }
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Authorize Access →"}
                </Button>

                <Typography sx={{ textAlign: "center", color: "#6B7280", mt: 4, fontWeight: 500 }}>
                    New to CDC? <Link href="/register" sx={{ color: MAROON, fontWeight: 800, textDecoration: "none", borderBottom: `2px solid ${YELLOW}` }}>Register Organisation</Link>
                </Typography>
            </Box>
        </Box>

        <Box sx={{ mt: "auto", pt: 6 }}>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", fontWeight: 600 }}>
                © {new Date().getFullYear()} IIT (ISM) DHANBAD • ESTABLISHED 1926
            </Typography>
        </Box>
      </Box>

      {/* ── RIGHT: VISUAL ───────────────────────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "flex" }, width: "55%", position: "relative", bgcolor: MAROON }}>
        <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.5, mixBlendMode: "luminosity" }} />
        <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(87, 0, 0, 0.4)" }} />
        
        <Box sx={{ position: "relative", zIndex: 2, p: 10, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <Typography variant="h1" sx={{ color: YELLOW, fontWeight: 900, fontFamily: "var(--font-manrope)", fontSize: "4.5rem", mb: 2, letterSpacing: -3 }}>
                Legacy.
            </Typography>
            <Typography variant="h5" sx={{ color: WHITE, fontWeight: 500, lineHeight: 1.6, maxWidth: 500 }}>
                Recruiting India's finest minds since 1926. Connect with a century of academic excellence and technical innovation.
            </Typography>
            <Box sx={{ display: "flex", gap: 5, mt: 6 }}>
                <Box>
                    <Typography sx={{ color: YELLOW, fontWeight: 900, fontSize: "1.5rem" }}>1926</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Founded</Typography>
                </Box>
                <Box>
                    <Typography sx={{ color: YELLOW, fontWeight: 900, fontSize: "1.5rem" }}>XXX+</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Recruiters</Typography>
                </Box>
                <Box>
                    <Typography sx={{ color: YELLOW, fontWeight: 900, fontSize: "1.5rem" }}>8600+</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>Scholars</Typography>
                </Box>
            </Box>
        </Box>
      </Box>
    </Box>
  );
}

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 3,
        bgcolor: "#F9FAFB",
        "& fieldset": { borderColor: "#E5E7EB" },
        "&:hover fieldset": { borderColor: MAROON },
        "&.Mui-focused fieldset": { borderColor: MAROON, borderWidth: 2 }
    }
};
