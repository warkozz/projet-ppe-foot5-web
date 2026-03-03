import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { terrainsAPI } from '../services/api';

interface Terrain {
  id: number;
  name: string;
  location: string;
  active: boolean;
}

const TerrainsPage: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    terrainsAPI.getAll()
      .then(res => setTerrains(res.data))
      .catch(() => setError('Impossible de charger les terrains.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Nos terrains</h1>
          <p className="text-gray-500 text-lg">Choisissez votre terrain et réservez en ligne</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {terrains.map(terrain => (
              <div key={terrain.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 h-36 flex items-center justify-center">
                  <span className="text-6xl">⚽</span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{terrain.name}</h3>
                  {terrain.location && (
                    <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
                      <span>📍</span> {terrain.location}
                    </p>
                  )}
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-4 ${
                    terrain.active ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {terrain.active ? 'Disponible' : 'Indisponible'}
                  </span>
                  <div className="pt-2 border-t border-gray-100">
                    <Link
                      to="/connexion"
                      className="block text-center bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      Réserver ce terrain
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && terrains.length === 0 && (
          <p className="text-center text-gray-500 py-20">Aucun terrain disponible pour le moment.</p>
        )}
      </div>
    </main>
  );
};

export default TerrainsPage;
