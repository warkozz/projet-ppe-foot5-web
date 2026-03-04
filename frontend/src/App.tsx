import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import GlobalNotifications from './components/GlobalNotifications';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TerrainsPage from './pages/TerrainsPage';
import LoginPage from './pages/LoginPage';
import MonEspacePage from './pages/MonEspacePage';
import ReservationPage from './pages/ReservationPage';
import ProfilPage from './pages/ProfilPage';
import MentionsLegalesPage from './pages/MentionsLegalesPage';
import CguPage from './pages/CguPage';
import ConfidentialitePage from './pages/ConfidentialitePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <GlobalNotifications />
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terrains" element={<TerrainsPage />} />
            <Route path="/connexion" element={<LoginPage />} />

            {/* Pages protégées (login requis) */}
            <Route path="/mon-espace" element={
              <ProtectedRoute><MonEspacePage /></ProtectedRoute>
            } />
            <Route path="/reserver" element={
              <ProtectedRoute><ReservationPage /></ProtectedRoute>
            } />
            <Route path="/profil" element={
              <ProtectedRoute><ProfilPage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

            {/* Pages légales */}
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/cgu" element={<CguPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

