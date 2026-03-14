<!-- src/views/admin/Settings.vue -->
<template>
  <div class="admin-page">
    <header class="page-header">
      <h1 class="page-title">الإعدادات</h1>
      <p class="page-subtitle">تخصيص إعدادات المنصة</p>
    </header>

    <div class="page-content">
      <div class="settings-grid">
        <!-- General Settings -->
        <div class="settings-card">
          <h3 class="card-title">الإعدادات العامة</h3>

          <div class="setting-item">
            <label class="setting-label">اسم الموقع</label>
            <input type="text" v-model="settings.siteName" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">وصف الموقع</label>
            <textarea v-model="settings.siteDescription" class="setting-textarea"></textarea>
          </div>

          <div class="setting-item">
            <label class="setting-label">البريد الإلكتروني للتواصل</label>
            <input type="email" v-model="settings.contactEmail" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">رقم الهاتف</label>
            <input type="tel" v-model="settings.contactPhone" class="setting-input" />
          </div>
        </div>

        <!-- Shipping Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات الشحن</h3>

          <div class="setting-item">
            <label class="setting-label">تكلفة الشحن الافتراضية</label>
            <input type="number" v-model="settings.defaultShipping" class="setting-input" />
          </div>

          <div class="setting-item">
            <label class="setting-label">الشحن المجاني (من)</label>
            <input type="number" v-model="settings.freeShippingFrom" class="setting-input" />
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="settings-card">
          <h3 class="card-title">إعدادات الدفع</h3>

          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.cashOnDelivery" />
              الدفع عند الاستلام
            </label>
          </div>

          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" v-model="settings.onlinePayment" />
              الدفع الإلكتروني
            </label>
          </div>
        </div>

        <!-- Save Button -->
        <div class="save-section">
          <button class="btn-save" @click="saveSettings">حفظ الإعدادات</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  siteName: 'توراث',
  siteDescription: 'منصة الحرف اليدوية التونسية',
  contactEmail: 'contact@turath.tn',
  contactPhone: '+216 12 345 678',
  defaultShipping: 7,
  freeShippingFrom: 100,
  cashOnDelivery: true,
  onlinePayment: false,
})

const saveSettings = () => {
  localStorage.setItem('admin_settings', JSON.stringify(settings.value))
  alert('تم حفظ الإعدادات بنجاح')
}

onMounted(() => {
  const saved = localStorage.getItem('admin_settings')
  if (saved) {
    settings.value = JSON.parse(saved)
  }
})
</script>
