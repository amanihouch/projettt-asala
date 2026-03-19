// backend/src/models/Newsletter.js
const db = require('./db');

const Newsletter = {
  // ===== S'ABONNER À LA NEWSLETTER =====
  async subscribe(email) {
    try {
      console.log(`📧 Tentative d'abonnement: ${email}`);

      // Vérifier si l'email existe déjà
      const existing = await db.getOne(
        'SELECT * FROM newsletter WHERE email = ?',
        [email]
      );

      if (existing) {
        // Si l'email existe mais est désactivé, le réactiver
        if (!existing.is_active) {
          await db.query(
            'UPDATE newsletter SET is_active = TRUE, updated_at = NOW() WHERE email = ?',
            [email]
          );
          console.log(`✅ Email réactivé: ${email}`);
          return { 
            success: true, 
            message: 'تم إعادة تفعيل الاشتراك بنجاح',
            isNew: false 
          };
        }
        
        // Si l'email est déjà actif
        console.log(`⚠️ Email déjà abonné: ${email}`);
        return { 
          success: false, 
          message: 'هذا البريد الإلكتروني مسجل بالفعل',
          isNew: false 
        };
      }

      // Ajouter le nouvel email
      const sql = 'INSERT INTO newsletter (email) VALUES (?)';
      await db.insert(sql, [email]);
      
      console.log(`✅ Nouvel abonné ajouté: ${email}`);
      return { 
        success: true, 
        message: 'تم الاشتراك في النشرة البريدية بنجاح',
        isNew: true 
      };

    } catch (error) {
      console.error('❌ Erreur Newsletter.subscribe:', error);
      throw error;
    }
  },

  // ===== SE DÉSABONNER =====
  async unsubscribe(email) {
    try {
      console.log(`📧 Tentative de désabonnement: ${email}`);

      const result = await db.query(
        'UPDATE newsletter SET is_active = FALSE, updated_at = NOW() WHERE email = ?',
        [email]
      );
      
      const success = result.affectedRows > 0;
      
      if (success) {
        console.log(`✅ Désabonnement réussi: ${email}`);
      } else {
        console.log(`⚠️ Email non trouvé: ${email}`);
      }
      
      return success;

    } catch (error) {
      console.error('❌ Erreur Newsletter.unsubscribe:', error);
      throw error;
    }
  },

  // ===== RÉCUPÉRER TOUS LES EMAILS ACTIFS =====
  async getActiveEmails() {
    try {
      const sql = `
        SELECT email, subscribed_at 
        FROM newsletter 
        WHERE is_active = TRUE 
        ORDER BY subscribed_at DESC
      `;
      return await db.query(sql);

    } catch (error) {
      console.error('❌ Erreur Newsletter.getActiveEmails:', error);
      return [];
    }
  },

  // ===== RÉCUPÉRER TOUS LES EMAILS (admin) =====
  async getAllEmails() {
    try {
      const sql = `
        SELECT id, email, is_active, subscribed_at, updated_at 
        FROM newsletter 
        ORDER BY subscribed_at DESC
      `;
      return await db.query(sql);

    } catch (error) {
      console.error('❌ Erreur Newsletter.getAllEmails:', error);
      return [];
    }
  },

  // ===== COMPTER LES ABONNÉS ACTIFS =====
  async countSubscribers() {
    try {
      const result = await db.getOne(
        'SELECT COUNT(*) as total FROM newsletter WHERE is_active = TRUE'
      );
      return result?.total || 0;

    } catch (error) {
      console.error('❌ Erreur Newsletter.countSubscribers:', error);
      return 0;
    }
  },

  // ===== STATISTIQUES COMPLÈTES =====
  async getStats() {
    try {
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      };

      // Total des abonnés
      const totalResult = await db.getOne('SELECT COUNT(*) as count FROM newsletter');
      stats.total = totalResult?.count || 0;

      // Abonnés actifs
      const activeResult = await db.getOne(
        'SELECT COUNT(*) as count FROM newsletter WHERE is_active = TRUE'
      );
      stats.active = activeResult?.count || 0;

      // Abonnés inactifs
      stats.inactive = stats.total - stats.active;

      // Abonnés aujourd'hui
      const todayResult = await db.getOne(
        'SELECT COUNT(*) as count FROM newsletter WHERE DATE(subscribed_at) = CURDATE()'
      );
      stats.today = todayResult?.count || 0;

      // Abonnés cette semaine
      const weekResult = await db.getOne(
        'SELECT COUNT(*) as count FROM newsletter WHERE YEARWEEK(subscribed_at) = YEARWEEK(NOW())'
      );
      stats.thisWeek = weekResult?.count || 0;

      // Abonnés ce mois
      const monthResult = await db.getOne(
        'SELECT COUNT(*) as count FROM newsletter WHERE MONTH(subscribed_at) = MONTH(NOW()) AND YEAR(subscribed_at) = YEAR(NOW())'
      );
      stats.thisMonth = monthResult?.count || 0;

      return stats;

    } catch (error) {
      console.error('❌ Erreur Newsletter.getStats:', error);
      throw error;
    }
  },

  // ===== VÉRIFIER SI UN EMAIL EST ABONNÉ =====
  async isSubscribed(email) {
    try {
      const result = await db.getOne(
        'SELECT * FROM newsletter WHERE email = ? AND is_active = TRUE',
        [email]
      );
      return !!result;

    } catch (error) {
      console.error('❌ Erreur Newsletter.isSubscribed:', error);
      return false;
    }
  },

  // ===== SUPPRIMER DÉFINITIVEMENT UN EMAIL (admin) =====
  async delete(email) {
    try {
      console.log(`🗑️ Suppression définitive: ${email}`);
      
      const result = await db.query(
        'DELETE FROM newsletter WHERE email = ?',
        [email]
      );
      
      return result.affectedRows > 0;

    } catch (error) {
      console.error('❌ Erreur Newsletter.delete:', error);
      throw error;
    }
  },

  // ===== METTRE À JOUR LE STATUT D'UN EMAIL (admin) =====
  async updateStatus(email, isActive) {
    try {
      const result = await db.query(
        'UPDATE newsletter SET is_active = ?, updated_at = NOW() WHERE email = ?',
        [isActive ? 1 : 0, email]
      );
      
      return result.affectedRows > 0;

    } catch (error) {
      console.error('❌ Erreur Newsletter.updateStatus:', error);
      throw error;
    }
  },

  // ===== EXPORTER LES EMAILS AU FORMAT CSV =====
  async exportToCSV() {
    try {
      const emails = await this.getAllEmails();
      
      const csv = [
        ['ID', 'Email', 'Statut', "Date d'inscription", 'Dernière mise à jour'],
        ...emails.map(e => [
          e.id,
          e.email,
          e.is_active ? 'Actif' : 'Inactif',
          new Date(e.subscribed_at).toLocaleString('fr-TN'),
          new Date(e.updated_at).toLocaleString('fr-TN')
        ])
      ].map(row => row.join(',')).join('\n');

      return csv;

    } catch (error) {
      console.error('❌ Erreur Newsletter.exportToCSV:', error);
      throw error;
    }
  }
};

module.exports = Newsletter;