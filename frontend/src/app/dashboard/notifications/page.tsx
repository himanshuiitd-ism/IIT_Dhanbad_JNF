"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Box, Typography, Paper, Divider, CircularProgress,
  Button, Chip, List, ListItem, Alert,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/navigation";
import axios from "axios";

const MAROON  = "#850000";

const NOTIF_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string; bg: string }> = {
  approval:      { icon: <CheckCircleRoundedIcon />,   color: "#059669", bg: "#D1FAE5", label: "Form Approved" },
  rejection:     { icon: <CancelRoundedIcon />,         color: "#DC2626", bg: "#FEE2E2", label: "Form Rejected" },
  status_update: { icon: <CheckCircleRoundedIcon />,   color: "#2563EB", bg: "#DBEAFE", label: "Status Update" },
  edit_request:  { icon: <EditNoteRoundedIcon />,       color: "#D97706", bg: "#FEF3C7", label: "Edit Requested" },
  email:         { icon: <MarkEmailReadRoundedIcon />,  color: "#7C3AED", bg: "#EDE9FE", label: "Message" },
  system:        { icon: <ArticleRoundedIcon />,        color: "#6B7280", bg: "#F3F4F6", label: "System" },
};

export default function RecruiterNotificationsPage() {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [notifs, setNotifs]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const getToken = useCallback(() =>
    (session as any)?.accessToken || localStorage.getItem("local_token") || "",
  [session]);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notifications", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifs(res.data);
    } catch {}
    finally { setLoading(false); }
  }, [getToken]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await axios.post("http://localhost:8000/api/notifications/read", {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {} finally { setMarkingAll(false); }
  };

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const unreadCount = notifs.filter(n => !n.is_read).length;

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress sx={{ color: MAROON }} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.push("/dashboard")}
            sx={{ color: "#6B7280", textTransform: "none", fontWeight: 600, fontSize: "0.8rem", mb: 1, px: 0 }}
          >
            Back to Dashboard
          </Button>
          <Typography sx={{ fontWeight: 900, fontSize: "1.4rem", color: MAROON }}>
            My Notifications
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>
            {notifs.length} messages · {unreadCount} unread
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            startIcon={markingAll ? <CircularProgress size={14} /> : <DoneAllRoundedIcon />}
            onClick={markAllRead}
            disabled={markingAll}
            sx={{ color: MAROON, textTransform: "none", fontWeight: 700, fontSize: "0.78rem" }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Unread alert */}
      {unreadCount > 0 && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2, fontSize: "0.8rem" }}>
          You have <strong>{unreadCount} unread</strong> notification{unreadCount > 1 ? "s" : ""} from the CDC Admin.
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden" }}>
        {notifs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <NotificationsRoundedIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.88rem" }}>
              No notifications yet
            </Typography>
            <Typography sx={{ color: "#D1D5DB", fontSize: "0.75rem", mt: 0.5 }}>
              Approval decisions and admin messages will appear here.
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
                      px: 2.5, py: 2,
                      bgcolor: n.is_read ? "white" : "rgba(133,0,0,0.025)",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    {/* Icon */}
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                      bgcolor: cfg.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: cfg.color, mt: 0.2,
                    }}>
                      {cfg.icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.3, flexWrap: "wrap", gap: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Typography sx={{ fontWeight: n.is_read ? 600 : 800, fontSize: "0.85rem", color: "#111827" }}>
                            {n.title || cfg.label}
                          </Typography>
                          <Chip label={cfg.label} size="small" sx={{ fontSize: "0.58rem", height: 17, bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }} />
                          {!n.is_read && (
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: MAROON }} />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: "0.65rem", color: "#9CA3AF", flexShrink: 0 }}>
                          {new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#4B5563", lineHeight: 1.6 }}>
                        {n.message}
                      </Typography>
                      {n.form_type && n.form_id && (
                        <Typography sx={{ fontSize: "0.66rem", color: "#9CA3AF", mt: 0.5 }}>
                          Re: {n.form_type.toUpperCase()} Form #{n.form_id}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                  {i < notifs.length - 1 && <Divider sx={{ mx: 2.5, borderColor: "#F3F4F6" }} />}
                </Box>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
}
