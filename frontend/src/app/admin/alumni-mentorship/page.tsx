"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import {
  Visibility as VisibilityRoundedIcon,
  Delete as DeleteRoundedIcon,
  Groups as GroupsRoundedIcon,
  LinkedIn as LinkedInIcon,
  Refresh as RefreshRoundedIcon,
} from "@mui/icons-material";
import axios from "axios";

const MAROON = "#7B0000";
const DEEP_RED = "#4A0000";
const BORDER = "rgba(0,0,0,0.08)";
const WHITE = "#FFFFFF";
const SURFACE = "#F9FAFB";

// ─── Status config ─────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#B45309", bg: "rgba(245,158,11,0.1)" },
  reviewed: { label: "Reviewed", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  contacted: { label: "Contacted", color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.3, borderRadius: 10, bgcolor: cfg.bg }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: cfg.color }} />
      <Typography sx={{ fontWeight: 800, fontSize: "0.65rem", color: cfg.color, textTransform: "uppercase" }}>
        {cfg.label}
      </Typography>
    </Box>
  );
};

// ─── Types ─────────────────────────────────────────────────────
interface Application {
  id: number;
  email: string;
  name: string;
  phone: string;
  year_of_completion: string;
  degree: string;
  branch: string;
  current_job: string;
  areas_of_interest: string;
  linkedin_profile: string;
  general_comments?: string;
  status: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────
export default function AdminAlumniMentorshipPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Detail dialog
  const [selected, setSelected] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Status update
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const getToken = () =>
    localStorage.getItem("admin_token") ||
    localStorage.getItem("local_token") ||
    "";
    
  const getRole = () => localStorage.getItem("local_user_role");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const params = filterStatus !== "all" ? { status: filterStatus } : {};
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await axios.get(`${API_BASE}/alumni-mentorship`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setApplications(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load applications. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    const role = getRole();
    const token = getToken();
    if (!token || role !== "admin") {
      router.replace("/");
      return;
    }
    fetchApplications();
  }, [fetchApplications, router]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const token = getToken();
      await axios.patch(`http://localhost:8000/api/alumni-mentorship/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev);
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteApplication = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = getToken();
      await axios.delete(`http://localhost:8000/api/alumni-mentorship/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────−
  const stats = [
    { label: "Total", val: applications.length, color: MAROON },
    { label: "Pending", val: applications.filter(a => a.status === "pending").length, color: "#B45309" },
    { label: "Reviewed", val: applications.filter(a => a.status === "reviewed").length, color: "#2563EB" },
    { label: "Contacted", val: applications.filter(a => a.status === "contacted").length, color: "#059669" },
  ];

  return (
    <Box>
      {/* ── Page Header ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2,
              background: `linear-gradient(135deg, ${DEEP_RED}, ${MAROON})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(123,0,0,0.2)",
            }}
          >
            <GroupsRoundedIcon sx={{ color: "#FCD34D", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: "#111827", letterSpacing: -0.3 }}>
              Alumni Mentorship Applications
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>
              IIT (ISM) Dhanbad — Mentor Applications
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchApplications} sx={{ color: MAROON, border: `1px solid ${BORDER}`, borderRadius: 2, p: 1 }}>
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: 3 }}>
        {stats.map(s => (
          <Paper key={s.label} elevation={0} sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 2, borderLeft: `4px solid ${s.color}` }}>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", color: s.color, lineHeight: 1.2 }}>
              {s.val}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Filter Bar ──────────────────────────────────────── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: "0.82rem" }}>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter by Status"
            onChange={e => setFilterStatus(e.target.value)}
            sx={{ fontSize: "0.82rem", borderRadius: 2 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="reviewed">Reviewed</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
          </Select>
        </FormControl>
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: MAROON }} />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: SURFACE }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563", py: 1.5 }}>Alumni</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }}>Degree / Branch</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }}>Current Job</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }}>Applied</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.68rem", color: "#4B5563" }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map(app => (
                <TableRow
                  key={app.id}
                  hover
                  sx={{ "&:hover": { bgcolor: "rgba(123,0,0,0.01)" } }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827" }}>{app.name}</Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>{app.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.75rem", color: "#374151", fontWeight: 600 }}>{app.degree}</Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>{app.branch}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.75rem", color: "#374151" }}>{app.year_of_completion}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.75rem", color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {app.current_job}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <StatusBadge status={app.status} />
                      {updatingId === app.id && <CircularProgress size={12} sx={{ color: MAROON }} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>
                      {new Date(app.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          sx={{ color: MAROON }}
                          onClick={() => { setSelected(app); setDetailOpen(true); }}
                        >
                          <VisibilityRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{ color: "#DC2626" }}
                          onClick={() => { setDeleteTarget(app); setDeleteOpen(true); }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <GroupsRoundedIcon sx={{ fontSize: 36, color: "#D1D5DB", mb: 1, display: "block", mx: "auto" }} />
                    <Typography sx={{ color: "#9CA3AF", fontSize: "0.82rem" }}>No applications yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Detail Dialog ───────────────────────────────────── */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selected && (
          <>
            <DialogTitle sx={{ pb: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    background: `linear-gradient(135deg, ${DEEP_RED}, ${MAROON})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <GroupsRoundedIcon sx={{ color: "#FCD34D", fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#111827" }}>{selected.name}</Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{selected.email}</Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />

              {/* Status changer */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, bgcolor: SURFACE, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151" }}>Update Status:</Typography>
                {(["pending", "reviewed", "contacted"] as const).map(s => {
                  const cfg = STATUS_CFG[s];
                  const isActive = selected.status === s;
                  return (
                    <Button
                      key={s}
                      size="small"
                      variant={isActive ? "contained" : "outlined"}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updatingId === selected.id}
                      sx={{
                        fontSize: "0.68rem",
                        textTransform: "capitalize",
                        fontWeight: 700,
                        borderRadius: 10,
                        px: 1.5,
                        py: 0.3,
                        bgcolor: isActive ? cfg.color : "transparent",
                        color: isActive ? WHITE : cfg.color,
                        borderColor: cfg.color,
                        "&:hover": { bgcolor: cfg.bg },
                      }}
                    >
                      {cfg.label}
                    </Button>
                  );
                })}
              </Box>

              {/* Detail grid */}
              {[
                { label: "Phone", value: selected.phone },
                { label: "Year of Completion", value: selected.year_of_completion },
                { label: "Degree", value: selected.degree },
                { label: "Branch", value: selected.branch },
                { label: "Current Job", value: selected.current_job },
                { label: "Areas of Interest", value: selected.areas_of_interest },
                { label: "LinkedIn", value: selected.linkedin_profile, isLink: true },
                ...(selected.general_comments ? [{ label: "Comments", value: selected.general_comments }] : []),
              ].map(field => (
                <Box key={field.label} sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.4 }}>
                    {field.label}
                  </Typography>
                  {(field as any).isLink ? (
                    <Box
                      component="a"
                      href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-flex", alignItems: "center", gap: 0.5,
                        color: "#2563EB", fontSize: "0.82rem", fontWeight: 600,
                        textDecoration: "none", "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      <LinkedInIcon sx={{ fontSize: 16, color: "#0A66C2" }} />
                      {field.value}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "0.82rem", color: "#1F2937", lineHeight: 1.6 }}>{field.value}</Typography>
                  )}
                </Box>
              ))}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER}` }}>
              <Button
                onClick={() => setDetailOpen(false)}
                sx={{ color: "#6B7280", textTransform: "none", fontWeight: 600 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => { setDeleteTarget(selected); setDetailOpen(false); setDeleteOpen(true); }}
                sx={{ bgcolor: "#DC2626", color: WHITE, textTransform: "none", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "#B91C1C" } }}
              >
                Delete Application
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>Delete Application?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.7 }}>
            Are you sure you want to delete the application from{" "}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: "#6B7280", textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={deleteApplication}
            disabled={deleting}
            variant="contained"
            sx={{ bgcolor: "#DC2626", color: WHITE, textTransform: "none", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "#B91C1C" } }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: WHITE }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
