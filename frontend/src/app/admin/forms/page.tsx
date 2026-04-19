"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "@/lib/api";

const RED = "#8B0000";

interface Form {
  id: number;
  company_name: string;
  status: string;
  created_at: string;
  submitted_at: string | null;
  user?: { name: string; email: string };
}

function FormsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "jnf";
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/forms?type=${type}`)
      .then(res => setForms(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [type]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING": return "warning";
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      case "LIVE": return "info";
      default: return "default";
    }
  };

  if (loading) return <CircularProgress color="error" />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={800}>
          {type.toUpperCase()} Submissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {forms.length}
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Submitted By</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{form.company_name}</TableCell>
                <TableCell>
                  <Typography variant="body2">{form.user?.name || "N/A"}</Typography>
                  <Typography variant="caption" color="text.secondary">{form.user?.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(form.submitted_at || form.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={form.status} 
                    size="small"
                    color={getStatusColor(form.status) as any}
                    variant="filled"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    startIcon={<VisibilityIcon />}
                    size="small"
                    variant="outlined"
                    sx={{ color: RED, borderColor: RED, textTransform: "none", borderRadius: 2 }}
                    onClick={() => router.push(`/admin/forms/${type}/${form.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  No {type.toUpperCase()} submissions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function AdminForms() {
  return (
    <Suspense fallback={<CircularProgress color="error" />}>
      <FormsContent />
    </Suspense>
  );
}
