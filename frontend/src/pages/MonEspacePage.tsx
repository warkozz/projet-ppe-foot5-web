import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MonEspacePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon espace</h1>
          <p className="text-gray-500 mt-1">Bonjour, <span className="font-medium text-gray-700">{user?.username}</span></p>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/reserver"
            className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl p-6 flex items-center gap-4 transition-colors group"
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl">📅</div>
            <div>
              <p className="font-semibold text-lg">Nouvelle réservation</p>
              <p className="text-brand-100 text-sm">Choisir un terrain et un créneau</p>
            </div>
          </Link>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🧾</div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Mes réservations</p>
              <p className="text-gray-500 text-sm">Gérer vos réservations en cours</p>
            </div>
          </div>
        </div>

        {/* Liste des réservations - à implémenter */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes réservations</h2>
          </div>
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Aucune réservation pour le moment</p>
            <p className="text-sm mt-1">
              <Link to="/reserver" className="text-brand-500 hover:underline">Réserver un terrain</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MonEspacePage;
