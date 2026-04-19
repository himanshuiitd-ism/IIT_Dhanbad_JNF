"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ─── Design Tokens ───────────────────────────────────────────────
const MAROON = "#570000";
const RED    = "#800000";
const WHITE  = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.09)";

// ─── Stages ──────────────────────────────────────────────────────
type ParseStage = "idle" | "uploading" | "analyzing" | "mapping" | "done" | "error";

const STAGE_MESSAGES: Record<ParseStage, string> = {
  idle: "Upload a PDF to auto-fill the form",
  uploading: "Uploading PDF…",
  analyzing: "AI is analyzing your document…",
  mapping: "Mapping fields to form…",
  done: "Auto-fill complete!",
  error: "Something went wrong",
};

const STAGE_PROGRESS: Record<ParseStage, number> = {
  idle: 0,
  uploading: 20,
  analyzing: 60,
  mapping: 85,
  done: 100,
  error: 0,
};

interface PdfUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onParse: (
    file: File,
    onProgress: (stage: string) => void
  ) => Promise<{ fieldsCount: number }>;
  formType: "jnf" | "inf";
}

/**
 * PDF Upload Dialog with drag-and-drop support.
 * Shows animated progress through AI parsing stages.
 */
export default function PdfUploadDialog({
  open,
  onClose,
  onParse,
  formType,
}: PdfUploadDialogProps) {
  const [stage, setStage] = useState<ParseStage>("idle");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fieldsFound, setFieldsFound] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStage("idle");
    setError("");
    setSelectedFile(null);
    setFieldsFound(0);
    setDragOver(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleParse = async () => {
    if (!selectedFile) return;

    try {
      setStage("uploading");

      const result = await onParse(selectedFile, (progressStage: string) => {
        if (progressStage.includes("Uploading")) setStage("uploading");
        else if (progressStage.includes("Analyzing")) setStage("analyzing");
        else if (progressStage.includes("Mapping")) setStage("mapping");
      });

      setFieldsFound(result.fieldsCount);
      setStage("done");
    } catch (err: any) {
      setError(err.message || "Failed to parse PDF");
      setStage("error");
    }
  };

  const progress = STAGE_PROGRESS[stage];

  return (
    <Dialog
      open={open}
      onClose={stage === "idle" || stage === "done" || stage === "error" ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: MAROON,
          color: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoFixHighIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontWeight: 900, fontSize: "0.95rem" }}>
            AI Auto-Fill — Upload Recruiter PDF
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: "rgba(255,255,255,0.6)" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        {/* Info banner */}
        <Alert
          severity="info"
          icon={<AutoFixHighIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 3, fontSize: "0.75rem", borderRadius: 1.5 }}
        >
          Upload a PDF containing company/job details. Our AI will
          intelligently map the content to {formType.toUpperCase()} form fields — even
          if the PDF uses different terminology (e.g., "GPA" → "CGPA").
        </Alert>

        {/* Drop zone */}
        {(stage === "idle" || stage === "error") && (
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? MAROON : BORDER}`,
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: dragOver ? "rgba(87,0,0,0.03)" : "#FAFAFA",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: MAROON,
                bgcolor: "rgba(87,0,0,0.02)",
              },
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              hidden
              onChange={handleInputChange}
            />

            {selectedFile ? (
              <Box>
                <PictureAsPdfIcon sx={{ fontSize: 48, color: RED, mb: 1 }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", mb: 0.5 }}>
                  {selectedFile.name}
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
                  {(selectedFile.size / 1024).toFixed(0)} KB · Click to change
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUploadIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", mb: 0.5 }}>
                  Drag & drop your PDF here
                </Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                  or click to browse · Max 10 MB
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Progress stages */}
        {(stage === "uploading" || stage === "analyzing" || stage === "mapping") && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `3px solid ${BORDER}`,
                borderTopColor: MAROON,
                mx: "auto",
                mb: 3,
                animation: "spin 1s linear infinite",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", mb: 1, color: MAROON }}>
              {STAGE_MESSAGES[stage]}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", mb: 3 }}>
              This may take 15–30 seconds depending on the document size
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                maxWidth: 300,
                mx: "auto",
                bgcolor: "rgba(87,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  bgcolor: MAROON,
                  transition: "transform 1s ease",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
              {["Upload", "Analyze", "Map"].map((s, i) => {
                const stageIdx =
                  stage === "uploading" ? 0 : stage === "analyzing" ? 1 : 2;
                return (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      bgcolor: i <= stageIdx ? "rgba(87,0,0,0.08)" : "rgba(0,0,0,0.04)",
                      color: i <= stageIdx ? MAROON : "#9CA3AF",
                      border: i === stageIdx ? `1px solid ${MAROON}` : "none",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Success */}
        {stage === "done" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#059669", mb: 2 }} />
            <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: "#059669", mb: 1 }}>
              Auto-Fill Complete!
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#374151", mb: 0.5 }}>
              <strong>{fieldsFound}</strong> fields were automatically filled from your PDF.
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>
              Please review and correct any values before submitting.
              AI-filled fields are marked with a{" "}
              <AutoFixHighIcon sx={{ fontSize: 12, verticalAlign: "middle", color: "#7C3AED" }} />{" "}
              icon in the form tracker.
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, fontSize: "0.78rem" }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: "none", color: "#6B7280", fontSize: "0.82rem" }}
        >
          {stage === "done" ? "Close" : "Cancel"}
        </Button>

        {(stage === "idle" || stage === "error") && selectedFile && (
          <Button
            variant="contained"
            startIcon={<AutoFixHighIcon />}
            onClick={handleParse}
            sx={{
              bgcolor: MAROON,
              color: WHITE,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.82rem",
              px: 3,
              borderRadius: 2,
              "&:hover": { bgcolor: RED },
            }}
          >
            Parse & Auto-Fill
          </Button>
        )}

        {stage === "done" && (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: "#059669",
              color: WHITE,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.82rem",
              px: 3,
              borderRadius: 2,
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            Start Reviewing Form
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
