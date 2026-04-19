"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Chip,
  CircularProgress, TextField, InputAdornment, IconButton, Tooltip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import axios from "axios";

const MAROON = "#7B0000";

export default function AdminRecruiters() {
  const router = useRouter();
  const [users, setUsers]     = useState<any[]>([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
  }), []);

  useEffect(() => {
    axios.get("http://localhost:8000/api/admin/users", { headers: authHeaders() })
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authHeaders]);

  const filtered = users.filter(u =>
    `${u.name} ${u.email} ${u.organisation}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
    <CircularProgress sx={{ color: MAROON }} />
  </Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#111827" }}>Recruiters</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.83rem" }}>
            {users.length} registered companies · {users.filter(u => u.jnfs_count > 0 || u.infs_count > 0).length} with submissions
          </Typography>
        </Box>
        <TextField
          placeholder="Search by name, email or company…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 300, bgcolor: "white", borderRadius: 2 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment>,
            sx: { borderRadius: 2, fontSize: "0.83rem" },
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2.5, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase", py: 1.5 }}>Recruiter</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Organisation</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Submissions</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }}>Profile</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#6B7280", textTransform: "uppercase" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} hover sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: MAROON, width: 34, height: 34, fontSize: "0.8rem", fontWeight: 700 }}>
                      {u.name?.[0] || "R"}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#111827" }}>{u.name || "—"}</Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#6B7280" }}>{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.78rem", color: "#374151" }}>
                    {u.organisation || <span style={{ color: "#9CA3AF" }}>Not set</span>}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "0.75rem", color: "#4B5563" }}>{u.phone || "—"}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.75 }}>
                    <Chip
                      label={`JNF: ${u.jnfs_count || 0}`}
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20, fontWeight: 700, bgcolor: "#EDE9FE", color: "#6D28D9" }}
                    />
                    <Chip
                      label={`INF: ${u.infs_count || 0}`}
                      size="small"
                      sx={{ fontSize: "0.65rem", height: 20, fontWeight: 700, bgcolor: "#E0F2FE", color: "#0369A1" }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {u.profile_complete ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#059669" }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>Complete</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#D97706" }}>
                      <PendingRoundedIcon sx={{ fontSize: 15 }} />
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#D97706" }}>Incomplete</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <Tooltip title="View recruiter profile">
                      <IconButton size="small" onClick={() => router.push(`/admin/recruiters/${u.id}`)} sx={{ color: MAROON }}>
                        <OpenInNewRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Email ${u.email}`}>
                      <IconButton size="small" component="a" href={`mailto:${u.email}`} sx={{ color: "#2563EB" }}>
                        <MailOutlineRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10, color: "#9CA3AF" }}>
                  {search ? `No results for "${search}"` : "No recruiters registered yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
