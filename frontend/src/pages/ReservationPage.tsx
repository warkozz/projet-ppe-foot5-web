import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { terrainsAPI, reservationAPI } from '../services/api';

interface Terrain {
  id: number;
  name: string;
  location?: string;
  active: boolean;
}

interface Slot {
  start_time: string;
  end_time: string;
  label: string;
  available: boolean;
}

type Step = 1 | 2 | 3;

// Retourne la date d'aujourd'hui au format YYYY-MM-DD
const today = () => new Date().toISOString().slice(0, 10);

// Formatage lisible
const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step tracking
  const [step, setStep] = useState<Step>(1);

  // Step 1 — Terrain
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [terrainsLoading, setTerrainsLoading] = useState(true);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);

  // Step 2 — Date + Créneau
  const [date, setDate] = useState<string>(today());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');

  // Step 3 — Confirmation
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Charger les terrains au montage + présélectionner si ?terrain=id
  useEffect(() => {
    terrainsAPI.getAll()
      .then(res => {
        const list: Terrain[] = res.data.filter((t: Terrain) => t.active);
        setTerrains(list);
        // Présélectionner le terrain passé en paramètre
        const preId = parseInt(searchParams.get('terrain') || '', 10);
        if (preId) {
          const found = list.find(t => t.id === preId);
          if (found) {
            setSelectedTerrain(found);
            setStep(2);
          }
        }
      })
      .catch(() => setTerrains([]))
      .finally(() => setTerrainsLoading(false));
  }, [searchParams]);

  // Charger les créneaux uniquement sur l'étape 2
  useEffect(() => {
    if (!selectedTerrain || step !== 2) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    terrainsAPI.getSlots(selectedTerrain.id, date)
      .then(res => {
        const now = new Date();
        const filtered: Slot[] = (res.data.available_slots || []).filter((s: Slot) => {
          if (date !== today()) return true;
          return new Date(s.start_time) > now;
        });
        setSlots(filtered);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedTerrain, date, step]);

  const handleSubmit = async () => {
    if (!selectedTerrain || !selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await reservationAPI.create({
        terrain_id: selectedTerrain.id,
        start: selectedSlot.start_time,
        end: selectedSlot.end_time,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Succès ────────────────────────────────────────────────
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md w-full">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h2>
          <p className="text-gray-500 mb-1">
            <span className="font-medium">{selectedTerrain?.name}</span>
          </p>
          <p className="text-gray-500 mb-6 capitalize">
            {fmtDate(selectedSlot!.start_time)} · {fmt(selectedSlot!.start_time)} – {fmt(selectedSlot!.end_time)}
          </p>
          <button
            onClick={() => navigate('/mon-espace')}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
          >
            Voir mes réservations
          </button>
        </div>
      </main>
    );
  }

  // ─── Étapes ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* En-tête + stepper */}
        <div className="mb-8">
          <button
            onClick={() => step === 1 ? navigate('/mon-espace') : setStep(s => (s - 1) as Step)}
            className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1 mb-4 transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle réservation</h1>

          {/* Stepper */}
          <div className="flex items-center gap-3 mt-5">
            {(['Terrain', 'Créneau', 'Confirmation'] as const).map((label, i) => {
              const n = (i + 1) as Step;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${done ? 'bg-brand-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-px ${step > n ? 'bg-brand-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1 : Terrain ── */}
        {step === 1 && (
          <div>
            <p className="text-gray-500 mb-6">Choisissez le terrain que vous souhaitez réserver.</p>

            {terrainsLoading ? (
              <p className="text-gray-400 text-center py-12">Chargement des terrains...</p>
            ) : terrains.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Aucun terrain disponible pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {terrains.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTerrain(t); setStep(2); }}
                    className="text-left bg-white rounded-xl border-2 border-gray-200 hover:border-brand-500
                               p-5 transition-all group focus:outline-none focus:border-brand-500"
                  >
                    <p className="font-semibold text-gray-900 text-lg group-hover:text-brand-600 transition-colors">
                      {t.name}
                    </p>
                    {t.location && (
                      <p className="text-gray-400 text-sm mt-1">📍 {t.location}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 : Date + Créneau ── */}
        {step === 2 && selectedTerrain && (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <p className="font-semibold text-gray-900">{selectedTerrain.name}</p>
                {selectedTerrain.location && (
                  <p className="text-gray-400 text-sm">📍 {selectedTerrain.location}</p>
                )}
              </div>
            </div>

            {/* Sélecteur de date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                min={today()}
                onChange={e => setDate(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            {/* Créneaux */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Créneau disponible</label>

              {slotsLoading ? (
                <p className="text-gray-400">Chargement des créneaux...</p>
              ) : slots.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                  Aucun créneau disponible pour cette date. Essayez une autre date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map(slot => {
                    const isSelected = selectedSlot?.start_time === slot.start_time;
                    return (
                      <button
                        key={slot.start_time}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all focus:outline-none
                          ${isSelected
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400'
                          }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes optionnelles */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={250}
                rows={2}
                placeholder="Ex : besoin de chasubles, nombre de joueurs..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500
                           focus:border-transparent transition resize-none"
              />
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedSlot}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </div>
        )}

        {/* ── STEP 3 : Confirmation ── */}
        {step === 3 && selectedTerrain && selectedSlot && (
          <div>
            <p className="text-gray-500 mb-6">Vérifiez les détails avant de confirmer.</p>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Terrain</span>
                <span className="font-semibold text-gray-900">{selectedTerrain.name}</span>
              </div>
              {selectedTerrain.location && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Localisation</span>
                  <span className="text-gray-700">📍 {selectedTerrain.location}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900 capitalize">{fmtDate(selectedSlot.start_time)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Créneau</span>
                <span className="font-semibold text-gray-900">
                  {fmt(selectedSlot.start_time)} – {fmt(selectedSlot.end_time)}
                </span>
              </div>

              {notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Notes</span>
                  <span className="text-gray-700 text-right max-w-[60%]">{notes}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Confirmation...' : 'Confirmer la réservation'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ReservationPage;
