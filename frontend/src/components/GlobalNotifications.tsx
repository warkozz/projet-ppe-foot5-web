import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI } from '../services/api';

interface Reservation {
  id: number;
  start: string;
  end: string;
  status: string;
  notes?: string;
  terrain?: { id: number; name: string; active: boolean };
}

const TERRAIN_MARKER = '[TERRAIN_DÉSACTIVÉ]';
const TERRAIN_TOAST_DURATION = 8000;  // ms
const TODAY_TOAST_DURATION   = 10000; // ms

// Flag session : true = l'utilisateur a déjà fermé le toast cette session
// Se remet à false à chaque refresh (nouvelle session = nouvelles notifs)
let terrainToastDismissedThisSession = false;

const isTerrainClosed = (r: Reservation) =>
  (r.terrain?.active === false
    && (r.status === 'confirmed' || r.status === 'pending')
    && new Date(r.end) > new Date())
  || (r.status === 'cancelled' && (r.notes ?? '').startsWith(TERRAIN_MARKER));

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

/* ── Barre de progression qui se vide en `duration` ms ── */
const ProgressBar: React.FC<{ duration: number; color: string }> = ({ duration, color }) => {
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="h-1 w-full bg-gray-100">
      <div
        className={`h-full ${color} transition-none`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════════ */
const GlobalNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [terrainCount,    setTerrainCount]    = useState(0);
  const [showTerrain,     setShowTerrain]     = useState(false);
  const [todayRes,        setTodayRes]        = useState<Reservation[]>([]);
  const [showToday,       setShowToday]       = useState(false);

  const loaded = useRef(false);

  const loadData = useCallback(async () => {
    if (!user || loaded.current) return;
    loaded.current = true;
    try {
      const res = await reservationAPI.getMine();
      const all: Reservation[] = res.data;

      // ── Terrain fermé ────────────────────────────────────
      const unseen = all.filter(r => isTerrainClosed(r));
      if (unseen.length > 0 && !terrainToastDismissedThisSession) {
        setTerrainCount(unseen.length);
        setShowTerrain(true);
      }

      // ── Réservations aujourd'hui (futures) ─────────────────
      const todayStr = new Date().toISOString().slice(0, 10);
      const now      = new Date();
      const today    = all.filter(r =>
        r.start.slice(0, 10) === todayStr
        && (r.status === 'confirmed' || r.status === 'pending')
        && new Date(r.start) > now
      );
      if (today.length > 0) {
        setTodayRes(today.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
        setShowToday(true);
      }
    } catch { /* silencieux */ }
  }, [user]);

  // Charger dès que l'utilisateur est connecté
  useEffect(() => {
    loaded.current = false;
    if (user) loadData();
    else {
      setShowTerrain(false);
      setShowToday(false);
    }
  }, [user, loadData]);

  // Auto-dismiss terrain toast
  useEffect(() => {
    if (!showTerrain) return;
    const t = setTimeout(() => setShowTerrain(false), TERRAIN_TOAST_DURATION);
    return () => clearTimeout(t);
  }, [showTerrain]);

  // Auto-dismiss today toast
  useEffect(() => {
    if (!showToday) return;
    const t = setTimeout(() => setShowToday(false), TODAY_TOAST_DURATION);
    return () => clearTimeout(t);
  }, [showToday]);

  if (!user) return null;

  return (
    <>
      {/* ── Toast terrain fermé — BAS DROITE ──────────────────── */}
      {showTerrain && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => { terrainToastDismissedThisSession = true; setShowTerrain(false); navigate('/mon-espace'); }}
        >
          <ProgressBar duration={TERRAIN_TOAST_DURATION} color="bg-orange-400" />
          <div className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">
                {terrainCount > 1 ? `${terrainCount} réservations annulées` : 'Réservation annulée'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Un terrain a été fermé · Cliquez pour voir les détails
              </p>
            </div>
            <button
              className="text-gray-300 hover:text-gray-500 flex-shrink-0 ml-1"
              onClick={e => { e.stopPropagation(); terrainToastDismissedThisSession = true; setShowTerrain(false); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Toast aujourd'hui — HAUT GAUCHE ───────────────────── */}
      {showToday && (
        <div
          role="status"
          className="fixed top-24 left-6 z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-brand-200 overflow-hidden"
        >
          <ProgressBar duration={TODAY_TOAST_DURATION} color="bg-brand-500" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 text-sm">Aujourd'hui</p>
              </div>
              <button
                className="text-gray-300 hover:text-gray-500"
                onClick={() => setShowToday(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {todayRes.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2 cursor-pointer hover:bg-brand-100 transition-colors"
                  onClick={() => { setShowToday(false); navigate('/mon-espace'); }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-brand-600 flex-shrink-0">
                    {fmt(r.start)} – {fmt(r.end)}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {r.terrain?.name ?? 'Terrain'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalNotifications;
