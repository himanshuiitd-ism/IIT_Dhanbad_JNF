"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import axios from "axios";

const MAROON = "#7B0000";
const RED    = "#B91C1C";

// ── Status chip ──────────────────────────────────────────────
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
      <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, color: s.color, textTransform: "uppercase" }}>
        {status}
      </Typography>
    </Box>
  );
};

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, sub, accent, onClick
}: {
  icon: React.ReactNode; label: string; value: number; sub?: string; accent: string; onClick?: () => void;
}) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5, borderRadius: 2.5, border: "1px solid #E5E7EB", bgcolor: "white",
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s, transform 0.15s",
      "&:hover": onClick ? { boxShadow: "0 8px 24px rgba(0,0,0,0.08)", transform: "translateY(-1px)" } : {},
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "2.2rem", fontWeight: 900, color: "#111827", lineHeight: 1.2, mt: 0.5 }}>
          {value ?? "—"}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </Box>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2, bgcolor: `${accent}15`,
        display: "flex", alignItems: "center", justifyContent: "center", color: accent,
      }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats]         = useState<any>(null);
  const [recentJnfs, setRecentJnfs] = useState<any[]>([]);
  const [recentInfs, setRecentInfs] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("admin_token")
      || localStorage.getItem("nextauth.session-token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, jnfRes, infRes, usersRes] = await Promise.all([
        axios.get("http://localhost:8000/api/admin/stats", { headers: authHeaders() }),
        axios.get("http://localhost:8000/api/admin/forms?type=jnf", { headers: authHeaders() }),
        axios.get("http://localhost:8000/api/admin/forms?type=inf", { headers: authHeaders() }),
        axios.get("http://localhost:8000/api/admin/users", { headers: authHeaders() }),
      ]);
      setStats(statsRes.data);
      setRecentJnfs(jnfRes.data.slice(0, 5));
      setRecentInfs(infRes.data.slice(0, 5));
      setRecruiters(usersRes.data.slice(0, 6));
    } catch (err) {
      // backend may be offline - show empty state
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "55vh" }}>
        <CircularProgress sx={{ color: MAROON }} />
      </Box>
    );
  }

  const statCards = [
    { icon: <PeopleAltRoundedIcon />, label: "Total Recruiters", value: stats?.total_users || recruiters.length, sub: "Registered companies", accent: "#2563EB", path: "/admin/recruiters" },
    { icon: <DescriptionRoundedIcon />, label: "JNF Submissions", value: stats?.total_jnfs || recentJnfs.length, sub: "Job notification forms", accent: "#7C3AED", path: "/admin/forms/jnf" },
    { icon: <DescriptionRoundedIcon />, label: "INF Submissions", value: stats?.total_infs || recentInfs.length, sub: "Internship notification forms", accent: "#0891B2", path: "/admin/forms/inf" },
    { icon: <PendingActionsRoundedIcon />, label: "Pending Review", value: (stats?.pending_jnfs || 0) + (stats?.pending_infs || 0), sub: "Awaiting your decision", accent: "#D97706", path: "/admin/forms/jnf" },
    { icon: <CheckCircleRoundedIcon />, label: "Approved Forms", value: (stats?.approved_jnfs || 0) + (stats?.approved_infs || 0), sub: "Forms cleared for recruiting", accent: "#059669" },
    { icon: <EditNoteRoundedIcon />, label: "Edit Requests", value: stats?.edit_requests || 0, sub: "Recruiter unlock requests", accent: RED },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", color: "#111827", letterSpacing: -0.5 }}>
          Overview
        </Typography>
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", mt: 0.5 }}>
          IIT (ISM) Dhanbad — Career Development Centre Verifier Panel
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={4} key={card.label}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              sub={card.sub}
              accent={card.accent}
              onClick={card.path ? () => router.push(card.path!) : undefined}
            />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent JNF */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>
                Recent JNF Submissions
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/admin/forms/jnf")}
                sx={{ color: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
              >
                View all →
              </Button>
            </Box>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280", py: 1.2 }}>Company</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280" }}>Status</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280" }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentJnfs.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.78rem", color: "#111827" }}>
                        {f.company_name || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF" }}>
                        {f.user?.name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Open form">
                        <IconButton size="small" onClick={() => router.push(`/admin/forms/jnf/${f.id}`)} sx={{ color: MAROON }}>
                          <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {recentJnfs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 5, color: "#9CA3AF", fontSize: "0.8rem" }}>
                      No JNF submissions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Recent INF */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>
                Recent INF Submissions
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/admin/forms/inf")}
                sx={{ color: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
              >
                View all →
              </Button>
            </Box>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280", py: 1.2 }}>Company</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280" }}>Status</TableCell>
                  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280" }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentInfs.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.78rem", color: "#111827" }}>
                        {f.company_name || "—"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF" }}>
                        {f.user?.name || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusBadge status={f.status} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Open form">
                        <IconButton size="small" onClick={() => router.push(`/admin/forms/inf/${f.id}`)} sx={{ color: MAROON }}>
                          <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {recentInfs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 5, color: "#9CA3AF", fontSize: "0.8rem" }}>
                      No INF submissions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Recent Recruiters */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F3F4F6" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>
                Recently Registered Recruiters
              </Typography>
              <Button
                size="small"
                onClick={() => router.push("/admin/recruiters")}
                sx={{ color: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
              >
                View all →
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 3 }}>
              {recruiters.map((u) => (
                <Box
                  key={u.id}
                  onClick={() => router.push(`/admin/recruiters/${u.id}`)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                    border: "1px solid #E5E7EB", borderRadius: 2, cursor: "pointer", minWidth: 200,
                    "&:hover": { bgcolor: "#F9FAFB", borderColor: MAROON },
                    transition: "all 0.15s",
                  }}
                >
                  <Avatar sx={{ bgcolor: MAROON, width: 32, height: 32, fontSize: "0.78rem", fontWeight: 700 }}>
                    {u.name?.[0] || "R"}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#111827", lineHeight: 1.2 }}>
                      {u.name || "—"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF" }}>
                      {u.organisation || u.email || "—"}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {recruiters.length === 0 && (
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.82rem", py: 2 }}>
                  No recruiters have registered yet.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
