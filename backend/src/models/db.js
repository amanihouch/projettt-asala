const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'turath_ikbel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const db = {
  pool,

  /**
   * Exécuter une requête SQL et retourner toutes les lignes
   */
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Erreur SQL:', error);
      console.log('📝 SQL:', sql);
      console.log('📦 Params:', params);
      throw error;
    }
  },

  /**
   * Récupérer une seule ligne
   */
  async getOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  },

  /**
   * Exécuter une requête INSERT et retourner l'ID inséré
   */
  async insert(sql, params = []) {
    try {
      const [result] = await pool.execute(sql, params);
      return result.insertId;
    } catch (error) {
      console.error('❌ Erreur INSERT:', error);
      console.log('📝 SQL:', sql);
      console.log('📦 Params:', params);
      throw error;
    }
  },

  /**
   * Exécuter une requête UPDATE/DELETE et retourner le nombre de lignes affectées
   */
  async execute(sql, params = []) {
    try {
      const [result] = await pool.execute(sql, params);
      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows,
        insertId: result.insertId
      };
    } catch (error) {
      console.error('❌ Erreur EXECUTE:', error);
      console.log('📝 SQL:', sql);
      console.log('📦 Params:', params);
      throw error;
    }
  },

  /**
   * Vérifier si une ligne existe
   */
  async exists(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0;
  },

  /**
   * Transaction: exécuter plusieurs requêtes dans une transaction
   */
  async transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Pagination: exécuter une requête avec pagination
   */
  async paginate(sql, params = [], page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Requête avec pagination
    const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, parseInt(limit), parseInt(offset)];
    
    // Compter le total
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as countTable`;
    
    try {
      const [rows, countRows] = await Promise.all([
        this.query(paginatedSql, paginatedParams),
        this.getOne(countSql, params)
      ]);
      
      const total = countRows?.total || 0;
      
      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Erreur pagination:', error);
      throw error;
    }
  },

  /**
   * Vérifier la connexion à la base de données
   */
  async testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Connexion à la base de données établie avec succès');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error);
      return false;
    }
  }
};

// Tester la connexion au démarrage (optionnel)
if (process.env.NODE_ENV !== 'test') {
  db.testConnection().catch(console.error);
}

module.exports = db;