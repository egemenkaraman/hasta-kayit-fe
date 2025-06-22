import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  MenuItem,
} from "@mui/material";

// const patientId = 1; // Gerçek login ile alınmalı
const APPOINTMENTS_API = `/api/patient/appointments`;
const PRESCRIPTIONS_API = `/api/patient/prescriptions`;
const RESULTS_API = `/api/patient/results`;
const DOCTORS_API = "/api/staff/doctors";

const PatientPanel = ({ token, onLogout }) => {
  const [tab, setTab] = useState(0);
  // Randevular
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Reçeteler
  const [prescriptions, setPrescriptions] = useState([]);
  // Sonuçlar
  const [results, setResults] = useState([]);
  // Randevu alma
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    appointmentDate: "",
    notes: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Merkezi fetch fonksiyonu
  const authFetch = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fetchers
  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(APPOINTMENTS_API);
      if (!res.ok) throw new Error("Randevular alınamadı.");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchPrescriptions = async () => {
    try {
      const res = await authFetch(PRESCRIPTIONS_API);
      if (!res.ok) throw new Error("Reçeteler alınamadı.");
      const data = await res.json();
      setPrescriptions(data);
    } catch {
      setError("Reçeteler alınamadı.");
    }
  };
  const fetchResults = async () => {
    try {
      const res = await authFetch(RESULTS_API);
      if (!res.ok) throw new Error("Sonuçlar alınamadı.");
      const data = await res.json();
      setResults(data);
    } catch {
      setError("Sonuçlar alınamadı.");
    }
  };
  const fetchDoctors = async () => {
    try {
      const res = await authFetch(DOCTORS_API);
      if (!res.ok) throw new Error("Doktorlar alınamadı.");
      const data = await res.json();
      setDoctors(data);
    } catch {
      setError("Doktorlar alınamadı.");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptions();
    fetchResults();
    fetchDoctors();
  }, []);

  // Randevu iptal
  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Randevu iptal edilsin mi?")) return;
    setActionLoading(true);
    setError("");
    try {
      const res = await authFetch(
        `/api/patient/appointments/${appointmentId}/cancel`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("İptal işlemi başarısız.");
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Randevu alma
  const handleOpen = () => {
    setNewAppointment({ doctorId: "", appointmentDate: "", notes: "" });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleCreate = async () => {
    setActionLoading(true);
    setError("");
    try {
      const url = `/api/patient/appointments?doctorId=${newAppointment.doctorId}`;
      const res = await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: newAppointment.appointmentDate,
          notes: newAppointment.notes,
        }),
      });
      if (!res.ok) throw new Error("Randevu oluşturulamadı.");
      setOpen(false);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" p={4}>
      <Paper
        elevation={3}
        sx={{ maxWidth: 900, mx: "auto", p: 3, position: "relative" }}
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
          Hasta Paneli
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Randevularım" />
          <Tab label="Reçetelerim" />
          <Tab label="Sonuçlarım" />
        </Tabs>
        {tab === 0 && (
          <>
            <Stack direction="row" justifyContent="flex-end" mb={2}>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Yeni Randevu Al
              </Button>
            </Stack>
            {loading && <CircularProgress />}
            {error && (
              <Alert severity="error" sx={{ my: 2 }}>
                {error}
              </Alert>
            )}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Doktor</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Not</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Kayıt bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {a.doctorName || a.doctor?.name}{" "}
                          {a.doctorSurname || a.doctor?.surname}
                        </TableCell>
                        <TableCell>
                          {a.appointmentDate?.replace("T", " ").slice(0, 16)}
                        </TableCell>
                        <TableCell>{a.notes}</TableCell>
                        <TableCell>{a.status}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancel(a.id)}
                            disabled={actionLoading || a.status === "COMPLETED"}
                          >
                            İptal Et
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Randevu Alma Dialog */}
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Yeni Randevu Al</DialogTitle>
              <DialogContent>
                <Stack spacing={2} mt={1}>
                  <TextField
                    select
                    label="Doktor"
                    value={newAppointment.doctorId}
                    onChange={(e) =>
                      setNewAppointment((a) => ({
                        ...a,
                        doctorId: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">Doktor Seçiniz</MenuItem>
                    {doctors.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name} {d.surname} ({d.specialty})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Tarih ve Saat"
                    type="datetime-local"
                    value={newAppointment.appointmentDate}
                    onChange={(e) =>
                      setNewAppointment((a) => ({
                        ...a,
                        appointmentDate: e.target.value,
                      }))
                    }
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Not"
                    value={newAppointment.notes}
                    onChange={(e) =>
                      setNewAppointment((a) => ({
                        ...a,
                        notes: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button
                  onClick={handleCreate}
                  variant="contained"
                  disabled={
                    actionLoading ||
                    !newAppointment.doctorId ||
                    !newAppointment.appointmentDate
                  }
                >
                  Kaydet
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {tab === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Reçetelerim
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reçete No</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Oluşturulma Tarihi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Kayıt bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    prescriptions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.prescriptionNumber}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>
                          {p.createdAt
                            ? p.createdAt.replace("T", " ").slice(0, 16)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        {tab === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Sonuçlarım
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sonuç Tipi</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Oluşturulma Tarihi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Kayıt bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.resultType}</TableCell>
                        <TableCell>{r.resultDescription}</TableCell>
                        <TableCell>
                          {r.createdAt
                            ? r.createdAt.replace("T", " ").slice(0, 16)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PatientPanel;
