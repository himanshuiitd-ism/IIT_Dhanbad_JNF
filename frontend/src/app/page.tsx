"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid2 as Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import ArticleIcon from "@mui/icons-material/Article";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarIcon from "@mui/icons-material/Star";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PsychologyIcon from "@mui/icons-material/Psychology";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VerifiedIcon from "@mui/icons-material/Verified";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// ─── Design Tokens ───────────────────────────────────────────
const RED = "#8B0000";
const RED_LIGHT = "#C41230";
const RED_DARK = "#5C0000";
const CREAM = "#FFF8E7";
const CREAM_DARK = "#F5EDD5";
const WHITE = "#FFFFFF";
const TEXT_DARK = "#2D1B00";
const TEXT_MUTED = "#6B5B45";

// ─── Navigation links ────────────────────────────────────────
const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Why Recruit", href: "#why-recruit" },
  { label: "Director's Message", href: "#directors-message" },
  { label: "Recruitment Process", href: "#recruitment-process" },
  { label: "Contact Us", href: "#contact" },
];

// ─── Why Recruit cards ───────────────────────────────────────
const whyCards = [
  {
    icon: <GroupsIcon sx={{ fontSize: 40 }} />,
    title: "Alumni Network",
    desc: "Our alumni have excelled in fields ranging from core engineering to finance, consulting, and entrepreneurship, building a global network of over XX,XXX professionals.",
  },
  {
    icon: <StarIcon sx={{ fontSize: 40 }} />,
    title: "National Rankings",
    desc: "IIT (ISM) Dhanbad is consistently ranked among India's top technical institutes, recognised for excellence in research, innovation, and industry partnerships.",
  },
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    title: "Admission Process",
    desc: "Students admitted through rigorous JEE Advanced screening — ensuring you recruit from India's most talented and academically accomplished pool.",
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    title: "All Round Development",
    desc: "With a vibrant campus culture, technical clubs, cultural fests, and leadership programmes, our students are moulded into well-rounded professionals.",
  },
];

// ─── Recruitment steps ───────────────────────────────────────
const processSteps = [
  { n: 1, title: "Intent to Recruit", desc: "Submit your organisation's intent to recruit at IIT (ISM) Dhanbad to the JNF Office." },
  { n: 2, title: "Account Registration", desc: "Create your recruiter account on the JNF portal to access all features and student data." },
  { n: 3, title: "Registration Fee", desc: "Complete the one-time registration as per the schedule shared by the placement office." },
  { n: 4, title: "Job Posting", desc: "Post detailed job/internship descriptions specifying roles, CTC, eligibility and other requirements." },
  { n: 5, title: "Profile Verification", desc: "The JNF office reviews and verifies the job details before making them available to students." },
  { n: 6, title: "Student Applications", desc: "Verified profiles go live; eligible students apply based on the schedule released by the JNF office." },
  { n: 7, title: "Resume Shortlisting", desc: "Recruiters access student resumes through the portal and shortlist candidates for further rounds." },
  { n: 8, title: "Pre-Placement Talks", desc: "Conduct online or on-campus pre-placement talks to connect with potential candidates." },
  { n: 9, title: "Screening & Tests", desc: "Conduct aptitude tests, technical assessments, or group discussions as per your selection process." },
  { n: 10, title: "Interview Scheduling", desc: "Co-ordinate with the JNF office to finalise interview slots according to the campus calendar." },
  { n: 11, title: "Final Selection", desc: "Declare results and share offer letters with selected students through the JNF portal." },
  { n: 12, title: "Offer Confirmation", desc: "Students accept/reject offers within the stipulated deadline; the JNF office consolidates the results." },
];

// ─── Contact Cards ───────────────────────────────────────────
const contacts = [
  {
    name: "Prof. [Name Placeholder]",
    role: "Faculty Advisor, JNF Cell",
    email: "jnf-advisor@iitism.ac.in",
    phone: "+91-XXXXXXXXXX",
  },
  {
    name: "[Student Coordinator Name]",
    role: "Student Head, JNF Cell",
    email: "jnf-head@iitism.ac.in",
    phone: "+91-XXXXXXXXXX",
  },
  {
    name: "[Placement Officer Name]",
    role: "Placement Officer",
    email: "placement@iitism.ac.in",
    phone: "+91-0326-XXXXXXX",
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ fontFamily: "'Inter', sans-serif", bgcolor: CREAM }}>
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: scrolled ? RED_DARK : "rgba(92,0,0,0.92)",
          backdropFilter: "blur(8px)",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.35)" : "none",
          transition: "all 0.3s ease",
          borderBottom: `2px solid ${RED_LIGHT}`,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.2,
            }}
          >
            {/* Logo + Name */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: CREAM,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccountBalanceIcon sx={{ color: RED, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: WHITE,
                    fontWeight: 700,
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    lineHeight: 1.2,
                  }}
                >
                  JNF Cell, IIT (ISM) Dhanbad
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,248,231,0.75)",
                    fontSize: "0.68rem",
                    fontStyle: "italic",
                  }}
                >
                  Legacy that Inspires the Future
                </Typography>
              </Box>
            </Box>

            {/* Desktop nav links */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, alignItems: "center" }}>
              {navLinks.map((l) => (
                <Button
                  key={l.label}
                  onClick={() => scrollTo(l.href)}
                  sx={{
                    color: WHITE,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 1,
                    textTransform: "none",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  {l.label}
                </Button>
              ))}
              <Button
                href="/login"
                variant="contained"
                sx={{
                  ml: 2,
                  bgcolor: CREAM,
                  color: RED,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2.5,
                  "&:hover": { bgcolor: "#ffe0a0" },
                }}
              >
                Login
              </Button>
            </Box>

            {/* Mobile hamburger */}
            <IconButton
              sx={{ display: { md: "none" }, color: WHITE }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, bgcolor: RED_DARK, height: "100%", color: WHITE, pt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2 }}>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: WHITE }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navLinks.map((l) => (
              <ListItem
                key={l.label}
                onClick={() => scrollTo(l.href)}
                sx={{ cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
              >
                <ListItemText primary={l.label} sx={{ color: WHITE }} />
              </ListItem>
            ))}
            <ListItem>
              <Button
                href="/login"
                fullWidth
                variant="contained"
                sx={{ bgcolor: CREAM, color: RED, fontWeight: 700, mt: 1 }}
              >
                Login
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <Box
        id="overview"
        sx={{
          minHeight: "100vh",
          backgroundImage: "url('/campus-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          position: "relative",
          display: "flex",
          alignItems: "center",
          pt: 8,
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(92,0,0,0.82) 0%, rgba(92,0,0,0.65) 55%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left: Heading + intro */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#FFD700",
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  mb: 1.5,
                  fontSize: "0.85rem",
                }}
              >
                IIT (ISM) Dhanbad &mdash; Est. 1926
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: WHITE,
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.2,
                  mb: 2.5,
                }}
              >
                A One Stop Portal for{" "}
                <Box component="span" sx={{ color: "#FFD700" }}>
                  Placements & Internships
                </Box>
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,248,231,0.88)",
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  maxWidth: 560,
                  mb: 4,
                }}
              >
                Welcome to the official JNF (Job &amp; Internship Notification &amp; Facilitation)
                portal of IIT (Indian School of Mines) Dhanbad. Connect with top-tier recruiters,
                manage applications, and power your career journey from one platform.
              </Typography>
              <Button
                onClick={() => scrollTo("#why-recruit")}
                variant="outlined"
                sx={{
                  color: CREAM,
                  borderColor: CREAM,
                  borderWidth: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3.5,
                  py: 1.2,
                  fontSize: "0.95rem",
                  "&:hover": { bgcolor: "rgba(255,248,231,0.12)", borderColor: "#FFD700", color: "#FFD700" },
                }}
              >
                Explore Portal ↓
              </Button>
            </Grid>

            {/* Right: Action buttons */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 340, mx: "auto" }}>
                {[
                  { label: "Student", sub: "Access jobs, internships & profile", icon: <PersonIcon />, href: "/login" },
                  { label: "Recruiter", sub: "Post jobs & manage candidates", icon: <BusinessCenterIcon />, href: "/login" },
                  { label: "Coordinator", sub: "Manage drives & student data", icon: <AdminPanelSettingsIcon />, href: "/login" },
                  { label: "Verifier", sub: "Verify offers & documents", icon: <VerifiedIcon />, href: "/login" },
                ].map((btn) => (
                  <Button
                    key={btn.label}
                    href={btn.href}
                    variant="contained"
                    startIcon={btn.icon}
                    sx={{
                      bgcolor: "rgba(255,248,231,0.12)",
                      backdropFilter: "blur(12px)",
                      border: `1.5px solid rgba(255,248,231,0.3)`,
                      color: WHITE,
                      textTransform: "none",
                      borderRadius: 2.5,
                      py: 2,
                      px: 3,
                      justifyContent: "flex-start",
                      fontSize: "1rem",
                      fontWeight: 700,
                      gap: 1,
                      transition: "all 0.25s",
                      "&:hover": {
                        bgcolor: RED_LIGHT,
                        border: `1.5px solid ${RED_LIGHT}`,
                        transform: "translateX(6px)",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "left" }}>
                      <Box>{btn.label}</Box>
                      <Box sx={{ fontSize: "0.72rem", fontWeight: 400, opacity: 0.8 }}>
                        {btn.sub}
                      </Box>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <Box sx={{ bgcolor: RED, py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {[
              { label: "Established", value: "1926", icon: "🏛️" },
              { label: "Students", value: "8,600+", icon: "🎓" },
              { label: "Faculty", value: "420+", icon: "👨‍🏫" },
              { label: "Recruiters", value: "XXX+", icon: "🏢" },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: "center", color: WHITE }}>
                  <Typography sx={{ fontSize: "1.8rem", mb: 0.5 }}>{stat.icon}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ opacity: 0.8, fontSize: "0.78rem", letterSpacing: 1, mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── OVERVIEW / INFO CARDS ──────────────────────────────── */}
      <Box sx={{ bgcolor: WHITE, py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="stretch">
            {/* Left col: two info cards */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, height: "100%" }}>
                {[
                  {
                    icon: <SchoolIcon sx={{ color: RED, fontSize: 32 }} />,
                    title: "Academic Facilities",
                    body: "IIT (ISM) Dhanbad offers world-class laboratories, research centres, digital libraries, and innovation hubs across XX departments and YY academic programmes.",
                    link: "See more",
                  },
                  {
                    icon: <ArticleIcon sx={{ color: RED, fontSize: 32 }} />,
                    title: "Industrial Design & Innovation",
                    body: "The institute fosters cutting-edge research partnerships with industry leaders, government bodies, and global academic institutions through dedicated centres.",
                    link: "Explore",
                  },
                ].map((card) => (
                  <Card
                    key={card.title}
                    elevation={0}
                    sx={{
                      border: `1px solid ${CREAM_DARK}`,
                      borderRadius: 3,
                      p: 1,
                      flex: 1,
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: "0 4px 24px rgba(139,0,0,0.12)" },
                    }}
                  >
                    <CardContent>
                      {card.icon}
                      <Typography fontWeight={700} mt={1} mb={1} color={TEXT_DARK}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color={TEXT_MUTED} sx={{ lineHeight: 1.7 }}>
                        {card.body}
                      </Typography>
                      <Typography
                        sx={{
                          color: RED,
                          fontWeight: 600,
                          mt: 1.5,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {card.link} →
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            {/* Middle col: About text */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${CREAM_DARK}`,
                  borderRadius: 3,
                  p: 1,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "inline-block",
                      bgcolor: RED,
                      color: WHITE,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 1,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: 1,
                      mb: 2,
                    }}
                  >
                    ABOUT US
                  </Box>
                  <Typography fontWeight={700} fontSize="1.15rem" mb={2} color={TEXT_DARK}>
                    Departments &amp; Programmes
                  </Typography>
                  <Typography variant="body2" color={TEXT_MUTED} sx={{ lineHeight: 1.8, mb: 2 }}>
                    IIT (ISM) Dhanbad is one of India&apos;s premier institutions of national
                    importance since 1926. It currently offers XX UG, YY PG and ZZ PhD programmes
                    across [N] departments spanning engineering, sciences, humanities and management.
                  </Typography>
                  <Typography variant="body2" color={TEXT_MUTED} sx={{ lineHeight: 1.8, mb: 3 }}>
                    The institute has evolved over nearly a century to offer students the finest
                    facilities for multi-dimensional growth — at the intersection of technology,
                    research, and industry.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: RED,
                      color: WHITE,
                      textTransform: "none",
                      borderRadius: 2,
                      fontWeight: 600,
                      "&:hover": { bgcolor: RED_DARK },
                    }}
                  >
                    Know more
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Right col: JNF Reports */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: `1px solid ${CREAM_DARK}`,
                  borderRadius: 3,
                  p: 1,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <ArticleIcon sx={{ color: RED }} />
                    <Typography fontWeight={700} color={TEXT_DARK}>
                      JNF Reports &amp; Brochure
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {[
                    "Placement Brochure 2025-26",
                    "Annual Report 2024-25",
                    "Annual Report 2023-24",
                    "Annual Report 2022-23",
                    "Annual Report 2021-22",
                    "Annual Report 2020-21",
                  ].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.2,
                        borderBottom: `1px solid ${CREAM_DARK}`,
                        cursor: "pointer",
                        "&:hover": { "& .link-text": { color: RED } },
                        transition: "all 0.2s",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ArticleIcon sx={{ color: TEXT_MUTED, fontSize: 18 }} />
                        <Typography
                          className="link-text"
                          variant="body2"
                          fontWeight={600}
                          color={TEXT_DARK}
                          sx={{ transition: "color 0.2s" }}
                        >
                          {item}
                        </Typography>
                      </Box>
                      <ChevronRightIcon sx={{ color: TEXT_MUTED, fontSize: 18 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── WHY RECRUIT ────────────────────────────────────────── */}
      <Box
        id="why-recruit"
        sx={{
          bgcolor: RED_DARK,
          py: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        {[
          { top: -60, left: -60, size: 200, opacity: 0.06 },
          { bottom: -80, right: -80, size: 300, opacity: 0.05 },
          { top: "30%", right: 40, size: 120, opacity: 0.07 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              ...c,
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              bgcolor: CREAM,
              opacity: c.opacity,
              pointerEvents: "none",
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            color={WHITE}
            mb={2}
          >
            Why IIT (ISM) Dhanbad?
          </Typography>
          <Typography
            textAlign="center"
            color="rgba(255,248,231,0.75)"
            mb={7}
            maxWidth={780}
            mx="auto"
            lineHeight={1.8}
          >
            Established in 1926 as the Indian School of Mines, IIT (ISM) Dhanbad is one of
            India's oldest and most distinguished technical institutions. Our graduates are
            renowned for their technical depth, leadership, and industry readiness — making
            this campus a prime recruitment destination for leading organisations globally.
          </Typography>
          <Grid container spacing={3}>
            {whyCards.map((card) => (
              <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    color: WHITE,
                    px: 2,
                    py: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: "50%",
                      border: `2px solid rgba(255,248,231,0.25)`,
                      display: "inline-flex",
                      color: "#FFD700",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography fontWeight={700} fontSize="1.05rem" mb={1.5}>
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,248,231,0.75)"
                    lineHeight={1.75}
                    mb={2.5}
                    flex={1}
                  >
                    {card.desc}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: CREAM,
                      borderColor: "rgba(255,248,231,0.4)",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { borderColor: CREAM, bgcolor: "rgba(255,248,231,0.08)" },
                    }}
                  >
                    Know more
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── DIRECTOR'S MESSAGE ─────────────────────────────────── */}
      <Box id="directors-message" sx={{ bgcolor: CREAM, py: 10 }}>
        <Container maxWidth="md">
          <Grid container spacing={6} alignItems="center">
            {/* Photo */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 240,
                  mx: "auto",
                  aspectRatio: "3/4",
                  borderRadius: 4,
                  bgcolor: CREAM_DARK,
                  border: `4px solid ${RED}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(139,0,0,0.18)",
                }}
              >
                <PersonIcon sx={{ fontSize: 80, color: RED, opacity: 0.4 }} />
                <Typography variant="caption" color={TEXT_MUTED} textAlign="center" px={2}>
                  Director Photo
                  <br />
                  (To be updated)
                </Typography>
              </Box>
            </Grid>

            {/* Message */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: RED,
                  color: WHITE,
                  px: 1.5,
                  py: 0.4,
                  borderRadius: 1,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  mb: 2,
                }}
              >
                DIRECTOR&apos;S MESSAGE
              </Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color={TEXT_DARK}
                mb={0.5}
              >
                Prof. Sukumar Mishra
              </Typography>
              <Typography
                sx={{ color: RED, fontWeight: 600, mb: 3, fontSize: "0.9rem" }}
              >
                Director, IIT (ISM) Dhanbad
              </Typography>
              <Typography
                variant="body1"
                color={TEXT_MUTED}
                lineHeight={1.85}
                mb={2}
                fontStyle="italic"
              >
                &ldquo;[Director&apos;s message placeholder — to be filled with an inspiring
                message about the institute&apos;s legacy, the quality of students, and an
                invitation to recruiting companies to partner with IIT (ISM) Dhanbad in
                shaping India&apos;s engineering future.]&rdquo;
              </Typography>
              <Typography
                variant="body2"
                color={TEXT_MUTED}
                lineHeight={1.8}
                mb={3}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vehicula
                risus vitae nulla dignissim, vel viverra odio pellentesque. Curabitur volutpat
                enim sed tortor condimentum, at commodo libero consequat.
              </Typography>
              <Button
                variant="text"
                sx={{
                  color: RED,
                  fontWeight: 600,
                  textTransform: "none",
                  p: 0,
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                Read full message →
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── RECRUITMENT PROCESS ────────────────────────────────── */}
      <Box id="recruitment-process" sx={{ bgcolor: WHITE, py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            color={TEXT_DARK}
            mb={1}
          >
            Recruitment Process
          </Typography>
          <Typography
            textAlign="center"
            color={TEXT_MUTED}
            mb={7}
            maxWidth={640}
            mx="auto"
          >
            Our process has evolved over decades to ensure a seamless and transparent
            experience for all recruiting organisations.
          </Typography>
          <Grid container spacing={3}>
            {processSteps.map((step) => (
              <Grid key={step.n} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: `1px solid ${CREAM_DARK}`,
                    borderRadius: 3,
                    p: 1,
                    transition: "all 0.25s",
                    "&:hover": {
                      borderColor: RED_LIGHT,
                      boxShadow: "0 4px 20px rgba(139,0,0,0.12)",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      sx={{
                        fontSize: "3rem",
                        fontWeight: 900,
                        color: CREAM_DARK,
                        lineHeight: 1,
                        mb: 1,
                      }}
                    >
                      {step.n}
                    </Typography>
                    <Typography fontWeight={700} color={TEXT_DARK} mb={0.8} fontSize="0.95rem">
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color={TEXT_MUTED} lineHeight={1.7}>
                      {step.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CONTACT US ─────────────────────────────────────────── */}
      <Box id="contact" sx={{ bgcolor: CREAM, py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            color={TEXT_DARK}
            mb={1}
          >
            Contact Us
          </Typography>
          <Typography textAlign="center" color={TEXT_MUTED} mb={7}>
            Reach out to us for recruitment queries, partnerships, or any other assistance.
          </Typography>
          <Grid container spacing={3}>
            {contacts.map((c) => (
              <Grid key={c.name} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${CREAM_DARK}`,
                    borderRadius: 3,
                    textAlign: "center",
                    p: 2,
                    height: "100%",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 4px 20px rgba(139,0,0,0.1)" },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        bgcolor: CREAM_DARK,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      <PersonIcon sx={{ color: RED, fontSize: 36 }} />
                    </Box>
                    <Typography fontWeight={700} color={TEXT_DARK} mb={0.5}>
                      {c.name}
                    </Typography>
                    <Typography variant="body2" color={RED} fontWeight={600} mb={2}>
                      {c.role}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.8 }}>
                      <EmailIcon sx={{ fontSize: 16, color: TEXT_MUTED }} />
                      <Typography variant="body2" color={TEXT_MUTED}>
                        {c.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: TEXT_MUTED }} />
                      <Typography variant="body2" color={TEXT_MUTED}>
                        {c.phone}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Office Address */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  border: `1px solid ${CREAM_DARK}`,
                  borderRadius: 3,
                  p: 2,
                  height: "100%",
                  bgcolor: RED,
                  color: WHITE,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocationOnIcon sx={{ color: "#FFD700" }} />
                    <Typography fontWeight={700} fontSize="1rem">
                      Office Address
                    </Typography>
                  </Box>
                  <Typography variant="body2" lineHeight={1.9} sx={{ opacity: 0.88 }}>
                    JNF (Placement) Cell
                    <br />
                    IIT (Indian School of Mines)
                    <br />
                    Dhanbad, Jharkhand — 826004
                    <br />
                    India
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.88 }}>
                      +91-0326-XXXXXXX
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.8 }}>
                    <EmailIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.88 }}>
                      placement@iitism.ac.in
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: RED_DARK, color: WHITE, pt: 7, pb: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} mb={5}>
            {/* Brand */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <AccountBalanceIcon sx={{ color: "#FFD700", fontSize: 28 }} />
                <Typography fontWeight={800} fontSize="1rem">
                  JNF Cell, IIT (ISM) Dhanbad
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.72, lineHeight: 1.8, maxWidth: 280 }}
              >
                The official Job &amp; Internship Notification &amp; Facilitation (JNF) cell of
                IIT (ISM) Dhanbad, connecting talent with industry since 1926.
              </Typography>
            </Grid>

            {/* Quick links */}
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography fontWeight={700} mb={2} color="#FFD700" fontSize="0.82rem" letterSpacing={1}>
                PORTAL
              </Typography>
              {["Overview", "Why Recruit", "Recruitment Process", "Login"].map((l) => (
                <Typography
                  key={l}
                  variant="body2"
                  sx={{
                    opacity: 0.72,
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                    transition: "opacity 0.2s",
                  }}
                >
                  {l}
                </Typography>
              ))}
            </Grid>

            {/* Institute links */}
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography fontWeight={700} mb={2} color="#FFD700" fontSize="0.82rem" letterSpacing={1}>
                INSTITUTE
              </Typography>
              {["About IIT ISM", "Departments", "Research", "Alumni", "Campus Life"].map((l) => (
                <Typography
                  key={l}
                  variant="body2"
                  sx={{
                    opacity: 0.72,
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                    transition: "opacity 0.2s",
                  }}
                >
                  {l}
                </Typography>
              ))}
            </Grid>

            {/* Contact quick */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography fontWeight={700} mb={2} color="#FFD700" fontSize="0.82rem" letterSpacing={1}>
                GET IN TOUCH
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {[
                  { icon: <LocationOnIcon sx={{ fontSize: 16 }} />, text: "Dhanbad, Jharkhand — 826004" },
                  { icon: <PhoneIcon sx={{ fontSize: 16 }} />, text: "+91-0326-XXXXXXX" },
                  { icon: <EmailIcon sx={{ fontSize: 16 }} />, text: "placement@iitism.ac.in" },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, opacity: 0.8 }}>
                    {item.icon}
                    <Typography variant="body2">{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 3 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.55 }}>
              © {new Date().getFullYear()} JNF Cell, IIT (ISM) Dhanbad. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.55 }}>
              IIT (Indian School of Mines) Dhanbad, Jharkhand, India
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
