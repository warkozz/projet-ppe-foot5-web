import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reservationAPI } from '../services/api';

interface Reservation {
  id: number;
  start: string;
  end: string;
  status: string;
  notes?: string;
  terrain?: { id: number; name: string; location?: string };
}

const statusLabel: Record<string, { label: string; classes: string }> = {
  confirmed: { label: 'Confirmée',  classes: 'bg-green-100 text-green-700' },
  pending:   { label: 'En attente', classes: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Annulée',   classes: 'bg-red-100 text-red-600' },
  completed: { label: 'Terminée',  classes: 'bg-gray-100 text-gray-500' },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const MonEspacePage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState('');

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
      setCancelSuccess('');
      alert("Erreur lors de l'annulation. Veuillez réessayer.");
    } finally {
      setCancelling(null);
    }
  };

  const active = reservations.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const past   = reservations.filter(r => r.status === 'cancelled' || r.status === 'completed');

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon espace</h1>
          <p className="text-gray-500 mt-1">
            Bonjour, <span className="font-medium text-gray-700">{user?.username}</span>
          </p>
        </div>

        {/* Toast annulation */}
        {cancelSuccess && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <span>✅</span>
            <span>{cancelSuccess}</span>
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
              {active.map(r => <ReservationCard key={r.id} r={r} onCancel={handleCancel} cancelling={cancelling} />)}
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
              {past.map(r => <ReservationCard key={r.id} r={r} onCancel={handleCancel} cancelling={cancelling} />)}
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
  cancelling: number | null;
}> = ({ r, onCancel, cancelling }) => {
  const s = statusLabel[r.status] ?? { label: r.status, classes: 'bg-gray-100 text-gray-500' };
  const canCancel = r.status === 'confirmed' || r.status === 'pending';

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
      {canCancel && (
          <button
            onClick={() => onCancel(r.id)}
            disabled={cancelling === r.id}
            className="flex-shrink-0 text-sm text-red-500 hover:text-red-700 border border-red-200
                       hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling === r.id ? '...' : 'Annuler'}
          </button>
        )}
    </div>
  );
};

export default MonEspacePage;
