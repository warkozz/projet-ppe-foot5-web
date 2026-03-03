import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI, terrainsAPI } from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

interface Reservation {
  id: number;
  start: string;
  end: string;
  status: string;
  notes?: string;
  terrain?: { id: number; name: string; location?: string };
}

interface Slot {
  start_time: string;
  end_time: string;
  label: string;
  available: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'green'|'yellow'|'red'|'gray'; bar: string }> = {
  confirmed: { label: 'Confirmée',  variant: 'green',  bar: 'border-l-green-400'  },
  pending:   { label: 'En attente', variant: 'yellow', bar: 'border-l-yellow-400' },
  cancelled: { label: 'Annulée',   variant: 'red',    bar: 'border-l-red-400'    },
  completed: { label: 'Terminée',  variant: 'gray',   bar: 'border-l-gray-300'   },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const todayISO = () => new Date().toISOString().split('T')[0];

/* ══════════════════════════════════════════════
   MODAL MODIFICATION
══════════════════════════════════════════════ */
const EditModal: React.FC<{
  reservation: Reservation;
  onClose: () => void;
  onSaved: (updated: Reservation) => void;
}> = ({ reservation, onClose, onSaved }) => {
  const [date, setDate]               = useState(reservation.start.split('T')[0]);
  const [slots, setSlots]             = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes]             = useState(reservation.notes ?? '');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const loadSlots = useCallback(async (d: string) => {
    if (!reservation.terrain) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await terrainsAPI.getSlots(reservation.terrain.id, d);
      const available: Slot[] = (res.data?.available_slots ?? []);
      // start_time peut être "HH:MM" ou un ISO complet "2026-03-03T08:00:00"
      // On extrait toujours la partie HH:MM pour comparer
      const getHM = (t: string) => t.includes('T') ? t.split('T')[1].slice(0, 5) : t.slice(0, 5);
      const currentStartHM = formatTime(reservation.start); // "08:00"
      // Si date = aujourd'hui, exclure les créneaux passés
      const now = new Date();
      const filtered = d === todayISO()
        ? available.filter(s => {
            const [h, m] = getHM(s.start_time).split(':').map(Number);
            const slotDate = new Date();
            slotDate.setHours(h, m, 0, 0);
            return slotDate > now;
          })
        : available;
      // Pré-sélectionner l'ancien créneau si même date et encore disponible
      const match = filtered.find(s => getHM(s.start_time) === currentStartHM);
      if (match?.available) setSelectedSlot(match);
      setSlots(filtered);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [reservation]);

  useEffect(() => { loadSlots(date); }, [date, loadSlots]);

  const handleSubmit = async () => {
    if (!selectedSlot) { setError('Veuillez sélectionner un créneau.'); return; }
    setError('');
    setSubmitting(true);
    try {
      // start_time peut être un datetime ISO complet ("2026-03-03T08:00:00") ou juste "08:00"
      // On extrait la partie HH:MM:SS pour la recombiner avec la date choisie
      const timePart = (iso: string) =>
        iso.includes('T') ? iso.split('T')[1].slice(0, 8) : `${iso.slice(0, 5)}:00`;
      const startStr = `${date}T${timePart(selectedSlot.start_time)}`;
      const endStr   = `${date}T${timePart(selectedSlot.end_time)}`;
      const res = await reservationAPI.update(reservation.id, {
        start: startStr,
        end:   endStr,
        notes: notes.trim() || undefined,
      });
      onSaved({ ...reservation, ...res.data });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((e: any) => e.msg ?? e.message ?? 'Erreur').join(', ')
            : 'Erreur lors de la modification.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Modifier la réservation</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choisissez une nouvelle date et un créneau</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Terrain (lecture seule) */}
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Terrain</p>
            <p className="font-semibold text-gray-900 text-sm">{reservation.terrain?.name}</p>
            {reservation.terrain?.location && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {reservation.terrain.location}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition hover:border-gray-300"
            />
          </div>

          {/* Créneaux */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Créneau</label>
            {slotsLoading ? (
              <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                <Spinner size="sm" /> Chargement des créneaux…
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 bg-gray-50 rounded-xl px-4">Aucun créneau disponible ce jour.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(s => (
                  <button
                    key={s.start_time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => s.available && setSelectedSlot(s)}
                    className={`py-2.5 px-1 rounded-xl text-xs font-semibold border transition-all
                      ${!s.available
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : selectedSlot?.start_time === s.start_time
                          ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/30'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={250}
              placeholder="Informations complémentaires…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition"
            />
          </div>

          {error && <Alert variant="error">{error}</Alert>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            loading={submitting}
            disabled={!selectedSlot}
            onClick={handleSubmit}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
};

const MonEspacePage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling]       = useState<number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [editSuccess, setEditSuccess]     = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationAPI.getMine();
      setReservations(res.data);
    } catch {
      setError('Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setCancelling(id);
    try {
      await reservationAPI.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      setCancelSuccess('Réservation annulée avec succès.');
      setTimeout(() => setCancelSuccess(''), 4000);
    } catch {
      alert("Erreur lors de l'annulation. Veuillez réessayer.");
    } finally {
      setCancelling(null);
    }
  };

  const handleSaved = (updated: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
    setEditingReservation(null);
    setEditSuccess('Réservation modifiée avec succès.');
    setTimeout(() => setEditSuccess(''), 4000);
  };

  const active = reservations.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const past   = reservations.filter(r => r.status === 'cancelled'  || r.status === 'completed');

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50">
      {editingReservation && (
        <EditModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Mon espace</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Bonjour, <span className="font-semibold text-gray-600">{user?.username}</span> 👋
                </p>
              </div>
            </div>
            <Link
              to="/profil"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600
                         border border-gray-200 hover:border-brand-300 rounded-xl px-4 py-2.5 transition-colors bg-white shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mon profil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Toasts */}
        {cancelSuccess && (
          <div className="mb-6"><Alert variant="success">{cancelSuccess}</Alert></div>
        )}
        {editSuccess && (
          <div className="mb-6"><Alert variant="info">{editSuccess}</Alert></div>
        )}

        {/* CTA nouvelle réservation */}
        <div className="mb-10">
          <Link
            to="/reserver"
            className="group inline-flex items-center gap-4 bg-white border-2 border-brand-200 hover:border-brand-500
                       rounded-2xl px-6 py-5 transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
              📅
            </div>
            <div>
              <p className="font-bold text-gray-900 text-[15px]">Nouvelle réservation</p>
              <p className="text-sm text-gray-400 mt-0.5">Choisir un terrain et un créneau</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 ml-auto group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Réservations actives */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Réservations à venir</h2>
            {!loading && (
              <Badge variant={active.length > 0 ? 'brand' : 'gray'}>{active.length}</Badge>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-4 text-gray-400 shadow-sm">
              <Spinner size="md" />
              <p className="text-sm">Chargement…</p>
            </div>
          ) : error ? (
            <div>
              <Alert variant="error">{error}</Alert>
              <button onClick={loadReservations} className="mt-3 text-sm text-brand-500 hover:underline">Réessayer</button>
            </div>
          ) : active.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-3 text-gray-400 shadow-sm">
              <span className="text-5xl">📭</span>
              <p className="font-semibold text-gray-600">Aucune réservation à venir</p>
              <Link to="/reserver" className="text-sm text-brand-500 hover:text-brand-600 hover:underline font-medium">
                Réserver un terrain →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(r => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  onCancel={handleCancel}
                  onEdit={setEditingReservation}
                  cancelling={cancelling}
                />
              ))}
            </div>
          )}
        </section>

        {/* Historique */}
        {!loading && past.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Historique</h2>
              <Badge variant="gray">{past.length}</Badge>
            </div>
            <div className="space-y-3 opacity-80">
              {past.map(r => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  onCancel={handleCancel}
                  onEdit={setEditingReservation}
                  cancelling={cancelling}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

const ReservationCard: React.FC<{
  r: Reservation;
  onCancel: (id: number) => void;
  onEdit: (r: Reservation) => void;
  cancelling: number | null;
}> = ({ r, onCancel, onEdit, cancelling }) => {
  const cfg = statusConfig[r.status] ?? { label: r.status, variant: 'gray' as const, bar: 'border-l-gray-300' };
  const canAct = r.status === 'confirmed' || r.status === 'pending';

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${cfg.bar} shadow-sm overflow-hidden hover:shadow-md transition-all duration-200`}>
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status + terrain */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {r.terrain && (
              <span className="text-sm font-bold text-gray-900">{r.terrain.name}</span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1.5">
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{formatDate(r.start)}</span>
          </div>

          {/* Heure */}
          <div className="flex items-center gap-2 text-sm text-brand-600 font-semibold">
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(r.start)} – {formatTime(r.end)}
          </div>

          {/* Localisation */}
          {r.terrain?.location && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {r.terrain.location}
            </p>
          )}
          {r.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>
          )}
        </div>

        {canAct && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(r)}>
              Modifier
            </Button>
            <Button
              variant="dangerGhost"
              size="sm"
              disabled={cancelling === r.id}
              loading={cancelling === r.id}
              onClick={() => onCancel(r.id)}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonEspacePage;
