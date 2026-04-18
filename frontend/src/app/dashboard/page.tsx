"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
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

// ─── Design Tokens ────────────────────────────────────────────
const MAROON = "#860000ff";
const RED = "#c00000ff";
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

export default function DashboardPage() {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Data state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [myEditRequests, setMyEditRequests] = useState<EditRequest[]>([]);

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

  const userRole = session?.user?.role || "recruiter";
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
  }, [userRole]);

  useEffect(() => { if (session) fetchData(); }, [session, fetchData]);

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
    myEditRequests.find(r => r.form_type === sub.type.toLowerCase() && r.form_id === sub.id);

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
    { label: "Submissions", icon: <BusinessCenterIcon sx={{ fontSize: 18 }} /> },
    {
      label: userRole === "admin" ? "Edit Requests" : "Contact Admin",
      icon: userRole === "admin"
        ? <Badge badgeContent={pendingAdminCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}><AssignmentIcon sx={{ fontSize: 18 }} /></Badge>
        : <AssignmentIcon sx={{ fontSize: 18 }} />,
    },
    { label: "Policies", icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: WHITE }}>
      <Box sx={{ p: 2, bgcolor: MAROON, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ bgcolor: WHITE, borderRadius: 1, p: 0.3, display: "flex" }}>
          <Image src="/logo.png" alt="IIT Dhanbad" width={28} height={28} />
        </Box>
        <Box>
          <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.9rem" }}>IIT Dhanbad</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: 0.8 }}>CDC Portal</Typography>
        </Box>
      </Box>

      <List sx={{ px: 1, py: 1.5 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.25 }}>
            <ListItemButton
              onClick={() => setActiveTab(item.label)}
              sx={{
                borderRadius: 1, py: 0.9,
                bgcolor: activeTab === item.label ? "rgba(87,0,0,0.06)" : "transparent",
                color: activeTab === item.label ? MAROON : "#6B7280",
                "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
              }}
            >
              <ListItemIcon sx={{ color: activeTab === item.label ? MAROON : "#9CA3AF", minWidth: 32 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeTab === item.label ? 700 : 500, fontSize: "0.8rem" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 1.5, borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 1 }}>
        <Button fullWidth variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => router.push("/dashboard/jnf/new")}
          sx={{ bgcolor: MAROON, color: WHITE, textTransform: "none", fontWeight: 700, fontSize: "0.75rem", py: 0.8, "&:hover": { bgcolor: RED } }}>
          New JNF
        </Button>
        <Button fullWidth variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={() => router.push("/dashboard/inf/new")}
          sx={{ color: MAROON, borderColor: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.75rem", py: 0.8, "&:hover": { borderColor: RED, bgcolor: "rgba(87,0,0,0.03)" } }}>
          New INF
        </Button>
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
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.78rem", lineHeight: 1.1 }}>
                  {session?.user?.name || "Partner"}
                </Typography>
                <Typography sx={{ color: RED_ACCENT, fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {userRole}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: MAROON, width: 30, height: 30, fontSize: "0.75rem" }}>
                {session?.user?.name?.[0] || "C"}
              </Avatar>
              <IconButton size="small" onClick={() => signOut()}><LogoutIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
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
                              {/* Edit button (unlocked OR admin) */}
                              {(!locked || userRole === "admin") && (
                                <Tooltip title="Edit form">
                                  <IconButton size="small" sx={{ color: MAROON }}>
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Request Edit button — only recruiter with locked form */}
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

              {/* ── Admin: Edit Requests Panel ───────────────────── */}
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
                                  <Tooltip title="Approve request">
                                    <IconButton size="small" sx={{ color: "#059669" }} onClick={() => openNoteDialog(req, "approve")}>
                                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject request">
                                    <IconButton size="small" sx={{ color: RED_ACCENT }} onClick={() => openNoteDialog(req, "reject")}>
                                      <CancelIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                              {req.status !== "pending" && (
                                <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>Decided</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {editRequests.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#9CA3AF", fontSize: "0.78rem" }}>
                              No edit requests yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>

            {/* ── Right: Sidebar Widgets ─────────────────────────────── */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

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

              {/* Contact Placement Office (Recruiter) */}
              {userRole === "recruiter" && (
                <Paper sx={{ p: 2, border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", mb: 0.5 }}>Contact Placement Office</Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "#6B7280", mb: 1.5 }}>
                    General queries, scheduling, or policy clarifications.
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField placeholder="Subject" size="small" fullWidth value={msgSubject} onChange={(e) => setMsgSubject(e.target.value)}
                      inputProps={{ style: { fontSize: "0.75rem" } }} />
                    <TextField placeholder="Your message..." multiline rows={3} size="small" fullWidth value={msgBody} onChange={(e) => setMsgBody(e.target.value)}
                      inputProps={{ style: { fontSize: "0.75rem" } }} />
                    <Button fullWidth variant="contained" size="small" endIcon={<SendIcon sx={{ fontSize: 13 }} />} onClick={sendMessage}
                      sx={{ bgcolor: MAROON, color: WHITE, textTransform: "none", fontSize: "0.75rem", fontWeight: 700, "&:hover": { bgcolor: RED } }}>
                      Send Message
                    </Button>
                  </Box>
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

              {/* Contact info card */}
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
