const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const { protect, authorize } = require('../../middleware/auth');

// Middleware d'authentification et autorisation admin
router.use(protect);
router.use(authorize('admin'));

/**
 * GET / - Récupérer toutes les catégories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('admin categories GET:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST / - Créer une nouvelle catégorie
 * Corps attendu : { name, nameAr?, icon?, description?, imageUrl? }
 */
router.post('/', async (req, res) => {
  try {
    const { name, nameAr, icon, description, imageUrl } = req.body;

    // Vérifier que le nom est fourni
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Le nom de la catégorie est requis' });
    }

    // Générer un slug à partir du nom (en français ou en arabe)
    let slug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Si le slug est vide (ex: noms uniquement symboles), utiliser un fallback
    if (!slug) slug = 'categorie-' + Date.now();

    // Vérifier l'unicité du slug et ajouter un suffixe si nécessaire
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await db.getOne('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Insérer la catégorie avec tous les champs obligatoires
    const result = await db.query(
      `INSERT INTO categories (name, nameAr, icon, description, slug, imageUrl, isActive, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      [name.trim(), nameAr || name.trim(), icon || null, description || null, finalSlug, imageUrl || null]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name: name.trim(),
        slug: finalSlug,
        imageUrl: imageUrl || null
      },
      message: 'Catégorie créée avec succès'
    });
  } catch (err) {
    console.error('admin categories POST:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /:id - Mettre à jour une catégorie
 * Corps attendu : { name?, nameAr?, icon?, description?, imageUrl? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, nameAr, icon, description, imageUrl } = req.body;
    const id = req.params.id;

    // Récupérer la catégorie existante
    const existing = await db.getOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    // Construire dynamiquement la requête UPDATE
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (nameAr !== undefined) {
      updates.push('nameAr = ?');
      values.push(nameAr || null);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon || null);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }
    if (imageUrl !== undefined) {
      updates.push('imageUrl = ?');
      values.push(imageUrl || null);
    }

    // Si le nom change, recalculer le slug
    if (name !== undefined && name.trim() !== existing.name) {
      let slug = name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (!slug) slug = 'categorie-' + Date.now();

      // Vérifier l'unicité du nouveau slug (en excluant la catégorie actuelle)
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existingSlug = await db.getOne('SELECT id FROM categories WHERE slug = ? AND id != ?', [finalSlug, id]);
        if (!existingSlug) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      updates.push('slug = ?');
      values.push(finalSlug);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
    }

    values.push(id);
    const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(sql, values);

    res.json({ success: true, message: 'Catégorie mise à jour' });
  } catch (err) {
    console.error('admin categories PUT:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /:id - Supprimer une catégorie
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await db.getOne('SELECT id FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (err) {
    console.error('admin categories DELETE:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
