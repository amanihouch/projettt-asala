// backend/src/routes/sponsoredProducts.js
//
// Montage dans app.js (UN SEUL) :
//   app.use('/api/v1', sponsoredProductsRoutes)
//
// Routes exposées :
//   PUBLIC  GET  /api/v1/sponsored-products?active=true
//   PUBLIC  GET  /api/v1/sponsored-products/posts
//   ADMIN   GET  /api/v1/admin/sponsored-products
//   ADMIN   POST /api/v1/admin/sponsored-products
//   ADMIN   PUT  /api/v1/admin/sponsored-products/:id
//   ADMIN   PATCH /api/v1/admin/sponsored-products/:id/toggle
//   ADMIN   PATCH /api/v1/admin/sponsored-products/:id/order
//   ADMIN   DELETE /api/v1/admin/sponsored-products/:id

const express = require('express');
const router = express.Router();

// ============================================================
// DONNÉES (remplacer par Sequelize/MySQL en production)
// ============================================================
let sponsoredProducts = [
  {
    id: 1, postId: 101, price: 120, oldPrice: 150, displayOrder: 1,
    isActive: true,
    startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'),
    notes: 'Promotion spéciale', createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: 2, postId: 102, price: 180, oldPrice: null, displayOrder: 2,
    isActive: true,
    startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'),
    notes: null, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: 3, postId: 103, price: 160, oldPrice: 200, displayOrder: 3,
    isActive: false,
    startDate: new Date('2024-01-01'), endDate: new Date('2024-06-01'),
    notes: 'Expiré', createdAt: new Date(), updatedAt: new Date()
  }
];

// Catalogue simulé — en production : Post.findAll({ include: [Vendor] })
const mockPosts = {
  101: { id: 101, productName: 'أطواق تقليدية فضة', price: 120, oldPrice: 150,
    images: ['https://placehold.co/400x400/08717f/white?text=مجوهرات1'],
    description: 'أطواق فضية تقليدية مصنوعة يدوياً بأعلى جودة',
    vendor: { id: 1, shopName: 'دار الأصالة', avatar: 'https://i.pravatar.cc/150?u=1' } },
  102: { id: 102, productName: 'قلادة حجرية أصيلة', price: 180, oldPrice: null,
    images: ['https://placehold.co/400x400/d40025/white?text=قلادة'],
    description: 'قلادة مرصعة بالأحجار الكريمة الطبيعية',
    vendor: { id: 2, shopName: 'جواهر تونس', avatar: 'https://i.pravatar.cc/150?u=2' } },
  103: { id: 103, productName: 'سوار تقليدي فضة', price: 160, oldPrice: 200,
    images: ['https://placehold.co/400x400/c9a04a/white?text=سوار'],
    description: 'سوار فضي تقليدي بتصميم أمازيغي أصيل',
    vendor: { id: 3, shopName: 'لمسات تونس', avatar: 'https://i.pravatar.cc/150?u=3' } },
  104: { id: 104, productName: 'خاتم تقليدي مرصّع', price: 95, oldPrice: 120,
    images: ['https://placehold.co/400x400/065a69/white?text=خاتم'],
    description: 'خاتم فضي بنقش يدوي تقليدي',
    vendor: { id: 1, shopName: 'دار الأصالة', avatar: 'https://i.pravatar.cc/150?u=1' } },
  105: { id: 105, productName: 'مجموعة عقود أمازيغية', price: 250, oldPrice: null,
    images: ['https://placehold.co/400x400/c9a04a/white?text=عقود'],
    description: 'مجموعة عقود أمازيغية أصيلة',
    vendor: { id: 4, shopName: 'تراث الجنوب', avatar: 'https://i.pravatar.cc/150?u=4' } }
};

// ============================================================
// HELPERS
// ============================================================
const enrichProduct = (sp, post) => ({
  id: sp.id,
  postId: sp.postId,
  name: post.productName || post.name,
  price: sp.price || post.price,
  oldPrice: sp.oldPrice ?? post.oldPrice ?? null,
  image: post.images?.[0] || null,
  description: post.description,
  vendorId: post.vendor?.id,
  vendorName: post.vendor?.shopName || post.vendor?.name,
  vendorAvatar: post.vendor?.avatar,
  displayOrder: sp.displayOrder,
  startDate: sp.startDate,
  endDate: sp.endDate,
  isActive: sp.isActive,
  notes: sp.notes || null
});

const reorder = () => {
  sponsoredProducts.sort((a, b) => a.displayOrder - b.displayOrder);
};

// ============================================================
// PUBLIC — GET /api/v1/sponsored-products?active=true
// ============================================================
router.get('/sponsored-products', (req, res) => {
  try {
    const { active } = req.query;
    const now = new Date();
    let list = [...sponsoredProducts];

    if (active === 'true') {
      list = list.filter(sp =>
        sp.isActive &&
        new Date(sp.startDate) <= now &&
        new Date(sp.endDate) >= now
      );
    }

    list.sort((a, b) => a.displayOrder - b.displayOrder);

    const products = list
      .map(sp => {
        const post = mockPosts[sp.postId];
        if (!post) return null;
        return { ...enrichProduct(sp, post), isActive: sp.isActive && new Date(sp.endDate) >= now };
      })
      .filter(Boolean);

    res.json({ success: true, data: { products }, count: products.length });
  } catch (err) {
    console.error('[SP] GET public error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// PUBLIC — GET /api/v1/sponsored-products/posts
// Catalogue complet pour le navigateur admin
// ============================================================
router.get('/sponsored-products/posts', (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    let posts = Object.values(mockPosts);

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        (p.productName || '').toLowerCase().includes(q) ||
        (p.vendor?.shopName || '').toLowerCase().includes(q)
      );
    }

    const result = posts.slice(0, parseInt(limit)).map(p => ({
      id: p.id,
      name: p.productName || p.name,
      price: p.price,
      oldPrice: p.oldPrice || null,
      image: p.images?.[0] || null,
      description: p.description || '',
      vendorId: p.vendor?.id,
      vendorName: p.vendor?.shopName || p.vendor?.name,
      vendorAvatar: p.vendor?.avatar
    }));

    res.json({ success: true, data: { posts: result }, count: result.length });
  } catch (err) {
    console.error('[SP] GET posts error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// ADMIN — GET /api/v1/admin/sponsored-products
// ============================================================
router.get('/admin/sponsored-products', (req, res) => {
  try {
    reorder();
    const products = sponsoredProducts
      .map(sp => {
        const post = mockPosts[sp.postId];
        return post ? enrichProduct(sp, post) : null;
      })
      .filter(Boolean);

    res.json({ success: true, data: { products } });
  } catch (err) {
    console.error('[SP] Admin GET error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// ADMIN — POST /api/v1/admin/sponsored-products
// ============================================================
router.post('/admin/sponsored-products', (req, res) => {
  try {
    const { postId, startDate, endDate, displayOrder, isActive, notes } = req.body;

    if (!postId || !endDate) {
      return res.status(400).json({ success: false, message: 'postId et endDate requis' });
    }

    const post = mockPosts[parseInt(postId)];
    if (!post) {
      return res.status(404).json({ success: false, message: 'Produit introuvable dans le catalogue' });
    }

    const newId = Math.max(...sponsoredProducts.map(p => p.id), 0) + 1;
    const newOrder = displayOrder || sponsoredProducts.length + 1;

    if (displayOrder) {
      sponsoredProducts.forEach(sp => {
        if (sp.displayOrder >= displayOrder) sp.displayOrder += 1;
      });
    }

    const newSP = {
      id: newId,
      postId: parseInt(postId),
      price: post.price,
      oldPrice: post.oldPrice || null,
      displayOrder: newOrder,
      isActive: isActive !== undefined ? isActive : true,
      startDate: new Date(startDate || new Date()),
      endDate: new Date(endDate),
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sponsoredProducts.push(newSP);
    reorder();

    res.status(201).json({ success: true, data: { product: enrichProduct(newSP, post) } });
  } catch (err) {
    console.error('[SP] POST error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// ADMIN — PUT /api/v1/admin/sponsored-products/:id
// ============================================================
router.put('/admin/sponsored-products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { startDate, endDate, displayOrder, isActive, notes } = req.body;
    const index = sponsoredProducts.findIndex(sp => sp.id === id);

    if (index === -1) return res.status(404).json({ success: false, message: 'Non trouvé' });

    const sp = sponsoredProducts[index];
    sponsoredProducts[index] = {
      ...sp,
      startDate: startDate ? new Date(startDate) : sp.startDate,
      endDate: endDate ? new Date(endDate) : sp.endDate,
      displayOrder: displayOrder !== undefined ? displayOrder : sp.displayOrder,
      isActive: isActive !== undefined ? isActive : sp.isActive,
      notes: notes !== undefined ? notes : sp.notes,
      updatedAt: new Date()
    };

    reorder();
    const post = mockPosts[sponsoredProducts[index].postId];
    res.json({ success: true, data: { product: post ? enrichProduct(sponsoredProducts[index], post) : sponsoredProducts[index] } });
  } catch (err) {
    console.error('[SP] PUT error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// ADMIN — PATCH /api/v1/admin/sponsored-products/:id/toggle
// ============================================================
router.patch('/admin/sponsored-products/:id/toggle', (req, res) => {
  try {
    const index = sponsoredProducts.findIndex(sp => sp.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Non trouvé' });

    sponsoredProducts[index].isActive = !sponsoredProducts[index].isActive;
    sponsoredProducts[index].updatedAt = new Date();

    res.json({ success: true, data: { isActive: sponsoredProducts[index].isActive } });
  } catch (err) {
    console.error('[SP] Toggle error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================================
// ADMIN — PATCH /api/v1/admin/sponsored-products/:id/order
// ============================================================
router.patch('/admin/sponsored-products/:id/order', (req, res) => {
  try {
    const { displayOrder } = req.body;
    const index = sponsoredProducts.findIndex(sp => sp.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false });

    sponsoredProducts[index].displayOrder = displayOrder;
    sponsoredProducts[index].updatedAt = new Date();
    reorder();

    res.json({ success: true });
  } catch (err) {
    console.error('[SP] Order error:', err);
    res.status(500).json({ success: false });
  }
});

// ============================================================
// ADMIN — DELETE /api/v1/admin/sponsored-products/:id
// ============================================================
router.delete('/admin/sponsored-products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = sponsoredProducts.findIndex(sp => sp.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Non trouvé' });

    sponsoredProducts.splice(index, 1);
    sponsoredProducts = sponsoredProducts.map((sp, i) => ({ ...sp, displayOrder: i + 1 }));

    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (err) {
    console.error('[SP] DELETE error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
