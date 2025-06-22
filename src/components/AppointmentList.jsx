import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

const API_BASE = "http://localhost:8080/api/staff/appointments";
const PATIENT_API = "http://localhost:8080/api/staff/patients";
const DOCTOR_API = "http://localhost:8080/api/staff/doctors";

const AppointmentList = ({ token }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [open, setOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    notes: "",
  });

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

  const fetchPatients = async () => {
    try {
      const res = await authFetch(PATIENT_API);
      if (!res.ok) throw new Error("Hasta listesi alınamadı.");
      const data = await res.json();
      setPatients(data);
    } catch {
      setError("Hasta listesi alınamadı.");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await authFetch(DOCTOR_API);
      if (!res.ok) throw new Error("Doktor listesi alınamadı.");
      const data = await res.json();
      setDoctors(data);
    } catch {
      setError("Doktor listesi alınamadı.");
    }
  };

  const fetchAppointments = async (pid) => {
    if (!pid) return setAppointments([]);
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/patient/${pid}`);
      if (!res.ok) throw new Error("Randevu listesi alınamadı.");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (patientId) fetchAppointments(patientId);
    else setAppointments([]);
  }, [patientId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Randevu silinsin mi?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız.");
      fetchAppointments(patientId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setNewAppointment({
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      notes: "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      });
      if (!res.ok) throw new Error("Randevu oluşturulamadı.");
      setOpen(false);
      if (patientId === newAppointment.patientId) fetchAppointments(patientId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Randevu İşlemleri
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          select
          label="Hasta Seç"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Hasta Seçiniz</MenuItem>
          {patients.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} {p.surname} ({p.tcNo})
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          disabled={!patientId}
        >
          Yeni Randevu
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
              <TableCell>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
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
                  <TableCell>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleDelete(a.id)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Hasta"
              value={newAppointment.patientId}
              onChange={(e) =>
                setNewAppointment((a) => ({ ...a, patientId: e.target.value }))
              }
              size="small"
              fullWidth
            >
              <MenuItem value="">Hasta Seçiniz</MenuItem>
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} {p.surname} ({p.tcNo})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Doktor"
              value={newAppointment.doctorId}
              onChange={(e) =>
                setNewAppointment((a) => ({ ...a, doctorId: e.target.value }))
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
                setNewAppointment((a) => ({ ...a, notes: e.target.value }))
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
              !(
                newAppointment.patientId &&
                newAppointment.doctorId &&
                newAppointment.appointmentDate
              )
            }
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentList;
