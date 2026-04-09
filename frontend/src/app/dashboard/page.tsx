"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Container,
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
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

// Icons
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";

// Constants
const RED = "#8B0000";
const RED_DARK = "#5C0000";
const CREAM = "#FFF8E7";
const WHITE = "#FFFFFF";
const SIDEBAR_WIDTH = 240;

interface JnfSubmission {
  id: number;
  job_designation: string;
  status: string;
  sector: string;
  created_at: string;
}

interface InfSubmission {
  id: number;
  internship_designation: string;
  status: string;
  sector: string;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jnfs, setJnfs] = useState<JnfSubmission[]>([]);
  const [infs, setInfs] = useState<InfSubmission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jnfRes = await axios.get("http://localhost:8000/api/jnfs");
        const infRes = await axios.get("http://localhost:8000/api/infs");
        setJnfs(jnfRes.data);
        setInfs(infRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 20 }} />, path: "/dashboard" },
    { label: "Active JNFs", icon: <BusinessCenterIcon sx={{ fontSize: 20 }} />, path: "/dashboard" },
    { label: "Internship Forms", icon: <AssignmentIcon sx={{ fontSize: 20 }} />, path: "/dashboard" },
    { label: "Candidate Pool", icon: <PeopleIcon sx={{ fontSize: 20 }} />, path: "/dashboard" },
    { label: "Settings", icon: <SettingsIcon sx={{ fontSize: 20 }} />, path: "/dashboard" },
  ];

  const submissions = [
    { id: "#JNF-2024-001", title: "Software Development Engineer", type: "JNF", date: "Oct 24, 2023", status: "LIVE", color: "#4CAF50" },
    { id: "#INF-2024-042", title: "Data Science Intern", type: "INF", date: "Nov 02, 2023", status: "UNDER REVIEW", color: "#FF9800" },
    { id: "#JNF-2024-009", title: "Product Manager", type: "JNF", date: "Oct 28, 2023", status: "APPROVED", color: "#2196F3" },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: WHITE }}>
      <Box sx={{ p: 2.5, borderBottom: "1px solid #F0F0F0" }}>
        <Typography variant="overline" sx={{ color: RED, fontWeight: 800, letterSpacing: 1 }}>
          CDC PORTAL
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                setActiveTab(item.label);
                router.push(item.path);
              }}
              sx={{
                borderRadius: 1.5,
                bgcolor: activeTab === item.label ? "rgba(139, 0, 0, 0.05)" : "transparent",
                color: activeTab === item.label ? RED : "#555",
                py: 1,
                "&:hover": { bgcolor: "rgba(139, 0, 0, 0.08)" },
              }}
            >
              <ListItemIcon sx={{ color: activeTab === item.label ? RED : "#888", minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: activeTab === item.label ? 600 : 500, fontSize: "0.82rem" }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid #F0F0F0", display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => router.push("/dashboard/jnf/new")}
          sx={{
            bgcolor: RED,
            color: WHITE,
            py: 1,
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            boxShadow: "none",
            "&:hover": { bgcolor: RED_DARK, boxShadow: "none" },
          }}
        >
          Post New JNF
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={() => router.push("/dashboard/inf/new")}
          sx={{
            color: RED,
            borderColor: RED,
            py: 1,
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            "&:hover": { borderColor: RED_DARK, bgcolor: "rgba(139, 0, 0, 0.04)" },
          }}
        >
          Post New INF
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F9FAFB" }}>
      <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, borderRight: "none" } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, borderRight: "1px solid #E5E7EB" } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ flexGrow: 1, width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` } }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: WHITE, borderBottom: "1px solid #E5E7EB" }}>
          <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: 64 }}>
            <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { lg: "none" }, color: "#374151" }}>
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
              <Box component="img" src="/logo.png" sx={{ height: 28 }} alt="IIT Dhanbad" />
              <Typography sx={{ color: RED, fontWeight: 700, fontSize: "0.95rem", letterSpacing: -0.2 }}>
                IIT Dhanbad <Typography component="span" sx={{ color: "#6B7280", fontWeight: 500, fontSize: "0.85rem" }}>Recruiter</Typography>
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton sx={{ color: "#6B7280" }}>
                <Badge variant="dot" color="error"><NotificationsNoneIcon sx={{ fontSize: 22 }} /></Badge>
              </IconButton>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, ml: 1 }}>
                <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                  <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.82rem", lineHeight: 1.2 }}>
                    {session?.user?.name || "Google Cloud India"}
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.72rem" }}>Recruiter Admin</Typography>
                </Box>
                <Avatar sx={{ bgcolor: CREAM, color: RED, fontWeight: 700, width: 32, height: 32, fontSize: "0.8rem", border: "1px solid #E5E7EB" }}>G</Avatar>
                <IconButton size="small" onClick={() => signOut()}><LogoutIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></IconButton>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ color: RED, fontWeight: 700, fontSize: "0.72rem", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
              CDC Recruitment Dashboard
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 1, letterSpacing: -0.5 }}>
              Welcome back, {session?.user?.name || "Google Cloud India"}
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", maxWidth: 600 }}>
              Manage your placement activities, track JNF approvals, and finalize schedules from a single interface.
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(3, 1fr)" }, gap: 2.5, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "#FFF", border: "1px solid #E5E7EB" }}>
              <Typography sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.725rem", textTransform: "uppercase", mb: 1.5 }}>Total Forms</Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#111827" }}>{jnfs.length + infs.length}</Typography>
              </Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.5 }}>Submissions by your organization</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "#FFF", border: "1px solid #E5E7EB" }}>
              <Typography sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.725rem", textTransform: "uppercase", mb: 1.5 }}>JNFs / INFs</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: "#111827" }}>{jnfs.length} / {infs.length}</Typography>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.5 }}>Jobs / Internships ratio</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "#FFF", border: "1px solid #E5E7EB" }}>
              <Typography sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.725rem", textTransform: "uppercase", mb: 1.5 }}>Pending Approval</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: RED }}>
                {[...jnfs, ...infs].filter(f => f.status === 'PENDING').length}
              </Typography>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.5 }}>Forms awaiting CDC review</Typography>
            </Paper>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "100%", md: "repeat(2, 1fr)" }, gap: 2.5, mb: 6 }}>
            {[
              { title: "New Job Notification (JNF)", icon: <WorkIcon sx={{ fontSize: 20 }} />, color: RED_DARK, path: "/dashboard/jnf/new" },
              { title: "New Internship (INF)", icon: <SchoolIcon sx={{ fontSize: 20 }} />, color: "#111827", path: "/dashboard/inf/new" }
            ].map((card) => (
              <Paper 
                key={card.title} 
                elevation={0} 
                sx={{ 
                  p: 3, borderRadius: 3, border: "1px solid #E5E7EB", bgcolor: "#FFF",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "all 0.2s", cursor: "pointer", "&:hover": { borderColor: RED, transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }
                }}
                onClick={() => router.push(card.path)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.03)", color: "#444" }}>{card.icon}</Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{card.title}</Typography>
                </Box>
                <Button variant="text" size="small" sx={{ color: RED, fontWeight: 700, fontSize: "0.75rem", textTransform: "none" }}>Start →</Button>
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "1rem" }}>Recent Submissions</Typography>
            <Button sx={{ color: RED, fontWeight: 600, fontSize: "0.72rem", textTransform: "none" }}>See All</Button>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F9FAFB" }}>
                <TableRow>
                  {["Title", "Type", "Sector", "Date", "Status", "Actions"].map(h => (
                    <TableCell key={h} sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ...jnfs.map(j => ({ ...j, displayType: 'JNF' })),
                  ...infs.map(i => ({ ...i, displayType: 'INF' }))
                  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5).map((sub: any) => (
                    <TableRow key={sub.id} hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", color: "#111827" }}>
                          {sub.job_designation || sub.internship_designation || "N/A"}
                      </TableCell>
                    <TableCell><Chip label={sub.displayType} size="small" sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700, borderRadius: 1, bgcolor: sub.displayType === 'JNF' ? "rgba(139, 0, 0, 0.1)" : "#F3F4F6", color: sub.displayType === 'JNF' ? RED : "#444" }} /></TableCell>
                    <TableCell sx={{ color: "#6B7280", fontSize: "0.75rem" }}>{sub.sector || "N/A"}</TableCell>
                    <TableCell sx={{ color: "#6B7280", fontSize: "0.75rem" }}>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: sub.status === 'PENDING' ? "#F59E0B" : "#10B981" }} />
                        <Typography sx={{ fontWeight: 600, fontSize: "0.72rem", color: sub.status === 'PENDING' ? "#F59E0B" : "#10B981" }}>{sub.status}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><IconButton size="small"><MoreVertIcon sx={{ fontSize: 16, color: "#9CA3AF" }} /></IconButton></TableCell>
                  </TableRow>
                ))}
                {([...jnfs, ...infs]).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#9CA3AF", fontSize: "0.8rem" }}>No submissions found yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 8, pt: 3, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.72rem" }}>© 2024 IIT (ISM) DHANBAD • CAREER DEVELOPMENT CENTRE</Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              {["Privacy", "Terms", "Handbook", "Contact"].map(l => (
                <Typography key={l} sx={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", "&:hover": { color: RED } }}>{l}</Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
