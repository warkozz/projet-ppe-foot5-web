import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReserver = () => {
    navigate(isAuthenticated ? '/reserver' : '/connexion');
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Réservez votre terrain de <span className="text-brand-400">Football 5v5</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Des terrains de qualité disponibles 7j/7, de 8h à 20h. Réservez en ligne en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReserver}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Réserver un terrain
            </button>
            <Link
              to="/terrains"
              className="border border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Voir les terrains
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚽</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Terrains de qualité</h3>
              <p className="text-gray-500">Gazon synthétique dernière génération, vestiaires et éclairage inclus.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Réservation facile</h3>
              <p className="text-gray-500">Choisissez votre terrain, votre créneau, et confirmez en ligne en moins d'une minute.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🕐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ouvert 7j/7</h3>
              <p className="text-gray-500">Disponible de 8h à 20h tous les jours, réservez quand vous voulez.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Prêt à jouer ?</h2>
        <p className="text-brand-100 mb-8 text-lg">Créez votre compte gratuitement et réservez votre premier terrain.</p>
        <button
          onClick={handleReserver}
          className="bg-white text-brand-700 hover:bg-brand-50 font-semibold py-3 px-10 rounded-lg transition-colors text-lg"
        >
          Commencer
        </button>
      </section>
    </main>
  );
};

export default HomePage;
