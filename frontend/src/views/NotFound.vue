<template>
  <div class="not-found-page">
    <div class="error-container">
      <!-- Animation SVG moderne -->
      <div class="error-illustration">
        <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" class="illustration-svg">
          <!-- Background elements -->
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #1e40af; stop-opacity: 1" />
              <stop offset="100%" style="stop-color: #7c3aed; stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: #f59e0b; stop-opacity: 0.8" />
              <stop offset="100%" style="stop-color: #ef4444; stop-opacity: 0.8" />
            </linearGradient>
          </defs>

          <!-- Floating circles background -->
          <circle cx="100" cy="100" r="60" fill="url(#grad1)" opacity="0.1" class="float-1" />
          <circle cx="700" cy="150" r="80" fill="url(#grad2)" opacity="0.1" class="float-2" />
          <circle cx="650" cy="500" r="50" fill="url(#grad1)" opacity="0.1" class="float-3" />

          <!-- Main 404 illustration -->
          <g class="main-404">
            <!-- First 4 -->
            <path
              d="M 150 250 L 150 350 L 200 300 L 200 450 L 230 450 L 230 250 Z"
              fill="url(#grad1)"
              class="number-4-1"
            />

            <!-- 0 -->
            <circle
              cx="400"
              cy="350"
              r="80"
              fill="none"
              stroke="url(#grad2)"
              stroke-width="30"
              class="number-0"
            />
            <circle cx="400" cy="350" r="30" fill="url(#grad2)" class="number-0-center" />

            <!-- Second 4 -->
            <path
              d="M 550 250 L 550 350 L 600 300 L 600 450 L 630 450 L 630 250 Z"
              fill="url(#grad1)"
              class="number-4-2"
            />
          </g>

          <!-- Decorative elements -->
          <path
            d="M 300 500 Q 400 480 500 500"
            stroke="#94a3b8"
            stroke-width="3"
            fill="none"
            stroke-dasharray="10,5"
            class="deco-line"
          />
        </svg>
      </div>

      <!-- Content -->
      <div class="error-content">
        <div class="error-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Erreur 404</span>
        </div>

        <h1 class="error-title">Page introuvable</h1>
        <p class="error-description">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou
          retournez à l'accueil.
        </p>

        <!-- Action buttons -->
        <div class="error-actions">
          <router-link to="/" class="btn btn-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
              />
            </svg>
            Retour à l'accueil
          </router-link>

          <button @click="goBack" class="btn btn-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            Page précédente
          </button>
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <p class="quick-links-title">Pages populaires :</p>
          <div class="quick-links-grid">
            <router-link to="/products" class="quick-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="quick-link-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                />
              </svg>
              Produits
            </router-link>

            <router-link to="/about" class="quick-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="quick-link-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              À propos
            </router-link>

            <router-link to="/contact" class="quick-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="quick-link-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact
            </router-link>

            <router-link to="/become-vendor" class="quick-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="quick-link-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
                <path
                  d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"
                />
              </svg>
              Devenir vendeur
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()

    const goBack = () => {
      if (window.history.length > 2) {
        router.back()
      } else {
        router.push('/')
      }
    }

    return {
      goBack,
    }
  },
}
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

/* Background animation */
.not-found-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: backgroundMove 20s linear infinite;
  pointer-events: none;
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.error-container {
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  position: relative;
  z-index: 1;
}

/* SVG Illustration */
.error-illustration {
  width: 100%;
  max-width: 600px;
  height: auto;
}

.illustration-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
}

/* SVG Animations */
.float-1 {
  animation: float 6s ease-in-out infinite;
}

.float-2 {
  animation: float 8s ease-in-out infinite 1s;
}

.float-3 {
  animation: float 7s ease-in-out infinite 0.5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.number-4-1,
.number-4-2 {
  animation: scaleIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.number-0 {
  animation: drawCircle 1.5s ease-out;
  stroke-dasharray: 502;
  stroke-dashoffset: 502;
}

@keyframes drawCircle {
  to {
    stroke-dashoffset: 0;
  }
}

.number-0-center {
  animation: popIn 0.5s ease-out 1s backwards;
}

@keyframes popIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.deco-line {
  animation: dash 3s ease-in-out infinite;
  stroke-dasharray: 100;
}

@keyframes dash {
  0%,
  100% {
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dashoffset: 200;
  }
}

/* Content */
.error-content {
  text-align: center;
  animation: fadeInUp 0.8s ease-out 0.3s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.1);
}

.error-badge .icon {
  width: 20px;
  height: 20px;
}

.error-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.2;
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-description {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}

/* Buttons */
.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

/* Quick Links */
.quick-links {
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;
}

.quick-links-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  max-width: 700px;
  margin: 0 auto;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: #475569;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.quick-link:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
}

.quick-link-icon {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}

.quick-link:hover .quick-link-icon {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .error-illustration {
    max-width: 400px;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .quick-links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Dark mode support (optionnel) */
@media (prefers-color-scheme: dark) {
  .not-found-page {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  }

  .error-title {
    color: #f1f5f9;
  }

  .error-description {
    color: #94a3b8;
  }

  .quick-link {
    background: #1e293b;
    border-color: #334155;
    color: #cbd5e1;
  }

  .btn-secondary {
    background: #1e293b;
    color: #cbd5e1;
    border-color: #334155;
  }
}
</style>
