import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import PersonnelPanel from "./pages/PersonnelPanel";
import DoctorPanel from "./pages/DoctorPanel";
import PatientPanel from "./pages/PatientPanel";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'personel' | 'doctor' | 'patient'
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // İlk yüklemede localStorage'dan login state'ini ayarla
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");
    if (storedToken && storedUserType) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (type, token) => {
    setIsLoggedIn(true);
    setUserType(type);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("userType", type);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
  };

  // Token yoksa logout
  useEffect(() => {
    if (!token) {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
              isLoggedIn={isLoggedIn}
              userType={userType}
            />
          }
        />
        <Route
          path="/panel"
          element={
            isLoggedIn && userType === "personel" && token ? (
              <PersonnelPanel token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/doctor-panel"
          element={
            isLoggedIn && userType === "doctor" && token ? (
              <DoctorPanel token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patient-panel"
          element={
            isLoggedIn && userType === "patient" && token ? (
              <PatientPanel token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
