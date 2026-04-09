"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";

const RED = "#8B0000";
const RED_DARK = "#5C0000";
const CREAM = "#FFF8E7";
const WHITE = "#FFFFFF";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: CREAM }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static" sx={{ bgcolor: RED_DARK }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2, color: "#FFD700" }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            IIT (ISM) JNF Portal
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              Welcome, {session?.user?.name || session?.user?.email}
            </Typography>
            <Avatar sx={{ bgcolor: RED, color: CREAM, width: 32, height: 32, fontSize: "0.8rem" }}>
              {session?.user?.name?.charAt(0) || "U"}
            </Avatar>
            <IconButton color="inherit" onClick={() => signOut()}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e0e0e0" }}>
          <Typography variant="h4" gutterBottom fontWeight={800} color={RED}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Successfully logged in. This is your recruitment command centre.
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "100%", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {[
              { label: "Active JNFs", count: "0", sub: "Currently posted jobs" },
              { label: "Applications", count: "0", sub: "Students reached out" },
              { label: "Shortlisted", count: "0", sub: "Ready for interview" },
            ].map((stat) => (
              <Paper key={stat.label} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
                <Typography variant="h3" fontWeight={800} color={RED}>{stat.count}</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{stat.label}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ mt: 6, p: 3, bgcolor: CREAM, borderRadius: 2, border: `1px dashed ${RED}` }}>
            <Typography variant="h6" fontWeight={700} color={RED_DARK} gutterBottom>
              Get Started
            </Typography>
            <Typography variant="body2" paragraph>
              The 2024-25 placement season is now active! Start by creating a new JNF or checking active student pools.
            </Typography>
            <Button variant="contained" sx={{ bgcolor: RED, color: WHITE, textTransform: "none", fontWeight: 700 }}>
              Create New JNF +
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
