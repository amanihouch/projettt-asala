// backend/src/routes/sponsoredProducts.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================================
// ROUTES PUBLIQUES - /api/v1/sponsored-products
// ============================================================

// GET / - Liste des produits sponsorisés (publique)
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.name as productName,
        p.description,
        p.price,
        p.oldPrice,
        p.images,
        p.status,
        p.createdAt,
        p.isSponsored,
        v.id as vendorId,
        v.shopName as vendorName,
        v.verified as vendorVerified,
        c.id as categoryId,
        c.name as categoryName,
        c.slug as categorySlug
      FROM products p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.isSponsored = 1
    `;
    
    const params = [];
    
    // Filtrer par actif
    if (req.query.active === 'true') {
      query += ` AND (p.status IS NULL OR p.status = 'approved' OR p.status = 'active')`;
    }
    
    query += ` ORDER BY p.createdAt DESC LIMIT 12`;
    
    const products = await db.query(query, params);
    
    // Formater les produits pour le frontend
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.productName || p.name,
      description: p.description,
      price: parseFloat(p.price) || 0,
      oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : null,
      images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [],
      image: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0]) : null,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      vendorVerified: p.vendorVerified || false,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      categorySlug: p.categorySlug,
      isSponsored: true,
      status: p.status || 'approved',
      createdAt: p.createdAt
    }));
    
    res.json({ 
      success: true, 
      data: { 
        products: formattedProducts 
      } 
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits sponsorisés:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des produits sponsorisés' 
    });
  }
});

// GET /posts - Récupérer les posts sponsorisés
router.get('/posts', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        v.shopName as vendorName,
        u.name as userName,
        u.avatar as vendorAvatar
      FROM posts p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN users u ON v.userId = u.id
      WHERE p.isSponsored = 1 AND p.status = 'approved'
      ORDER BY p.createdAt DESC
      LIMIT 12
    `;
    
    const posts = await db.query(query);
    
    res.json({ 
      success: true, 
      data: { 
        posts: posts || [] 
      } 
    });
  } catch (error) {
    console.error('❌ Erreur récupération posts sponsorisés:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des posts sponsorisés' 
    });
  }
});

// ============================================================
// ROUTES ADMIN - /api/v1/admin/sponsored-products
// ============================================================

// GET /admin - Liste admin des produits sponsorisés
router.get('/admin', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name as productName,
        p.price,
        p.oldPrice,
        p.images,
        p.status,
        p.createdAt,
        p.isSponsored,
        v.shopName as vendorName,
        c.name as categoryName
      FROM products p
      LEFT JOIN vendors v ON p.vendorId = v.id
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.isSponsored = 1
      ORDER BY p.createdAt DESC
    `;
    
    const products = await db.query(query);
    
    // Formater les produits
    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.productName || p.name,
      price: parseFloat(p.price) || 0,
      oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : null,
      images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [],
      image: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0]) : null,
      vendorName: p.vendorName,
      categoryName: p.categoryName,
      status: p.status,
      isSponsored: true,
      createdAt: p.createdAt
    }));
    
    res.json({ 
      success: true, 
      data: { 
        products: formattedProducts 
      } 
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits sponsorisés admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des produits sponsorisés' 
    });
  }
});

// POST /admin - Ajouter un produit sponsorisé
router.post('/admin', async (req, res) => {
  try {
    const { productId, startDate, endDate, isActive, notes } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID du produit requis' 
      });
    }
    
    // Vérifier si le produit existe
    const product = await db.query(
      'SELECT id, name, price FROM products WHERE id = ?',
      [productId]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    // Mettre à jour le produit comme sponsorisé
    await db.query(
      `UPDATE products SET 
        isSponsored = 1,
        sponsoredStartDate = ?,
        sponsoredEndDate = ?,
        sponsoredNotes = ?,
        updatedAt = NOW()
      WHERE id = ?`,
      [startDate || new Date(), endDate, notes || null, productId]
    );
    
    // Récupérer le produit mis à jour
    const updatedProduct = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    
    res.status(201).json({ 
      success: true, 
      data: { 
        product: updatedProduct[0] 
      },
      message: 'Produit sponsorisé avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur ajout produit sponsorisé:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'ajout du produit sponsorisé' 
    });
  }
});

// PUT /admin/:id - Modifier un produit sponsorisé
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, isActive, notes } = req.body;
    
    // Vérifier si le produit existe
    const product = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    // Mettre à jour
    await db.query(
      `UPDATE products SET 
        sponsoredStartDate = ?,
        sponsoredEndDate = ?,
        isSponsored = ?,
        sponsoredNotes = ?,
        updatedAt = NOW()
      WHERE id = ?`,
      [startDate, endDate, isActive !== undefined ? isActive : 1, notes || null, id]
    );
    
    const updatedProduct = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      data: { 
        product: updatedProduct[0] 
      },
      message: 'Produit sponsorisé mis à jour' 
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour produit sponsorisé:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
});

// PATCH /admin/:id/toggle - Activer/Désactiver un produit sponsorisé
router.patch('/admin/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'état actuel
    const product = await db.query(
      'SELECT isSponsored FROM products WHERE id = ?',
      [id]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    const newStatus = product[0].isSponsored ? 0 : 1;
    
    await db.query(
      'UPDATE products SET isSponsored = ?, updatedAt = NOW() WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({ 
      success: true, 
      data: { 
        isActive: newStatus === 1 
      },
      message: newStatus === 1 ? 'Produit sponsorisé activé' : 'Produit sponsorisé désactivé' 
    });
  } catch (error) {
    console.error('❌ Erreur toggle produit sponsorisé:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du changement de statut' 
    });
  }
});

// DELETE /admin/:id - Supprimer un produit sponsorisé
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le produit existe
    const product = await db.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produit non trouvé' 
      });
    }
    
    // Désactiver le statut sponsorisé
    await db.query(
      'UPDATE products SET isSponsored = 0, updatedAt = NOW() WHERE id = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      message: 'Produit retiré des sponsorisés' 
    });
  } catch (error) {
    console.error('❌ Erreur suppression produit sponsorisé:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
});

module.exports = router;

module.exports = router;
