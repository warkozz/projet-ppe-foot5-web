import React, { useState } from 'react';
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

const faqs = [
  {
    q: 'Comment réserver un terrain ?',
    a: "Créez un compte gratuitement, choisissez votre terrain et votre créneau depuis la page Terrains, puis confirmez votre réservation en quelques clics.",
  },
  {
    q: 'Quel est le délai d\'annulation ?',
    a: "Vous pouvez annuler une réservation jusqu'à 24h avant le créneau directement depuis votre espace client, sans frais.",
  },
  {
    q: 'Y a-t-il un accès parking ?',
    a: "Oui, un parking gratuit est disponible sur place pour tous nos clients pendant la durée de leur réservation.",
  },
  {
    q: 'Les équipements sont-ils fournis ?',
    a: "Le ballon est inclus dans chaque réservation. Vestiaires, éclairage LED et accès buvette sont également compris.",
  },
  {
    q: 'Puis-je modifier une réservation existante ?',
    a: "Oui, depuis votre espace client (Mon Espace), vous pouvez modifier la date ou l'heure de votre réservation sous réserve de disponibilité.",
  },
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 bg-gray-50/70">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Questions fréquentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-[15px]">{faq.q}</span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${openIndex === i ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

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

      {/* ── Infos pratiques ── */}
      <section className="py-24 px-4 bg-gray-50/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Infos pratiques</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Tout ce qu'il faut savoir</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Horaires */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Horaires d'ouverture</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { day: 'Lundi – Vendredi', hours: '8h00 – 22h00' },
                  { day: 'Samedi',           hours: '8h00 – 22h00' },
                  { day: 'Dimanche',         hours: '9h00 – 20h00' },
                ].map(({ day, hours }) => (
                  <li key={day} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{day}</span>
                    <span className="font-semibold text-gray-800">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adresse & Téléphone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
              <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Adresse & Contact</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Foot 5 Centre</p>
                    <p className="text-gray-500 leading-relaxed">12 Rue du Stade<br />75001 Paris, France</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <a href="tel:+33100000000" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                    01 00 00 00 00
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a href="mailto:contact@foot5.fr" className="text-gray-500 hover:text-brand-600 transition-colors">
                    contact@foot5.fr
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Réserver */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">Réservez maintenant</h3>
                <p className="text-brand-100 text-sm leading-relaxed mb-6">
                  Choisissez votre terrain et votre créneau en moins de 2 minutes.
                </p>
              </div>
              <button
                onClick={handleReserver}
                className="relative w-full bg-white text-brand-700 hover:bg-brand-50 font-bold py-3 px-5 rounded-xl transition-all text-sm shadow-lg"
              >
                Voir les disponibilités →
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Services inclus ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Services</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Tout est inclus dans votre réservation</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: '⚽', label: 'Ballon fourni' },
              { icon: '🚿', label: 'Vestiaires' },
              { icon: '💡', label: 'Éclairage LED' },
              { icon: '🅿️', label: 'Parking gratuit' },
              { icon: '🥤', label: 'Buvette' },
              { icon: '📹', label: 'Vidéo à la demande' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-2xl hover:bg-brand-50 transition-colors group">
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-700 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

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
