"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, TextField, Button, CircularProgress,
  Alert, Chip, Divider, Snackbar,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import axios from "axios";

const MAROON = "#7B0000";
const API = "http://localhost:8000/api";

interface SmtpConfig {
  mailer: string;
  host: string;
  port: string;
  encryption: string;
  username: string;
  password: string;
  from_address: string;
  from_name: string;
}

export default function SmtpSettingsPage() {
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: "success" | "error" }>({ open: false, msg: "", type: "success" });

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("local_token") || ""}`,
  }), []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/smtp/config`, { headers: authHeaders() });
      setConfig(res.data);
    } catch (e: any) {
      setToast({ open: true, msg: "Failed to load SMTP config", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchConfig();
    // Pre-fill test email from admin email
    const email = localStorage.getItem("local_user_email") || localStorage.getItem("admin_email") || "";
    setTestEmail(email);
  }, [fetchConfig]);

  const handleTest = async () => {
    if (!testEmail) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `${API}/admin/smtp/test`,
        { to_email: testEmail },
        { headers: authHeaders() }
      );
      setTestResult({ success: true, message: res.data.message });
      setToast({ open: true, msg: "Test email sent! Check your inbox.", type: "success" });
    } catch (e: any) {
      const msg = e.response?.data?.error || e.response?.data?.message || "SMTP test failed";
      setTestResult({ success: false, message: msg });
      setToast({ open: true, msg: `SMTP test failed: ${msg}`, type: "error" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress sx={{ color: MAROON }} />
      </Box>
    );
  }

  const configRows = config ? [
    { label: "Mailer", value: config.mailer, color: config.mailer === "smtp" ? "#059669" : "#D97706" },
    { label: "SMTP Host", value: config.host },
    { label: "Port", value: config.port },
    { label: "Encryption", value: config.encryption },
    { label: "Username", value: config.username },
    { label: "Password", value: config.password },
    { label: "From Address", value: config.from_address },
    { label: "From Name", value: config.from_name },
  ] : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <EmailRoundedIcon sx={{ color: MAROON, fontSize: 28 }} />
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>
            SMTP Email Settings
          </Typography>
        </Box>
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
          View your email configuration and test SMTP delivery. Configuration is read from your <code style={{ background: "#F3F4F6", padding: "2px 6px", borderRadius: 4, fontSize: "0.8rem" }}>.env</code> file.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        {/* Current Config Card */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box sx={{
            bgcolor: MAROON,
            px: 3, py: 2,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
              Current Configuration
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={fetchConfig}
              sx={{
                color: "rgba(255,255,255,0.8)",
                textTransform: "none",
                fontSize: "0.72rem",
                fontWeight: 700,
                "&:hover": { color: "white" },
              }}
            >
              Refresh
            </Button>
          </Box>

          <Box sx={{ p: 0 }}>
            {configRows.map((row, i) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 3, py: 1.8,
                  borderBottom: i < configRows.length - 1 ? "1px solid #F3F4F6" : "none",
                  "&:hover": { bgcolor: "#FAFAFA" },
                  transition: "background 0.15s",
                }}
              >
                <Typography sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}>
                  {row.label}
                </Typography>
                {row.color ? (
                  <Chip
                    label={row.value}
                    size="small"
                    sx={{
                      bgcolor: `${row.color}14`,
                      color: row.color,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  />
                ) : (
                  <Typography sx={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#111827",
                    fontFamily: "monospace",
                    bgcolor: "#F9FAFB",
                    px: 1.5,
                    py: 0.3,
                    borderRadius: 1.5,
                  }}>
                    {row.value || "—"}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #F3F4F6" }}>
            <Alert severity="info" sx={{ fontSize: "0.75rem", py: 0 }}>
              To change these values, edit the <strong>MAIL_*</strong> variables in your backend <code>.env</code> file and restart the server.
            </Alert>
          </Box>
        </Paper>

        {/* Test Email Card */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ bgcolor: "#14532D", px: 3, py: 2 }}>
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
              Send Test Email
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", mt: 0.3 }}>
              Verify that your SMTP configuration is working correctly
            </Typography>
          </Box>

          <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#374151", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Recipient Email <span style={{ color: "#DC2626" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                placeholder="admin@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: "0.85rem",
                    "&:hover fieldset": { borderColor: "#14532D" },
                    "&.Mui-focused fieldset": { borderColor: "#14532D", borderWidth: 2 },
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleTest}
              disabled={testing || !testEmail}
              startIcon={testing ? <CircularProgress size={16} sx={{ color: "white" }} /> : <SendRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "#14532D",
                color: "white",
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "none",
                py: 1.2,
                borderRadius: 2,
                "&:hover": { bgcolor: "#166534" },
                "&.Mui-disabled": { bgcolor: "#D1D5DB" },
              }}
            >
              {testing ? "Sending Test Email…" : "Send Test Email"}
            </Button>

            {/* Result */}
            {testResult && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${testResult.success ? "#D1FAE5" : "#FEE2E2"}`,
                  bgcolor: testResult.success ? "#F0FDF4" : "#FEF2F2",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                {testResult.success ? (
                  <CheckCircleRoundedIcon sx={{ color: "#059669", fontSize: 20, mt: 0.2 }} />
                ) : (
                  <ErrorRoundedIcon sx={{ color: "#DC2626", fontSize: 20, mt: 0.2 }} />
                )}
                <Box>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    color: testResult.success ? "#059669" : "#DC2626",
                    mb: 0.3,
                  }}>
                    {testResult.success ? "Email Sent Successfully ✓" : "Email Failed ✗"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#4B5563", wordBreak: "break-word" }}>
                    {testResult.message}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #F3F4F6" }}>
            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
              The test email will be sent using your configured SMTP server with the branded CDC email template.
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Notification Summary */}
      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, mt: 3, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>
            Email Notification Events
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mt: 0.3 }}>
            The following events will trigger an SMTP email notification automatically:
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {[
              { event: "OTP Verification", desc: "Branded OTP email during recruiter registration", badge: "Recruiter", color: "#7C3AED" },
              { event: "JNF / INF Submitted", desc: "Confirmation to recruiter + alert to admins", badge: "Both", color: "#2563EB" },
              { event: "Form Approved / Rejected", desc: "Status update email to recruiter", badge: "Recruiter", color: "#059669" },
              { event: "Admin Edit", desc: "Notification when admin modifies a form", badge: "Recruiter", color: "#D97706" },
              { event: "Edit Request Approved / Rejected", desc: "Decision email to recruiter", badge: "Recruiter", color: "#059669" },
              { event: "Admin Communication", desc: "When admin sends an 'email' type message", badge: "Recruiter", color: "#DC2626" },
            ].map((item) => (
              <Box
                key={item.event}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #F3F4F6",
                  "&:hover": { borderColor: "#E5E7EB", bgcolor: "#FAFAFA" },
                  transition: "all 0.15s",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827" }}>
                    {item.event}
                  </Typography>
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      fontSize: "0.6rem", height: 18, fontWeight: 700,
                      bgcolor: `${item.color}14`, color: item.color,
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{ fontWeight: 600, fontSize: "0.82rem" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
