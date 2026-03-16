// backend/src/controllers/admin/ProductController.js
const Product = require('../../models/Product');
const db = require('../../models/db');

// ===== RÉCUPÉRER TOUS LES PRODUITS =====
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', categoryId = '', status = '' } = req.query;

    let sql = `
      SELECT p.*, 
             v.shopName as vendorName,
             c.name as categoryName,
             (SELECT imageUrl FROM product_images WHERE productId = p.id ORDER BY displayOrder LIMIT 1) as mainImage
      FROM products p
      JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      sql += ' AND p.categoryId = ?';
      params.push(categoryId);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY p.createdAt DESC';

    const result = await db.paginate(sql, params, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur admin getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== RÉCUPÉRER UN PRODUIT =====
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Erreur admin getProductById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== METTRE À JOUR UN PRODUIT =====
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, status, isFeatured, isSponsored } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const updated = await Product.update(req.params.id, {
      name,
      description,
      price,
      categoryId,
      status,
      isFeatured,
      isSponsored
    });

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: { product: updated }
    });
  } catch (error) {
    console.error('❌ Erreur admin updateProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===== SUPPRIMER UN PRODUIT =====
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await Product.delete(req.params.id);

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur admin deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};