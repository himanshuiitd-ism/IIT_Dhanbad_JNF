"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import {
  PeopleAltRounded as PeopleAltRoundedIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  NotificationsRounded as NotificationsRoundedIcon,
  LogoutRounded as LogoutRoundedIcon,
  MenuRounded as MenuRoundedIcon,
  CheckCircleRounded as CheckCircleRoundedIcon,
  CancelRounded as CancelRoundedIcon,
  AccessTimeRounded as AccessTimeRoundedIcon,
  MarkEmailReadRounded as MarkEmailReadRoundedIcon,
  EditNoteRounded as EditNoteRoundedIcon,
  ArticleRounded as ArticleRoundedIcon,
  GroupsRounded as GroupsRoundedIcon,
  EmailRounded as EmailRoundedIcon,
} from "@mui/icons-material";
import axios from "axios";

const MAROON = "#7B0000";
const DEEP_RED = "#4A0000";
const SIDEBAR_W = 260;

// ─── Notification type icon ────────────────────────────────────
const NotifIcon = ({ type }: { type: string }) => {
  const props = { fontSize: "small" as const };
  if (type === "approval") return <CheckCircleRoundedIcon {...props} sx={{ color: "#059669" }} />;
  if (type === "rejection") return <CancelRoundedIcon {...props} sx={{ color: "#DC2626" }} />;
  if (type === "edit_request") return <EditNoteRoundedIcon {...props} sx={{ color: "#D97706" }} />;
  if (type === "email") return <MarkEmailReadRoundedIcon {...props} sx={{ color: "#2563EB" }} />;
  return <ArticleRoundedIcon {...props} sx={{ color: "#6B7280" }} />;
};

const navLinks = [
  { label: "Dashboard", path: "/admin", icon: <DashboardRoundedIcon /> },
  { label: "Recruiters", path: "/admin/recruiters", icon: <PeopleAltRoundedIcon /> },
  { label: "JNF Reviews", path: "/admin/forms/jnf", icon: <DescriptionRoundedIcon /> },
  { label: "INF Reviews", path: "/admin/forms/inf", icon: <DescriptionRoundedIcon /> },
  { label: "Alumni Mentorship", path: "/admin/alumni-mentorship", icon: <GroupsRoundedIcon /> },
  { label: "Notifications", path: "/admin/notifications", icon: <NotificationsRoundedIcon /> },
  { label: "SMTP Settings", path: "/admin/smtp", icon: <EmailRoundedIcon /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  // Fetch admin notifications
  const fetchNotifs = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("local_token") || "";
      const res = await axios.get("http://localhost:8000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(res.data.slice(0, 8));
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length);
      setAdminName(
        localStorage.getItem("admin_name") ||
        localStorage.getItem("local_user_name") ||
        "CDC Admin"
      );
    } catch {
      // backend may not be ready yet
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Accept admin_token, local_token, or local_user_role=admin
    const token = localStorage.getItem("admin_token") || localStorage.getItem("local_token");
    const role = localStorage.getItem("local_user_role");
    if (!token && role !== "admin") {
      router.replace("/");
      return;
    }
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000); // poll every 30s
    return () => clearInterval(iv);
  }, [fetchNotifs, router]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post("http://localhost:8000/api/notifications/read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const logout = () => {
    ["admin_token", "local_user_role", "local_user_name", "local_user_email", "admin_name", "local_token"].forEach(k => localStorage.removeItem(k));
    router.push("/");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#F9FAFB" }}>
        <CircularProgress sx={{ color: MAROON }} />
      </Box>
    );
  }

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: DEEP_RED }}>
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Box sx={{ bgcolor: "white", borderRadius: 1.5, p: 0.5, display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
          <Image src="/logo.png" alt="IIT Dhanbad" width={30} height={30} />
        </Box>
        <Box>
          <Typography sx={{ color: "white", fontWeight: 900, fontSize: "0.85rem", lineHeight: 1.2 }}>
            IIT (ISM) Dhanbad
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Admin Portal
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, px: 2, pt: 3 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, px: 1, mb: 1 }}>
          Navigation
        </Typography>
        <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {navLinks.map((link) => {
            const isActive = link.path === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.path);
            return (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  onClick={() => { router.push(link.path); setMobileOpen(false); }}
                  sx={{
                    borderRadius: 2,
                    py: 1.1,
                    bgcolor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                    transition: "all 0.15s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "#FCD34D" : "rgba(255,255,255,0.6)", minWidth: 38 }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontSize: "0.83rem",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "white" : "rgba(255,255,255,0.75)",
                    }}
                  />
                  {isActive && (
                    <Box sx={{ width: 4, height: 20, bgcolor: "#FCD34D", borderRadius: 2, ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 2, py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.07)" } }}
        >
          <ListItemIcon sx={{ color: "rgba(255,255,255,0.5)", minWidth: 38 }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F3F4F6" }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { lg: SIDEBAR_W }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_W, border: "none" } }}
        >
          {sidebar}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": { width: SIDEBAR_W, border: "none" } }}
          open
        >
          {sidebar}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: { lg: `calc(100% - ${SIDEBAR_W}px)` } }}>
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "white", borderBottom: "1px solid #E5E7EB", top: 0, zIndex: 10 }}
        >
          <Toolbar sx={{ minHeight: "60px !important", px: 3 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { lg: "none" }, color: MAROON }}
            >
              <MenuRoundedIcon />
            </IconButton>

            {/* Breadcrumb */}
            <Typography sx={{ flex: 1, fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>
              {navLinks.find(l => l.path === "/admin" ? pathname === "/admin" : pathname.startsWith(l.path))?.label || "Admin"}
            </Typography>

            {/* Notification Bell */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => { setNotifAnchor(e.currentTarget); markAllRead(); }}
                sx={{ color: "#6B7280", "&:hover": { color: MAROON } }}
              >
                <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Admin Avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#111827", lineHeight: 1.2 }}>
                  {adminName}
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: MAROON, fontWeight: 700, textTransform: "uppercase" }}>
                  Verifier · CDC
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: MAROON, width: 34, height: 34, fontSize: "0.85rem", fontWeight: 700 }}>
                {adminName?.[0] || "A"}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          PaperProps={{
            sx: {
              width: 380,
              maxHeight: 480,
              mt: 1,
              borderRadius: 2,
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              border: "1px solid #E5E7EB",
              overflow: "hidden",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#111827" }}>Notifications</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: MAROON, fontWeight: 600, cursor: "pointer" }} onClick={fetchNotifs}>
              Refresh
            </Typography>
          </Box>
          <Box sx={{ overflowY: "auto", maxHeight: 380 }}>
            {notifs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <NotificationsRoundedIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.82rem" }}>No notifications yet</Typography>
              </Box>
            ) : (
              notifs.map((n, i) => (
                <Box key={n.id}>
                  <MenuItem
                    sx={{
                      px: 2.5, py: 1.5,
                      bgcolor: n.is_read ? "transparent" : "rgba(123,0,0,0.03)",
                      "&:hover": { bgcolor: "#F9FAFB" },
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ mt: 0.3 }}><NotifIcon type={n.type} /></Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: n.is_read ? 500 : 700, fontSize: "0.8rem", color: "#111827", lineHeight: 1.3 }}>
                        {n.title || n.type}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mt: 0.3, lineHeight: 1.4, whiteSpace: "normal" }}>
                        {n.message}
                      </Typography>
                      <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", mt: 0.5 }}>
                        {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </Typography>
                    </Box>
                    {!n.is_read && (
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: MAROON, flexShrink: 0, mt: 0.5 }} />
                    )}
                  </MenuItem>
                  {i < notifs.length - 1 && <Divider sx={{ mx: 2, borderColor: "#F3F4F6" }} />}
                </Box>
              ))
            )}
          </Box>
          {notifs.length > 0 && (
            <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
              <Typography
                sx={{ fontSize: "0.75rem", color: MAROON, fontWeight: 700, cursor: "pointer" }}
                onClick={() => { setNotifAnchor(null); router.push("/admin/notifications"); }}
              >
                View all notifications →
              </Typography>
            </Box>
          )}
        </Menu>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
