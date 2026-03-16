// backend/src/models/db.js
const { pool } = require('../config/database');

const query = async (sql, params = []) => {
  try {
    // Optionnel : logger les requêtes en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 SQL:', sql);
      console.log('📦 Params:', params);
    }
    
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Erreur SQL:', error);
    console.error('📝 SQL was:', sql);
    console.error('📦 Params were:', params);
    throw error;
  }
};

const getOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
};

const insert = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params);
    return result.insertId;
  } catch (error) {
    console.error('❌ Erreur insert:', error);
    throw error;
  }
};

const exists = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0;
};

const count = async (sql, params = []) => {
  const results = await query(sql, params);
  return results[0]?.count || 0;
};

const paginate = async (sql, params = [], page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    
    // Compter le total
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_table`;
    const [totalResult] = await pool.execute(countSql, params);
    const total = totalResult[0].total;
    
    // Récupérer les données paginées
    const paginatedSql = `${sql} LIMIT ${limit} OFFSET ${offset}`;
    const [data] = await pool.execute(paginatedSql, params);
    
    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ Erreur paginate:', error);
    throw error;
  }
};

const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getOne,
  insert,
  exists,
  count,
  paginate,
  transaction
};