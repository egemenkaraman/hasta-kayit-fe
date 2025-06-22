import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";

const Login = ({ onLogin, isLoggedIn, userType }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("personel");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (userType === "doctor") navigate("/doctor-panel");
      else if (userType === "patient") navigate("/patient-panel");
      else navigate("/panel");
    }
  }, [isLoggedIn, userType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) return;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok)
        throw new Error("Giriş başarısız. Bilgilerinizi kontrol edin.");
      const data = await res.json();
      if (!data.token) throw new Error("Token alınamadı.");
      localStorage.setItem("token", data.token);
      onLogin(type, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2} align="center">
          Giriş Yap
        </Typography>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, v) => v && setType(v)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="personel">Personel</ToggleButton>
          <ToggleButton value="doctor">Doktor</ToggleButton>
          <ToggleButton value="patient">Hasta</ToggleButton>
        </ToggleButtonGroup>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Giriş Yap
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
