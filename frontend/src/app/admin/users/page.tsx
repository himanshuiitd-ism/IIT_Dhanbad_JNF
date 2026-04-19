"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MailIcon from "@mui/icons-material/Mail";
import api from "@/lib/api";

const RED = "#8B0000";

interface User {
  id: number;
  name: string;
  email: string;
  organisation: string;
  phone: string;
  jnfs_count: number;
  infs_count: number;
  profile_complete: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.organisation?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <CircularProgress color="error" />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Registered Recruiters
        </Typography>
        <TextField
          placeholder="Search recruiters..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, bgcolor: "white" }}
        />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Recruiter</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Organisation</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Forms</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: RED, fontSize: "0.85rem" }}>
                      {user.name?.charAt(0) || "R"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{user.name || "N/A"}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{user.organisation || "Pending Setup"}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.phone || "-"}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip label={`JNF: ${user.jnfs_count}`} size="small" variant="outlined" />
                    <Chip label={`INF: ${user.infs_count}`} size="small" variant="outlined" />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.profile_complete ? "Active" : "Incomplete"} 
                    size="small"
                    color={user.profile_complete ? "success" : "warning"}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" title="Email User" sx={{ color: RED }}>
                    <MailIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No recruiters found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
