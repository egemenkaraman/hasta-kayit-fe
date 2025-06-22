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
} from "@mui/material";

// NOT: doctorId'yi gerçek login ile almak gerekir, şimdilik sabit
// const doctorId = 1; // Artık gerek yok
const APPOINTMENTS_API = `http://localhost:8080/api/doctor/appointments`;

const DoctorPanel = ({ token, onLogout }) => {
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultDialog, setResultDialog] = useState({
    open: false,
    appointmentId: null,
  });
  const [prescDialog, setPrescDialog] = useState({
    open: false,
    appointmentId: null,
  });
  const [resultForm, setResultForm] = useState({
    resultType: "",
    resultDescription: "",
  });
  const [prescForm, setPrescForm] = useState({
    prescriptionNumber: "",
    description: "",
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Randevu iptal edilsin mi?")) return;
    setActionLoading(true);
    setError("");
    try {
      const res = await authFetch(
        `http://localhost:8080/api/doctor/appointments/${appointmentId}/cancel`,
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

  const handleResultOpen = (appointmentId) => {
    setResultForm({ resultType: "", resultDescription: "" });
    setResultDialog({ open: true, appointmentId });
  };
  const handleResultClose = () =>
    setResultDialog({ open: false, appointmentId: null });

  const handleResultSave = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await authFetch(`http://localhost:8080/api/doctor/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: resultDialog.appointmentId,
          ...resultForm,
        }),
      });
      if (!res.ok) throw new Error("Sonuç kaydedilemedi.");
      setResultDialog({ open: false, appointmentId: null });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrescOpen = (appointmentId) => {
    setPrescForm({ prescriptionNumber: "", description: "" });
    setPrescDialog({ open: true, appointmentId });
  };
  const handlePrescClose = () =>
    setPrescDialog({ open: false, appointmentId: null });

  const handlePrescSave = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await authFetch(
        `http://localhost:8080/api/doctor/prescriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId: prescDialog.appointmentId,
            ...prescForm,
          }),
        }
      );
      if (!res.ok) throw new Error("Reçete kaydedilemedi.");
      setPrescDialog({ open: false, appointmentId: null });
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
          Doktor Paneli
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Randevularım" />
        </Tabs>
        {tab === 0 && (
          <>
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
                    <TableCell>Hasta</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Not</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>İşlemler</TableCell>
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
                          {a.patientName || a.patient?.name}{" "}
                          {a.patientSurname || a.patient?.surname}
                        </TableCell>
                        <TableCell>
                          {a.appointmentDate?.replace("T", " ").slice(0, 16)}
                        </TableCell>
                        <TableCell>{a.notes}</TableCell>
                        <TableCell>{a.status}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleCancel(a.id)}
                              disabled={
                                actionLoading || a.status === "COMPLETED"
                              }
                            >
                              İptal Et
                            </Button>
                            <Button
                              size="small"
                              color="info"
                              onClick={() => handleResultOpen(a.id)}
                              disabled={
                                actionLoading || a.status === "COMPLETED"
                              }
                            >
                              Sonuç Gir
                            </Button>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handlePrescOpen(a.id)}
                              disabled={
                                actionLoading || a.status === "COMPLETED"
                              }
                            >
                              Reçete Gir
                            </Button>
                          </Stack>
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
      {/* Sonuç Dialog */}
      <Dialog open={resultDialog.open} onClose={handleResultClose}>
        <DialogTitle>Sonuç Gir</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Sonuç Tipi"
              value={resultForm.resultType}
              onChange={(e) =>
                setResultForm((f) => ({ ...f, resultType: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Açıklama"
              value={resultForm.resultDescription}
              onChange={(e) =>
                setResultForm((f) => ({
                  ...f,
                  resultDescription: e.target.value,
                }))
              }
              size="small"
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResultClose}>İptal</Button>
          <Button
            onClick={handleResultSave}
            variant="contained"
            disabled={
              actionLoading ||
              !resultForm.resultType ||
              !resultForm.resultDescription
            }
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      {/* Reçete Dialog */}
      <Dialog open={prescDialog.open} onClose={handlePrescClose}>
        <DialogTitle>Reçete Gir</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Reçete Numarası"
              value={prescForm.prescriptionNumber}
              onChange={(e) =>
                setPrescForm((f) => ({
                  ...f,
                  prescriptionNumber: e.target.value,
                }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Açıklama"
              value={prescForm.description}
              onChange={(e) =>
                setPrescForm((f) => ({ ...f, description: e.target.value }))
              }
              size="small"
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePrescClose}>İptal</Button>
          <Button
            onClick={handlePrescSave}
            variant="contained"
            disabled={
              actionLoading ||
              !prescForm.prescriptionNumber ||
              !prescForm.description
            }
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorPanel;
