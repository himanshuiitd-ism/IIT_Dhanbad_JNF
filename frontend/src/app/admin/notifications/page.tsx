"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Paper, Divider, CircularProgress, Button,
  Chip, List, ListItem,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import axios from "axios";

const MAROON = "#7B0000";

const NOTIF_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  approval:     { icon: <CheckCircleRoundedIcon />,    color: "#059669", label: "Approval" },
  rejection:    { icon: <CancelRoundedIcon />,          color: "#DC2626", label: "Rejection" },
  status_update:{ icon: <CheckCircleRoundedIcon />,    color: "#2563EB", label: "Status Update" },
  edit_request: { icon: <EditNoteRoundedIcon />,        color: "#D97706", label: "Edit Request" },
  email:        { icon: <MarkEmailReadRoundedIcon />,   color: "#7C3AED", label: "Email" },
  system:       { icon: <ArticleRoundedIcon />,         color: "#6B7280", label: "System" },
};

export default function AdminNotifications() {
  const [notifs, setNotifs]               = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("local_token") || ""}`,
  }), []);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notifications", { headers: authHeaders() });
      setNotifs(res.data);
    } catch {}
    finally { setLoading(false); }
  }, [authHeaders]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.post("http://localhost:8000/api/notifications/read", {}, { headers: authHeaders() });
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {} finally { setMarkingAll(false); }
  };

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const unreadCount = notifs.filter(n => !n.is_read).length;

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}><CircularProgress sx={{ color: MAROON }} /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>Notifications</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
            {notifs.length} total · {unreadCount} unread
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            startIcon={markingAll ? <CircularProgress size={14} /> : <DoneAllRoundedIcon />}
            onClick={markAllRead}
            disabled={markingAll}
            sx={{ color: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.82rem" }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
        {notifs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <NotificationsRoundedIcon sx={{ fontSize: 52, color: "#D1D5DB", mb: 2 }} />
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.9rem", fontWeight: 600 }}>
              You have no notifications.
            </Typography>
            <Typography sx={{ color: "#D1D5DB", fontSize: "0.78rem", mt: 0.5 }}>
              New submission alerts and system messages will appear here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifs.map((n, i) => {
              const cfg = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.system;
              return (
                <Box key={n.id}>
                  <ListItem
                    sx={{
                      px: 3, py: 2.5,
                      bgcolor: n.is_read ? "white" : "rgba(123,0,0,0.025)",
                      alignItems: "flex-start",
                      gap: 2,
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Icon */}
                    <Box sx={{
                      width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                      bgcolor: `${cfg.color}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: cfg.color, mt: 0.2,
                    }}>
                      {cfg.icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontWeight: n.is_read ? 600 : 800, fontSize: "0.88rem", color: "#111827" }}>
                            {n.title || cfg.label}
                          </Typography>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              fontSize: "0.6rem", height: 18, fontWeight: 700,
                              bgcolor: `${cfg.color}12`, color: cfg.color,
                            }}
                          />
                          {n.is_email && (
                            <Chip label="Email" size="small" sx={{ fontSize: "0.6rem", height: 18, bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 700 }} />
                          )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {!n.is_read && (
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: MAROON, flexShrink: 0 }} />
                          )}
                          <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                            {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.6 }}>
                        {n.message}
                      </Typography>
                      {(n.form_type && n.form_id) && (
                        <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF", mt: 0.5 }}>
                          Related: {n.form_type?.toUpperCase()} #{n.form_id}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                  {i < notifs.length - 1 && <Divider sx={{ mx: 3, borderColor: "#F3F4F6" }} />}
                </Box>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
