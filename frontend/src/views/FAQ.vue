<template>
  <div class="faq-page">
    <!-- Hero Section -->
    <section class="faq-hero">
      <div class="container">
        <div class="hero-content">
          <span class="hero-badge">Centre d'aide</span>
          <h1 class="hero-title">Questions Fréquentes</h1>
          <p class="hero-description">
            Trouvez rapidement des réponses à vos questions sur notre plateforme
          </p>

          <!-- Search bar -->
          <div class="search-container">
            <div class="search-box">
              <svg
                class="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher une question..."
                class="search-input"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Categories -->
    <section class="faq-categories">
      <div class="container">
        <div class="categories-grid">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-btn', { active: activeCategory === category.id }]"
            @click="activeCategory = category.id"
          >
            <span class="category-icon" v-html="category.icon"></span>
            <span class="category-label">{{ category.label }}</span>
            <span class="category-count">{{ category.count }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FAQ Content -->
    <section class="faq-content">
      <div class="container">
        <div class="faq-grid">
          <div
            v-for="(item, index) in filteredFaqs"
            :key="index"
            class="faq-item"
            :class="{ active: activeIndex === index }"
          >
            <button class="faq-question" @click="toggleFaq(index)">
              <span class="question-text">{{ item.question }}</span>
              <svg
                class="chevron-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <transition name="slide-fade">
              <div v-show="activeIndex === index" class="faq-answer">
                <div class="answer-content" v-html="item.answer"></div>
              </div>
            </transition>
          </div>
        </div>

        <!-- No results -->
        <div v-if="filteredFaqs.length === 0" class="no-results">
          <svg
            class="no-results-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3>Aucun résultat trouvé</h3>
          <p>Essayez avec d'autres mots-clés ou contactez notre support</p>
        </div>
      </div>
    </section>

    <!-- Still have questions -->
    <section class="help-section">
      <div class="container">
        <div class="help-card">
          <h2>Vous n'avez pas trouvé de réponse ?</h2>
          <p>Notre équipe est là pour vous aider</p>
          <router-link to="/contact" class="btn-contact">
            Contactez-nous
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="arrow-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'FAQView',
  setup() {
    const searchQuery = ref('')
    const activeCategory = ref('all')
    const activeIndex = ref(null)

    const categories = [
      { id: 'all', label: 'Tout', icon: '🔍', count: 15 },
      { id: 'orders', label: 'Commandes', icon: '📦', count: 5 },
      { id: 'shipping', label: 'Livraison', icon: '🚚', count: 4 },
      { id: 'payment', label: 'Paiement', icon: '💳', count: 3 },
      { id: 'account', label: 'Compte', icon: '👤', count: 3 },
    ]

    const faqs = [
      {
        category: 'orders',
        question: 'Comment passer une commande ?',
        answer: `<p>Pour passer une commande sur notre plateforme :</p>
          <ol>
            <li>Parcourez les produits et ajoutez-les à votre panier</li>
            <li>Cliquez sur l'icône panier et validez votre sélection</li>
            <li>Remplissez vos informations de livraison</li>
            <li>Choisissez votre mode de paiement</li>
            <li>Confirmez votre commande</li>
          </ol>
          <p>Vous recevrez un email de confirmation immédiatement après.</p>`,
      },
      {
        category: 'orders',
        question: 'Puis-je modifier ma commande après validation ?',
        answer: `<p>Vous pouvez modifier votre commande dans les <strong>2 heures</strong> suivant sa validation, uniquement si elle n'a pas encore été expédiée.</p>
          <p>Pour cela :</p>
          <ul>
            <li>Accédez à votre espace "Mes commandes"</li>
            <li>Cliquez sur "Modifier la commande"</li>
            <li>Ou contactez notre service client</li>
          </ul>`,
      },
      {
        category: 'orders',
        question: 'Comment suivre ma commande ?',
        answer: `<p>Un numéro de suivi vous est envoyé par email dès l'expédition de votre commande.</p>
          <p>Vous pouvez aussi :</p>
          <ul>
            <li>Vous connecter à votre compte</li>
            <li>Accéder à "Mes commandes"</li>
            <li>Cliquer sur "Suivre ma commande"</li>
          </ul>
          <p>Le suivi est mis à jour en temps réel.</p>`,
      },
      {
        category: 'shipping',
        question: 'Quels sont les délais de livraison ?',
        answer: `<p>Les délais varient selon votre localisation :</p>
          <ul>
            <li><strong>Tunis</strong> : 24-48h</li>
            <li><strong>Autres villes</strong> : 3-5 jours ouvrés</li>
            <li><strong>Zones reculées</strong> : 5-7 jours ouvrés</li>
          </ul>
          <p>Ces délais sont indicatifs et peuvent varier selon la disponibilité des produits.</p>`,
      },
      {
        category: 'shipping',
        question: 'Quels sont les frais de livraison ?',
        answer: `<p>Nos tarifs de livraison :</p>
          <ul>
            <li><strong>Livraison standard</strong> : 7 TND</li>
            <li><strong>Livraison express</strong> : 15 TND</li>
            <li><strong>GRATUIT</strong> pour les commandes > 100 TND</li>
          </ul>
          <p>Les frais sont calculés automatiquement lors du paiement.</p>`,
      },
      {
        category: 'payment',
        question: 'Quels modes de paiement acceptez-vous ?',
        answer: `<p>Nous acceptons plusieurs modes de paiement sécurisés :</p>
          <ul>
            <li>💳 <strong>Carte bancaire</strong> (Visa, Mastercard)</li>
            <li>💰 <strong>Paiement à la livraison</strong></li>
            <li>🏦 <strong>Virement bancaire</strong></li>
            <li>📱 <strong>Mobile Money</strong> (D17, Mobiflouss)</li>
          </ul>
          <p>Tous les paiements en ligne sont sécurisés par cryptage SSL.</p>`,
      },
      {
        category: 'payment',
        question: 'Est-ce que mes données bancaires sont sécurisées ?',
        answer: `<p>Oui, absolument ! Nous prenons la sécurité très au sérieux :</p>
          <ul>
            <li>🔒 Cryptage SSL 256 bits</li>
            <li>🛡️ Certification PCI-DSS</li>
            <li>🚫 Nous ne stockons JAMAIS vos données bancaires</li>
            <li>✅ Paiements traités par des prestataires certifiés</li>
          </ul>
          <p>Vos transactions sont totalement sécurisées.</p>`,
      },
      {
        category: 'account',
        question: 'Comment créer un compte ?',
        answer: `<p>Créer un compte est rapide et gratuit :</p>
          <ol>
            <li>Cliquez sur "S'inscrire" en haut de la page</li>
            <li>Remplissez le formulaire avec vos informations</li>
            <li>Validez votre email via le lien envoyé</li>
            <li>Connectez-vous et profitez de vos avantages !</li>
          </ol>
          <p><strong>Avantages :</strong> suivi des commandes, liste de souhaits, offres exclusives.</p>`,
      },
      {
        category: 'account',
        question: "J'ai oublié mon mot de passe, que faire ?",
        answer: `<p>Pas de panique ! Pour réinitialiser votre mot de passe :</p>
          <ol>
            <li>Cliquez sur "Mot de passe oublié" sur la page de connexion</li>
            <li>Saisissez votre email</li>
            <li>Cliquez sur le lien reçu par email</li>
            <li>Créez un nouveau mot de passe</li>
          </ol>
          <p>Si vous ne recevez pas l'email, vérifiez vos spams.</p>`,
      },
      {
        category: 'orders',
        question: 'Quelle est votre politique de retour ?',
        answer: `<p>Vous disposez de <strong>14 jours</strong> pour retourner un produit :</p>
          <ul>
            <li>✅ Produit dans son emballage d'origine</li>
            <li>✅ Non utilisé, avec étiquettes</li>
            <li>✅ Accompagné de la facture</li>
          </ul>
          <p><strong>Procédure :</strong></p>
          <ol>
            <li>Contactez notre service client</li>
            <li>Obtenez un numéro de retour</li>
            <li>Renvoyez le produit</li>
            <li>Remboursement sous 7-10 jours</li>
          </ol>`,
      },
      {
        category: 'shipping',
        question: "Livrez-vous à l'international ?",
        answer: `<p>Actuellement, nous livrons uniquement en <strong>Tunisie</strong>.</p>
          <p>Nous travaillons activement pour étendre nos services à l'international prochainement.</p>
          <p>Inscrivez-vous à notre newsletter pour être informé dès le lancement !</p>`,
      },
      {
        category: 'account',
        question: 'Comment devenir vendeur sur la plateforme ?',
        answer: `<p>Pour devenir vendeur artisan :</p>
          <ol>
            <li>Visitez notre page <router-link to="/become-vendor">"Devenir Vendeur"</router-link></li>
            <li>Remplissez le formulaire d'inscription</li>
            <li>Soumettez les documents requis (carte d'identité, RIB)</li>
            <li>Notre équipe valide votre dossier sous 48h</li>
            <li>Commencez à vendre !</li>
          </ol>
          <p><strong>Commission :</strong> 10% sur chaque vente.</p>`,
      },
      {
        category: 'payment',
        question: 'Puis-je payer en plusieurs fois ?',
        answer: `<p>Oui ! Pour les commandes supérieures à <strong>200 TND</strong>, vous pouvez payer en 3 fois sans frais :</p>
          <ul>
            <li>33% à la commande</li>
            <li>33% à 30 jours</li>
            <li>34% à 60 jours</li>
          </ul>
          <p>Cette option est disponible uniquement par carte bancaire.</p>`,
      },
      {
        category: 'orders',
        question: 'Que faire si je reçois un produit défectueux ?',
        answer: `<p>Si vous recevez un produit défectueux ou endommagé :</p>
          <ol>
            <li><strong>Ne l'utilisez pas</strong></li>
            <li>Prenez des photos du défaut</li>
            <li>Contactez-nous immédiatement via le formulaire de contact</li>
            <li>Nous organisons le retour gratuit</li>
            <li>Échange ou remboursement sous 48h</li>
          </ol>
          <p>Votre satisfaction est notre priorité !</p>`,
      },
      {
        category: 'shipping',
        question: "Puis-je changer l'adresse de livraison ?",
        answer: `<p>Oui, tant que votre commande n'est pas expédiée :</p>
          <ul>
            <li>Accédez à "Mes commandes"</li>
            <li>Cliquez sur "Modifier l'adresse"</li>
            <li>Ou contactez notre service client</li>
          </ul>
          <p>Une fois expédiée, contactez le transporteur avec votre numéro de suivi.</p>`,
      },
    ]

    const filteredFaqs = computed(() => {
      let result = faqs

      // Filter by category
      if (activeCategory.value !== 'all') {
        result = result.filter((faq) => faq.category === activeCategory.value)
      }

      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query),
        )
      }

      return result
    })

    const toggleFaq = (index) => {
      activeIndex.value = activeIndex.value === index ? null : index
    }

    return {
      searchQuery,
      activeCategory,
      activeIndex,
      categories,
      filteredFaqs,
      toggleFaq,
    }
  },
}
</script>

<style scoped>
/* Hero Section */
.faq-hero {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #ec4899 100%);
  padding: 5rem 1rem 4rem;
  position: relative;
  overflow: hidden;
}

.faq-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

/* Search */
.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 1.25rem 1.25rem 1.25rem 3.5rem;
  border: none;
  font-size: 1rem;
  outline: none;
  background: transparent;
}

/* Categories */
.faq-categories {
  padding: 2rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 80px;
  z-index: 10;
}

.categories-grid {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.category-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
}

.category-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.category-icon {
  font-size: 1.25rem;
}

.category-count {
  padding: 0.125rem 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  font-size: 0.75rem;
}

.category-btn.active .category-count {
  background: rgba(255, 255, 255, 0.3);
}

/* FAQ Content */
.faq-content {
  padding: 4rem 1rem;
}

.faq-grid {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.faq-item.active {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.faq-question:hover {
  background: #f8fafc;
}

.question-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.chevron-icon {
  width: 24px;
  height: 24px;
  color: #64748b;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-item.active .chevron-icon {
  transform: rotate(180deg);
  color: #3b82f6;
}

.faq-answer {
  overflow: hidden;
}

.answer-content {
  padding: 0 1.75rem 1.75rem;
  color: #475569;
  line-height: 1.7;
  font-size: 1rem;
}

.answer-content p {
  margin-bottom: 1rem;
}

.answer-content ul,
.answer-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.answer-content li {
  margin-bottom: 0.5rem;
}

.answer-content strong {
  color: #1e293b;
  font-weight: 600;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* No results */
.no-results {
  text-align: center;
  padding: 4rem 1rem;
}

.no-results-icon {
  width: 80px;
  height: 80px;
  color: #cbd5e1;
  margin: 0 auto 1.5rem;
}

.no-results h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.no-results p {
  color: #64748b;
  font-size: 1rem;
}

/* Help Section */
.help-section {
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
}

.help-card {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.help-card h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.help-card p {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.btn-contact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-contact:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.arrow-icon {
  width: 20px;
  height: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .faq-hero {
    padding: 3rem 1rem 2.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .faq-categories {
    top: 60px;
  }

  .categories-grid {
    justify-content: flex-start;
  }

  .faq-content {
    padding: 2rem 1rem;
  }

  .question-text {
    font-size: 1rem;
  }

  .help-card {
    padding: 2rem 1.5rem;
  }

  .help-card h2 {
    font-size: 1.5rem;
  }
}
</style>
