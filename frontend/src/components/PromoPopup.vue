<template>
  <transition name="popup-fade">
    <div v-if="isVisible" class="promo-popup-overlay" @click.self="closePopup">
      <div class="promo-popup-container" dir="rtl">

        <!-- Image Traditionnelle en Background -->
        <div class="traditional-bg">
          <img
            src="/src/assets/pop.png"
            alt="Artisanat Tunisien"
            class="bg-image"
            @error="handleImageError"
          />
          <!-- Overlay léger pour lisibilité -->
          <div class="image-overlay"></div>

          <!-- Contenu Texte par-dessus l'image -->
          <div class="content-overlay">

            <!-- Bouton Fermer -->
            <button class="close-btn" @click="closePopup">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <!-- Badge Artisanal -->
            <div class="artisan-badge">
              <span class="badge-icon">✦</span>
              <span>صناعة تقليدية</span>
              <span class="badge-icon">✦</span>
            </div>

            <!-- Titre Principal -->
            <h2 class="main-title">عروض الحرفيين</h2>

            <!-- Sous-titre -->
            <p class="subtitle">اكتشف أجمل المنتجات اليدوية التونسية</p>

            <!-- Liste des Offres (si existent) -->
            <div v-if="activePromotions.length > 0" class="offers-mini-list">
              <div
                v-for="offer in activePromotions.slice(0, 2)"
                :key="offer.id"
                class="offer-chip"
                @click="goToOffer(offer)"
              >
                <span class="chip-icon">🎁</span>
                <span class="chip-text">{{ truncate(offer.title, 25) }}</span>
                <span class="chip-arrow">←</span>
              </div>
            </div>

            <!-- Boutons d'Action -->
            <div class="action-buttons">
              <button class="btn-primary" @click="goToProducts">
                <span>اكتشف المنتجات</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>

              <button class="btn-secondary" @click="remindLater">
                <span>⏰</span>
                <span>لاحقاً</span>
              </button>
            </div>

            <!-- Footer Text -->
            <p class="footer-text">منتجات يدوية أصيلة 100% تونسية</p>

          </div>
        </div>

      </div>
    </div>
  </transition>

  <!-- Toast Notification -->
  <transition name="toast-slide">
    <div v-if="toast.show" class="traditional-toast">
      <span>{{ toast.message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  offers: {
    type: Array,
    default: () => []
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'remind'])

const router = useRouter()

const toast = ref({
  show: false,
  message: ''
})

let toastTimeout = null

// Fallback image si l'image principale ne charge pas
const handleImageError = (e) => {
  e.target.src = 'https://placehold.co/600x800/8b5e3c/f5e6d3?text=صناعة+تونسية'
}

const normalizedOffers = computed(() => {
  return (props.offers || []).map((offer) => ({
    id: offer.id ?? Date.now(),
    title: offer.title || 'عرض خاص',
    link: offer.link || '/products',
    active: offer.active !== false
  }))
})

const activePromotions = computed(() => {
  return normalizedOffers.value.filter(offer => offer.active).slice(0, 2)
})

const truncate = (text, length = 25) => {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}

const showToast = (message) => {
  toast.value.show = true
  toast.value.message = message

  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

const closePopup = () => {
  emit('close')
}

const goToProducts = () => {
  closePopup()
  router.push('/products')
}

const goToOffer = (offer) => {
  closePopup()
  if (!offer?.link) {
    router.push('/products')
    return
  }
  router.push(offer.link)
}

const remindLater = () => {
  showToast('🌸 سنذكرك لاحقاً')
  emit('remind')
  closePopup()
}
</script>

<style>
/* ===== IMPORT POLICE AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;500;600;700;800&display=swap');
</style>

<style scoped>
/* ===== APPLICATION DE LA POLICE AMIRI ===== */
.promo-popup-container {
  font-family: 'Amiri', 'Cairo', serif;
}

.promo-popup-container * {
  font-family: 'Amiri', 'Cairo', serif;
}

/* ===== OVERLAY ===== */
.promo-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

/* ===== CONTAINER ===== */
.promo-popup-container {
  position: relative;
  width: 100%;
  max-width: 420px;
  border-radius: 32px;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(210, 180, 140, 0.3);
}

/* ===== TRADITIONAL BACKGROUND ===== */
.traditional-bg {
  position: relative;
  width: 100%;
  min-height: 560px;
  background: #2c1810; /* Fallback marron foncé */
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  transition: transform 8s ease;
}

.promo-popup-container:hover .bg-image {
  transform: scale(1.08);
}

/* ===== OVERLAY LÉGER ===== */
.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.4) 100%
  );
}

/* ===== CONTENT OVERLAY ===== */
.content-overlay {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-height: 560px;
  padding: 24px 20px 28px;
  color: #f5e6d3;
  text-align: center;
}

/* ===== CLOSE BUTTON ===== */
.close-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: #f5e6d3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(210, 180, 140, 0.3);
}

.close-btn:hover {
  background: rgba(200, 160, 120, 0.3);
  transform: rotate(90deg);
  border-color: #d2b48c;
}

/* ===== ARTISAN BADGE ===== */
.artisan-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 40px auto 20px;
  padding: 8px 20px;
  background: rgba(139, 94, 60, 0.25);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  border: 1px solid rgba(210, 180, 140, 0.4);
  font-size: 0.95rem;
  font-weight: 600;
  color: #f5e6d3;
  letter-spacing: 1px;
  font-family: 'Amiri', serif;
}

.badge-icon {
  font-size: 1rem;
  color: #d4a574;
}

/* ===== MAIN TITLE ===== */
.main-title {
  margin: 0 0 12px;
  font-size: 2.4rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Amiri', serif;
  letter-spacing: 1px;
  line-height: 1.3;
}

/* ===== SUBTITLE ===== */
.subtitle {
  margin: 0 0 24px;
  font-size: 1.1rem;
  color: #f0d5b5;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-weight: 400;
  opacity: 0.95;
  font-family: 'Amiri', serif;
}

/* ===== OFFERS MINI LIST ===== */
.offers-mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.offer-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid rgba(210, 180, 140, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.offer-chip:hover {
  background: rgba(210, 180, 140, 0.2);
  border-color: #d2b48c;
  transform: translateY(-2px);
}

.chip-icon {
  font-size: 1.2rem;
  color: #f5e6d3;
}

.chip-text {
  flex: 1;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  font-family: 'Amiri', serif;
}

.chip-arrow {
  font-size: 1rem;
  color: #d2b48c;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.offer-chip:hover .chip-arrow {
  opacity: 1;
  transform: translateX(-4px);
}

/* ===== ACTION BUTTONS ===== */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: auto;
  margin-bottom: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 20px;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Amiri', serif;
}

.btn-primary {
  flex: 2;
  background: linear-gradient(135deg, #8b5e3c, #6b4226);
  color: #f5e6d3;
  border: 1px solid rgba(210, 180, 140, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #a07048, #7a5030);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  color: #f5e6d3;
  border: 1px solid rgba(210, 180, 140, 0.3);
}

.btn-secondary:hover {
  background: rgba(210, 180, 140, 0.2);
  border-color: #d2b48c;
  transform: translateY(-2px);
}

/* ===== FOOTER TEXT ===== */
.footer-text {
  margin: 0;
  font-size: 0.8rem;
  color: #d4c4b0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
  letter-spacing: 0.5px;
  font-family: 'Amiri', serif;
}

/* ===== TRADITIONAL TOAST ===== */
.traditional-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
  padding: 12px 28px;
  border-radius: 50px;
  background: #6b4226;
  color: #f5e6d3;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid #d2b48c;
  white-space: nowrap;
  font-family: 'Amiri', serif;
}

/* ===== TRANSITIONS ===== */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.4s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-from .promo-popup-container {
  transform: scale(0.9) translateY(20px);
}

.popup-fade-enter-active .promo-popup-container {
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(15px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .promo-popup-container {
    max-width: 100%;
    border-radius: 28px;
  }

  .traditional-bg,
  .content-overlay {
    min-height: 520px;
  }

  .main-title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .artisan-badge {
    margin-top: 30px;
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
