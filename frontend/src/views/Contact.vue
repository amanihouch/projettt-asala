<template>
  <div class="contact-page">
    <!-- ===== HERO SECTION - ÉLÉGANT & RAFFINÉ ===== -->
    <section class="contact-hero">
      <div class="hero-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge" data-aos="fade-down">
            <span class="badge-dot" style="background: #08717f"></span>
            <span class="badge-dot" style="background: #d40025"></span>
            <span class="badge-text">تواصل معنا</span>
          </div>

          <h1 class="hero-title" data-aos="fade-up" data-aos-delay="100">
            <span class="title-line">نحن هنا</span>
            <span class="title-line accent">في خدمتك</span>
          </h1>

          <p class="hero-description" data-aos="fade-up" data-aos-delay="200">
            فريقنا متاح للإجابة على استفساراتك ومساعدتك في أي وقت
          </p>
        </div>
      </div>

      <!-- Simple Wave Divider -->
      <div class="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,0 C480,50 960,50 1440,0 L1440,100 L0,100 Z"></path>
        </svg>
      </div>
    </section>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="contact-main">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header" data-aos="fade-up">
          <span class="section-tag" style="border-left-color: #d40025">اتصل بنا</span>
          <h2 class="section-title">معلومات <span style="color: #08717f">الاتصال</span></h2>
          <p class="section-subtitle">تواصل معنا عبر القنوات التالية وسنكون سعداء بخدمتك</p>
        </div>

        <!-- ===== INFO CARDS - DESIGN ÉLÉGANT ===== -->
        <div class="info-grid">
          <!-- Address Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="100">
            <div class="card-icon-wrapper" style="background: rgba(8, 113, 127, 0.1)">
              <div class="card-icon" style="color: #08717f">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
            </div>
            <h3 class="card-title">العنوان</h3>
            <p class="card-text">شارع طريق قابس، مدنين الشمالية</p>
            <p class="card-note">INFINITY Marketing & Production</p>
            <button class="card-action" @click="openInMaps" style="color: #08717f">
              <span>عرض على الخريطة</span>
              <span class="action-icon">←</span>
            </button>
          </div>

          <!-- Phone Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="200">
            <div class="card-icon-wrapper" style="background: rgba(212, 0, 37, 0.1)">
              <div class="card-icon" style="color: #d40025">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    d="M22 16.92v3a1.999 1.999 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
              </div>
            </div>
            <h3 class="card-title">الهاتف</h3>
            <a href="tel:+21692105505" class="card-link">21692105505+</a>
            <a href="tel:+966582522701" class="card-link">966582522701+</a>
            <div class="card-availability" style="color: #08717f">
              <span class="availability-dot"></span>
              <span>متاح الآن</span>
            </div>
          </div>

          <!-- Email Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="300">
            <div class="card-icon-wrapper" style="background: rgba(8, 113, 127, 0.1)">
              <div class="card-icon" style="color: #08717f">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>
            <h3 class="card-title">البريد الإلكتروني</h3>
            <a href="mailto:Infinity.tunisia@gmail.com" class="card-link"
              >Infinity.tunisia@gmail.com</a
            >
            <p class="card-note">نرد خلال 24 ساعة</p>
          </div>

          <!-- Hours Card -->
          <div class="info-card" data-aos="fade-up" data-aos-delay="400">
            <div class="card-icon-wrapper" style="background: rgba(212, 0, 37, 0.1)">
              <div class="card-icon" style="color: #d40025">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <h3 class="card-title">ساعات العمل</h3>
            <div class="hours-list">
              <div class="hour-item">
                <span>الأحد - الخميس</span>
                <span class="hour-badge" style="background: rgba(8, 113, 127, 0.1); color: #08717f"
                  >08:00 - 00:00</span
                >
              </div>
              <div class="hour-item">
                <span>الجمعة</span>
                <span class="hour-badge" style="background: rgba(8, 113, 127, 0.1); color: #08717f"
                  >08:00 - 12:00</span
                >
              </div>
              <div class="hour-item">
                <span>السبت</span>
                <span
                  class="hour-badge closed"
                  style="background: rgba(212, 0, 37, 0.1); color: #d40025"
                  >مغلق</span
                >
              </div>
            </div>
            <div class="current-time" style="color: #08717f">
              <span>التوقيت المحلي: {{ currentTime }}</span>
            </div>
          </div>
        </div>

        <!-- ===== SOCIAL MEDIA - ÉLÉGANT ===== -->
        <div class="social-section" data-aos="fade-up">
          <div class="social-header">
            <span class="social-line" style="background: #08717f"></span>
            <h3>تابعنا على</h3>
            <span class="social-line" style="background: #d40025"></span>
          </div>

          <div class="social-grid">
            <a href="#" class="social-link">
              <div class="social-icon" style="background: #1877f2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <span>فيسبوك</span>
            </a>
            <a href="#" class="social-link">
              <div
                class="social-icon"
                style="
                  background: radial-gradient(
                    circle at 30% 30%,
                    #fdf497,
                    #fdf497,
                    #fd5949,
                    #d6249f,
                    #285aeb
                  );
                "
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                </svg>
              </div>
              <span>انستغرام</span>
            </a>
            <a href="#" class="social-link">
              <div class="social-icon" style="background: #1da1f2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                  />
                </svg>
              </div>
              <span>تويتر</span>
            </a>
          </div>
        </div>

        <!-- ===== FORM SECTION - DESIGN ÉLÉGANT ===== -->
        <div class="form-section" ref="formSection" data-aos="fade-up">
          <div class="form-container">
            <div class="form-header">
              <div class="form-tag" style="border-left-color: #08717f">أرسل لنا</div>
              <h2 class="form-title">رسالة</h2>
              <p class="form-subtitle">سنتواصل معك في أقرب وقت ممكن</p>
            </div>

            <form @submit.prevent="submitForm" class="contact-form">
              <!-- 2 Columns Grid -->
              <div class="form-row">
                <div
                  class="form-group"
                  :class="{ focused: focusedField === 'name', 'has-error': errors.name }"
                >
                  <label for="name">الاسم الكامل</label>
                  <div class="input-wrapper">
                    <span class="input-icon">👤</span>
                    <input
                      type="text"
                      id="name"
                      v-model="form.name"
                      @focus="focusedField = 'name'"
                      @blur="focusedField = null"
                      placeholder="أدخل اسمك الكامل"
                    />
                    <div class="input-border" style="background: #08717f"></div>
                  </div>
                  <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div
                  class="form-group"
                  :class="{ focused: focusedField === 'email', 'has-error': errors.email }"
                >
                  <label for="email">البريد الإلكتروني</label>
                  <div class="input-wrapper">
                    <span class="input-icon">✉️</span>
                    <input
                      type="email"
                      id="email"
                      v-model="form.email"
                      @focus="focusedField = 'email'"
                      @blur="focusedField = null"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                    <div class="input-border" style="background: #d40025"></div>
                  </div>
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group" :class="{ focused: focusedField === 'phone' }">
                  <label for="phone">رقم الهاتف (اختياري)</label>
                  <div class="input-wrapper">
                    <span class="input-icon">📞</span>
                    <input
                      type="tel"
                      id="phone"
                      v-model="form.phone"
                      @focus="focusedField = 'phone'"
                      @blur="focusedField = null"
                      placeholder="أدخل رقم هاتفك"
                    />
                    <div class="input-border" style="background: #08717f"></div>
                  </div>
                  <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>

                <div
                  class="form-group"
                  :class="{ focused: focusedField === 'subject', 'has-error': errors.subject }"
                >
                  <label for="subject">الموضوع</label>
                  <div class="input-wrapper">
                    <span class="input-icon">📌</span>
                    <select
                      id="subject"
                      v-model="form.subject"
                      @focus="focusedField = 'subject'"
                      @blur="focusedField = null"
                    >
                      <option value="" disabled selected>اختر الموضوع</option>
                      <option value="general">استفسار عام</option>
                      <option value="support">دعم فني</option>
                      <option value="partnership">شراكة</option>
                      <option value="complaint">شكوى</option>
                      <option value="other">أخرى</option>
                    </select>
                    <span class="select-arrow">▼</span>
                    <div class="input-border" style="background: #d40025"></div>
                  </div>
                  <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
                </div>
              </div>

              <!-- Message Field - Full Width -->
              <div
                class="form-group full-width"
                :class="{ focused: focusedField === 'message', 'has-error': errors.message }"
              >
                <label for="message">الرسالة</label>
                <div class="input-wrapper">
                  <span class="input-icon">💬</span>
                  <textarea
                    id="message"
                    v-model="form.message"
                    @focus="focusedField = 'message'"
                    @blur="focusedField = null"
                    rows="4"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                  <div
                    class="input-border"
                    style="background: linear-gradient(90deg, #08717f, #d40025)"
                  ></div>
                </div>
                <div class="textarea-footer">
                  <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
                  <span class="char-count">{{ form.message.length }}/500</span>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="submit-btn"
                  :disabled="isSubmitting"
                  :style="{ background: 'linear-gradient(135deg, #08717f, #065a69)' }"
                >
                  <span v-if="isSubmitting" class="spinner"></span>
                  <span v-else>إرسال الرسالة</span>
                  <span class="btn-icon" v-if="!isSubmitting">←</span>
                </button>
                <p class="form-note">نحن نرد خلال 24 ساعة</p>
              </div>
            </form>
          </div>
        </div>

        <!-- ===== MAP SECTION - INFINITY MARKETING & PRODUCTION ===== -->
        <div class="map-section" data-aos="fade-up">
          <div class="map-container">
            <div class="map-header">
              <div class="map-badge-wrapper">
                <span class="map-badge" style="border-left-color: #08717f">📍 موقعنا</span>
                <span class="map-live" style="background: #08717f">مباشر</span>
              </div>
              <h3 class="map-title">INFINITY Marketing & Production</h3>
              <p class="map-address">شارع طريق قابس، مدنين الشمالية</p>

              <div class="map-actions">
                <a
                  href="https://maps.app.goo.gl/hME4kinoAf69PjHP8"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="map-btn"
                  style="background: #08717f"
                >
                  <span class="btn-icon">🗺️</span>
                  <span>فتح في خرائط Google</span>
                </a>
                <a
                  :href="`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('INFINITY Marketing & Production تونس')}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="map-btn-outline"
                  style="color: #08717f; border-color: #08717f"
                >
                  <span class="btn-icon">🧭</span>
                  <span>الحصول على الاتجاهات</span>
                </a>
              </div>
            </div>

            <!-- Google Maps Iframe - INFINITY Marketing & Production -->
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

              <!-- Map Overlay Info -->
              <div class="map-overlay">
                <div class="overlay-content">
                  <span class="overlay-icon">🏢</span>
                  <div class="overlay-text">
                    <strong>INFINITY Marketing & Production</strong>
                    <span>مدنين الشمالية</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Hours & Info -->
            <div class="map-footer">
              <div class="hours-status">
                <div class="status-badge" style="background: #10b981">
                  <span class="status-dot"></span>
                  <span>مفتوح الآن</span>
                </div>
                <div class="hours-today">
                  <span class="hours-icon">⏰</span>
                  <span>اليوم: 00:00–06:00 ● 08:00–00:00</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="nearby-title">
                <span class="nearby-dot" style="background: #08717f"></span>
                <span>معلومات إضافية:</span>
              </div>
              <div class="map-info-grid">
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <span>أيام العمل: الأحد - الخميس</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <span>ساعات العمل: 08:00 - 00:00</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <span>المنطقة: طريق قابس</span>
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

    <!-- ===== TOAST NOTIFICATION - ÉLÉGANT ===== -->
    <transition name="toast">
      <div
        v-if="toast.show"
        class="toast-notification"
        :class="toast.type"
        :style="{ borderRightColor: toast.type === 'success' ? '#08717f' : '#d40025' }"
      >
        <div class="toast-content">
          <span class="toast-icon">{{ toast.icon }}</span>
          <div class="toast-message">
            <strong>{{ toast.title }}</strong>
            <p>{{ toast.message }}</p>
          </div>
        </div>
        <button @click="toast.show = false" class="toast-close" aria-label="إغلاق">✕</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// ===== CONSTANTS =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

// Custom encode function (already exists in browser)
const encodeURIComponent = (str) => {
  return window.encodeURIComponent(str)
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
    newErrors.name = 'الاسم مطلوب'
  } else if (form.name.length < 3) {
    newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل'
  } else if (form.name.length > 50) {
    newErrors.name = 'الاسم طويل جداً (الحد الأقصى 50 حرف)'
  }

  if (!form.email.trim()) {
    newErrors.email = 'البريد الإلكتروني مطلوب'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = 'البريد الإلكتروني غير صحيح'
  }

  if (form.phone && !/^[\d\+\-\(\)\s]{8,}$/.test(form.phone.trim())) {
    newErrors.phone = 'رقم الهاتف غير صحيح'
  }

  if (!form.subject) {
    newErrors.subject = 'الرجاء اختيار الموضوع'
  }

  if (!form.message.trim()) {
    newErrors.message = 'الرسالة مطلوبة'
  } else if (form.message.length < 10) {
    newErrors.message = 'الرسالة قصيرة جداً (10 أحرف على الأقل)'
  } else if (form.message.length > 500) {
    newErrors.message = 'الرسالة طويلة جداً (الحد الأقصى 500 حرف)'
  }

  return newErrors
}

// ===== SUBMIT FORM =====
const submitForm = async () => {
  const newErrors = validateForm()

  if (Object.keys(newErrors).length > 0) {
    errors.value = newErrors
    showNotification('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج', 'error')

    // Scroll to first error
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
      timestamp: new Date().toISOString(),
      source: 'contact_page',
    }

    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'فشل في إرسال الرسالة')
    }

    const result = await response.json()

    // Reset form
    form.name = ''
    form.email = ''
    form.phone = ''
    form.subject = ''
    form.message = ''

    showNotification('تم إرسال الرسالة بنجاح', 'سنتواصل معك في أقرب وقت ممكن', 'success')

    // Clear any saved drafts
    localStorage.removeItem('contactFormDraft')
  } catch (error) {
    console.error('Contact form error:', error)
    showNotification(
      'خطأ في الإرسال',
      error.message || 'حدث خطأ ما، الرجاء المحاولة لاحقاً',
      'error',
    )
  } finally {
    isSubmitting.value = false
  }
}

// ===== NOTIFICATION =====
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

  // Auto hide after 5 seconds
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
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
      // Only load drafts less than 24 hours old
      if (draft.timestamp && Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
        form.name = draft.name || ''
        form.email = draft.email || ''
        form.phone = draft.phone || ''
        form.subject = draft.subject || ''
        form.message = draft.message || ''

        if (form.message || form.name || form.email) {
          showNotification('تم استعادة مسودة', 'لديك رسالة غير مكتملة', 'info')
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
onMounted(() => {
  // Load saved draft
  loadDraft()

  // Update time every second
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)

  // Simple Intersection Observer for animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate')
          // Unobserve after animation
          observer.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  )

  // Observe elements with data-aos attribute
  document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el))

  // Observe cards
  document.querySelectorAll('.info-card').forEach((el) => {
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    observer.observe(el)
  })

  // Watch form changes for autosave
  const unwatch = watch(
    () => ({ ...form }),
    () => {
      clearTimeout(autosaveTimer)
      autosaveTimer = setTimeout(autosaveForm, 2000)
    },
    { deep: true },
  )

  // Cleanup function
  onUnmounted(() => {
    observer.disconnect()
    clearInterval(timeInterval)
    clearTimeout(autosaveTimer)
    unwatch()
  })
})

// Import watch for autosave
import { watch } from 'vue'
</script>

<style scoped>
/* ===== CSS VARIABLES - COULEURS ÉLÉGANTES ===== */
.contact-page {
  --teal: #08717f;
  --teal-dark: #065a69;
  --teal-light: #e0f2f1;
  --teal-soft: rgba(8, 113, 127, 0.1);
  --red: #d40025;
  --red-dark: #b00020;
  --red-light: #ffe0e0;
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
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.08);
  --radius: 16px;
  --radius-sm: 8px;
  --radius-lg: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.contact-page {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: var(--gray-800);
  background: var(--white);
  line-height: 1.6;
  overflow-x: hidden;
  direction: rtl;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
}

/* ===== AOS ANIMATIONS ===== */
[data-aos] {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

[data-aos].aos-animate {
  opacity: 1;
  transform: translateY(0);
}

[data-aos='fade-down'].aos-animate {
  transform: translateY(0);
}

/* ===== HERO SECTION ===== */
.contact-hero {
  position: relative;
  background: linear-gradient(145deg, #0a1a1f, #031015);
  padding: 100px 0 120px;
  color: white;
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(8, 113, 127, 0.15) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(212, 0, 37, 0.1) 0%, transparent 30%);
  opacity: 0.6;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.badge-text {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0 4px;
}

.hero-title {
  margin-bottom: 20px;
}

.title-line {
  display: block;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  font-weight: 800;
  line-height: 1.2;
}

.title-line.accent {
  background: linear-gradient(135deg, #08717f, #d40025);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-top: 5px;
}

.hero-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
  font-weight: 400;
  line-height: 1.7;
}

.hero-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  line-height: 0;
}

.hero-wave svg {
  width: 100%;
  height: 50px;
  display: block;
}

/* ===== MAIN CONTENT ===== */
.contact-main {
  padding: 80px 0;
  background: var(--white);
}

/* ===== SECTION HEADER ===== */
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
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--gray-600);
  max-width: 600px;
  margin: 0 auto;
}

/* ===== INFO CARDS ===== */
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  border-color: transparent;
}

.card-icon-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin: 0 auto 20px;
  transition: var(--transition);
}

.info-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.card-icon {
  width: 32px;
  height: 32px;
  transition: var(--transition);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 12px;
}

.card-text {
  color: var(--gray-600);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 4px;
}

.card-note {
  font-size: 0.85rem;
  color: var(--gray-500);
  margin-top: 8px;
}

.card-link {
  display: block;
  color: var(--gray-600);
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 4px;
  transition: var(--transition);
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
}

.card-action:hover {
  background: var(--teal);
  color: white !important;
}

.card-action:hover .action-icon {
  transform: translateX(4px);
}

.action-icon {
  transition: var(--transition);
}

.card-availability {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.availability-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
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
}

.hour-badge {
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
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
}

/* ===== SOCIAL SECTION ===== */
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
  margin: 0;
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
  transition: var(--transition);
}

.social-link:hover .social-icon {
  transform: scale(1.1) rotate(8deg);
}

.social-link span {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-700);
}

/* ===== FORM SECTION ===== */
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
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--gray-600);
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

input,
select,
textarea {
  width: 100%;
  padding: 14px 48px 14px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--gray-800);
  background: var(--white);
  transition: var(--transition);
  direction: rtl;
}

input:focus,
select:focus,
textarea:focus {
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
  transition: var(--transition);
}

.form-group.focused .select-arrow {
  color: var(--teal);
  transform: translateY(2px);
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
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(8, 113, 127, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
  transition: var(--transition);
}

.submit-btn:hover .btn-icon {
  transform: translateX(-5px);
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
  to {
    transform: rotate(360deg);
  }
}

.form-note {
  margin-top: 20px;
  color: var(--gray-500);
  font-size: 0.85rem;
}

/* ===== MAP SECTION - INFINITY MARKETING ===== */
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
}

.map-live {
  padding: 4px 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
  animation: livePulse 1.5s infinite;
}

@keyframes livePulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.map-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 8px;
}

.map-address {
  color: var(--gray-600);
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.map-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.map-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
}

.map-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(8, 113, 127, 0.3);
}

.map-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: 2px solid;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
}

.map-btn-outline:hover {
  background: var(--teal);
  color: white !important;
  border-color: var(--teal);
  transform: translateY(-3px);
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  direction: rtl;
}

.overlay-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overlay-icon {
  font-size: 1.5rem;
}

.overlay-text {
  display: flex;
  flex-direction: column;
}

.overlay-text strong {
  font-size: 1rem;
  color: var(--gray-800);
}

.overlay-text span {
  font-size: 0.8rem;
  color: var(--gray-600);
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
}

.status-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.hours-today {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-700);
  font-size: 0.95rem;
  font-weight: 500;
}

.hours-icon {
  font-size: 1.1rem;
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
}

.nearby-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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
  color: var(--gray-700);
}

.info-icon {
  font-size: 1.1rem;
  color: var(--teal);
}

/* ===== TOAST NOTIFICATION ===== */
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ===== RTL SPECIFIC STYLES ===== */
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

[dir='rtl'] .card-link:hover {
  transform: translateX(-4px);
}

[dir='rtl'] .card-action:hover .action-icon {
  transform: translateX(-4px);
}

[dir='rtl'] .map-overlay {
  right: auto;
  left: 20px;
}

[dir='rtl'] .submit-btn:hover .btn-icon {
  transform: translateX(5px);
}

[dir='rtl'] .toast-notification {
  right: auto;
  left: 30px;
  border-right: none;
  border-left-width: 6px;
  border-left-style: solid;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .map-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contact-hero {
    padding: 80px 0 100px;
  }

  .hero-title {
    font-size: clamp(2rem, 5vw, 2.8rem);
  }

  .hero-description {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
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
    gap: 20px;
  }

  .form-container {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 1.6rem;
  }

  .submit-btn {
    width: 100%;
  }

  .map-container {
    padding: 24px;
  }

  .map-title {
    font-size: 1.5rem;
  }

  .map-address {
    font-size: 1rem;
  }

  .map-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .map-btn,
  .map-btn-outline {
    justify-content: center;
  }

  .map-wrapper {
    height: 300px;
  }

  .hours-status {
    flex-direction: column;
    align-items: flex-start;
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
  .hero-badge {
    padding: 8px 16px;
  }

  .badge-text {
    font-size: 0.85rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .info-card {
    padding: 24px 20px;
  }

  .form-container {
    padding: 24px 16px;
  }

  .form-title {
    font-size: 1.4rem;
  }

  .map-container {
    padding: 20px 16px;
  }

  .map-title {
    font-size: 1.3rem;
  }

  .map-overlay {
    right: 50%;
    transform: translateX(50%);
    width: 90%;
    padding: 10px 16px;
  }

  .overlay-text strong {
    font-size: 0.9rem;
  }

  .overlay-text span {
    font-size: 0.75rem;
  }

  .toast-notification {
    padding: 14px 18px;
  }

  .toast-message strong {
    font-size: 0.9rem;
  }

  .toast-message p {
    font-size: 0.8rem;
  }
}

/* ===== PRINT STYLES ===== */
@media print {
  .contact-hero {
    background: none;
    color: black;
    padding: 40px 0;
  }

  .hero-pattern,
  .hero-wave,
  .map-actions,
  .card-action,
  .toast-notification,
  .social-section,
  .form-section {
    display: none;
  }

  .title-line.accent {
    -webkit-text-fill-color: #08717f;
    background: none;
  }

  .info-card,
  .map-container {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }

  .google-map {
    filter: grayscale(100%);
    border: 1px solid #ddd;
  }

  .map-overlay {
    border: 1px solid #ddd;
    background: white;
  }

  a {
    text-decoration: none;
    color: black;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 2px;
}

/* ===== UTILITY CLASSES ===== */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
