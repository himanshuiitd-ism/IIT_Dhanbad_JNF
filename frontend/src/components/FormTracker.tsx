"use client";

import React from "react";
import {
  Box,
  Typography,
  Tooltip,
  LinearProgress,
  IconButton,
  Collapse,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import type { TrackerSection } from "@/lib/ai-parser/types";

// ─── Design Tokens ───────────────────────────────────────────────
const MAROON = "#570000";
const RED    = "#800000";
const SURFACE = "#FBF8F8";
const WHITE  = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.09)";
const GREEN  = "#059669";
const AMBER  = "#D97706";

interface FormTrackerProps {
  sections: TrackerSection[];
  currentStep: number;
  onJumpToStep: (stepIndex: number) => void;
  autoFilledKeys: Set<string>;
  open: boolean;
  onToggle: () => void;
}

/**
 * Cross-page form tracker.
 * Shows fill-status of ALL pages while on any page.
 * Highlights AI-auto-filled fields with a sparkle icon.
 */
export default function FormTracker({
  sections,
  currentStep,
  onJumpToStep,
  autoFilledKeys,
  open,
  onToggle,
}: FormTrackerProps) {
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});

  const totalFilled = sections.reduce((a, s) => a + s.filledCount, 0);
  const totalFields = sections.reduce((a, s) => a + s.totalCount, 0);
  const overallPercentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  const toggleSection = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!open) {
    return (
      <Tooltip title="Show form tracker" placement="left">
        <Box
          onClick={onToggle}
          sx={{
            position: "fixed",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1100,
            bgcolor: MAROON,
            color: WHITE,
            borderRadius: "8px 0 0 8px",
            p: 1,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(87,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            transition: "all 0.3s",
            "&:hover": { bgcolor: RED, pr: 2 },
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: "1rem" }}>
            {overallPercentage}%
          </Typography>
          <Typography sx={{ fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Filled
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: 80,
        bottom: 20,
        width: 280,
        zIndex: 1100,
        bgcolor: WHITE,
        borderLeft: `1px solid ${BORDER}`,
        borderRadius: "12px 0 0 12px",
        boxShadow: "-4px 0 30px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.3s",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: MAROON,
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ color: WHITE, fontWeight: 900, fontSize: "0.82rem" }}>
            Form Tracker
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.62rem" }}>
            {totalFilled}/{totalFields} fields filled
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ minWidth: 50 }}>
            <Typography
              sx={{ color: WHITE, fontSize: "1.1rem", fontWeight: 900, textAlign: "right" }}
            >
              {overallPercentage}%
            </Typography>
          </Box>
          <IconButton size="small" onClick={onToggle} sx={{ color: "rgba(255,255,255,0.6)" }}>
            <Typography sx={{ fontSize: "1.2rem" }}>✕</Typography>
          </IconButton>
        </Box>
      </Box>

      {/* Overall progress bar */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={overallPercentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(87,0,0,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              bgcolor: overallPercentage === 100 ? GREEN : MAROON,
            },
          }}
        />
      </Box>

      {/* Sections list */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 2 }}>
        {sections.map((section, idx) => {
          const isCurrent = section.stepIndex === currentStep;
          const isExpanded = expanded[idx] ?? isCurrent;
          const sectionColor =
            section.percentage === 100
              ? GREEN
              : section.percentage > 0
              ? AMBER
              : "#9CA3AF";

          return (
            <Box key={section.stepName} sx={{ mb: 0.5 }}>
              {/* Section header */}
              <Box
                onClick={() => toggleSection(idx)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 1,
                  px: 1.5,
                  borderRadius: 1.5,
                  cursor: "pointer",
                  bgcolor: isCurrent ? "rgba(87,0,0,0.04)" : "transparent",
                  border: isCurrent ? `1px solid rgba(87,0,0,0.12)` : "1px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "rgba(87,0,0,0.04)" },
                }}
              >
                {/* Status dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: sectionColor,
                    flexShrink: 0,
                  }}
                />

                {/* Step name + stats */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: isCurrent ? 900 : 700,
                      color: isCurrent ? MAROON : "#374151",
                      lineHeight: 1.2,
                    }}
                  >
                    {section.stepName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.58rem", color: "#9CA3AF" }}>
                    {section.filledCount}/{section.totalCount} · {section.percentage}%
                  </Typography>
                </Box>

                {/* Jump button (only for non-current) */}
                {!isCurrent && section.filledCount < section.totalCount && (
                  <Tooltip title={`Go to ${section.stepName}`}>
                    <Typography
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToStep(section.stepIndex);
                      }}
                      sx={{
                        fontSize: "0.58rem",
                        color: MAROON,
                        fontWeight: 800,
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      GO →
                    </Typography>
                  </Tooltip>
                )}

                {/* Expand/collapse */}
                <IconButton size="small" sx={{ p: 0.2 }}>
                  {isExpanded ? (
                    <ExpandLessIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                  )}
                </IconButton>
              </Box>

              {/* Field-level details */}
              <Collapse in={isExpanded}>
                <Box sx={{ pl: 3, pr: 1, pb: 0.5 }}>
                  {section.fields.map((field) => (
                    <Box
                      key={field.key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        py: 0.35,
                        borderBottom: `1px solid rgba(0,0,0,0.03)`,
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      {field.status === "filled" ? (
                        <CheckCircleIcon sx={{ fontSize: 11, color: GREEN }} />
                      ) : field.status === "partial" ? (
                        <ErrorOutlineIcon sx={{ fontSize: 11, color: AMBER }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: "#D1D5DB" }} />
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.62rem",
                          color: field.status === "filled" ? "#374151" : "#9CA3AF",
                          fontWeight: field.status === "filled" ? 600 : 400,
                          flex: 1,
                        }}
                      >
                        {field.label}
                      </Typography>
                      {field.autoFilled && (
                        <Tooltip title="Auto-filled by AI">
                          <AutoFixHighIcon
                            sx={{ fontSize: 10, color: "#7C3AED" }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {/* AI badge */}
      {autoFilledKeys.size > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: `1px solid ${BORDER}`,
            bgcolor: "rgba(124,58,237,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 14, color: "#7C3AED" }} />
          <Typography sx={{ fontSize: "0.62rem", color: "#7C3AED", fontWeight: 700 }}>
            {autoFilledKeys.size} fields auto-filled by AI
          </Typography>
        </Box>
      )}
    </Box>
  );
}
