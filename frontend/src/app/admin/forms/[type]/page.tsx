"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
  CircularProgress, TextField, InputAdornment, IconButton, Button, Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import axios from "axios";

const MAROON = "#7B0000";

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
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.3, borderRadius: 10, bgcolor: s.bg }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
      <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: s.color, textTransform: "uppercase" }}>{status}</Typography>
    </Box>
  );
};

export default function AdminFormsList() {
  const router  = useRouter();
  const params  = useParams();
  const type    = params.type as string; // "jnf" or "inf"
  const [forms, setForms]     = useState<any[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
  }), []);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/forms?type=${type}`, { headers: authHeaders() });
      setForms(res.data);
    } catch {
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [type, authHeaders]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const quickUpdateStatus = async (formId: number, status: string) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/admin/forms/${type}/${formId}`,
        { status, note: `Marked as ${status} by admin` },
        { headers: authHeaders() }
      );
      fetchForms();
    } catch { /* ignore */ }
  };

  const filtered = forms.filter(f =>
    `${f.company_name} ${f.user?.name} ${f.user?.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = forms.filter(f => ["SUBMITTED","PENDING"].includes(f.status?.toUpperCase())).length;

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
    <CircularProgress sx={{ color: MAROON }} />
  </Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>
            {type.toUpperCase()} — Form Review Queue
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
            {forms.length} total · {pendingCount} awaiting review
          </Typography>
        </Box>
        <TextField
          placeholder="Search company, recruiter…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 280, bgcolor: "white", borderRadius: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: { borderRadius: 2, fontSize: "0.83rem" },
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", py: 1.5 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Edits</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((f, idx) => {
              const isPending = ["SUBMITTED","PENDING"].includes(f.status?.toUpperCase());
              return (
                <TableRow key={f.id} hover sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}>
                  <TableCell sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>
                    {String(idx + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827" }}>
                      {f.company_name || "—"}
                    </Typography>
                    {f.job_designation || f.job_title ? (
                      <Typography sx={{ fontSize: "0.66rem", color: "#6B7280" }}>
                        {f.job_designation || f.job_title}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{f.user?.name || "—"}</Typography>
                    <Typography sx={{ fontSize: "0.66rem", color: "#9CA3AF" }}>{f.user?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>
                      {f.submitted_at
                        ? new Date(f.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : new Date(f.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: f.edit_count > 0 ? "#D97706" : "#9CA3AF" }}>
                      {f.edit_count || 0} / 1
                    </Typography>
                  </TableCell>
                  <TableCell><StatusBadge status={f.status || "DRAFT"} /></TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                      {isPending && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" onClick={() => quickUpdateStatus(f.id, "approved")} sx={{ color: "#059669" }}>
                              <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => quickUpdateStatus(f.id, "rejected")} sx={{ color: "#DC2626" }}>
                              <CancelRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Open full details">
                        <IconButton size="small" onClick={() => router.push(`/admin/forms/${type}/${f.id}`)} sx={{ color: MAROON }}>
                          <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 12, color: "#9CA3AF", fontSize: "0.85rem" }}>
                  {search ? `No results for "${search}"` : `No ${type.toUpperCase()} submissions yet.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
