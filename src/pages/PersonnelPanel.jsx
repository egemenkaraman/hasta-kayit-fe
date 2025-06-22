import { useState } from "react";
import { Typography, Box, Paper, Tabs, Tab, Button } from "@mui/material";
import PatientList from "../components/PatientList";
import DoctorList from "../components/DoctorList";
import AppointmentList from "../components/AppointmentList";

const PersonnelPanel = ({ token, onLogout }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" p={4}>
      <Paper
        elevation={3}
        sx={{ maxWidth: 800, mx: "auto", p: 3, position: "relative" }}
      >
        <Button
          onClick={onLogout}
          variant="outlined"
          color="error"
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          Çıkış Yap
        </Button>
        <Typography variant="h4" align="center" gutterBottom>
          Personel Paneli
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Hasta İşlemleri" />
          <Tab label="Doktor İşlemleri" />
          <Tab label="Randevu İşlemleri" />
        </Tabs>
        {tab === 0 && <PatientList token={token} />}
        {tab === 1 && <DoctorList token={token} />}
        {tab === 2 && <AppointmentList token={token} />}
      </Paper>
    </Box>
  );
};

export default PersonnelPanel;
