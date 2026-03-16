<!-- frontend/src/components/VendorCard.vue -->
<template>
  <div class="vendor-card" @click="goToVendor">
    <div class="vendor-cover">
      <img :src="vendor.coverImage || defaultCover" :alt="vendor.shopName">
      <div v-if="vendor.verified" class="verified-badge">✓</div>
    </div>

    <div class="vendor-info">
      <div class="vendor-avatar">
        <img :src="vendor.avatar || vendor.userAvatar || defaultAvatar" :alt="vendor.shopName">
      </div>

      <h3 class="vendor-name">{{ vendor.shopName }}</h3>
      <p class="vendor-specialty">{{ vendor.specialty }}</p>

      <div class="vendor-stats">
        <div class="stat">
          <span class="stat-value">{{ vendor.productsCount || 0 }}</span>
          <span class="stat-label">منتجات</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ vendor.followersCount || 0 }}</span>
          <span class="stat-label">متابعون</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ vendor.rating || 0 }}</span>
          <span class="stat-label">تقييم</span>
        </div>
      </div>

      <button class="view-profile-btn">
        عرض الملف الشخصي
        <span class="arrow">←</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  vendor: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const defaultAvatar = 'https://i.pravatar.cc/300'
const defaultCover = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400'

const goToVendor = () => {
  router.push(`/vendor/${props.vendor.id}`)
}
</script>

<style scoped>
.vendor-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.vendor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-color: #08717f;
}

.vendor-cover {
  position: relative;
  height: 100px;
  overflow: hidden;
}

.vendor-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #d40025;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  border: 2px solid white;
}

.vendor-info {
  padding: 20px;
  text-align: center;
  position: relative;
}

.vendor-avatar {
  width: 80px;
  height: 80px;
  margin: -50px auto 10px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  overflow: hidden;
}

.vendor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
}

.vendor-specialty {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.vendor-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.7rem;
  color: #64748b;
}

.view-profile-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #08717f, #065a69);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.view-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(8,113,127,0.3);
}

.arrow {
  font-size: 1.1rem;
}
</style>
