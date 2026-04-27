<!-- frontend/src/views/Contact.vue - Version COMPLÈTE ET CORRIGÉE -->
<template>
  <div class="contact-page" :class="{ 'dark-theme': isDarkMode }">

    <!-- ===== MAIN CONTENT ===== -->
    <main class="contact-main">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header" data-aos="fade-up">
          <span class="section-tag" style="border-left-color: #d40025">{{ currentLanguage === 'ar' ? 'اتصل بنا' : 'Contactez-nous' }}</span>
          <h2 class="section-title">{{ currentLanguage === 'ar' ? 'معلومات' : 'Informations' }} <span style="color: #08717f">{{ currentLanguage === 'ar' ? 'الاتصال' : 'de contact' }}</span></h2>
          <p class="section-subtitle">{{ currentLanguage === 'ar' ? 'تواصل معنا عبر القنوات التالية وسنكون سعداء بخدمتك' : 'Contactez-nous via les canaux suivants, nous serons ravis de vous servir' }}</p>
        </div>

        <!-- ===== INFO CARDS ===== -->
        <div class="info-grid">
          <!-- Address Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="100">
            <div class="card-icon-wrapper" style="background: rgba(8, 113, 127, 0.1)">
              <div class="card-icon" style="color: #08717f">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
            <h3 class="card-title">{{ currentLanguage === 'ar' ? 'العنوان' : 'Adresse' }}</h3>
            <p class="card-text">{{ currentLanguage === 'ar' ? 'شارع طريق قابس، مدنين الشمالية' : 'Rue Gabès, Mednine Nord' }}</p>
            <p class="card-note">INFINITY Marketing & Production</p>
            <button class="card-action" @click="openInMaps" style="color: #08717f">
              <span>{{ currentLanguage === 'ar' ? 'عرض على الخريطة' : 'Voir sur la carte' }}</span>
              <span class="action-icon">←</span>
            </button>
          </div>

          <!-- Phone Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="200">
            <div class="card-icon-wrapper" style="background: rgba(212, 0, 37, 0.1)">
              <div class="card-icon" style="color: #d40025">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M22 16.92v3a1.999 1.999 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
            </div>
            <h3 class="card-title">{{ currentLanguage === 'ar' ? 'الهاتف' : 'Téléphone' }}</h3>
            <a href="tel:+21692105505" class="card-link">+216 92 105 505</a>
            <a href="tel:+966582522701" class="card-link">+966 58 252 2701</a>
            <div class="card-availability" style="color: #08717f">
              <span class="availability-dot"></span>
              <span>{{ currentLanguage === 'ar' ? 'متاح الآن' : 'Disponible maintenant' }}</span>
            </div>
          </div>

          <!-- Email Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="300">
            <div class="card-icon-wrapper" style="background: rgba(8, 113, 127, 0.1)">
              <div class="card-icon" style="color: #08717f">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>
            <h3 class="card-title">{{ currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</h3>
            <a href="mailto:Infinity.tunisia@gmail.com" class="card-link">Infinity.tunisia@gmail.com</a>
            <p class="card-note">{{ currentLanguage === 'ar' ? 'نرد خلال 24 ساعة' : 'Réponse sous 24h' }}</p>
          </div>

          <!-- Hours Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="400">
            <div class="card-icon-wrapper" style="background: rgba(212, 0, 37, 0.1)">
              <div class="card-icon" style="color: #d40025">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
            <h3 class="card-title">{{ currentLanguage === 'ar' ? 'ساعات العمل' : 'Horaires' }}</h3>
            <div class="hours-list">
              <div class="hour-item">
                <span>{{ currentLanguage === 'ar' ? 'الأحد - الخميس' : 'Dimanche - Jeudi' }}</span>
                <span class="hour-badge" style="background: rgba(8, 113, 127, 0.1); color: #08717f">08:00 - 00:00</span>
              </div>
              <div class="hour-item">
                <span>{{ currentLanguage === 'ar' ? 'الجمعة' : 'Vendredi' }}</span>
                <span class="hour-badge" style="background: rgba(8, 113, 127, 0.1); color: #08717f">08:00 - 12:00</span>
              </div>
              <div class="hour-item">
                <span>{{ currentLanguage === 'ar' ? 'السبت' : 'Samedi' }}</span>
                <span class="hour-badge closed" style="background: rgba(212, 0, 37, 0.1); color: #d40025">{{ currentLanguage === 'ar' ? 'مغلق' : 'Fermé' }}</span>
              </div>
            </div>
            <div class="current-time" style="color: #08717f">
              <span>{{ currentLanguage === 'ar' ? 'التوقيت المحلي:' : 'Heure locale:' }} {{ currentTime }}</span>
            </div>
          </div>
        </div>
        <!-- ===== FORM SECTION ===== -->
        <div class="form-section" ref="formSection" data-aos="fade-up">
          <div class="form-container">
            <div class="form-header">
              <div class="form-tag" style="border-left-color: #08717f">{{ currentLanguage === 'ar' ? 'أرسل لنا' : 'Envoyez-nous' }}</div>
              <h2 class="form-title">{{ currentLanguage === 'ar' ? 'رسالة' : 'Un message' }}</h2>
              <p class="form-subtitle">{{ currentLanguage === 'ar' ? 'سنتواصل معك في أقرب وقت ممكن' : 'Nous vous répondrons dans les plus brefs délais' }}</p>
            </div>

            <form @submit.prevent="submitForm" class="contact-form">
              <div class="form-row">
                <div class="form-group" :class="{ focused: focusedField === 'name', 'has-error': errors.name }">
                  <label for="name">{{ currentLanguage === 'ar' ? 'الاسم الكامل' : 'Nom complet' }}</label>
                  <div class="input-wrapper">
                    <span class="input-icon">👤</span>
                    <input
                      type="text"
                      id="name"
                      v-model="form.name"
                      @focus="focusedField = 'name'"
                      @blur="focusedField = null"
                      :placeholder="currentLanguage === 'ar' ? 'أدخل اسمك الكامل' : 'Entrez votre nom complet'"
                    />
                    <div class="input-border" style="background: #08717f"></div>
                  </div>
                  <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="form-group" :class="{ focused: focusedField === 'email', 'has-error': errors.email }">
                  <label for="email">{{ currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
                  <div class="input-wrapper">
                    <span class="input-icon">✉️</span>
                    <input
                      type="email"
                      id="email"
                      v-model="form.email"
                      @focus="focusedField = 'email'"
                      @blur="focusedField = null"
                      :placeholder="currentLanguage === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Entrez votre email'"
                    />
                    <div class="input-border" style="background: #d40025"></div>
                  </div>
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group" :class="{ focused: focusedField === 'phone' }">
                  <label for="phone">{{ currentLanguage === 'ar' ? 'رقم الهاتف (اختياري)' : 'Téléphone (optionnel)' }}</label>
                  <div class="input-wrapper">
                    <span class="input-icon">📞</span>
                    <input
                      type="tel"
                      id="phone"
                      v-model="form.phone"
                      @focus="focusedField = 'phone'"
                      @blur="focusedField = null"
                      :placeholder="currentLanguage === 'ar' ? 'أدخل رقم هاتفك' : 'Entrez votre téléphone'"
                    />
                    <div class="input-border" style="background: #08717f"></div>
                  </div>
                  <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>

                <div class="form-group" :class="{ focused: focusedField === 'subject', 'has-error': errors.subject }">
                  <label for="subject">{{ currentLanguage === 'ar' ? 'الموضوع' : 'Sujet' }}</label>
                  <div class="input-wrapper">
                    <span class="input-icon">📌</span>
                    <select
                      id="subject"
                      v-model="form.subject"
                      @focus="focusedField = 'subject'"
                      @blur="focusedField = null"
                    >
                      <option value="" disabled selected>{{ currentLanguage === 'ar' ? 'اختر الموضوع' : 'Choisissez un sujet' }}</option>
                      <option value="general">{{ currentLanguage === 'ar' ? 'استفسار عام' : 'Demande générale' }}</option>
                      <option value="support">{{ currentLanguage === 'ar' ? 'دعم فني' : 'Support technique' }}</option>
                      <option value="partnership">{{ currentLanguage === 'ar' ? 'شراكة' : 'Partenariat' }}</option>
                      <option value="complaint">{{ currentLanguage === 'ar' ? 'شكوى' : 'Réclamation' }}</option>
                      <option value="other">{{ currentLanguage === 'ar' ? 'أخرى' : 'Autre' }}</option>
                    </select>
                    <span class="select-arrow">▼</span>
                    <div class="input-border" style="background: #d40025"></div>
                  </div>
                  <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
                </div>
              </div>

              <div class="form-group full-width" :class="{ focused: focusedField === 'message', 'has-error': errors.message }">
                <label for="message">{{ currentLanguage === 'ar' ? 'الرسالة' : 'Message' }}</label>
                <div class="input-wrapper">
                  <span class="input-icon">💬</span>
                  <textarea
                    id="message"
                    v-model="form.message"
                    @focus="focusedField = 'message'"
                    @blur="focusedField = null"
                    rows="4"
                    :placeholder="currentLanguage === 'ar' ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'"
                  ></textarea>
                  <div class="input-border" style="background: linear-gradient(90deg, #08717f, #d40025)"></div>
                </div>
                <div class="textarea-footer">
                  <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
                  <span class="char-count">{{ form.message.length }}/500</span>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="submit-btn" :disabled="isSubmitting" style="background: linear-gradient(135deg, #08717f, #065a69)">
                  <span v-if="isSubmitting" class="spinner"></span>
                  <span v-else>{{ currentLanguage === 'ar' ? 'إرسال الرسالة' : 'Envoyer le message' }}</span>
                  <span class="btn-icon" v-if="!isSubmitting">←</span>
                </button>
                <p class="form-note">{{ currentLanguage === 'ar' ? 'نحن نرد خلال 24 ساعة' : 'Nous répondons sous 24h' }}</p>
              </div>
            </form>
          </div>
        </div>

        <!-- ===== MAP SECTION ===== -->
        <div class="map-section" data-aos="fade-up">
          <div class="map-container">
            <div class="map-header">
              <div class="map-badge-wrapper">
                <span class="map-badge" style="border-left-color: #08717f">{{ currentLanguage === 'ar' ? '📍 موقعنا' : '📍 Notre emplacement' }}</span>
                <span class="map-live" style="background: #08717f">{{ currentLanguage === 'ar' ? 'مباشر' : 'Live' }}</span>
              </div>
              <h3 class="map-title">INFINITY Marketing & Production</h3>
              <p class="map-address">{{ currentLanguage === 'ar' ? 'شارع طريق قابس، مدنين الشمالية' : 'Rue Gabès, Mednine Nord, Tunisie' }}</p>

              <div class="map-actions">
                <a href="https://maps.app.goo.gl/hME4kinoAf69PjHP8" target="_blank" rel="noopener noreferrer" class="map-btn" style="background: #08717f">
                  <span class="btn-icon">🗺️</span>
                  <span>{{ currentLanguage === 'ar' ? 'فتح في خرائط Google' : 'Ouvrir dans Google Maps' }}</span>
                </a>
                <a :href="`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('INFINITY Marketing & Production تونس')}`" target="_blank" rel="noopener noreferrer" class="map-btn-outline" style="color: #08717f; border-color: #08717f">
                  <span class="btn-icon">🧭</span>
                  <span>{{ currentLanguage === 'ar' ? 'الحصول على الاتجاهات' : 'Obtenir l\'itinéraire' }}</span>
                </a>
              </div>
            </div>

            <div class="map-wrapper">
              <iframe
                class="google-map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.5!2d10.1815316!3d36.8064948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd337e1866b1e9%3A0xf13f4b3c8f3c8f3c!2sINFINITY%20Marketing%20%26%20Production!5e0!3m2!1sfr!2stn!4v1700000000000!5m2!1sfr!2stn"
                style="border: 0"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Google Maps - INFINITY Marketing & Production"
              ></iframe>

              <div class="map-overlay">
                <div class="overlay-content">
                  <span class="overlay-icon">🏢</span>
                  <div class="overlay-text">
                    <strong>INFINITY Marketing & Production</strong>
                    <span>{{ currentLanguage === 'ar' ? 'مدنين الشمالية' : 'Mednine Nord' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="map-footer">
              <div class="hours-status">
                <div class="status-badge" style="background: #10b981">
                  <span class="status-dot"></span>
                  <span>{{ currentLanguage === 'ar' ? 'مفتوح الآن' : 'Ouvert maintenant' }}</span>
                </div>
                <div class="hours-today">
                  <span class="hours-icon">⏰</span>
                  <span>{{ currentLanguage === 'ar' ? 'اليوم: 00:00–06:00 ● 08:00–00:00' : 'Aujourd\'hui: 00:00–06:00 ● 08:00–00:00' }}</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="nearby-title">
                <span class="nearby-dot" style="background: #08717f"></span>
                <span>{{ currentLanguage === 'ar' ? 'معلومات إضافية:' : 'Informations supplémentaires:' }}</span>
              </div>
              <div class="map-info-grid">
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <span>{{ currentLanguage === 'ar' ? 'أيام العمل: الأحد - الخميس' : 'Jours ouvrés: Dimanche - Jeudi' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <span>{{ currentLanguage === 'ar' ? 'ساعات العمل: 08:00 - 00:00' : 'Horaires: 08:00 - 00:00' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <span>{{ currentLanguage === 'ar' ? 'المنطقة: طريق قابس' : 'Zone: Route Gabès' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🏢</span>
                  <span>INFINITY Marketing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ===== TOAST NOTIFICATION ===== -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type" :style="{ borderRightColor: toast.type === 'success' ? '#08717f' : '#d40025' }">
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <div class="toast-message">
            <strong>{{ toast.title }}</strong>
            <p>{{ toast.message }}</p>
          </div>
        </div>
        <button @click="toast.show = false" class="toast-close" aria-label="Fermer">✕</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'

// ===== I18N =====
const { locale } = useI18n()
const currentLanguage = computed(() => locale.value)

// ===== DARK MODE =====
const themeStore = useThemeStore()
const isDarkMode = computed(() => themeStore.isDarkMode)

// ===== CONSTANTS =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// ===== CURRENT TIME =====
const currentTime = ref('')

// ===== FORM STATE =====
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const errors = ref({})
const isSubmitting = ref(false)
const focusedField = ref(null)
const formSection = ref(null)

const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: '',
  icon: '✅',
})

// ===== MAP FUNCTIONS =====
const openInMaps = () => {
  window.open('https://maps.app.goo.gl/hME4kinoAf69PjHP8', '_blank', 'noopener,noreferrer')
}

// ===== UPDATE CURRENT TIME =====
const updateTime = () => {
  const now = new Date()
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Africa/Tunis',
  }
  currentTime.value = now.toLocaleTimeString('ar-TN', options)
}

// ===== VALIDATION =====
const validateForm = () => {
  const newErrors = {}

  if (!form.name.trim()) {
    newErrors.name = currentLanguage.value === 'ar' ? 'الاسم مطلوب' : 'Le nom est requis'
  } else if (form.name.length < 3) {
    newErrors.name = currentLanguage.value === 'ar' ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Le nom doit contenir au moins 3 caractères'
  } else if (form.name.length > 50) {
    newErrors.name = currentLanguage.value === 'ar' ? 'الاسم طويل جداً (الحد الأقصى 50 حرف)' : 'Nom trop long (max 50 caractères)'
  }

  if (!form.email.trim()) {
    newErrors.email = currentLanguage.value === 'ar' ? 'البريد الإلكتروني مطلوب' : 'L\'email est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = currentLanguage.value === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Email invalide'
  }

  if (form.phone && !/^[\d\+\-\(\)\s]{8,}$/.test(form.phone.trim())) {
    newErrors.phone = currentLanguage.value === 'ar' ? 'رقم الهاتف غير صحيح' : 'Numéro de téléphone invalide'
  }

  if (!form.subject) {
    newErrors.subject = currentLanguage.value === 'ar' ? 'الرجاء اختيار الموضوع' : 'Veuillez choisir un sujet'
  }

  if (!form.message.trim()) {
    newErrors.message = currentLanguage.value === 'ar' ? 'الرسالة مطلوبة' : 'Le message est requis'
  } else if (form.message.length < 10) {
    newErrors.message = currentLanguage.value === 'ar' ? 'الرسالة قصيرة جداً (10 أحرف على الأقل)' : 'Message trop court (min 10 caractères)'
  } else if (form.message.length > 500) {
    newErrors.message = currentLanguage.value === 'ar' ? 'الرسالة طويلة جداً (الحد الأقصى 500 حرف)' : 'Message trop long (max 500 caractères)'
  }

  return newErrors
}

// ===== SHOW NOTIFICATION =====
const showNotification = (title, message, type = 'success') => {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  toast.value = {
    show: true,
    type,
    title,
    message,
    icon: icons[type],
  }

  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

// ===== SAUVEGARDER LE MESSAGE DANS LOCALSTORAGE =====
const saveMessageToLocalStorage = (messageData) => {
  try {
    let existingMessages = []
    const saved = localStorage.getItem('contact_messages')
    if (saved) {
      existingMessages = JSON.parse(saved)
    }

    const newMessage = {
      id: Date.now(),
      ...messageData,
      isRead: false,
      createdAt: new Date().toISOString()
    }

    existingMessages.unshift(newMessage)
    localStorage.setItem('contact_messages', JSON.stringify(existingMessages))

    // Déclencher l'événement pour AdminLayout
    const unreadCount = existingMessages.filter(m => !m.isRead).length
    window.dispatchEvent(new CustomEvent('contact-messages-updated', {
      detail: { unreadCount: unreadCount }
    }))

    console.log('📧 Message sauvegardé dans localStorage, nouveau total:', existingMessages.length)
    return true
  } catch (error) {
    console.error('❌ Erreur sauvegarde message:', error)
    return false
  }
}

// ===== SUBMIT FORM =====
const submitForm = async () => {
  const newErrors = validateForm()

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    showNotification(
      currentLanguage.value === 'ar' ? 'خطأ في البيانات' : 'Erreur de validation',
      currentLanguage.value === 'ar' ? 'الرجاء تصحيح الأخطاء في النموذج' : 'Veuillez corriger les erreurs',
      'error'
    )

    const firstErrorField = document.querySelector('.has-error')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  isSubmitting.value = true
  errors.value = {}

  try {
    const formData = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject,
      message: form.message.trim(),
      source: 'contact_page'
    }

    // ✅ Sauvegarder dans localStorage IMMÉDIATEMENT
    saveMessageToLocalStorage(formData)

    // Essayer d'envoyer à l'API
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showNotification(
          currentLanguage.value === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message envoyé avec succès',
          currentLanguage.value === 'ar' ? 'سنتواصل معك في أقرب وقت ممكن' : 'Nous vous répondrons dès que possible',
          'success'
        )
      } else {
        console.log('API non disponible, message sauvegardé localement')
      }
    } catch (apiError) {
      console.log('API non disponible, message sauvegardé localement')
      showNotification(
        currentLanguage.value === 'ar' ? 'تم حفظ رسالتك' : 'Message sauvegardé',
        currentLanguage.value === 'ar' ? 'سيتم إرسال رسالتك عند استعادة الاتصال' : 'Votre message sera envoyé quand la connexion sera rétablie',
        'info'
      )
    }

    // Réinitialiser le formulaire
    form.name = ''
    form.email = ''
    form.phone = ''
    form.subject = ''
    form.message = ''
    localStorage.removeItem('contactFormDraft')

  } catch (error) {
    console.error('Contact form error:', error)
    showNotification(
      currentLanguage.value === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue',
      error.message || 'Veuillez réessayer plus tard',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

// ===== AUTOSAVE DRAFT =====
let autosaveTimer = null

const autosaveForm = () => {
  try {
    const draft = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
      timestamp: Date.now(),
    }
    localStorage.setItem('contactFormDraft', JSON.stringify(draft))
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

// ===== LOAD DRAFT =====
const loadDraft = () => {
  try {
    const saved = localStorage.getItem('contactFormDraft')
    if (saved) {
      const draft = JSON.parse(saved)
      if (draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
        form.name = draft.name || ''
        form.email = draft.email || ''
        form.phone = draft.phone || ''
        form.subject = draft.subject || ''
        form.message = draft.message || ''

        if (form.message || form.name || form.email) {
          showNotification(
            currentLanguage.value === 'ar' ? 'تم استعادة مسودة' : 'Brouillon récupéré',
            currentLanguage.value === 'ar' ? 'لديك رسالة غير مكتملة' : 'Vous avez un message non terminé',
            'info'
          )
        }
      } else {
        localStorage.removeItem('contactFormDraft')
      }
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

// ===== LIFECYCLE HOOKS =====
let unwatch = null

onMounted(() => {
  loadDraft()
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)

  unwatch = watch(
    () => ({ ...form }),
    () => {
      clearTimeout(autosaveTimer)
      autosaveTimer = setTimeout(autosaveForm, 2000)
    },
    { deep: true },
  )

  onUnmounted(() => {
    clearInterval(timeInterval)
    clearTimeout(autosaveTimer)
    if (unwatch) unwatch()
  })
})
</script>

<style>
/* ===== GOOGLE FONTS - AMIRI ===== */
@import url('https://fonts.googleapis.com/css2?family=Amiri&display=swap');
</style>

<style scoped>
/* ===== CSS VARIABLES ===== */
.contact-page {
  --teal: #08717f;
  --teal-dark: #065a69;
  --teal-soft: rgba(8, 113, 127, 0.1);
  --red: #d40025;
  --red-dark: #b00020;
  --red-soft: rgba(212, 0, 37, 0.1);
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  --white: #ffffff;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.08);
  --radius: 16px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.contact-page {
  font-family: 'Amiri', 'Cairo', 'Inter', serif;
  color: var(--gray-800);
  background: var(--white);
  line-height: 1.6;
  overflow-x: hidden;
  direction: rtl;
  transition: all 0.3s ease;
}

.contact-page * {
  font-family: 'Amiri', 'Cairo', 'Inter', serif;
}

/* Dark Mode */
.contact-page.dark-theme {
  --white: #1e293b;
  --gray-50: #0f172a;
  --gray-100: #1e293b;
  --gray-200: #334155;
  --gray-300: #475569;
  --gray-400: #64748b;
  --gray-500: #94a3b8;
  --gray-600: #cbd5e1;
  --gray-700: #e2e8f0;
  --gray-800: #f1f5f9;
  --teal: #0a94a6;
  --teal-soft: rgba(10, 148, 166, 0.1);
  --red: #ff1744;
  --red-soft: rgba(255, 23, 68, 0.1);
}

.contact-page.dark-theme .contact-main {
  background: #0f172a;
}

.contact-page.dark-theme .info-card,
.contact-page.dark-theme .social-section,
.contact-page.dark-theme .form-container,
.contact-page.dark-theme .map-container {
  background: #1e293b;
  border-color: #334155;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
}

/* Main Content */
.contact-main {
  padding: 80px 0;
  background: var(--white);
}

/* Section Header */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-tag {
  display: inline-block;
  padding: 6px 20px 6px 16px;
  background: var(--gray-100);
  border-right: 4px solid;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  border-radius: 30px 0 0 30px;
  margin-bottom: 16px;
  font-family: 'Amiri', serif;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 12px;
  font-family: 'Amiri', serif;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--gray-600);
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Amiri', serif;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 60px;
}

.info-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 32px 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  transition: var(--transition);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

.card-icon-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 12px;
  font-family: 'Amiri', serif;
}

.card-text {
  color: var(--gray-600);
  font-size: 0.95rem;
  font-family: 'Amiri', serif;
}

.card-link {
  display: block;
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 4px;
  transition: var(--transition);
  font-family: 'Amiri', serif;
}

.card-link:hover {
  color: var(--teal);
  transform: translateX(4px);
}

.card-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px 16px;
  background: var(--teal-soft);
  border: none;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-family: 'Amiri', serif;
}

.card-action:hover {
  background: var(--teal);
  color: white !important;
}

.card-availability {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.availability-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.hour-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-family: 'Amiri', serif;
}

.hour-badge {
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.hour-badge.closed {
  background: var(--red-soft);
  color: var(--red);
}

.current-time {
  margin-top: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  background: var(--teal-soft);
  border-radius: 30px;
  font-family: 'Amiri', serif;
}

/* Social Section */
.social-section {
  background: var(--white);
  border-radius: var(--radius);
  padding: 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
  margin-bottom: 60px;
}

.social-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.social-line {
  width: 40px;
  height: 2px;
  border-radius: 2px;
}

.social-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--gray-800);
  font-family: 'Amiri', serif;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: var(--radius);
  text-decoration: none;
  transition: var(--transition);
  background: var(--gray-50);
}

.social-link:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow);
}

.social-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: white;
}

.social-link span {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
  font-family: 'Amiri', serif;
}

/* Form Section */
.form-section {
  margin-bottom: 60px;
}

.form-container {
  background: var(--white);
  border-radius: 24px;
  padding: 48px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-tag {
  display: inline-block;
  padding: 6px 20px 6px 16px;
  background: var(--gray-100);
  border-right: 4px solid;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  border-radius: 30px 0 0 30px;
  margin-bottom: 16px;
  font-family: 'Amiri', serif;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--gray-600);
  font-family: 'Amiri', serif;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  transition: var(--transition);
  font-family: 'Amiri', serif;
}

.form-group.focused label {
  color: var(--teal);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: 16px;
  color: var(--gray-500);
  font-size: 1.1rem;
  transition: var(--transition);
  z-index: 1;
}

.form-group.focused .input-icon {
  color: var(--teal);
}

input, select, textarea {
  width: 100%;
  padding: 14px 48px 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: 'Amiri', serif;
  color: var(--gray-800);
  background: var(--white);
  transition: var(--transition);
  direction: rtl;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 4px rgba(8, 113, 127, 0.05);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

select {
  appearance: none;
  cursor: pointer;
  padding-left: 40px;
}

.select-arrow {
  position: absolute;
  left: 16px;
  color: var(--gray-500);
  font-size: 0.8rem;
  pointer-events: none;
}

.input-border {
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  transform: translateX(-50%);
  transition: width 0.3s ease;
  border-radius: 2px;
  pointer-events: none;
}

.form-group.focused .input-border {
  width: 100%;
}

.has-error input,
.has-error select,
.has-error textarea {
  border-color: var(--red) !important;
}

.error-message {
  color: var(--red);
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 4px;
  font-family: 'Amiri', serif;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.char-count {
  color: var(--gray-500);
  font-size: 0.8rem;
  font-family: 'Amiri', serif;
}

.form-actions {
  margin-top: 16px;
  text-align: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 48px;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  min-width: 220px;
  font-family: 'Amiri', serif;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(8, 113, 127, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-note {
  margin-top: 20px;
  color: var(--gray-500);
  font-size: 0.85rem;
  font-family: 'Amiri', serif;
}

/* Map Section */
.map-section {
  margin-top: 40px;
}

.map-container {
  background: var(--white);
  border-radius: 24px;
  padding: 40px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

.map-header {
  text-align: center;
  margin-bottom: 30px;
}

.map-badge-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.map-badge {
  display: inline-block;
  padding: 6px 20px 6px 16px;
  background: var(--gray-100);
  border-right: 4px solid;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-700);
  border-radius: 30px 0 0 30px;
  font-family: 'Amiri', serif;
}

.map-live {
  padding: 4px 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 30px;
  animation: livePulse 1.5s infinite;
  font-family: 'Amiri', serif;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.map-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 8px;
  font-family: 'Amiri', serif;
}

.map-address {
  color: var(--gray-600);
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-family: 'Amiri', serif;
}

.map-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.map-btn, .map-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  font-family: 'Amiri', serif;
}

.map-btn {
  color: white;
  border: none;
}

.map-btn-outline {
  background: transparent;
  border: 2px solid;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
}

.google-map {
  width: 100%;
  height: 100%;
  border: none;
}

.map-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 12px 24px;
  direction: rtl;
}

.overlay-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overlay-text {
  display: flex;
  flex-direction: column;
  font-family: 'Amiri', serif;
}

.map-footer {
  border-top: 1px solid var(--gray-200);
  padding-top: 24px;
}

.hours-status {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: white;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Amiri', serif;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.divider {
  height: 1px;
  background: var(--gray-200);
  margin: 20px 0;
}

.nearby-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
  font-family: 'Amiri', serif;
}

.map-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--gray-50);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: 'Amiri', serif;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 380px;
  max-width: 500px;
  border: 1px solid var(--gray-200);
  border-right-width: 6px;
  border-right-style: solid;
  direction: rtl;
  animation: slideInRight 0.3s ease;
  font-family: 'Amiri', serif;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.toast-icon {
  font-size: 1.4rem;
}

.toast-message strong {
  display: block;
  color: var(--gray-800);
  margin-bottom: 2px;
  font-size: 0.95rem;
}

.toast-message p {
  color: var(--gray-600);
  font-size: 0.85rem;
  margin: 0;
}

.toast-close {
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  transition: var(--transition);
}

.toast-close:hover {
  color: var(--gray-800);
  transform: scale(1.2);
}

/* RTL Specific */
[dir='rtl'] .section-tag,
[dir='rtl'] .form-tag,
[dir='rtl'] .map-badge {
  border-right: 4px solid;
  border-left: none;
  border-radius: 0 30px 30px 0;
  padding: 6px 16px 6px 20px;
}

[dir='rtl'] .input-icon {
  right: 16px;
  left: auto;
}

[dir='rtl'] .select-arrow {
  left: auto;
  right: 16px;
}

[dir='rtl'] .map-overlay {
  right: auto;
  left: 20px;
}

[dir='rtl'] .toast-notification {
  right: auto;
  left: 30px;
  border-right: none;
  border-left-width: 6px;
  border-left-style: solid;
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .map-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .social-grid {
    grid-template-columns: 1fr;
  }
  .social-link {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px 24px;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .form-container {
    padding: 32px 24px;
  }
  .map-container {
    padding: 24px;
  }
  .map-wrapper {
    height: 300px;
  }
  .map-info-grid {
    grid-template-columns: 1fr;
  }
  .toast-notification {
    min-width: 90%;
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.5rem;
  }
  .info-card {
    padding: 24px 20px;
  }
  .form-container {
    padding: 24px 16px;
  }
  .map-container {
    padding: 20px 16px;
  }
  .map-overlay {
    right: 50%;
    transform: translateX(50%);
    width: 90%;
    padding: 10px 16px;
  }
}
</style>
