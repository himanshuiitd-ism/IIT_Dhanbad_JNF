"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { listDraftMetas } from "@/lib/use-draft";
import type { DraftMeta } from "@/lib/use-draft";
import {
  Box,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Badge,
  Alert,
  Grid,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import MenuIcon from "@mui/icons-material/Menu";
import VerifiedIcon from "@mui/icons-material/Verified";
import TimerIcon from "@mui/icons-material/Timer";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

// ─── Design Tokens ────────────────────────────────────────────
const MAROON = "#850000ff";
const RED = "#b90000ff";
const RED_ACCENT = "#C41230";
const SURFACE = "#FBF8F8";
const WHITE = "#FFFFFF";
const SIDEBAR_WIDTH = 240;
const BORDER = "rgba(0,0,0,0.08)";

// ─── Types ────────────────────────────────────────────────────
interface Submission {
  id: number;
  company_name?: string;
  job_designation?: string;
  internship_designation?: string;
  status: string;
  edit_count: number;
  created_at: string;
  type: "JNF" | "INF";
  user?: { name: string; organisation: string };
}

interface EditRequest {
  id: number;
  form_type: string;
  form_id: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_note?: string;
  form_title?: string;
  user?: { name: string; email: string; organisation: string };
  created_at: string;
}

// ─── Status Chip ──────────────────────────────────────────────
const StatusChip = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    PENDING:  { color: "#B45309", bg: "rgba(245,158,11,0.1)" },
    APPROVED: { color: "#059669", bg: "rgba(5,150,105,0.08)" },
    REJECTED: { color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
    pending:  { color: "#B45309", bg: "rgba(245,158,11,0.1)" },
    approved: { color: "#059669", bg: "rgba(5,150,105,0.08)" },
    rejected: { color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
  };
  const s = map[status] ?? { color: "#6B7280", bg: "rgba(107,114,128,0.1)" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.25, borderRadius: 10, bgcolor: s.bg }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
      <Typography sx={{ fontWeight: 800, fontSize: "0.68rem", color: s.color, textTransform: "uppercase" }}>{status}</Typography>
    </Box>
  );
};

// ─── Recruiter Notification Panel (inline, shares dashboard sidebar) ─────
const NOTIF_TYPES: Record<string, { color: string; bg: string; label: string }> = {
  approval:      { color: "#059669", bg: "#D1FAE5", label: "Approved" },
  rejection:     { color: "#DC2626", bg: "#FEE2E2", label: "Rejected" },
  status_update: { color: "#2563EB", bg: "#DBEAFE", label: "Status Update" },
  edit_request:  { color: "#D97706", bg: "#FEF3C7", label: "Edit Requested" },
  email:         { color: "#7C3AED", bg: "#EDE9FE", label: "Message" },
  system:        { color: "#6B7280", bg: "#F3F4F6", label: "System" },
};

function RecruiterNotifPanel({ token }: { token: string }) {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get("http://localhost:8000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setNotifs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress sx={{ color: MAROON }} size={28} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {notifs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", border: `1px solid ${BORDER}`, borderRadius: 3 }}>
          <Box sx={{ fontSize: 40, mb: 1 }}>🔔</Box>
          <Typography sx={{ fontWeight: 700, color: "#6B7280", fontSize: "0.88rem" }}>
            No notifications yet
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.5 }}>
            Approval decisions and admin messages will appear here.
          </Typography>
        </Paper>
      ) : (
        notifs.map((n) => {
          const cfg = NOTIF_TYPES[n.type] || NOTIF_TYPES.system;
          return (
            <Paper
              key={n.id}
              variant="outlined"
              sx={{
                p: 2.5, border: `1px solid ${BORDER}`, borderRadius: 2.5,
                bgcolor: n.is_read ? WHITE : `${cfg.color}05`,
                borderLeft: `4px solid ${n.is_read ? BORDER : cfg.color}`,
                transition: "background 0.15s",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: n.is_read ? 600 : 800, fontSize: "0.88rem", color: "#111827" }}>
                    {n.title || cfg.label}
                  </Typography>
                  <Box sx={{ px: 1, py: 0.2, borderRadius: 10, bgcolor: cfg.bg }}>
                    <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: cfg.color, textTransform: "uppercase" }}>
                      {cfg.label}
                    </Typography>
                  </Box>
                  {!n.is_read && (
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: MAROON, flexShrink: 0 }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.65 }}>
                {n.message}
              </Typography>
              {n.form_type && n.form_id && (
                <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", mt: 0.75 }}>
                  Re: {n.form_type.toUpperCase()} Form #{n.form_id}
                </Typography>
              )}
            </Paper>
          );
        })
      )}
    </Box>
  );
}

export default function DashboardPage() {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Data state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [myEditRequests, setMyEditRequests] = useState<EditRequest[]>([]);
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);

  // ── Notification state ────────────────────────────────────────
  const [notifCount, setNotifCount] = useState(0);

  // Contact form state
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");

  // Request Edit dialog state
  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [reqTarget, setReqTarget] = useState<{ type: string; id: number; title: string } | null>(null);
  const [reqReason, setReqReason] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");

  // Admin note dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{ req: EditRequest; action: "approve" | "reject" } | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const localRole = typeof window !== "undefined" ? localStorage.getItem("local_user_role") : null;
  const localName = typeof window !== "undefined" ? localStorage.getItem("local_user_name") : null;
  const userRole = session?.user?.role || localRole || "recruiter";
  const displayName = session?.user?.name || localName || "Partner";
  const pendingAdminCount = editRequests.filter(r => r.status === "pending").length;

  const fetchData = useCallback(async () => {
    try {
      const [jnfRes, infRes] = await Promise.all([
        axios.get("http://localhost:8000/api/jnfs"),
        axios.get("http://localhost:8000/api/infs"),
      ]);
      setSubmissions([
        ...jnfRes.data.map((j: any) => ({ ...j, type: "JNF" })),
        ...infRes.data.map((i: any) => ({ ...i, type: "INF" })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch { /* backend may be offline */ }

    try {
      if (userRole === "admin") {
        const res = await axios.get("http://localhost:8000/api/edit-requests");
        setEditRequests(res.data);
      } else {
        const res = await axios.get("http://localhost:8000/api/edit-requests/mine");
        setMyEditRequests(res.data);
      }
    } catch { /* silent */ }

    // Fetch unread notification count for recruiter
    if (userRole === "recruiter") {
      try {
        const nRes = await axios.get("http://localhost:8000/api/notifications");
        setNotifCount(nRes.data.filter((n: any) => !n.is_read).length);
      } catch { /* silent */ }
    }
  }, [userRole]);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

  // Poll notifications every 30s
  useEffect(() => {
    if (!session || userRole !== "recruiter") return;
    const iv = setInterval(() => {
      axios.get("http://localhost:8000/api/notifications")
        .then((r: import("axios").AxiosResponse) => setNotifCount(r.data.filter((n: any) => !n.is_read).length))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, [session, userRole]);

  // Load local drafts
  useEffect(() => {
    setDrafts(listDraftMetas());
    const handler = () => setDrafts(listDraftMetas());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── Auth guard: redirect unauthenticated users to landing page ──
  useEffect(() => {
    const localRole = localStorage.getItem("local_user_role");
    // Wait until next-auth has finished loading
    if (status === "loading") return;
    // If not authenticated via either method, redirect to landing
    if (status !== "authenticated" && !localRole) {
      router.replace("/");
    }
  }, [status, router]);

  // ── Recruiter: open request-edit dialog ──────────────────────
  const openRequestDialog = (sub: Submission) => {
    setReqTarget({
      type: sub.type.toLowerCase(),
      id: sub.id,
      title: sub.job_designation || sub.internship_designation || sub.company_name || `${sub.type} #${sub.id}`,
    });
    setReqReason("");
    setReqError("");
    setReqDialogOpen(true);
  };

  const submitEditRequest = async () => {
    if (!reqReason.trim() || !reqTarget) return;
    setReqLoading(true);
    setReqError("");
    try {
      await axios.post("http://localhost:8000/api/edit-requests", {
        form_type: reqTarget.type,
        form_id: reqTarget.id,
        reason: reqReason,
      });
      setReqDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setReqError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setReqLoading(false);
    }
  };

  // ── Admin: approve / reject ──────────────────────────────────
  const openNoteDialog = (req: EditRequest, action: "approve" | "reject") => {
    setNoteTarget({ req, action });
    setAdminNote("");
    setNoteDialogOpen(true);
  };

  const submitAdminDecision = async () => {
    if (!noteTarget) return;
    setActionLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/api/edit-requests/${noteTarget.req.id}/${noteTarget.action}`,
        { admin_note: adminNote }
      );
      setNoteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Contact admin ────────────────────────────────────────────
  const sendMessage = async () => {
    if (!msgSubject || !msgBody) return;
    try {
      await axios.post("http://localhost:8000/api/contact", { subject: msgSubject, message: msgBody });
      alert("Message sent to Placement Office.");
      setMsgSubject(""); setMsgBody("");
    } catch { alert("Could not send message."); }
  };

  // Helper: get edit request status for a specific form
  const getEditRequestStatus = (sub: Submission): EditRequest | undefined =>
    myEditRequests.find((r: EditRequest) => r.form_type === sub.type.toLowerCase() && r.form_id === sub.id);

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
    {
      label: userRole === "admin" ? "Edit Requests" : "Contact placement office",
      icon: userRole === "admin"
        ? <Badge badgeContent={pendingAdminCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}><AssignmentIcon sx={{ fontSize: 18 }} /></Badge>
        : <AssignmentIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Notifications",
      icon: (
        <Badge badgeContent={notifCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}>
          <NotificationsRoundedIcon sx={{ fontSize: 18 }} />
        </Badge>
      ),
    },
    { label: "Policies", icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: WHITE }}>
      <Box sx={{ p: 2, bgcolor: MAROON, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ bgcolor: WHITE, borderRadius: 1.5, p: 0.5, display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <Image src="/logo.png" alt="IIT Dhanbad" width={32} height={32} />
        </Box>
        <Box>
          <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.95rem", lineHeight: 1.2 }}>IIT (ISM)<br/>Dhanbad</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>Main Menu</Typography>
      </Box>

      <List sx={{ px: 1, py: 0 }}>
        {navItems.map((item: any, idx) => (
          <Box key={item.label}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.label === "Notifications") {
                    setActiveTab("Notifications");
                    // Mark all read when opening notifications tab
                    const token =
                      (session as any)?.accessToken ||
                      localStorage.getItem("local_token") ||
                      "";
                    if (token) {
                      axios.post("http://localhost:8000/api/notifications/read", {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      }).then(() => setNotifCount(0)).catch(() => {});
                    } else {
                      setNotifCount(0);
                    }
                    return;
                  }
                  setActiveTab(item.label);
                }}
                sx={{
                  borderRadius: 2, py: 1.2,
                  bgcolor: activeTab === item.label ? "rgba(87,0,0,0.06)" : "transparent",
                  color: activeTab === item.label ? MAROON : "#4B5563",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
                }}
              >
                <ListItemIcon sx={{ color: activeTab === item.label ? MAROON : "#9CA3AF", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeTab === item.label ? 800 : 500, fontSize: "0.82rem" }} />
              </ListItemButton>
            </ListItem>
            
            {idx === 0 && userRole !== "admin" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => router.push("/dashboard/jnf/new")}
                    sx={{
                      borderRadius: 2, py: 1.2,
                      color: "#4B5563",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#9CA3AF", minWidth: 36 }}>
                      <AddIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary="Create New JNF" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.82rem" }} />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => router.push("/dashboard/inf/new")}
                    sx={{
                      borderRadius: 2, py: 1.2,
                      color: "#4B5563",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#9CA3AF", minWidth: 36 }}>
                      <AddIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary="Create New INF" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.82rem" }} />
                  </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 1, mx: 1, borderColor: BORDER, opacity: 0.6 }} />
              </Box>
            )}
          </Box>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 2, borderTop: `1px solid ${BORDER}`, bgcolor: SURFACE }}>
         <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", textAlign: "center" }}>
           © 2024 IIT (ISM) Dhanbad <br/> Career Development Centre
         </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: SURFACE }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, border: "none" } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, borderRight: `1px solid ${BORDER}` } }} open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: WHITE, borderBottom: `1px solid ${BORDER}` }}>
          <Toolbar sx={{ px: 3, minHeight: "56px !important" }}>
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { lg: "none" }, color: MAROON }} size="small">
              <MenuIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ color: MAROON, fontWeight: 900, flexGrow: 1, fontSize: "1rem" }}>
              CDC <Typography component="span" sx={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 500 }}>Placement Portal</Typography>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Notification Bell (Recruiter only) */}
              {userRole === "recruiter" && (
                <Tooltip title="Notifications">
                  <IconButton
                    size="small"
                    onClick={() => router.push("/dashboard/notifications")}
                    sx={{ color: "#6B7280", "&:hover": { color: MAROON } }}
                  >
                    <Badge badgeContent={notifCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", height: 14, minWidth: 14 } }}>
                      <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.78rem", lineHeight: 1.1 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ color: RED_ACCENT, fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {userRole}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: MAROON, width: 30, height: 30, fontSize: "0.75rem" }}>
                {displayName?.[0] || "C"}
              </Avatar>
              <IconButton size="small" onClick={() => { localStorage.removeItem("local_user_role"); localStorage.removeItem("local_user_name"); localStorage.removeItem("local_user_email"); localStorage.removeItem("local_token"); localStorage.removeItem("admin_token"); signOut({ callbackUrl: "/" }); }}><LogoutIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {activeTab === "Dashboard" && (
            <>
              {/* Page Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: MAROON, letterSpacing: -0.3 }}>
                  {userRole === "admin" ? "Administrative Overview" : "My Dashboard"}
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: "0.78rem" }}>
                  {userRole === "admin"
                    ? "Manage all company submissions and edit requests."
                    : "Track your JNF/INF submissions and request edits when needed."}
                </Typography>
              </Box>

              {/* Draft Cards */}
              {userRole === "recruiter" && drafts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 800, color: MAROON, mb: 1.5, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 0.8 }}>
                    <AutorenewIcon sx={{ fontSize: 16 }} /> Continue Saved Drafts
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
                    {drafts.map((draft) => (
                      <Box key={draft.formType} sx={{
                        p: 2, bgcolor: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 2,
                        borderLeft: `4px solid ${MAROON}`, transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: "0 4px 16px rgba(87,0,0,0.09)" },
                      }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                          <Box>
                            <Chip label={draft.formType.toUpperCase()} size="small" sx={{ fontSize: "0.6rem", fontWeight: 800, height: 18, bgcolor: MAROON, color: WHITE, borderRadius: 0.5, mb: 0.5 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", lineHeight: 1.2 }}>
                              {draft.title || `Untitled ${draft.formType.toUpperCase()}`}
                            </Typography>
                            <Typography sx={{ fontSize: "0.64rem", color: "#9CA3AF", mt: 0.2 }}>
                              Step {draft.step + 1} · Saved {new Date(draft.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 900, color: MAROON }}>{draft.completion}%</Typography>
                        </Box>
                        <Box sx={{ height: 4, bgcolor: "rgba(87,0,0,0.08)", borderRadius: 4, mb: 1.5, overflow: "hidden" }}>
                          <Box sx={{ height: "100%", width: `${draft.completion}%`, bgcolor: MAROON, borderRadius: 4, transition: "width 0.5s" }} />
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                          onClick={() => router.push(`/dashboard/${draft.formType}/new?resume=1`)}
                          sx={{
                            bgcolor: MAROON, color: WHITE, fontWeight: 800, textTransform: "none",
                            fontSize: "0.72rem", borderRadius: 1.5, py: 0.6,
                            "&:hover": { bgcolor: RED },
                          }}
                        >
                          Continue Draft
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Stats Row */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
                {[
                  { label: "Total Forms", val: submissions.length, icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
                  { label: "Approved",    val: submissions.filter(s => s.status === "APPROVED").length, icon: <VerifiedIcon sx={{ fontSize: 18 }} /> },
                  { label: "Pending",     val: submissions.filter(s => s.status === "PENDING").length, icon: <TimerIcon sx={{ fontSize: 18 }} /> },
                ].map((s) => (
                  <Box key={s.label} sx={{ p: 1.5, bgcolor: WHITE, border: `1px solid ${BORDER}`, borderRadius: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography sx={{ color: "#9CA3AF", fontSize: "0.63rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{s.label}</Typography>
                      <Typography sx={{ fontWeight: 900, color: MAROON, fontSize: "1.5rem", lineHeight: 1.2 }}>{s.val}</Typography>
                    </Box>
                    <Box sx={{ color: MAROON, opacity: 0.12 }}>{s.icon}</Box>
                  </Box>
                ))}
              </Box>

              {/* Main Grid */}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 280px" }, gap: 2.5 }}>
                {/* ── Left: Submissions Table ────────────────────────────── */}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: MAROON, mb: 1.5, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {userRole === "admin" ? "All Submissions" : "My Submissions"}
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, overflow: "hidden" }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: `${SURFACE}` }}>
                        <TableRow>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, py: 1.2, color: "#4B5563" }}>
                            {userRole === "admin" ? "Company / Organisation" : "Role / Designation"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Type</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Status</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Edits Used</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {submissions.map((sub) => {
                          const myReq = getEditRequestStatus(sub);
                          const locked = userRole === "recruiter" && sub.edit_count >= 1;
                          const hasPending = myReq?.status === "pending";
                          const hasApproved = myReq?.status === "approved";

                          return (
                            <TableRow key={`${sub.type}-${sub.id}`} hover sx={{ "&:hover": { bgcolor: "rgba(87,0,0,0.01)" } }}>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.78rem", color: "#1F2937" }}>
                                {userRole === "admin"
                                  ? (sub.user?.organisation || sub.company_name || "—")
                                  : (sub.job_designation || sub.internship_designation || sub.company_name || "—")}
                              </TableCell>
                              <TableCell>
                                <Chip label={sub.type} size="small" sx={{ fontSize: "0.6rem", fontWeight: 800, height: 18, bgcolor: MAROON, color: WHITE, borderRadius: 0.5 }} />
                              </TableCell>
                              <TableCell><StatusChip status={sub.status} /></TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: "0.75rem", color: sub.edit_count >= 1 ? RED_ACCENT : "#6B7280", fontWeight: sub.edit_count >= 1 ? 700 : 400 }}>
                                  {sub.edit_count} / 1
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                                  {(!locked || userRole === "admin") && (
                                    <Tooltip title="Edit form">
                                      <IconButton size="small" sx={{ color: MAROON }}>
                                        <EditIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {userRole === "recruiter" && locked && (
                                    <>
                                      {hasPending && (
                                        <Tooltip title="Edit request pending admin approval">
                                          <Chip label="Requested" size="small" icon={<TimerIcon sx={{ fontSize: "10px !important" }} />}
                                            sx={{ fontSize: "0.6rem", height: 20, bgcolor: "rgba(245,158,11,0.1)", color: "#B45309", fontWeight: 700, cursor: "default" }} />
                                        </Tooltip>
                                      )}
                                      {hasApproved && (
                                        <Tooltip title="Approved! You can edit once more">
                                          <Chip label="Approved" size="small" icon={<CheckCircleIcon sx={{ fontSize: "10px !important" }} />}
                                            sx={{ fontSize: "0.6rem", height: 20, bgcolor: "rgba(5,150,105,0.1)", color: "#059669", fontWeight: 700, cursor: "default" }} />
                                        </Tooltip>
                                      )}
                                      {(!myReq || myReq.status === "rejected") && (
                                        <Tooltip title={myReq?.status === "rejected" ? `Rejected: ${myReq.admin_note || "No reason given"}` : "Request admin to unlock editing"}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<LockIcon sx={{ fontSize: "10px !important" }} />}
                                            onClick={() => openRequestDialog(sub)}
                                            sx={{
                                              fontSize: "0.62rem", textTransform: "none", py: 0.1, px: 1,
                                              color: myReq?.status === "rejected" ? RED_ACCENT : MAROON,
                                              borderColor: myReq?.status === "rejected" ? RED_ACCENT : MAROON,
                                              "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
                                            }}
                                          >
                                            {myReq?.status === "rejected" ? "Re-request" : "Request Edit"}
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {submissions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 5, color: "#9CA3AF", fontSize: "0.8rem" }}>
                              No submissions yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* ── Right: Sidebar Widgets ─────────────────────────────── */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Company Profile Card (Recruiter) */}
                  {userRole === "recruiter" && (() => {
                    const cp = typeof window !== "undefined" ? localStorage.getItem("recruiter_company_profile") : null;
                    const profile = cp ? JSON.parse(cp) : null;
                    return (
                      <Paper sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5, borderLeft: `4px solid ${MAROON}` }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 0.75, color: MAROON }}>
                            <BusinessCenterIcon sx={{ fontSize: 14 }} /> Company Profile
                          </Typography>
                          <Button href="/company-profile" size="small" startIcon={<EditIcon sx={{ fontSize: 12 }} />}
                            sx={{ fontSize: "0.64rem", color: MAROON, textTransform: "none", fontWeight: 700, px: 1, py: 0.3, bgcolor: "rgba(134,0,0,0.06)", borderRadius: 1.5, "&:hover": { bgcolor: "rgba(134,0,0,0.12)" } }}>
                            Edit
                          </Button>
                        </Box>
                        {profile ? (
                          <>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827", mb: 0.3 }}>{profile.company_name}</Typography>
                            <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>{profile.sector} · {profile.category || "—"}</Typography>
                            <Chip label="Profile Complete" size="small" icon={<CheckCircleIcon sx={{ fontSize: "12px !important" }} />}
                              sx={{ mt: 1, fontSize: "0.6rem", height: 18, bgcolor: "rgba(5,150,105,0.08)", color: "#059669", fontWeight: 700, border: "1px solid rgba(5,150,105,0.2)" }} />
                          </>
                        ) : (
                          <>
                            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mb: 1 }}>No profile set up yet. Add your company details to auto-fill JNF/INF forms.</Typography>
                            <Button href="/company-profile" variant="contained" size="small" fullWidth
                              sx={{ bgcolor: MAROON, color: WHITE, fontWeight: 700, textTransform: "none", fontSize: "0.72rem", borderRadius: 1.5 }}>
                              Set Up Company Profile →
                            </Button>
                          </>
                        )}
                      </Paper>
                    );
                  })()}

                  {/* My Edit Requests status (Recruiter) */}
                  {userRole === "recruiter" && myEditRequests.length > 0 && (
                    <Paper sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", mb: 1.5, display: "flex", alignItems: "center", gap: 0.75 }}>
                        <HelpOutlineIcon sx={{ fontSize: 14 }} /> My Edit Requests
                      </Typography>
                      {myEditRequests.slice(0, 3).map((req) => (
                        <Box key={req.id} sx={{ py: 1, borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: 0 } }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.3 }}>
                            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                              {req.form_type.toUpperCase()} #{req.form_id}
                            </Typography>
                            <StatusChip status={req.status} />
                          </Box>
                          {req.admin_note && (
                            <Typography sx={{ fontSize: "0.68rem", color: "#6B7280", mt: 0.3 }}>
                              Note: {req.admin_note}
                            </Typography>
                          )}
                          {req.status === "approved" && (
                            <Alert severity="success" variant="outlined" sx={{ py: 0.2, px: 1, mt: 0.5, fontSize: "0.68rem", "& .MuiAlert-icon": { fontSize: 14 } }}>
                              You may now edit this form once.
                            </Alert>
                          )}
                        </Box>
                      ))}
                    </Paper>
                  )}

                  {/* Admin: Quick Stats on edit requests */}
                  {userRole === "admin" && (
                    <Paper sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", mb: 1.5 }}>Request Overview</Typography>
                      {[
                        { label: "Pending", val: editRequests.filter(r => r.status === "pending").length, color: "#B45309" },
                        { label: "Approved", val: editRequests.filter(r => r.status === "approved").length, color: "#059669" },
                        { label: "Rejected", val: editRequests.filter(r => r.status === "rejected").length, color: RED_ACCENT },
                      ].map(s => (
                        <Box key={s.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.6, borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: 0 } }}>
                          <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{s.label}</Typography>
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: s.color }}>{s.val}</Typography>
                        </Box>
                      ))}
                    </Paper>
                  )}

                  <Box sx={{ p: 2, bgcolor: MAROON, color: WHITE, borderRadius: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MarkEmailReadIcon sx={{ fontSize: 14 }} /> Need Assistance?
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", opacity: 0.75, mb: 1 }}>Available Mon–Fri, 10 AM – 6 PM IST</Typography>
                    <Divider sx={{ bgcolor: "rgba(255,255,255,0.12)", mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.72rem" }}>placement@iitism.ac.in</Typography>
                    <Typography sx={{ fontSize: "0.68rem", opacity: 0.65 }}>+91 326 223 5235</Typography>
                  </Box>
                </Box>
              </Box>

              {/* ── Admin: Edit Requests Panel (Below Table) ── */}
               {userRole === "admin" && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontWeight: 800, color: MAROON, mb: 1.5, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Edit Requests
                    {pendingAdminCount > 0 && (
                      <Chip label={`${pendingAdminCount} pending`} size="small" sx={{ ml: 1, fontSize: "0.62rem", height: 18, bgcolor: "rgba(245,158,11,0.15)", color: "#B45309", fontWeight: 700 }} />
                    )}
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: SURFACE }}>
                        <TableRow>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563", py: 1.2 }}>Recruiter</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Form</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Reason</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }}>Status</TableCell>
                          <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#4B5563" }} align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {editRequests.map((req) => (
                          <TableRow key={req.id} hover>
                            <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{req.user?.name || "—"}</TableCell>
                            <TableCell>
                              <Box>
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{req.form_title || "—"}</Typography>
                                <Chip label={req.form_type.toUpperCase()} size="small" sx={{ fontSize: "0.58rem", height: 16, bgcolor: MAROON, color: WHITE, borderRadius: 0.5, mt: 0.3 }} />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={req.reason}>
                                <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {req.reason}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell><StatusChip status={req.status} /></TableCell>
                            <TableCell align="right">
                              {req.status === "pending" && (
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                  <IconButton size="small" sx={{ color: "#059669" }} onClick={() => openNoteDialog(req, "approve")}>
                                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <IconButton size="small" sx={{ color: RED_ACCENT }} onClick={() => openNoteDialog(req, "reject")}>
                                    <CancelIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              )}
                              {req.status !== "pending" && (
                                <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>Decided</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}

          {(activeTab === "Contact placement office" || activeTab === "Edit Requests") && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, color: MAROON, letterSpacing: -0.5 }}>
                  {userRole === "admin" ? "Edit Requests Management" : "Connect with Placement Office"}
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: "0.82rem", mt: 0.5, maxWidth: 600 }}>
                  {userRole === "admin"
                    ? "Monitor and respond to recruiter requests for unlocking form edits. Approvals reset the edit counter for the specific form."
                    : "For clarifications, status updates, or specific logistical requirements, please reach out directly to the CDC team."}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={userRole === "admin" ? 12 : 8}>
                  {userRole === "admin" ? (
                    <Paper variant="outlined" sx={{ border: `1px solid ${BORDER}`, borderRadius: 2.5, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                       <Table size="small">
                         <TableHead sx={{ bgcolor: SURFACE }}>
                           <TableRow>
                             <TableCell sx={{ py: 2, fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", color: "#6B7280" }}>Recruiter</TableCell>
                             <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", color: "#6B7280" }}>Form Details</TableCell>
                             <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", color: "#6B7280" }}>Submission Context</TableCell>
                             <TableCell sx={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", color: "#6B7280" }} align="right">Actions</TableCell>
                           </TableRow>
                         </TableHead>
                         <TableBody>
                           {editRequests.length > 0 ? editRequests.map((req) => (
                             <TableRow key={req.id} hover>
                               <TableCell sx={{ py: 2 }}>
                                 <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827" }}>{req.user?.name}</Typography>
                                 <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{req.user?.email}</Typography>
                               </TableCell>
                               <TableCell>
                                 <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", color: MAROON }}>{req.form_title}</Typography>
                                 <Chip label={req.form_type.toUpperCase()} size="small" sx={{ height: 16, fontSize: "0.55rem", bgcolor: MAROON, color: WHITE, borderRadius: 0.5, mt: 0.3 }} />
                               </TableCell>
                               <TableCell>
                                 <Tooltip title={req.reason}>
                                   <Typography sx={{ fontSize: "0.75rem", color: "#4B5563", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "help" }}>
                                     "{req.reason}"
                                   </Typography>
                                 </Tooltip>
                                 <Box sx={{ mt: 0.5 }}><StatusChip status={req.status} /></Box>
                               </TableCell>
                               <TableCell align="right">
                                 {req.status === "pending" ? (
                                   <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                     <Button size="small" variant="contained" sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, textTransform: "none", fontSize: "0.7rem", fontWeight: 700 }} onClick={() => openNoteDialog(req, "approve")}>Approve</Button>
                                     <Button size="small" variant="outlined" sx={{ color: RED_ACCENT, borderColor: RED_ACCENT, "&:hover": { borderColor: RED, bgcolor: "rgba(220,38,38,0.03)" }, textTransform: "none", fontSize: "0.7rem", fontWeight: 700 }} onClick={() => openNoteDialog(req, "reject")}>Reject</Button>
                                   </Box>
                                 ) : (
                                   <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 700 }}>VERDICT RENDERED</Typography>
                                 )}
                               </TableCell>
                             </TableRow>
                           )) : (
                             <TableRow><TableCell colSpan={4} align="center" sx={{ py: 12, color: "#9CA3AF", fontStyle: "italic", fontSize: "0.8rem" }}>No edit requests are currently pending review.</TableCell></TableRow>
                           )}
                         </TableBody>
                       </Table>
                    </Paper>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 4, border: `1px solid ${BORDER}`, borderRadius: 3, bgcolor: WHITE, boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField fullWidth label="Subject" variant="outlined" placeholder="How can we help you?" value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)}
                          InputProps={{ sx: { borderRadius: 1.5, bgcolor: SURFACE } }} />
                        <TextField fullWidth label="Detailed Message" variant="outlined" multiline rows={6} placeholder="Please provide specific details..." value={msgBody} onChange={(e) => setMsgBody(e.target.value)}
                          InputProps={{ sx: { borderRadius: 1.5, bgcolor: SURFACE } }} />
                        <Button variant="contained" endIcon={<SendIcon />} onClick={sendMessage}
                          sx={{ bgcolor: MAROON, py: 1.5, borderRadius: 1.5, fontWeight: 800, textTransform: "none", letterSpacing: 0.5, "&:hover": { bgcolor: RED } }}>
                          Direct Message to CDC Office
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Grid>

                {userRole === "recruiter" && (
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <Paper variant="outlined" sx={{ p: 3, border: `1px solid ${BORDER}`, borderRadius: 3, bgcolor: "#fffce8" }}>
                        <Typography sx={{ fontWeight: 900, fontSize: "0.85rem", color: "#854d0e", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                           Quick Note
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#854d0e", lineHeight: 1.5 }}>
                          Response windows vary during peak placement seasons. If you have an urgent change to a live JNF/INF, we recommend using both this form and the provided contact numbers.
                        </Typography>
                      </Paper>

                      <Paper variant="outlined" sx={{ p: 3, border: `1px solid ${BORDER}`, borderRadius: 3, bgcolor: SURFACE }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: MAROON, mb: 2, textTransform: "uppercase", letterSpacing: 1 }}>Official Channels</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <Box>
                            <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>Email Support</Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>placement@iitism.ac.in</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>Office Desk</Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>+91 326 223 5235</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase" }}>Timing</Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>10 AM – 6 PM (Mon–Fri)</Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}


          {/* ── NOTIFICATIONS TAB ─────────────────────────────────── */}
          {activeTab === "Notifications" && (
            <Box>
              <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: "1.35rem", color: MAROON }}>Notifications</Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.8rem", mt: 0.3 }}>
                    Messages and alerts from the CDC Placement Office
                  </Typography>
                </Box>
              </Box>

              <RecruiterNotifPanel token={(session as any)?.accessToken || localStorage.getItem("local_token") || ""} />
            </Box>
          )}

          {activeTab === "Policies" && (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <SettingsIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography sx={{ color: "#6B7280", fontWeight: 600 }}>Policy documents and guidelines will be available here soon.</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Dialog: Recruiter Request Edit ────────────────────────── */}
      <Dialog open={reqDialogOpen} onClose={() => setReqDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", color: MAROON, pb: 0.5 }}>
          Request Edit Permission
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mb: 2 }}>
            You have used your free edit for <strong>{reqTarget?.title}</strong>. Provide a reason below and the placement team will review your request.
          </Typography>
          {reqError && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.75rem" }}>{reqError}</Alert>}
          <TextField
            label="Reason for editing"
            placeholder="e.g. Incorrect CTC data, wrong contact person..."
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={reqReason}
            onChange={(e) => setReqReason(e.target.value)}
            inputProps={{ maxLength: 500, style: { fontSize: "0.8rem" } }}
            helperText={`${reqReason.length}/500`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReqDialogOpen(false)} sx={{ textTransform: "none", color: "#6B7280", fontSize: "0.8rem" }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!reqReason.trim() || reqLoading}
            onClick={submitEditRequest}
            sx={{ bgcolor: MAROON, color: WHITE, textTransform: "none", fontWeight: 700, fontSize: "0.8rem", "&:hover": { bgcolor: RED } }}
          >
            {reqLoading ? <CircularProgress size={18} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Admin Approve / Reject with note ──────────────── */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", color: noteTarget?.action === "approve" ? "#059669" : RED_ACCENT, pb: 0.5 }}>
          {noteTarget?.action === "approve" ? "Approve Edit Request" : "Reject Edit Request"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mb: 1.5 }}>
            {noteTarget?.action === "approve"
              ? "Approving will reset the edit count and send an email notification to the recruiter."
              : "Rejecting will notify the recruiter via email."}
          </Typography>
          <Box sx={{ p: 1.5, bgcolor: SURFACE, borderRadius: 1, mb: 2 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: MAROON }}>Recruiter's Reason:</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#374151", mt: 0.25 }}>{noteTarget?.req.reason}</Typography>
          </Box>
          <TextField
            label="Optional note to recruiter (will be emailed)"
            multiline rows={2} fullWidth
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            inputProps={{ maxLength: 500, style: { fontSize: "0.8rem" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNoteDialogOpen(false)} sx={{ textTransform: "none", color: "#6B7280", fontSize: "0.8rem" }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={actionLoading}
            onClick={submitAdminDecision}
            sx={{
              bgcolor: noteTarget?.action === "approve" ? "#059669" : RED_ACCENT,
              color: WHITE, textTransform: "none", fontWeight: 700, fontSize: "0.8rem",
              "&:hover": { bgcolor: noteTarget?.action === "approve" ? "#047857" : "#B91C1C" },
            }}
          >
            {actionLoading ? <CircularProgress size={18} color="inherit" /> : `Confirm ${noteTarget?.action === "approve" ? "Approval" : "Rejection"}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
