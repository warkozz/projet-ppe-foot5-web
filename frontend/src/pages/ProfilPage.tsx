import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { AxiosError } from 'axios';

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
    <main className="min-h-screen bg-gray-50 py-10 px-4">

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link to="/mon-espace" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mon espace
        </Link>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

        {/* ══ SIDEBAR ══ */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            {/* Bandeau couleur */}
            <div className="h-20 bg-gradient-to-r from-brand-500 to-brand-700" />

            {/* Avatar + infos */}
            <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-brand-500 border-4 border-white flex items-center justify-center shadow-sm">
                <span className="text-white text-2xl font-bold">{initials}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-sm text-gray-400 mt-0.5 break-all">{user?.email}</p>
              <span className="mt-3 inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                {roleLabel[user?.role ?? ''] ?? user?.role ?? ''}
              </span>
            </div>

            <div className="border-t border-gray-100 mx-4" />

            {/* Détails lecture seule */}
            <ul className="px-6 py-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-gray-700 truncate">{user?.username}</span>
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{user?.email}</span>
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{roleLabel[user?.role ?? ''] ?? user?.role}</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* ══ FORMULAIRES ══ */}
        <div className="flex-1 space-y-5">

          {/* ── Informations ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900">Informations personnelles</h3>
              <p className="text-sm text-gray-400 mt-0.5">Modifiez votre nom d'utilisateur et votre adresse e-mail.</p>
            </div>

            {infoSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                ✅ {infoSuccess}
              </div>
            )}
            {infoError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {infoError}
              </div>
            )}

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    minLength={3}
                    maxLength={50}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={infoLoading}
                  className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white
                             font-semibold py-2 px-5 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
                >
                  {infoLoading ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </section>

          {/* ── Mot de passe ── */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900">Mot de passe</h3>
              <p className="text-sm text-gray-400 mt-0.5">Choisissez un mot de passe d'au moins 6 caractères.</p>
            </div>

            {pwdSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                ✅ {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {pwdError}
              </div>
            )}

            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                                ${confirmPwd && confirmPwd !== newPwd
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-gray-300 focus:ring-brand-500'}`}
                  />
                  {confirmPwd && confirmPwd !== newPwd && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white
                             font-semibold py-2 px-5 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
                >
                  {pwdLoading ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </main>
  );
};

export default ProfilPage;
