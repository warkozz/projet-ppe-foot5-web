import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TerrainsPage from './pages/TerrainsPage';
import LoginPage from './pages/LoginPage';
import MonEspacePage from './pages/MonEspacePage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terrains" element={<TerrainsPage />} />
            <Route path="/connexion" element={<LoginPage />} />

            {/* Pages protégées (login requis) */}
            <Route path="/mon-espace" element={
              <ProtectedRoute><MonEspacePage /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

