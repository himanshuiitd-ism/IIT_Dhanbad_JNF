"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#800000", // The Heritage Red
      dark: "#570000", // Maroon
      light: "#C41230",
    },
    secondary: {
      main: "#FFD700", // Accent Yellow (Gold)
      contrastText: "#570000",
    },
    background: {
      default: "#F9F9F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1C1C",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), "Inter", sans-serif',
    h1: { fontFamily: 'var(--font-manrope)', fontWeight: 900 },
    h2: { fontFamily: 'var(--font-manrope)', fontWeight: 900 },
    h3: { fontFamily: 'var(--font-manrope)', fontWeight: 800 },
    h4: { fontFamily: 'var(--font-manrope)', fontWeight: 800 },
    h5: { fontFamily: 'var(--font-manrope)', fontWeight: 700 },
    h6: { fontFamily: 'var(--font-manrope)', fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
        },
        containedSecondary: {
            boxShadow: "0 8px 20px rgba(255, 215, 0, 0.2)",
            "&:hover": {
                boxShadow: "0 10px 25px rgba(255, 215, 0, 0.3)",
            }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 10px 30px rgba(87, 0, 0, 0.03)",
        },
      },
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
