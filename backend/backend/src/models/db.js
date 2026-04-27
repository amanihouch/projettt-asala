// backend/src/models/db.js
const { pool } = require('../config/database');

// Helper function for queries
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Erreur SQL:', error);
    throw error;
  }
};

// Helper for transactions
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

// Helper for getting a single row
const getOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
};

// Helper for inserting and returning ID
const insert = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
};

// Helper for checking if exists
const exists = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0;
};

// Helper for counting
const count = async (sql, params = []) => {
  const results = await query(sql, params);
  return results[0]?.count || 0;
};

// Helper for pagination
const paginate = async (sql, params = [], page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const countSql = `SELECT COUNT(*) as total FROM (${sql}) as count_table`;
  
  const [totalResult] = await pool.execute(countSql, params);
  const total = totalResult[0].total;
  
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
};

module.exports = {
  pool,
  query,
  transaction,
  getOne,
  insert,
  exists,
  count,
  paginate
};