import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { terrainsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

interface Terrain {
  id: number;
  name: string;
  location: string;
  active: boolean;
}

const TerrainCard: React.FC<{ terrain: Terrain; onReserver: (t: Terrain) => void }> = ({ terrain, onReserver }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
    {/* Visuel */}
    <div className="relative h-44 bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center overflow-hidden">
      {/* Pattern déco */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-2 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-0 right-4 w-20 h-20 border-4 border-white rounded-full" />
      </div>
      <span className="text-7xl relative z-10 drop-shadow-lg">⚽</span>
      {/* Badge disponibilité */}
      <div className="absolute top-3 right-3">
        <Badge variant={terrain.active ? 'green' : 'gray'}>
          <span className={`w-1.5 h-1.5 rounded-full ${terrain.active ? 'bg-green-500' : 'bg-gray-400'}`} />
          {terrain.active ? 'Disponible' : 'Indisponible'}
        </Badge>
      </div>
    </div>

    {/* Infos */}
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{terrain.name}</h3>
      {terrain.location && (
        <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {terrain.location}
        </p>
      )}

      {/* Caractéristiques */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          👥 5v5
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          🌿 Gazon synthétique
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          💡 Éclairage LED
        </span>
      </div>

      <div className="mt-auto">
        <Button
          variant={terrain.active ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
          disabled={!terrain.active}
          onClick={() => terrain.active && onReserver(terrain)}
        >
          {terrain.active ? 'Réserver ce terrain' : 'Non disponible'}
        </Button>
      </div>
    </div>
  </div>
);

const TerrainsPage: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    terrainsAPI.getAll()
      .then((res: { data: Terrain[] }) => setTerrains(res.data))
      .catch(() => setError('Impossible de charger les terrains.'))
      .finally(() => setLoading(false));
  }, []);

  const handleReserver = (terrain: Terrain) => {
    const dest = `/reserver?terrain=${terrain.id}`;
    isAuthenticated
      ? navigate(dest)
      : navigate('/connexion', { state: { from: { pathname: dest } } });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-2">Nos installations</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Choisissez votre terrain</h1>
          <p className="text-gray-500">Tous nos terrains sont disponibles à la réservation en ligne.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-gray-400">Chargement des terrains…</p>
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        {!loading && !error && terrains.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏟️</p>
            <p className="text-lg font-semibold text-gray-700 mb-2">Aucun terrain disponible</p>
            <p className="text-gray-400 text-sm">Revenez bientôt, nous ajoutons régulièrement de nouveaux terrains.</p>
          </div>
        )}

        {!loading && !error && terrains.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terrains.map(terrain => (
              <TerrainCard key={terrain.id} terrain={terrain} onReserver={handleReserver} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TerrainsPage;
