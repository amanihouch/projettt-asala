// backend/src/models/db.js
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

  async getOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  },

  async insert(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return result.insertId;
  },

  async exists(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0;
  }
};

module.exports = db;