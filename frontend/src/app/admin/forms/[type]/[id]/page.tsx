"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box, Typography, Paper, Grid, Chip, Button,
  Divider, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert,
  Avatar, IconButton, Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import axios from "axios";

const MAROON = "#7B0000";
const DEEP_RED = "#4A0000";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  SUBMITTED: { bg: "#DBEAFE", color: "#1D4ED8" },
  APPROVED:  { bg: "#D1FAE5", color: "#065F46" },
  REJECTED:  { bg: "#FEE2E2", color: "#991B1B" },
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  LIVE:      { bg: "#ECFDF5", color: "#059669" },
  DRAFT:     { bg: "#F3F4F6", color: "#6B7280" },
};
const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status?.toUpperCase()] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.4, borderRadius: 10, bgcolor: s.bg }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: s.color }} />
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: s.color, textTransform: "uppercase" }}>{status}</Typography>
    </Box>
  );
};

// Which fields to skip in the detail display
const SKIP_FIELDS = ["id","user_id","created_at","updated_at","user","status","edit_count","submitted_at","logo_path","brochure_path","jd_pdf_path"];

const FIELD_LABELS: Record<string, string> = {
  company_name: "Company Name",
  job_title: "Job Title",
  job_designation: "Designation",
  job_type: "Job Type",
  job_location: "Location",
  no_of_positions: "No. of Positions",
  job_description: "Job Description",
  ctc: "CTC / Package",
  min_cgpa: "Minimum CGPA",
  signatory_name: "Signatory Name",
  typed_signature: "Digital Signature",
  internship_designation: "Internship Role",
  duration: "Duration",
  stipend: "Stipend",
};

type DialogMode = "approve" | "reject" | "edit_request" | "email" | null;

export default function AdminFormDetail() {
  const router = useRouter();
  const params = useParams();
  const type   = params.type as string;
  const id     = params.id as string;

  const [form, setForm]         = useState<any>(null);
  const [comms, setComms]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dlgMode, setDlgMode]   = useState<DialogMode>(null);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
  }), []);

  const fetchAll = useCallback(async () => {
    try {
      const [formRes, commsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/admin/forms/${type}/${id}`, { headers: authHeaders() }),
        axios.get(`http://localhost:8000/api/admin/forms/${type}/${id}/comms`, { headers: authHeaders() }),
      ]);
      setForm(formRes.data);
      setComms(commsRes.data);
    } catch {
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [type, id, authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusUpdate = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const status = dlgMode === "approve" ? "approved" : "rejected";
      await axios.patch(
        `http://localhost:8000/api/admin/forms/${type}/${id}`,
        { status, note: noteText },
        { headers: authHeaders() }
      );
      setAlertMsg({ type: "success", msg: `Form ${status} successfully. Recruiter has been notified.` });
      setDlgMode(null);
      setNoteText("");
      fetchAll();
    } catch (e: any) {
      setAlertMsg({ type: "error", msg: e.response?.data?.message || "Action failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommunicate = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const isEmail = dlgMode === "email";
      await axios.post(
        "http://localhost:8000/api/admin/communicate",
        {
          user_id: form.user_id,
          type: isEmail ? "email" : "edit_request",
          title: isEmail
            ? "Message from CDC Admin re: your form"
            : "Admin has requested edits to your form",
          message: noteText,
          form_type: type,
          form_id: id,
          is_email: isEmail,
        },
        { headers: authHeaders() }
      );
      setAlertMsg({ type: "success", msg: isEmail ? "Email sent to recruiter." : "Edit request sent. Recruiter notified." });
      setDlgMode(null);
      setNoteText("");
      fetchAll();
    } catch (e: any) {
      setAlertMsg({ type: "error", msg: e.response?.data?.message || "Failed to send." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress sx={{ color: MAROON }} /></Box>;
  if (!form)  return <Box sx={{ p: 3 }}><Alert severity="error">Form not found.</Alert></Box>;

  const formFields = Object.entries(form).filter(([k, v]) => !SKIP_FIELDS.includes(k) && v !== null && v !== "" && v !== undefined);

  return (
    <Box sx={{ pb: 8 }}>
      {/* Back + Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push(`/admin/forms/${type}`)}
          sx={{ color: "#6B7280", textTransform: "none", mb: 2, fontWeight: 600, fontSize: "0.82rem" }}
        >
          Back to {type.toUpperCase()} Queue
        </Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>
                {form.company_name || `${type.toUpperCase()} #${id}`}
              </Typography>
              <StatusBadge status={form.status || "DRAFT"} />
            </Box>
            <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
              {type.toUpperCase()} · Form ID #{id} · Submitted by{" "}
              <strong style={{ color: "#374151" }}>{form.user?.name || "—"}</strong>
              {" "}({form.user?.email})
            </Typography>
          </Box>
          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleRoundedIcon />}
              onClick={() => { setDlgMode("approve"); setNoteText(""); }}
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelRoundedIcon />}
              onClick={() => { setDlgMode("reject"); setNoteText(""); }}
              sx={{ color: "#DC2626", borderColor: "#DC2626", "&:hover": { borderColor: "#B91C1C", bgcolor: "#FEF2F2" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditNoteRoundedIcon />}
              onClick={() => { setDlgMode("edit_request"); setNoteText(""); }}
              sx={{ color: "#D97706", borderColor: "#D97706", "&:hover": { borderColor: "#B45309", bgcolor: "#FFFBEB" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Request Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<MailOutlineRoundedIcon />}
              onClick={() => { setDlgMode("email"); setNoteText(""); }}
              sx={{ color: "#2563EB", borderColor: "#2563EB", "&:hover": { bgcolor: "#EFF6FF" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Email Recruiter
            </Button>
          </Box>
        </Box>
      </Box>

      {alertMsg && (
        <Alert severity={alertMsg.type} onClose={() => setAlertMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {alertMsg.msg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left — Form Data */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2.5, bgcolor: DEEP_RED }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "white" }}>
                Submitted Form Data
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", mt: 0.3 }}>
                All fields submitted by the recruiter for your review
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {formFields.map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.3 }}>
                      {FIELD_LABELS[key] || key.replace(/_/g, " ")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#1F2937", fontWeight: 500, wordBreak: "break-word" }}>
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </Typography>
                  </Grid>
                ))}
                {formFields.length === 0 && (
                  <Grid item xs={12}>
                    <Typography sx={{ color: "#9CA3AF", fontSize: "0.83rem" }}>
                      No data fields found. Form may be in draft.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Right — Recruiter Info + Communication Log */}
        <Grid item xs={12} lg={4}>
          {/* Recruiter Card */}
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, mb: 3, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#111827" }}>Recruiter Profile</Typography>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: MAROON, width: 40, height: 40, fontWeight: 700 }}>{form.user?.name?.[0] || "R"}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#111827" }}>{form.user?.name || "—"}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{form.user?.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Row label="Organisation" value={form.user?.organisation || "—"} />
                <Row label="Phone" value={form.user?.phone || "—"} />
                <Row label="Edits Used" value={`${form.edit_count || 0} / 1`} />
                <Row label="Submitted" value={form.submitted_at ? new Date(form.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} />
              </Box>
            </Box>
          </Paper>

          {/* Communication Log */}
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#111827" }}>
                Communication Log
              </Typography>
              <Chip label={`${comms.length} messages`} size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: "#F3F4F6", color: "#6B7280" }} />
            </Box>
            <Box sx={{ p: 2, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {comms.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem" }}>No messages yet</Typography>
                </Box>
              ) : (
                comms.map((c) => {
                  const isAdmin = c.sender_id !== form.user_id;
                  return (
                    <Box
                      key={c.id}
                      sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: isAdmin ? `${MAROON}08` : "#F9FAFB",
                        border: `1px solid ${isAdmin ? `${MAROON}18` : "#E5E7EB"}`,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: isAdmin ? MAROON : "#374151" }}>
                          {isAdmin ? "CDC Admin" : form.user?.name}
                        </Typography>
                        <Chip
                          label={c.type}
                          size="small"
                          sx={{ fontSize: "0.6rem", height: 16,
                            bgcolor: c.type === "email" ? "#EFF6FF" : c.type === "edit_request" ? "#FFFBEB" : "#F0FDF4",
                            color: c.type === "email" ? "#1D4ED8" : c.type === "edit_request" ? "#92400E" : "#065F46",
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#111827", mb: 0.3 }}>{c.title}</Typography>
                      <Typography sx={{ fontSize: "0.73rem", color: "#4B5563", lineHeight: 1.5 }}>{c.message}</Typography>
                      <Typography sx={{ fontSize: "0.63rem", color: "#9CA3AF", mt: 0.8 }}>
                        {new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={dlgMode !== null} onClose={() => !submitting && setDlgMode(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "#111827", pb: 1 }}>
          {dlgMode === "approve" && "✅ Approve this Form"}
          {dlgMode === "reject" && "❌ Reject this Form"}
          {dlgMode === "edit_request" && "✏️ Request Edits from Recruiter"}
          {dlgMode === "email" && "📧 Send Email to Recruiter"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 1.5, fontSize: "0.8rem" }}>
            {dlgMode === "approve" && "The recruiter will be notified that their form has been approved."}
            {dlgMode === "reject" && "The recruiter will be notified with your rejection reason."}
            {dlgMode === "edit_request" && "The recruiter will receive an in-app notification and can unlock their form for edits."}
            {dlgMode === "email" && "This message will appear in the recruiter's notification inbox and be flagged as an email."}
          </Alert>
          <TextField
            autoFocus
            fullWidth
            label={
              dlgMode === "approve" ? "Approval note (optional)" :
              dlgMode === "reject" ? "Reason for rejection *" :
              dlgMode === "edit_request" ? "Specify what needs to be corrected *" :
              "Your message to the recruiter *"
            }
            multiline
            rows={4}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            variant="outlined"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.85rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDlgMode(null)}
            disabled={submitting}
            sx={{ textTransform: "none", color: "#6B7280", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting || (dlgMode !== "approve" && !noteText.trim())}
            endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
            onClick={["approve","reject"].includes(dlgMode ?? "") ? handleStatusUpdate : handleCommunicate}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: 2,
              bgcolor: dlgMode === "approve" ? "#059669" : dlgMode === "reject" ? "#DC2626" : dlgMode === "email" ? "#2563EB" : "#D97706",
              "&:hover": {
                bgcolor: dlgMode === "approve" ? "#047857" : dlgMode === "reject" ? "#B91C1C" : dlgMode === "email" ? "#1D4ED8" : "#B45309",
              },
            }}
          >
            {dlgMode === "approve" ? "Confirm Approval" :
             dlgMode === "reject" ? "Confirm Rejection" :
             dlgMode === "email" ? "Send Email" :
             "Send Edit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper row component
const Row = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
    <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.72rem", color: "#374151", fontWeight: 600, textAlign: "right" }}>{value}</Typography>
  </Box>
);
