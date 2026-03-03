import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI, terrainsAPI } from '../services/api';

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

const statusLabel: Record<string, { label: string; classes: string }> = {
  confirmed: { label: 'Confirmée',  classes: 'bg-green-100 text-green-700' },
  pending:   { label: 'En attente', classes: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Annulée',   classes: 'bg-red-100 text-red-600' },
  completed: { label: 'Terminée',  classes: 'bg-gray-100 text-gray-500' },
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Modifier la réservation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Terrain (lecture seule) */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Terrain</p>
            <p className="font-semibold text-gray-900">{reservation.terrain?.name}</p>
            {reservation.terrain?.location && (
              <p className="text-xs text-gray-400 mt-0.5">📍 {reservation.terrain.location}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Créneaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Créneau</label>
            {slotsLoading ? (
              <p className="text-sm text-gray-400 py-2">Chargement des créneaux…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">Aucun créneau disponible ce jour.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(s => (
                  <button
                    key={s.start_time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => s.available && setSelectedSlot(s)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors
                      ${!s.available
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : selectedSlot?.start_time === s.start_time
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-400 hover:text-brand-600'
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={250}
              placeholder="Informations complémentaires…"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50
                       rounded-lg text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedSlot}
            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300
                       text-white rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? 'Enregistrement…' : 'Confirmer'}
          </button>
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
  const past   = reservations.filter(r => r.status === 'cancelled' || r.status === 'completed');

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      {editingReservation && (
        <EditModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon espace</h1>
            <p className="text-gray-500 mt-1">
              Bonjour, <span className="font-medium text-gray-700">{user?.username}</span>
            </p>
          </div>
          <Link
            to="/profil"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600
                       border border-gray-200 hover:border-brand-300 rounded-lg px-3 py-2
                       transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mon profil
          </Link>
        </div>

        {/* Toasts */}
        {cancelSuccess && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <span>✅</span><span>{cancelSuccess}</span>
          </div>
        )}
        {editSuccess && (
          <div className="mb-6 flex items-center gap-3 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl px-4 py-3 text-sm">
            <span>✅</span><span>{editSuccess}</span>
          </div>
        )}

        {/* Action principale */}
        <div className="mb-10">
          <Link
            to="/reserver"
            className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white
                       rounded-xl px-6 py-4 font-semibold text-lg transition-colors"
          >
            <span className="text-2xl">📅</span>
            <div>
              <p>Nouvelle réservation</p>
              <p className="text-brand-100 text-sm font-normal">Choisir un terrain et un créneau</p>
            </div>
          </Link>
        </div>

        {/* Réservations actives */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Réservations à venir
            {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({active.length})</span>}
          </h2>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <p className="text-2xl mb-2">⏳</p>
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
              <p>{error}</p>
              <button onClick={loadReservations} className="mt-3 text-sm underline">Réessayer</button>
            </div>
          ) : active.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">Aucune réservation à venir</p>
              <p className="text-sm mt-1">
                <Link to="/reserver" className="text-brand-500 hover:underline">Réserver un terrain</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(r => (
                <ReservationCard
                  key={r.id} r={r}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Historique
              <span className="ml-2 text-sm font-normal text-gray-400">({past.length})</span>
            </h2>
            <div className="space-y-3">
              {past.map(r => (
                <ReservationCard
                  key={r.id} r={r}
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
  const s = statusLabel[r.status] ?? { label: r.status, classes: 'bg-gray-100 text-gray-500' };
  const canAct = r.status === 'confirmed' || r.status === 'pending';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.classes}`}>{s.label}</span>
          {r.terrain && (
            <span className="text-sm font-semibold text-gray-900 truncate">{r.terrain.name}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 capitalize">{formatDate(r.start)}</p>
        <p className="text-sm text-gray-500">{formatTime(r.start)} – {formatTime(r.end)}</p>
        {r.terrain?.location && (
          <p className="text-xs text-gray-400 mt-1">📍 {r.terrain.location}</p>
        )}
        {r.notes && <p className="text-xs text-gray-400 mt-1 italic">{r.notes}</p>}
      </div>

      {canAct && (
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(r)}
            className="text-sm text-brand-600 hover:text-brand-800 border border-brand-200
                       hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={() => onCancel(r.id)}
            disabled={cancelling === r.id}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200
                       hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling === r.id ? '...' : 'Annuler'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonEspacePage;
