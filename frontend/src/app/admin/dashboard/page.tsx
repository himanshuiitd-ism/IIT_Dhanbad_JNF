"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import api from "@/lib/api";

const RED = "#8B0000";

interface Stats {
  total_users: number;
  total_jnfs: number;
  total_infs: number;
  pending_jnfs: number;
  pending_infs: number;
  edit_requests: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress color="error" />;

  const statCards = [
    { title: "Total Recruiters", value: stats?.total_users, icon: <PeopleIcon />, color: "#2196f3" },
    { title: "Total JNFs", value: stats?.total_jnfs, icon: <DescriptionIcon />, color: "#4caf50" },
    { title: "Total INFs", value: stats?.total_infs, icon: <DescriptionIcon />, color: "#ff9800" },
    { title: "Pending JNFs", value: stats?.pending_jnfs, icon: <PendingActionsIcon />, color: "#e91e63" },
    { title: "Pending INFs", value: stats?.pending_infs, icon: <PendingActionsIcon />, color: "#f44336" },
    { title: "Edit Requests", value: stats?.edit_requests, icon: <PendingActionsIcon />, color: "#9c27b0" },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1 }}>
        System Overview
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", transition: "0.3s", "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.05)" } }}>
              <CardContent sx={{ display: "flex", alignItems: "center", p: 3 }}>
                <Avatar sx={{ bgcolor: `${card.color}15`, color: card.color, width: 56, height: 56, mr: 2 }}>
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography color="text.secondary" variant="body2" fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 5 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e0e0e0", bgcolor: "white" }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Verification Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Weekly activity tracking will appear here as data is collected.
          </Typography>
          <Box sx={{ height: 200, display: "flex", alignItems: "baseline", gap: 1, mt: 3 }}>
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <Box key={i} sx={{ width: 40, height: `${h}%`, bgcolor: i === 3 ? RED : "#e0e0e0", borderRadius: "4px 4px 0 0" }} />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
