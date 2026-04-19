"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid2 as Grid,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestoreIcon from "@mui/icons-material/Restore";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

// ─── Design Tokens ───────────────────────────────────────────────
const MAROON = "#850000ff";
const RED = "#b90000ff";
const CREAM  = "#FFF8E7";
const WHITE  = "#FFFFFF";
const SURFACE = "#FBF8F8";

export default function InitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initStatus, setInitStatus] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  // Fetch current master data status
  const fetchStatus = async () => {
    try {
      const res = await api.get("/init");
      setMasterData(res.data);
    } catch (err) {
      console.error("Failed to fetch master data", err);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchStatus();
    }
  }, [status, router]);

  const handleInitialize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/init");
      setInitStatus(res.data);
      fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Initialization failed. Please ensure the backend is online and the database is configured.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: SURFACE }}>
        <CircularProgress sx={{ color: MAROON }} />
      </Box>
    );
  }

  if (!isAdmin && status === "authenticated") {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error" variant="filled">
          Unauthorized Access. This page is only accessible by administrators.
        </Alert>
        <Button onClick={() => router.push("/dashboard")} sx={{ mt: 2, color: MAROON }}>
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: SURFACE, pb: 10 }}>
      {/* Header Area */}
      <Box sx={{ bgcolor: MAROON, color: WHITE, py: 8, mb: 6, boxShadow: "0 10px 30px rgba(87,0,0,0.2)" }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
            System Initialization
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
            Setup master data for the IIT (ISM) Dhanbad Placement Portal
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Grid container spacing={4}>
          {/* Main Actions Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                <StorageIcon sx={{ color: RED }} />
                Initialize Master Data
              </Typography>
              
              <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
                This process will read the CSV files (departments, courses, branches) from the backend database directory 
                and populate the system tables. Existing records with the same codes will be updated.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {initStatus?.success && (
                <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
                  {initStatus.message}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleInitialize}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                  sx={{
                    bgcolor: RED,
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": { bgcolor: MAROON }
                  }}
                >
                  {loading ? "Initializing..." : "Start Initialization"}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={fetchStatus}
                  startIcon={<RestoreIcon />}
                  sx={{ color: RED, borderColor: RED, "&:hover": { borderColor: MAROON, bgcolor: "rgba(128,0,0,0.04)" } }}
                >
                  Refresh Status
                </Button>
              </Box>

              {initStatus?.stats && (
                <Box sx={{ mt: 4, p: 3, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: "text.secondary", textTransform: "uppercase" }}>
                    Initialization Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: RED }}>{initStatus.stats.departments}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Departments</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: RED }}>{initStatus.stats.courses}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Courses</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: RED }}>{initStatus.stats.branches}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Branches</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Current Status Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: WHITE, border: "1px solid rgba(0,0,0,0.05)" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Current Database
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BusinessIcon sx={{ color: masterData?.departments?.length > 0 ? RED : "rgba(0,0,0,0.2)" }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Departments</Typography>}
                    secondary={`${masterData?.departments?.length || 0} records found`}
                  />
                  {masterData?.departments?.length > 0 ? <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} /> : <ErrorIcon sx={{ color: "#D97706", fontSize: 20 }} />}
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SchoolIcon sx={{ color: masterData?.courses?.length > 0 ? RED : "rgba(0,0,0,0.2)" }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Courses</Typography>}
                    secondary={`${masterData?.courses?.length || 0} records found`}
                  />
                  {masterData?.courses?.length > 0 ? <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} /> : <ErrorIcon sx={{ color: "#D97706", fontSize: 20 }} />}
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccountTreeIcon sx={{ color: masterData?.branches?.length > 0 ? RED : "rgba(0,0,0,0.2)" }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Branches</Typography>}
                    secondary={`${masterData?.branches?.length || 0} records found`}
                  />
                  {masterData?.branches?.length > 0 ? <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} /> : <ErrorIcon sx={{ color: "#D97706", fontSize: 20 }} />}
                </ListItem>
              </List>

              <Box sx={{ mt: 3, p: 2, bgcolor: CREAM, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: MAROON, fontWeight: 600, display: "block" }}>
                  Status Tip:
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Initialize the system once before starting the placement season. 
                  Ensure CSV files are present in backend/database/data/.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
