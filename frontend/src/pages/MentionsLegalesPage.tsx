import React from 'react';
import { Link } from 'react-router-dom';

const MentionsLegalesPage: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold text-gray-900">Mentions légales</h1>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : mars 2026</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        <Section title="1. Éditeur du site">
          <p>Le site <strong>Five V Five</strong> est édité par :</p>
          <ul className="mt-3 space-y-1">
            <li><strong>Raison sociale :</strong> Five V Five SAS</li>
            <li><strong>Adresse :</strong> 12 Rue du Stade, 75001 Paris, France</li>
            <li><strong>Téléphone :</strong> 01 00 00 00 00</li>
            <li><strong>Email :</strong> contact@foot5.fr</li>
            <li><strong>Capital social :</strong> 10 000 €</li>
            <li><strong>SIRET :</strong> 000 000 000 00000</li>
            <li><strong>Directeur de la publication :</strong> Gérant de Five V Five SAS</li>
          </ul>
        </Section>

        <Section title="2. Hébergement">
          <p>Le site est hébergé par :</p>
          <ul className="mt-3 space-y-1">
            <li><strong>Hébergeur :</strong> OVHcloud</li>
            <li><strong>Adresse :</strong> 2 Rue Kellermann, 59100 Roubaix, France</li>
            <li><strong>Site web :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">www.ovhcloud.com</a></li>
          </ul>
        </Section>

        <Section title="3. Propriété intellectuelle">
          <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes) est la propriété exclusive de Five V Five SAS ou de ses partenaires. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable écrite est interdite.</p>
        </Section>

        <Section title="4. Limitation de responsabilité">
          <p>Five V Five SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, Five V Five SAS ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site. En conséquence, Five V Five SAS décline toute responsabilité pour toute imprécision, inexactitude ou omission.</p>
        </Section>

        <Section title="5. Liens hypertextes">
          <p>Le site peut contenir des liens vers des sites tiers. Five V Five SAS n'est pas responsable du contenu de ces sites. La création de liens vers le site Five V Five est soumise à l'accord préalable de l'éditeur.</p>
        </Section>

        <Section title="6. Droit applicable">
          <p>Tout litige en relation avec l'utilisation du site Five V Five est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.</p>
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

export default MentionsLegalesPage;
