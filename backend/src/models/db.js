// backend/src/models/db.js - Version avec logs détaillés
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
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
  }
  return pool;
};

const query = async (sql, params = []) => {
  try {
    console.log('🔍 Executing SQL:', sql);
    console.log('📦 Params:', params);
    
    const pool = getPool();
    
    // S'assurer que les paramètres LIMIT et OFFSET sont des nombres
    const processedParams = params.map(p => {
      if (typeof p === 'string' && !isNaN(p) && (sql.includes('LIMIT') || sql.includes('OFFSET'))) {
        return parseInt(p, 10);
      }
      return p;
    });
    
    const [rows] = await pool.query(sql, processedParams);
    console.log('✅ SQL Success, rows:', rows.length);
    return rows;
  } catch (error) {
    console.error('❌ SQL Error:', error.message);
    console.error('❌ SQL Code:', error.code);
    console.error('❌ SQL State:', error.sqlState);
    console.error('📝 SQL:', sql);
    console.error('📦 Params:', params);
    throw error;
  }
};



const getOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

const insert = async (sql, params = []) => {
  const pool = getPool();
  const [result] = await pool.query(sql, params);
  return result.insertId;
};

const update = async (sql, params = []) => {
  const pool = getPool();
  const [result] = await pool.query(sql, params);
  return result.affectedRows;
};

const count = async (sql, params = []) => {
  try {
    const row = await getOne(sql, params);
    return Number(row?.count || row?.total || 0);
  } catch (error) {
    console.error('❌ Count Error:', error.message);
    return 0;
  }
};

const exists = async (sql, params = []) => {
  try {
    const row = await getOne(sql, params);
    return !!row;
  } catch (error) {
    console.error('❌ Exists Error:', error.message);
    return false;
  }
};

const testConnection = async () => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  query,
  getOne,
  insert,
  update,
  count,
  exists,
  testConnection,
  getPool
};