import React from 'react';
import { Link } from 'react-router-dom';

const CguPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-500 transition-colors mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Accueil
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : mars 2026</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        <Section title="1. Objet">
          <p>Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation des services proposés sur le site Five V Five, ainsi que les droits et obligations des parties dans ce cadre.</p>
        </Section>

        <Section title="2. Acceptation des conditions">
          <p>L'accès et l'utilisation du site impliquent l'acceptation pleine et entière des présentes CGU. En créant un compte ou en utilisant nos services, vous reconnaissez avoir pris connaissance des présentes conditions et les acceptez sans réserve.</p>
        </Section>

        <Section title="3. Inscription et compte utilisateur">
          <ul className="space-y-2">
            <li>• L'inscription est gratuite et réservée aux personnes majeures (18 ans et plus).</li>
            <li>• Vous vous engagez à fournir des informations exactes et à les maintenir à jour.</li>
            <li>• Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
            <li>• Tout accès frauduleux à votre compte devra être signalé immédiatement à Five V Five.</li>
          </ul>
        </Section>

        <Section title="4. Réservation de terrains">
          <ul className="space-y-2">
            <li>• Les réservations sont effectuées en ligne via votre espace personnel.</li>
            <li>• Une réservation est confirmée dès réception de la validation sur le site.</li>
            <li>• L'annulation d'une réservation est possible jusqu'à 24h avant le créneau, sans frais.</li>
            <li>• En cas d'annulation tardive (moins de 24h), le créneau reste dû.</li>
            <li>• Five V Five se réserve le droit de modifier ou annuler un créneau en cas de force majeure.</li>
          </ul>
        </Section>

        <Section title="5. Tarifs et paiement">
          <p>Les tarifs applicables sont ceux affichés sur le site au moment de la réservation. Five V Five se réserve le droit de modifier ses tarifs à tout moment. Les modifications de tarifs seront communiquées aux utilisateurs avec un préavis raisonnable.</p>
        </Section>

        <Section title="6. Comportement sur les terrains">
          <ul className="space-y-2">
            <li>• Les utilisateurs s'engagent à respecter les règles du fair-play et les consignes du personnel.</li>
            <li>• Tout comportement dangereux, irrespectueux ou contraire aux règles pourra entraîner l'exclusion immédiate du site.</li>
            <li>• Les équipements sportifs doivent être utilisés conformément à leur destination.</li>
            <li>• Five V Five n'est pas responsable des blessures survenant lors des sessions de jeu.</li>
          </ul>
        </Section>

        <Section title="7. Modification des CGU">
          <p>Five V Five se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou via une notification sur le site. La poursuite de l'utilisation du site après notification vaut acceptation des nouvelles CGU.</p>
        </Section>

        <Section title="8. Droit applicable et juridiction">
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, le litige sera soumis aux tribunaux compétents de Paris.</p>
        </Section>
      </div>
    </main>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
    <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
  </section>
);

export default CguPage;
