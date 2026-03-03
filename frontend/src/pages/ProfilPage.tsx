import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { AxiosError } from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const ProfilPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  /* ─── Info form ─── */
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail]       = useState(user?.email ?? '');
  const [infoLoading, setInfoLoading]   = useState(false);
  const [infoSuccess, setInfoSuccess]   = useState('');
  const [infoError,   setInfoError]     = useState('');

  /* ─── Password form ─── */
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [pwdSuccess,  setPwdSuccess]  = useState('');
  const [pwdError,    setPwdError]    = useState('');

  /* ─── Handlers ─── */
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!username.trim() || !email.trim()) {
      setInfoError('Tous les champs sont obligatoires.');
      return;
    }

    if (username === user?.username && email === user?.email) {
      setInfoError('Aucune modification détectée.');
      return;
    }

    setInfoLoading(true);
    try {
      await authAPI.updateProfile({ username: username.trim(), email: email.trim() });
      await refreshProfile();
      setInfoSuccess('Profil mis à jour avec succès.');
      setTimeout(() => setInfoSuccess(''), 5000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setInfoError(axiosErr.response?.data?.detail ?? 'Erreur lors de la mise à jour.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('Tous les champs sont obligatoires.');
      return;
    }
    if (newPwd.length < 6) {
      setPwdError('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPwd === currentPwd) {
      setPwdError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    setPwdLoading(true);
    try {
      await authAPI.updatePassword({ current_password: currentPwd, new_password: newPwd });
      setPwdSuccess('Mot de passe modifié avec succès.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setTimeout(() => setPwdSuccess(''), 5000);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setPwdError(axiosErr.response?.data?.detail ?? 'Erreur lors du changement de mot de passe.');
    } finally {
      setPwdLoading(false);
    }
  };

  /* ─── Helpers ─── */
  const initials = (user?.username ?? '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const roleLabel: Record<string, string> = {
    user: 'Client', admin: 'Administrateur', superadmin: 'Super Admin',
  };

  /* ─── Render ─── */
  return (
    <main className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link to="/mon-espace" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mon espace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-7 items-start">

        {/* ══ SIDEBAR ══ */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

            {/* Bandeau gradient */}
            <div className="h-24 bg-gradient-to-br from-brand-500 to-brand-700 relative rounded-t-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -bottom-6 -right-6 w-24 h-24 border-4 border-white rounded-full" />
                <div className="absolute top-2 left-4 w-14 h-14 border-4 border-white rounded-full" />
              </div>
            </div>

            {/* Avatar + infos */}
            <div className="relative z-10 px-6 pb-6 -mt-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-500 border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-extrabold">{initials}</span>
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-gray-900">{user?.username}</h2>
              <p className="text-sm text-gray-400 mt-0.5 break-all">{user?.email}</p>
              <span className="mt-3 inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">
                {roleLabel[user?.role ?? ''] ?? user?.role ?? ''}
              </span>
            </div>

            {/* Navigation rapide */}
            <div className="border-t border-gray-100" />
            <nav className="px-3 py-3 space-y-0.5">
              <Link
                to="/mon-espace"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium">Mes réservations</span>
              </Link>
              <Link
                to="/terrains"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-medium">Terrains disponibles</span>
              </Link>
            </nav>
            <div className="px-5 pb-4 pt-1">
              <p className="text-xs text-gray-400 text-center">
                Compte · <span className="font-medium text-gray-500">{roleLabel[user?.role ?? ''] ?? user?.role}</span>
              </p>
            </div>
          </div>
        </aside>

        {/* ══ FORMULAIRES ══ */}
        <div className="flex-1 space-y-6">

          {/* ── Informations ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">Informations personnelles</h3>
              <p className="text-sm text-gray-400 mt-0.5">Modifiez votre nom d'utilisateur et votre adresse e-mail.</p>
            </div>

            {infoSuccess && <div className="mb-4"><Alert variant="success">{infoSuccess}</Alert></div>}
            {infoError && <div className="mb-4"><Alert variant="error">{infoError}</Alert></div>}

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={50}
                  required
                />
                <Input
                  label="Adresse e-mail"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="md" loading={infoLoading}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </section>

          {/* ── Mot de passe ── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900">Mot de passe</h3>
              <p className="text-sm text-gray-400 mt-0.5">Choisissez un mot de passe d'au moins 6 caractères.</p>
            </div>

            {pwdSuccess && <div className="mb-4"><Alert variant="success">{pwdSuccess}</Alert></div>}
            {pwdError && <div className="mb-4"><Alert variant="error">{pwdError}</Alert></div>}

            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <Input
                label="Mot de passe actuel"
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  hint="Minimum 6 caractères"
                />
                <Input
                  label="Confirmer"
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  error={confirmPwd && confirmPwd !== newPwd ? 'Les mots de passe ne correspondent pas.' : undefined}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" size="md" loading={pwdLoading}>
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </main>
  );
};

export default ProfilPage;
