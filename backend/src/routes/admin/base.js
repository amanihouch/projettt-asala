// backend/src/routes/admin/base.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const db = require('../../config/database');

// Template pour les routes GET simples
const createGetRoute = (table, orderBy = 'created_at DESC') => {
  return async (req, res) => {
    try {
      const data = await db.execute(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
      res.json({ success: true, data });
    } catch (error) {
      console.error(`❌ Erreur get ${table}:`, error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = { createGetRoute, protect, adminOnly, db };