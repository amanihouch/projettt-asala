<!-- src/views/Shipping.vue -->
<template>
  <div class="shipping-page" dir="rtl">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">🚚 تفاصيل الشحن والتوصيل</h1>
        <p class="page-subtitle">تعرف على طرق الشحن وأوقات التوصيل المتوفرة</p>
      </div>
    </div>

    <div class="container">
      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🚚</div>
          <div class="stat-content">
            <span class="stat-value">2-5</span>
            <span class="stat-label">أيام عمل</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📍</div>
          <div class="stat-content">
            <span class="stat-value">24</span>
            <span class="stat-label">ولاية</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-value">7-15</span>
            <span class="stat-label">د.ت تكلفة الشحن</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-content">
            <span class="stat-value">الدفع</span>
            <span class="stat-label">عند الاستلام</span>
          </div>
        </div>
      </div>

      <!-- Shipping Methods -->
      <div class="section-title">
        <h2>طرق الشحن المتاحة</h2>
        <p>اختر طريقة الشحن التي تناسبك</p>
      </div>

      <div class="shipping-methods">
        <div class="method-card standard">
          <div class="method-icon">
            <span class="emoji">📦</span>
          </div>
          <div class="method-content">
            <h3>شحن عادي</h3>
            <p class="method-desc">توصيل خلال 3-5 أيام عمل إلى جميع الولايات</p>
            <div class="method-price">
              <span class="price-label">التكلفة:</span>
              <span class="price-value">7 - 12 د.ت</span>
            </div>
          </div>
          <div class="method-badge">الأكثر استخداماً</div>
        </div>

        <div class="method-card express">
          <div class="method-icon">
            <span class="emoji">⚡</span>
          </div>
          <div class="method-content">
            <h3>شحن سريع</h3>
            <p class="method-desc">توصيل خلال 1-2 أيام عمل (متوفر في المدن الكبرى)</p>
            <div class="method-price">
              <span class="price-label">التكلفة:</span>
              <span class="price-value">12 - 18 د.ت</span>
            </div>
          </div>
          <div class="method-badge">سريع</div>
        </div>

        <div class="method-card pickup">
          <div class="method-icon">
            <span class="emoji">🏪</span>
          </div>
          <div class="method-content">
            <h3>استلام من المتجر</h3>
            <p class="method-desc">استلم طلبك مباشرة من متجر البائع</p>
            <div class="method-price">
              <span class="price-label">التكلفة:</span>
              <span class="price-value">مجاناً</span>
            </div>
          </div>
          <div class="method-badge">مجاني</div>
        </div>
      </div>

      <!-- Shipping Prices by Governorate -->
      <div class="section-title">
        <h2>تكلفة الشحن حسب الولاية</h2>
        <p>أسعار الشحن العادي لجميع ولايات الجمهورية</p>
      </div>

      <div class="prices-table">
        <table>
          <thead>
            <tr>
              <th>الولاية</th>
              <th>تكلفة الشحن</th>
              <th>مدة التوصيل</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gov in governorates" :key="gov.name">
              <td>
                <span class="gov-name">{{ gov.name }}</span>
              </td>
              <td>
                <span class="gov-price">{{ gov.price }} د.ت</span>
              </td>
              <td>
                <span class="gov-time">{{ gov.time }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment Methods -->
      <div class="section-title">
        <h2>طرق الدفع</h2>
        <p>نوفر لك طرق دفع آمنة ومريحة</p>
      </div>

      <div class="payment-methods">
        <div class="payment-card">
          <div class="payment-icon">💵</div>
          <div class="payment-content">
            <h3>الدفع عند الاستلام</h3>
            <p>ادفع نقداً عند استلام الطلب مباشرة</p>
          </div>
          <div class="payment-badge">متوفر</div>
        </div>

        <div class="payment-card">
          <div class="payment-icon">💳</div>
          <div class="payment-content">
            <h3>بطاقة بنكية</h3>
            <p>ادفع عبر الإنترنت ببطاقتك البنكية</p>
          </div>
          <div class="payment-badge">قريباً</div>
        </div>

        <div class="payment-card">
          <div class="payment-icon">📱</div>
          <div class="payment-content">
            <h3>محفظة إلكترونية</h3>
            <p>ادفع عبر تطبيقات الدفع الإلكتروني</p>
          </div>
          <div class="payment-badge">قريباً</div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="section-title">
        <h2>أسئلة شائعة</h2>
        <p>أجوبة على أكثر الأسئلة شيوعاً</p>
      </div>

      <div class="faq-section">
        <div class="faq-item" v-for="(item, index) in faq" :key="index">
          <div class="faq-question" @click="toggleFaq(index)">
            <span class="faq-icon">{{ openFaqs.includes(index) ? '➖' : '➕' }}</span>
            <h3>{{ item.question }}</h3>
          </div>
          <transition name="faq">
            <div v-if="openFaqs.includes(index)" class="faq-answer">
              <p>{{ item.answer }}</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta-section">
        <h3>هل لديك استفسار آخر؟</h3>
        <p>تواصل مع فريق الدعم لدينا</p>
        <div class="cta-buttons">
          <button class="cta-btn whatsapp" @click="contactWhatsApp">
            <span class="btn-icon">📱</span>
            <span>واتساب</span>
          </button>
          <button class="cta-btn email" @click="contactEmail">
            <span class="btn-icon">📧</span>
            <span>بريد إلكتروني</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// États pour les FAQs
const openFaqs = ref([])

// Liste des gouvernorats avec prix
const governorates = ref([
  { name: 'تونس', price: 7, time: '2-3 أيام' },
  { name: 'أريانة', price: 7, time: '2-3 أيام' },
  { name: 'بن عروس', price: 7, time: '2-3 أيام' },
  { name: 'منوبة', price: 7, time: '2-3 أيام' },
  { name: 'نابل', price: 8, time: '2-3 أيام' },
  { name: 'زغوان', price: 8, time: '2-4 أيام' },
  { name: 'بنزرت', price: 8, time: '2-4 أيام' },
  { name: 'باجة', price: 9, time: '3-4 أيام' },
  { name: 'جندوبة', price: 9, time: '3-4 أيام' },
  { name: 'الكاف', price: 9, time: '3-4 أيام' },
  { name: 'سليانة', price: 9, time: '3-4 أيام' },
  { name: 'سوسة', price: 8, time: '2-3 أيام' },
  { name: 'المنستير', price: 8, time: '2-3 أيام' },
  { name: 'المهدية', price: 9, time: '3-4 أيام' },
  { name: 'صفاقس', price: 8, time: '2-3 أيام' },
  { name: 'القيروان', price: 9, time: '3-4 أيام' },
  { name: 'القصرين', price: 10, time: '3-5 أيام' },
  { name: 'سيدي بوزيد', price: 10, time: '3-5 أيام' },
  { name: 'قفصة', price: 10, time: '3-5 أيام' },
  { name: 'توزر', price: 12, time: '4-5 أيام' },
  { name: 'قبلي', price: 12, time: '4-5 أيام' },
  { name: 'تطاوين', price: 12, time: '4-5 أيام' },
  { name: 'مدنين', price: 10, time: '3-4 أيام' },
  { name: 'قابس', price: 10, time: '3-4 أيام' }
])

// FAQ
const faq = ref([
  {
    question: 'كم تستغرق عملية التوصيل؟',
    answer: 'مدة التوصيل تتراوح بين 2 إلى 5 أيام عمل حسب الولاية. المناطق القريبة من العاصمة تستغرق وقتاً أقل، بينما المناطق البعيدة قد تستغرق وقتاً أطول قليلاً.'
  },
  {
    question: 'هل يمكن تتبع الطلب؟',
    answer: 'نعم، يمكنك تتبع طلبك من خلال حسابك الشخصي. سنقوم بإرسال رمز تتبع عبر البريد الإلكتروني والرسائل النصية عند شحن طلبك.'
  },
  {
    question: 'ماذا لو لم أكن في المنزل عند التوصيل؟',
    answer: 'سيقوم مندوب التوصيل بمحاولة الاتصال بك. يمكنك تنسيق موعد آخر للتوصيل أو اختيار استلام الطلب من أقرب مكتب بريد.'
  },
  {
    question: 'هل الشحن متوفر لجميع الولايات؟',
    answer: 'نعم، نوفر خدمة الشحن لجميع الولايات التونسية الـ 24. تختلف تكلفة الشحن حسب بعد المنطقة.'
  },
  {
    question: 'كيف يمكنني الدفع؟',
    answer: 'نوفر حالياً الدفع عند الاستلام نقداً. قريباً سنوفر خيارات دفع إضافية مثل البطاقات البنكية والمحافظ الإلكترونية.'
  }
])

// Méthodes
const toggleFaq = (index) => {
  if (openFaqs.value.includes(index)) {
    openFaqs.value = openFaqs.value.filter(i => i !== index)
  } else {
    openFaqs.value.push(index)
  }
}

const contactWhatsApp = () => {
  window.open('https://wa.me/21612345678', '_blank')
}

const contactEmail = () => {
  window.location.href = 'mailto:contact@asala.tn?subject=استفسار%20عن%20الشحن'
}
</script>

<style scoped>
.shipping-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.95;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 50px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(8, 113, 127, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: #e0f2f1;
  color: #08717f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 5px;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* Section Title */
.section-title {
  text-align: center;
  margin-bottom: 40px;
}

.section-title h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.section-title p {
  color: #64748b;
  font-size: 1.1rem;
}

/* Shipping Methods */
.shipping-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 60px;
}

.method-card {
  background: white;
  border-radius: 24px;
  padding: 30px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.method-card.standard {
  border-color: #08717f;
}

.method-card.express {
  border-color: #d40025;
}

.method-card.pickup {
  border-color: #10b981;
}

.method-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.method-icon {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.method-icon .emoji {
  font-size: 2.5rem;
}

.method-content h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 10px;
  font-weight: 700;
}

.method-desc {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 15px;
  min-height: 60px;
}

.method-price {
  padding: 10px;
  background: #f8fafc;
  border-radius: 30px;
  display: inline-block;
}

.price-label {
  color: #64748b;
  margin-left: 5px;
}

.price-value {
  font-weight: 700;
  color: #d40025;
  font-size: 1.1rem;
}

.method-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.method-card.standard .method-badge {
  background: #08717f;
}

.method-card.express .method-badge {
  background: #d40025;
}

.method-card.pickup .method-badge {
  background: #10b981;
}

/* Prices Table */
.prices-table {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 60px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
}

th {
  padding: 15px 20px;
  font-weight: 600;
  text-align: right;
}

td {
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

tr:hover td {
  background: #f8fafc;
}

.gov-name {
  font-weight: 600;
  color: #1e293b;
}

.gov-price {
  font-weight: 700;
  color: #d40025;
}

.gov-time {
  color: #08717f;
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 60px;
}

.payment-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
}

.payment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.payment-icon {
  width: 60px;
  height: 60px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.payment-content {
  flex: 1;
}

.payment-content h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 5px;
  font-weight: 600;
}

.payment-content p {
  color: #64748b;
  font-size: 0.9rem;
}

.payment-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  background: #e2e8f0;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 600;
}

/* FAQ Section */
.faq-section {
  max-width: 800px;
  margin: 0 auto 60px;
}

.faq-item {
  background: white;
  border-radius: 16px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.faq-question {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-question:hover {
  background: #f8fafc;
}

.faq-icon {
  font-size: 1.2rem;
  color: #08717f;
}

.faq-question h3 {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
  margin: 0;
}

.faq-answer {
  padding: 0 20px 20px 45px;
  color: #64748b;
  line-height: 1.6;
}

.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 20px;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #08717f, #065a69);
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.cta-section h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.cta-section p {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.cta-btn {
  padding: 15px 40px;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.cta-btn.whatsapp {
  background: #25d366;
  color: white;
}

.cta-btn.whatsapp:hover {
  background: #20ba5a;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
}

.cta-btn.email {
  background: white;
  color: #1e293b;
}

.cta-btn.email:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.3rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .shipping-methods {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-methods {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .shipping-methods {
    grid-template-columns: 1fr;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 30px;
  }

  .cta-section h3 {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-btn {
    width: 100%;
    justify-content: center;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .method-card {
    padding: 20px;
  }

  .payment-card {
    flex-direction: column;
    text-align: center;
  }

  .payment-badge {
    position: static;
    display: inline-block;
    margin-top: 10px;
  }

  .faq-question h3 {
    font-size: 1rem;
  }
}
</style>
