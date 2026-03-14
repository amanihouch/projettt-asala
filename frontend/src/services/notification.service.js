// src/services/notification.service.js
import { createApp, h } from 'vue'
import NotificationToast from '../components/NotificationToast.vue'

class NotificationService {
  constructor() {
    this.notifications = []
    this.container = null
    this.idCounter = 0
  }

  init() {
    if (this.container) return

    this.container = document.createElement('div')
    this.container.id = 'notification-container'
    document.body.appendChild(this.container)
  }

  show(options) {
    this.init()

    const id = ++this.idCounter
    const notification = {
      id,
      ...options,
      onClose: () => this.remove(id),
      onAction: options.onAction,
    }

    this.notifications.push(notification)
    this.render()

    return id
  }

  remove(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.render()
  }

  success(message, options = {}) {
    return this.show({
      type: 'success',
      message,
      title: options.title || 'نجاح',
      ...options,
    })
  }

  error(message, options = {}) {
    return this.show({
      type: 'error',
      message,
      title: options.title || 'خطأ',
      ...options,
    })
  }

  warning(message, options = {}) {
    return this.show({
      type: 'warning',
      message,
      title: options.title || 'تحذير',
      ...options,
    })
  }

  info(message, options = {}) {
    return this.show({
      type: 'info',
      message,
      title: options.title || 'معلومة',
      ...options,
    })
  }

  cart(message, options = {}) {
    return this.show({
      type: 'cart',
      message,
      title: options.title || 'السلة',
      ...options,
    })
  }

  wishlist(message, options = {}) {
    return this.show({
      type: 'wishlist',
      message,
      title: options.title || 'المفضلة',
      ...options,
    })
  }

  order(message, options = {}) {
    return this.show({
      type: 'order',
      message,
      title: options.title || 'الطلب',
      ...options,
    })
  }

  clearAll() {
    this.notifications = []
    this.render()
  }

  render() {
    if (!this.container) return

    this.container.innerHTML = ''

    this.notifications.forEach((notification) => {
      const app = createApp({
        render() {
          return h(NotificationToast, {
            key: notification.id,
            ...notification,
            onClose: () => {
              if (notification.onClose) notification.onClose()
              app.unmount()
            },
            onAction: notification.onAction,
          })
        },
      })

      const div = document.createElement('div')
      this.container.appendChild(div)
      app.mount(div)
    })
  }
}

export const notification = new NotificationService()

export default {
  install: (app) => {
    app.config.globalProperties.$notification = notification
    app.provide('notification', notification)
  },
}
