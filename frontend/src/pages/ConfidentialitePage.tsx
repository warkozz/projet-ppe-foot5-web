import React from 'react';
import { Link } from 'react-router-dom';

const ConfidentialitePage: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold text-gray-900">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400 mt-2">Dernière mise à jour : mars 2026</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        <Section title="1. Responsable du traitement">
          <p>Le responsable du traitement des données personnelles collectées sur le site Five V Five est :</p>
          <ul className="mt-3 space-y-1">
            <li><strong>Société :</strong> Five V Five SAS</li>
            <li><strong>Adresse :</strong> 12 Rue du Stade, 75001 Paris, France</li>
            <li><strong>Email :</strong> contact@foot5.fr</li>
          </ul>
        </Section>

        <Section title="2. Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <ul className="mt-3 space-y-2">
            <li>• <strong>Données d'identification :</strong> nom d'utilisateur, adresse email</li>
            <li>• <strong>Données de connexion :</strong> adresse IP, logs de connexion, type de navigateur</li>
            <li>• <strong>Données de réservation :</strong> historique des créneaux réservés, annulations</li>
          </ul>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>Vos données sont collectées pour les finalités suivantes :</p>
          <ul className="mt-3 space-y-2">
            <li>• Gestion de votre compte utilisateur et authentification</li>
            <li>• Traitement et suivi de vos réservations</li>
            <li>• Communication relative à votre compte (confirmations, annulations)</li>
            <li>• Amélioration de nos services et de l'expérience utilisateur</li>
            <li>• Respect de nos obligations légales</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement de vos données repose sur :</p>
          <ul className="mt-3 space-y-2">
            <li>• <strong>L'exécution du contrat</strong> : pour la gestion des réservations</li>
            <li>• <strong>Votre consentement</strong> : pour les communications marketing (si applicable)</li>
            <li>• <strong>L'intérêt légitime</strong> : pour l'amélioration de nos services et la sécurité</li>
          </ul>
        </Section>

        <Section title="5. Conservation des données">
          <p>Vos données sont conservées pendant :</p>
          <ul className="mt-3 space-y-2">
            <li>• <strong>Données de compte :</strong> durée de l'inscription + 3 ans après suppression</li>
            <li>• <strong>Données de réservation :</strong> 5 ans à des fins comptables et légales</li>
            <li>• <strong>Logs de connexion :</strong> 12 mois</li>
          </ul>
        </Section>

        <Section title="6. Vos droits">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="mt-3 space-y-2">
            <li>• <strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li>• <strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li>• <strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li>• <strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li>• <strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          </ul>
          <p className="mt-3">Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@foot5.fr" className="text-brand-600 hover:underline">contact@foot5.fr</a></p>
        </Section>

        <Section title="7. Cookies">
          <p>Le site utilise des cookies techniques nécessaires à son fonctionnement (session, authentification). Aucun cookie de tracking publicitaire tiers n'est déposé sans votre consentement.</p>
        </Section>

        <Section title="8. Sécurité">
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction, notamment : chiffrement des mots de passe (bcrypt), connexions HTTPS, accès restreint aux données personnelles.</p>
        </Section>

        <Section title="9. Contact CNIL">
          <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Commission Nationale de l'Informatique et des Libertés (CNIL)</a>.</p>
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

export default ConfidentialitePage;
