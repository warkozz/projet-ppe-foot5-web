import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200">
    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-4xl font-extrabold text-brand-600 mb-1">{value}</p>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
  </div>
);

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReserver = () => navigate(isAuthenticated ? '/reserver' : '/connexion');

  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-900 to-brand-800">
        {/* Décor radial */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700/30 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 sm:py-36">
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
              Réservation en ligne · Ouvert 7j/7
            </span>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Réservez votre<br />
              <span className="text-brand-400">terrain de foot</span><br />
              en quelques clics
            </h1>

            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
              Des terrains synthétiques de qualité, disponibles 7j/7 de 8h à 20h.
              Réservez, jouez, profitez.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReserver}
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-400/40 text-[15px]"
              >
                Réserver maintenant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                to="/terrains"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3.5 px-8 rounded-xl transition-all text-[15px]"
              >
                Voir les terrains
              </Link>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-16 fill-white">
            <path d="M0 64L1440 64L1440 30C1200 60 960 70 720 50C480 30 240 10 0 30L0 64Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 divide-x divide-gray-100">
          <Stat value="5+" label="Terrains disponibles" />
          <Stat value="7j/7" label="Ouverture continue" />
          <Stat value="2min" label="Pour réserver" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-gray-50/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Pourquoi nous choisir</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">L'expérience terrain idéale</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="⚽"
              title="Terrains premium"
              desc="Gazon synthétique dernière génération, vestiaires modernes et éclairage LED inclus."
            />
            <FeatureCard
              icon="📅"
              title="Réservation express"
              desc="Sélectionnez un terrain, un créneau et confirmez en ligne en moins de 2 minutes."
            />
            <FeatureCard
              icon="🕐"
              title="Disponible 7j/7"
              desc="De 8h à 20h tous les jours. Réservez quand vous voulez, cancellation facile."
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">3 étapes simples</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Créez un compte', desc: "Inscription gratuite en 30 secondes avec juste un email et un mot de passe." },
              { step: '2', title: 'Choisissez un terrain', desc: "Consultez nos terrains, leurs disponibilités et choisissez votre créneau." },
              { step: '3', title: 'Confirmez & jouez', desc: "Validation instantanée, récap dans Mon espace. À vous de jouer !" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-brand-500 text-white text-xl font-extrabold rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-brand-500/30">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-600 to-brand-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Prêt à jouer ?</h2>
          <p className="text-brand-100 text-lg mb-10">
            {isAuthenticated
              ? 'Votre prochain match n\'attend que vous.'
              : 'Créez votre compte gratuitement et réservez votre premier terrain.'}
          </p>
          <button
            onClick={handleReserver}
            className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-bold py-3.5 px-10 rounded-xl transition-all shadow-lg text-[15px]"
          >
            {isAuthenticated ? 'Réserver un terrain' : 'Commencer gratuitement'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
