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
} from "@mui/material";

const API_BASE = "http://localhost:8080/api/staff/patients";

const PatientList = ({ token }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); // 'name' or 'tc'
  const [open, setOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    tcNo: "",
    birthDate: "",
    bloodType: "",
    address: "",
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

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(API_BASE);
      if (!res.ok) throw new Error("Hasta listesi alınamadı.");
      const data = await res.json();
      setPatients(data);
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
      if (searchType === "tc") {
        url = `${API_BASE}/tc/${searchTerm}`;
      } else {
        url = `${API_BASE}/search?searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Arama başarısız.");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setNewPatient({
      username: "",
      password: "",
      name: "",
      surname: "",
      email: "",
      phone: "",
      tcNo: "",
      birthDate: "",
      bloodType: "",
      address: "",
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
        body: JSON.stringify(newPatient),
      });
      if (!res.ok) throw new Error("Hasta eklenemedi.");
      setOpen(false);
      fetchPatients();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    fetchPatients();
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
          Hasta Listesi
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Yeni Hasta Ekle
        </Button>
      </Stack>
      <Box component="form" onSubmit={handleSearch} mb={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Arama (İsim/Soyisim veya TC)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            select
            label="Arama Tipi"
            SelectProps={{ native: true }}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <option value="name">İsim/Soyisim</option>
            <option value="tc">TC No</option>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            Ara
          </Button>
          <Button variant="outlined" onClick={fetchPatients}>
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
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>TC No</TableCell>
              <TableCell>Doğum Tarihi</TableCell>
              <TableCell>Kan Grubu</TableCell>
              <TableCell>Adres</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id || p.tcNo}>
                  <TableCell>{p.username}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.surname}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.tcNo}</TableCell>
                  <TableCell>{p.birthDate}</TableCell>
                  <TableCell>{p.bloodType}</TableCell>
                  <TableCell>{p.address}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni Hasta Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Kullanıcı Adı"
              value={newPatient.username}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, username: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Şifre"
              type="password"
              value={newPatient.password}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, password: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Ad"
              value={newPatient.name}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, name: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Soyad"
              value={newPatient.surname}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, surname: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Email"
              value={newPatient.email}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, email: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Telefon"
              value={newPatient.phone}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, phone: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="TC No"
              value={newPatient.tcNo}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, tcNo: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Doğum Tarihi"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newPatient.birthDate}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, birthDate: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Kan Grubu"
              value={newPatient.bloodType}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, bloodType: e.target.value }))
              }
              size="small"
              fullWidth
            />
            <TextField
              label="Adres"
              value={newPatient.address}
              onChange={(e) =>
                setNewPatient((p) => ({ ...p, address: e.target.value }))
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
              !newPatient.username ||
              !newPatient.password ||
              !newPatient.name ||
              !newPatient.surname ||
              !newPatient.tcNo ||
              !newPatient.birthDate
            }
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientList;
