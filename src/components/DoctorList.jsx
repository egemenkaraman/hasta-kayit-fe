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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const API_BASE = "http://localhost:8080/api/staff/doctors";

const DoctorList = ({ token }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); // 'name' or 'specialty'
  const [open, setOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
  });
  const [adding, setAdding] = useState(false);

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

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_BASE);
      if (!res.ok) throw new Error("Doktor listesi alınamadı.");
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let url = "";
      if (searchType === "specialty") {
        url = `${API_BASE}/specialty/${encodeURIComponent(searchTerm)}`;
      } else {
        url = `${API_BASE}/search?searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Arama başarısız.");
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setNewDoctor({
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      phone: "",
      specialty: "",
      licenseNumber: "",
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleAdd = async () => {
    setAdding(true);
    setError("");
    try {
      const res = await authFetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctor),
      });
      if (!res.ok) throw new Error("Doktor eklenemedi.");
      setOpen(false);
      fetchDoctors();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" gutterBottom>
          Doktor Listesi
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Yeni Doktor Ekle
        </Button>
      </Stack>
      <Box component="form" onSubmit={handleSearch} mb={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label={
              searchType === "specialty"
                ? "Uzmanlık Alanı"
                : "Arama (İsim/Soyisim)"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            select
            label="Arama Tipi"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="name">İsim/Soyisim</MenuItem>
            <MenuItem value="specialty">Uzmanlık Alanı</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Ara
          </Button>
          <Button variant="outlined" onClick={fetchDoctors}>
            Tümünü Göster
          </Button>
        </Stack>
      </Box>
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
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Uzmanlık</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.surname}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.specialty}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni Doktor Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Kullanıcı Adı"
              value={newDoctor.username}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, username: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Şifre"
              type="password"
              value={newDoctor.password}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, password: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Ad"
              value={newDoctor.name}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, name: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Soyad"
              value={newDoctor.surname}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, surname: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              value={newDoctor.email}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, email: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Telefon"
              value={newDoctor.phone}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, phone: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Uzmanlık"
              value={newDoctor.specialty}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, specialty: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Lisans No"
              value={newDoctor.licenseNumber}
              onChange={(e) =>
                setNewDoctor((d) => ({ ...d, licenseNumber: e.target.value }))
              }
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={
              adding ||
              !newDoctor.username ||
              !newDoctor.password ||
              !newDoctor.name ||
              !newDoctor.surname ||
              !newDoctor.specialty ||
              !newDoctor.licenseNumber
            }
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorList;
