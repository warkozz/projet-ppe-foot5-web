import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { terrainsAPI, reservationAPI } from '../services/api';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

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

const today = () => new Date().toISOString().slice(0, 10);

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [terrainsLoading, setTerrainsLoading] = useState(true);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [date, setDate] = useState<string>(today());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    terrainsAPI.getAll()
      .then(res => {
        const list: Terrain[] = res.data.filter((t: Terrain) => t.active);
        setTerrains(list);
        const preId = parseInt(searchParams.get('terrain') || '', 10);
        if (preId) {
          const found = list.find(t => t.id === preId);
          if (found) { setSelectedTerrain(found); setStep(2); }
        }
      })
      .catch(() => setTerrains([]))
      .finally(() => setTerrainsLoading(false));
  }, [searchParams]);

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

  // ─── Succès ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Réservation confirmée !</h2>
          <p className="font-semibold text-gray-700 mb-1">{selectedTerrain?.name}</p>
          <p className="text-gray-400 text-sm capitalize mb-8">
            {fmtDate(selectedSlot!.start_time)} · {fmt(selectedSlot!.start_time)} – {fmt(selectedSlot!.end_time)}
          </p>
          <Button variant="primary" className="w-full" onClick={() => navigate('/mon-espace')}>
            Voir mes réservations
          </Button>
        </div>
      </main>
    );
  }

  const steps = ['Terrain', 'Créneau', 'Confirmation'];

  // ─── Main ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => step === 1 ? navigate('/mon-espace') : setStep(s => (s - 1) as Step)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step === 1 ? 'Mon espace' : 'Étape précédente'}
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">Nouvelle réservation</h1>

          {/* Stepper */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((label, i) => {
              const n = (i + 1) as Step;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors
                      ${done ? 'bg-brand-500 text-white' : active ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {done
                        ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : n}
                    </div>
                    <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-gray-900' : done ? 'text-brand-500' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step > n ? 'bg-brand-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* ── STEP 1 : Terrain ─────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <p className="text-gray-500 mb-6">Choisissez le terrain que vous souhaitez réserver.</p>
            {terrainsLoading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : terrains.length === 0 ? (
              <Alert variant="warning">Aucun terrain disponible pour le moment.</Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {terrains.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTerrain(t); setStep(2); }}
                    className="text-left bg-white rounded-2xl border-2 border-gray-100 hover:border-brand-400 shadow-sm hover:shadow-md p-6 transition-all group focus:outline-none focus:border-brand-500"
                  >
                    {/* Visuel mini terrain */}
                    <div className="w-full h-24 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-4 border-2 border-white rounded-lg" />
                        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full" />
                      </div>
                      <span className="text-white font-extrabold text-lg relative z-10">⚽</span>
                    </div>
                    <p className="font-bold text-gray-900 text-base group-hover:text-brand-600 transition-colors">{t.name}</p>
                    {t.location && (
                      <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {t.location}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 : Date + Créneau ─────────────────────────────────── */}
        {step === 2 && selectedTerrain && (
          <div>
            {/* Terrain sélectionné */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚽</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{selectedTerrain.name}</p>
                {selectedTerrain.location && <p className="text-gray-400 text-sm">{selectedTerrain.location}</p>}
              </div>
              <button
                onClick={() => { setSelectedTerrain(null); setStep(1); }}
                className="ml-auto text-xs text-gray-400 hover:text-brand-500 transition-colors font-medium"
              >
                Changer
              </button>
            </div>

            {/* Date */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-3">Choisir une date</label>
              <input
                type="date"
                value={date}
                min={today()}
                onChange={e => setDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>

            {/* Créneaux */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">Créneau disponible</label>
              {slotsLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : slots.length === 0 ? (
                <Alert variant="warning">Aucun créneau disponible pour cette date. Essayez une autre date.</Alert>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {slots.map(slot => {
                    const isSelected = selectedSlot?.start_time === slot.start_time;
                    return (
                      <button
                        key={slot.start_time}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all focus:outline-none
                          ${isSelected
                            ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400 hover:text-brand-600'
                          }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">Nombre de joueurs, besoins particuliers…</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={250}
                rows={2}
                placeholder="Ex : besoin de chasubles, 8 joueurs..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full" disabled={!selectedSlot} onClick={() => setStep(3)}>
              Continuer vers la confirmation
            </Button>
          </div>
        )}

        {/* ── STEP 3 : Confirmation ────────────────────────────────────── */}
        {step === 3 && selectedTerrain && selectedSlot && (
          <div>
            <p className="text-gray-500 mb-6">Vérifiez les détails avant de confirmer.</p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              {/* Bandeau vert */}
              <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-400" />
              <div className="p-6 space-y-4">
                {[
                  { label: 'Terrain', value: selectedTerrain.name },
                  ...(selectedTerrain.location ? [{ label: 'Localisation', value: selectedTerrain.location }] : []),
                  { label: 'Date', value: <span className="capitalize">{fmtDate(selectedSlot.start_time)}</span> },
                  { label: 'Créneau', value: `${fmt(selectedSlot.start_time)} – ${fmt(selectedSlot.end_time)}` },
                  ...(notes ? [{ label: 'Notes', value: notes }] : []),
                ].map(({ label, value }, i) => (
                  <div key={i} className="flex justify-between items-start text-sm border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <span className="text-gray-400 font-medium">{label}</span>
                    <span className="font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={submitting}
              onClick={handleSubmit}
            >
              Confirmer la réservation
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
              En confirmant, vous acceptez nos{' '}
              <Link to="/cgu" className="text-brand-500 hover:underline">CGU</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ReservationPage;
