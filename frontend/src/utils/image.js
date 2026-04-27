// frontend/src/utils/image.js
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  import.meta.env.CLOUDINARY_CLOUD_NAME ||
  'djfj85bwe'

export const DEFAULT_AVATAR = 'https://i.pravatar.cc/300'
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200'
export const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/600x600/08717f/white?text=Produit'

/**
 * Vérifie si une valeur est une source d'image valide
 */
export const isValidImageValue = (value) => {
  if (!value) return false
  if (typeof value !== 'string') return false
  const normalized = value.trim()
  return normalized !== '' && normalized !== 'null' && normalized !== 'undefined'
}

/**
 * Extrait la valeur d'image d'un objet ou d'une chaîne
 */
const extractImageValue = (input) => {
  if (!input) return null
  if (typeof input === 'string') return input
  if (typeof input === 'object') {
    return (
      input.secure_url ||
      input.url ||
      input.public_id ||
      input.path ||
      input.image ||
      input.avatar ||
      input.coverImage ||
      null
    )
  }
  return null
}

/**
 * Construit une URL Cloudinary
 */
export const buildCloudinaryUrl = (publicId, transformations = 'f_auto,q_auto') => {
  if (!isValidImageValue(publicId) || !CLOUDINARY_CLOUD_NAME) return null

  const cleanPublicId = publicId.trim().replace(/^\/+/, '')

  if (cleanPublicId.startsWith('http://') || cleanPublicId.startsWith('https://')) {
    return cleanPublicId
  }

  const transformSegment = transformations ? `${transformations}/` : ''
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformSegment}${cleanPublicId}`
}

/**
 * Vérifie si une valeur ressemble à un asset local
 */
const looksLikeLocalAsset = (value) => {
  return /^(\/?uploads\/|\/?images\/|\/?storage\/|\/?public\/|\/?posts\/)/i.test(value)
}

/**
 * Vérifie si une valeur ressemble à un public_id Cloudinary
 */
const looksLikeCloudinaryPublicId = (value) => {
  if (!isValidImageValue(value)) return false
  if (value.startsWith('http://') || value.startsWith('https://')) return false
  if (value.startsWith('data:image')) return false
  if (looksLikeLocalAsset(value)) return false
  return value.includes('/') || /^[\w.-]+$/.test(value)
}

/**
 * Formate une URL d'image (version principale)
 */
export const formatImageUrl = (input, options = {}) => {
  const {
    fallback = null,
    transformations = 'f_auto,q_auto'
  } = options

  const value = extractImageValue(input)
  if (!isValidImageValue(value)) return fallback

  const normalized = value.trim()

  // URL absolue déjà
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized
  }

  // Image base64
  if (normalized.startsWith('data:image')) {
    return normalized
  }

  // Asset local
  if (looksLikeLocalAsset(normalized) || normalized.startsWith('/')) {
    return `${API_BASE_URL}/${normalized.replace(/^\/+/, '')}`
  }

  // Cloudinary
  if (looksLikeCloudinaryPublicId(normalized) && CLOUDINARY_CLOUD_NAME) {
    const cloudinaryUrl = buildCloudinaryUrl(normalized, transformations)
    if (cloudinaryUrl) return cloudinaryUrl
  }

  return `${API_BASE_URL}/${normalized.replace(/^\/+/, '')}`
}

/**
 * Formate l'avatar (version avec fallback)
 */
export const formatAvatarUrl = (input, fallback = DEFAULT_AVATAR) => {
  return formatImageUrl(input, {
    fallback,
    transformations: 'c_fill,g_face,h_300,w_300,f_auto,q_auto'
  })
}

/**
 * Formate l'image de couverture
 */
export const formatCoverUrl = (input, fallback = DEFAULT_COVER) => {
  return formatImageUrl(input, {
    fallback,
    transformations: 'c_fill,h_800,w_1600,f_auto,q_auto'
  })
}

/**
 * Formate l'image d'un produit
 */
export const formatProductImageUrl = (input, fallback = DEFAULT_PRODUCT_IMAGE) => {
  return formatImageUrl(input, {
    fallback,
    transformations: 'c_limit,h_1200,w_1200,f_auto,q_auto'
  })
}

/**
 * Trouve la première source d'image valide dans une liste
 */
export const getFirstValidImage = (...sources) => {
  for (const source of sources) {
    if (isValidImageValue(source)) {
      return source
    }
  }
  return null
}

/**
 * Formate l'avatar d'un utilisateur
 */
export const formatUserAvatar = (user) => {
  if (!user) return DEFAULT_AVATAR

  const avatarSource = getFirstValidImage(
    user.avatar,
    user.userAvatar,
    user.user_avatar,
    user.profileImage,
    user.profile_image,
    user.image,
    user.photoURL,
    user.photo_url
  )

  return formatAvatarUrl(avatarSource, DEFAULT_AVATAR)
}

/**
 * Formate l'avatar d'un vendeur (alias pour getAvatarImage)
 */
export const formatVendorAvatar = (vendor) => {
  if (!vendor) return DEFAULT_AVATAR

  const avatarSource = getFirstValidImage(
    vendor.userAvatar,
    vendor.avatar,
    vendor.avatar_url,
    vendor.user_avatar,
    vendor.profileImage,
    vendor.profile_image,
    vendor.image,
    vendor.logo,
    vendor.shopLogo,
    vendor.shop_logo,
    vendor.user?.avatar,
    vendor.user?.userAvatar
  )

  return formatAvatarUrl(avatarSource, DEFAULT_AVATAR)
}

/**
 * Alias pour formatVendorAvatar (compatibilité)
 */
export const getAvatarImage = (vendor, user = null) => {
  if (vendor) return formatVendorAvatar(vendor)
  if (user) return formatUserAvatar(user)
  return DEFAULT_AVATAR
}

/**
 * Formate l'image de couverture d'un vendeur
 */
export const formatVendorCover = (vendor) => {
  if (!vendor) return DEFAULT_COVER

  const coverSource = getFirstValidImage(
    vendor.coverImage,
    vendor.cover_image,
    vendor.cover,
    vendor.banner,
    vendor.shopCover,
    vendor.shop_cover,
    vendor.headerImage,
    vendor.header_image,
    vendor.background,
    vendor.backgroundImage
  )

  return formatCoverUrl(coverSource, DEFAULT_COVER)
}

/**
 * Alias pour formatVendorCover (compatibilité)
 */
export const getCoverImage = (vendor) => {
  return formatVendorCover(vendor)
}

/**
 * Formate une note (rating) pour l'affichage
 */
export const formatRating = (rating) => {
  if (!rating && rating !== 0) return 'جديد'
  const numRating = parseFloat(rating)
  if (isNaN(numRating)) return 'جديد'
  return numRating.toFixed(1)
}

/**
 * Formate les images d'un post/produit
 */
export const formatPostImages = (post) => {
  if (!post) return null

  const formatted = { ...post }

  // Image principale
  const mainImageSource = getFirstValidImage(
    post.image,
    post.mainImage,
    post.main_image,
    post.thumbnail,
    post.thumbnail_url,
    post.images?.[0]
  )
  formatted.image = formatProductImageUrl(mainImageSource, DEFAULT_PRODUCT_IMAGE)

  // Toutes les images
  if (post.images && Array.isArray(post.images)) {
    formatted.images = post.images.map(img => formatProductImageUrl(img, DEFAULT_PRODUCT_IMAGE)).filter(Boolean)
  } else if (post.image) {
    formatted.images = [formatProductImageUrl(post.image, DEFAULT_PRODUCT_IMAGE)]
  } else {
    formatted.images = []
  }

  // Avatar du vendeur
  formatted.vendorAvatar = formatVendorAvatar(post)

  return formatted
}

/**
 * Compresse une image avant upload (retourne base64)
 */
export const compressImage = (file, maxWidth = 800, maxSizeKB = 500) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Aucun fichier fourni'))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.9
        let compressed = canvas.toDataURL('image/jpeg', quality)

        while (compressed.length > maxSizeKB * 1024 && quality > 0.3) {
          quality -= 0.1
          compressed = canvas.toDataURL('image/jpeg', quality)
        }

        console.log(`📸 Image compressée: ${Math.round(file.size / 1024)}KB → ${Math.round(compressed.length / 1024)}KB`)
        resolve(compressed)
      }

      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }
  })
}

/**
 * Compresse une image et retourne un File
 */
export const compressImageToFile = async (file, maxWidth = 800, maxSizeKB = 500, filename = 'image.jpg') => {
  const base64 = await compressImage(file, maxWidth, maxSizeKB)
  const res = await fetch(base64)
  const blob = await res.blob()
  return new File([blob], filename, { type: 'image/jpeg' })
}

/**
 * Convertit une image base64 en File
 */
export const base64ToFile = async (base64, filename = 'image.jpg') => {
  const res = await fetch(base64)
  const blob = await res.blob()
  return new File([blob], filename, { type: 'image/jpeg' })
}

/**
 * Vérifie si une URL est une image valide
 */
export const isImageUrlValid = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(false)

    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

/**
 * Nettoie une URL d'image des paramètres de cache
 */
export const cleanImageUrl = (url) => {
  if (!url) return url
  if (url.includes('data:image')) return url
  return url.split('?')[0]
}

/**
 * Ajoute un timestamp pour éviter le cache
 */
export const bustCache = (url) => {
  if (!url) return url
  if (url.includes('data:image')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

/**
 * Récupère l'URL d'une image avec gestion des erreurs
 */
export const getSafeImageUrl = (input, fallback = DEFAULT_PRODUCT_IMAGE, options = {}) => {
  const { bustCache: bust = false, transformations } = options

  let url = formatImageUrl(input, { fallback, transformations })

  if (bust && url && !url.includes('data:image')) {
    url = bustCache(url)
  }

  return url || fallback
}

/**
 * Formate les images multiples d'un produit
 */
export const formatProductGallery = (product) => {
  if (!product) return []

  const images = []

  if (product.image) {
    images.push(getSafeImageUrl(product.image, DEFAULT_PRODUCT_IMAGE))
  }

  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      const formatted = getSafeImageUrl(img, DEFAULT_PRODUCT_IMAGE)
      if (!images.includes(formatted)) {
        images.push(formatted)
      }
    }
  }

  if (images.length === 0) {
    images.push(DEFAULT_PRODUCT_IMAGE)
  }

  return images
}

// Export par défaut pour faciliter l'import
export default {
  DEFAULT_AVATAR,
  DEFAULT_COVER,
  DEFAULT_PRODUCT_IMAGE,
  isValidImageValue,
  formatImageUrl,
  formatAvatarUrl,
  formatCoverUrl,
  formatProductImageUrl,
  getFirstValidImage,
  formatUserAvatar,
  formatVendorAvatar,
  getAvatarImage,
  formatVendorCover,
  getCoverImage,
  formatPostImages,
  compressImage,
  compressImageToFile,
  base64ToFile,
  formatRating,
  isImageUrlValid,
  cleanImageUrl,
  bustCache,
  getSafeImageUrl,
  formatProductGallery,
  buildCloudinaryUrl
}
