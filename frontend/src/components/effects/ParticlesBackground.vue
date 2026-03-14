<template>
  <div class="particles-container">
    <canvas ref="canvas" class="particles-canvas"></canvas>
    <div class="particles-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let particles = []
let animationFrame = null

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight
    this.size = Math.random() * 3 + 1
    this.speedX = Math.random() * 3 - 1.5
    this.speedY = Math.random() * 3 - 1.5
    this.color = `rgba(${Math.floor(Math.random() * 50 + 139)},
                      ${Math.floor(Math.random() * 50 + 69)},
                      ${Math.floor(Math.random() * 50 + 19)},
                      ${Math.random() * 0.5 + 0.1})`
    this.wobble = Math.random() * 2
    this.wobbleSpeed = Math.random() * 0.05
    this.wobbleOffset = Math.random() * Math.PI * 2
  }

  update() {
    this.x +=
      this.speedX + Math.sin(Date.now() * this.wobbleSpeed + this.wobbleOffset) * this.wobble
    this.y +=
      this.speedY + Math.cos(Date.now() * this.wobbleSpeed + this.wobbleOffset) * this.wobble

    if (this.x > canvas.value.width) this.x = 0
    else if (this.x < 0) this.x = canvas.value.width
    if (this.y > canvas.value.height) this.y = 0
    else if (this.y < 0) this.y = canvas.value.height
  }

  draw() {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // Effet de brillance
    ctx.shadowBlur = 15
    ctx.shadowColor = this.color
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

const initParticles = () => {
  const canvasWidth = canvas.value.width
  const canvasHeight = canvas.value.height

  particles = []
  for (let i = 0; i < 150; i++) {
    particles.push(new Particle(canvasWidth, canvasHeight))
  }
}

const connectParticles = () => {
  const maxDistance = 100
  const maxDistanceSquared = maxDistance * maxDistance

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared < maxDistanceSquared) {
        const distance = Math.sqrt(distanceSquared)
        ctx.strokeStyle = `rgba(139, 69, 19, ${0.2 * (1 - distance / maxDistance)})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }
}

const animate = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  particles.forEach((particle) => {
    particle.update()
    particle.draw()
  })

  connectParticles()

  animationFrame = requestAnimationFrame(animate)
}

const resizeCanvas = () => {
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  initParticles()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight

  initParticles()
  animate()

  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.particles-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -2;
  pointer-events: none;
}

.particles-canvas {
  width: 100%;
  height: 100%;
}

.particles-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(200, 91, 14, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(220, 123, 5, 0.1) 0%, transparent 50%);
}
</style>
