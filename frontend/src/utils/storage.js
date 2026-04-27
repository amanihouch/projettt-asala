// src/utils/storage.js
// Utilitaire de stockage unifié avec fallback mémoire pour l'application Turath

/**
 * Vérifie si localStorage est disponible
 */
const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('⚠️ localStorage non disponible, utilisation du stockage mémoire');
    return false;
  }
};

// Stockage en mémoire comme fallback
const memoryStorage = new Map();

/**
 * Classe utilitaire pour la gestion du stockage
 */
export const StorageUtils = {
  isAvailable: isLocalStorageAvailable(),

  /**
   * Compresse les données en JSON minifié
   */
  compress: (data) => {
    try {
      const json = JSON.stringify(data);
      return json.replace(/\s+/g, ' ');
    } catch (error) {
      console.error('❌ Compression error:', error);
      return null;
    }
  },

  /**
   * Décompresse les données JSON
   */
  decompress: (compressed) => {
    try {
      return JSON.parse(compressed);
    } catch (error) {
      console.error('❌ Decompression error:', error);
      return null;
    }
  },

  /**
   * Sauvegarde une valeur dans le stockage
   */
  setItem: (key, data) => {
    try {
      // Toujours sauvegarder en mémoire
      memoryStorage.set(key, data);

      // Essayer de sauvegarder dans localStorage
      if (StorageUtils.isAvailable) {
        try {
          const compressed = StorageUtils.compress(data);
          if (compressed) {
            localStorage.setItem(key, compressed);
          }
        } catch (e) {
          console.warn(`⚠️ localStorage inaccessible pour ${key}:`, e.message);
        }
      }
      return true;
    } catch (error) {
      console.error(`❌ Erreur sauvegarde ${key}:`, error);
      return false;
    }
  },

  /**
   * Récupère une valeur du stockage
   * Priorité: localStorage → mémoire
   */
  getItem: (key) => {
    try {
      // Essayer localStorage d'abord
      if (StorageUtils.isAvailable) {
        const compressed = localStorage.getItem(key);
        if (compressed) {
          const decompressed = StorageUtils.decompress(compressed);
          if (decompressed !== null) {
            // Synchroniser avec la mémoire
            memoryStorage.set(key, decompressed);
            return decompressed;
          }
        }
      }

      // Fallback mémoire
      if (memoryStorage.has(key)) {
        return memoryStorage.get(key);
      }

      return null;
    } catch (error) {
      console.error(`❌ Erreur chargement ${key}:`, error);
      return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    }
  },

  /**
   * Supprime une valeur du stockage
   */
  removeItem: (key) => {
    try {
      if (StorageUtils.isAvailable) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`⚠️ Erreur suppression ${key}:`, e.message);
        }
      }
      memoryStorage.delete(key);
      return true;
    } catch (error) {
      console.error(`❌ Erreur suppression ${key}:`, error);
      memoryStorage.delete(key);
      return false;
    }
  },

  /**
   * Vide tout le stockage
   */
  clear: () => {
    try {
      if (StorageUtils.isAvailable) {
        try {
          localStorage.clear();
        } catch (e) {
          console.warn('⚠️ Erreur clear localStorage:', e.message);
        }
      }
      memoryStorage.clear();
      return true;
    } catch (error) {
      console.error('❌ Erreur clear:', error);
      memoryStorage.clear();
      return false;
    }
  },

  /**
   * Récupère l'utilisation du stockage
   */
  getStorageUsage: () => {
    let total = 0;

    // Calcul localStorage
    if (StorageUtils.isAvailable) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          total += (key?.length || 0) * 2 + (value?.length || 0) * 2;
        }
      } catch (e) {
        console.warn('⚠️ Erreur calcul utilisation localStorage:', e.message);
      }
    }

    // Calcul mémoire
    memoryStorage.forEach((value, key) => {
      try {
        const size = (key?.length || 0) * 2 + (JSON.stringify(value)?.length || 0) * 2;
        total += size;
      } catch (e) {
        // Ignorer les erreurs de sérialisation
      }
    });

    const maxSize = 5 * 1024 * 1024; // 5MB - limite typique de localStorage

    return {
      used: total,
      usedFormatted: StorageUtils.formatBytes(total),
      max: maxSize,
      maxFormatted: StorageUtils.formatBytes(maxSize),
      percentage: Math.round(Math.min((total / maxSize) * 100, 100))
    };
  },

  /**
   * Formate une taille en octets en format lisible
   */
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Vérifie si une clé existe
   */
  hasItem: (key) => {
    return memoryStorage.has(key) ||
           (StorageUtils.isAvailable && localStorage.getItem(key) !== null);
  },

  /**
   * Récupère toutes les clés du stockage
   */
  keys: () => {
    const keys = new Set();

    // Récupérer les clés de localStorage
    if (StorageUtils.isAvailable) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          keys.add(localStorage.key(i));
        }
      } catch (e) {
        console.warn('⚠️ Erreur récupération clés localStorage:', e.message);
      }
    }

    // Récupérer les clés de la mémoire
    memoryStorage.forEach((_, key) => keys.add(key));

    return Array.from(keys);
  },

  /**
   * Récupère toutes les données du stockage (utile pour le debug)
   */
  getAllData: () => {
    const data = {};
    const allKeys = StorageUtils.keys();

    for (const key of allKeys) {
      data[key] = StorageUtils.getItem(key);
    }

    return data;
  },

  /**
   * Nettoie les données expirées ou obsolètes
   */
  cleanup: () => {
    const now = Date.now();
    const keys = StorageUtils.keys();

    for (const key of keys) {
      // Nettoyer les données de session expirées
      if (key.startsWith('session_')) {
        const data = StorageUtils.getItem(key);
        if (data && data.expires && now > data.expires) {
          StorageUtils.removeItem(key);
        }
      }

      // Nettoyer les brouillons de formulaire de plus de 24h
      if (key.endsWith('Draft') || key.endsWith('FormDraft')) {
        const data = StorageUtils.getItem(key);
        if (data && data.timestamp && now - data.timestamp > 24 * 60 * 60 * 1000) {
          StorageUtils.removeItem(key);
        }
      }
    }

    return true;
  }
};

// Nettoyage automatique au démarrage
StorageUtils.cleanup();

export default StorageUtils;
