// backend/src/routes/sponsoredProducts.js
const express = require('express');
const router = express.Router();

// Données mock
let sponsoredProducts = [
  { id: 1, postId: 101, price: 120, oldPrice: 150, displayOrder: 1, isActive: true, startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'), notes: 'Promotion', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, postId: 102, price: 180, oldPrice: null, displayOrder: 2, isActive: true, startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'), notes: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, postId: 103, price: 160, oldPrice: 200, displayOrder: 3, isActive: true, startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'), notes: 'Promotion', createdAt: new Date(), updatedAt: new Date() }
];

const mockPosts = {
  101: { id: 101, productName: 'أطواق تقليدية فضة', price: 120, oldPrice: 150, images: ['https://placehold.co/400x400/08717f/white?text=1'], vendor: { shopName: 'دار الأصالة' } },
  102: { id: 102, productName: 'قلادة حجرية أصيلة', price: 180, oldPrice: null, images: ['https://placehold.co/400x400/d40025/white?text=2'], vendor: { shopName: 'جواهر تونس' } },
  103: { id: 103, productName: 'سوار تقليدي فضة', price: 160, oldPrice: 200, images: ['https://placehold.co/400x400/c9a04a/white?text=3'], vendor: { shopName: 'لمسات تونس' } },
  104: { id: 104, productName: 'خاتم تقليدي مرصّع', price: 95, oldPrice: null, images: ['https://placehold.co/400x400/065a69/white?text=4'], vendor: { shopName: 'دار الأصالة' } }
};

const formatProduct = (sp) => {
  const post = mockPosts[sp.postId];
  return {
    id: sp.id,
    postId: sp.postId,
    name: post?.productName || null,
    price: sp.price,
    oldPrice: sp.oldPrice,
    image: post?.images?.[0] || null,
    vendorName: post?.vendor?.shopName || null,
    displayOrder: sp.displayOrder,
    startDate: sp.startDate,
    endDate: sp.endDate,
    isActive: sp.isActive,
    notes: sp.notes || null
  };
};

// ========== ROUTES POUR /api/v1/sponsored-products ==========
// GET / - liste publique
router.get('/', (req, res) => {
  let products = sponsoredProducts.map(formatProduct);
  if (req.query.active === 'true') {
    const now = new Date();
    products = products.filter(p => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now);
  }
  products.sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true, data: { products } });
});

// ========== ROUTES POUR /api/v1/admin/sponsored-products ==========
// GET /admin - liste admin
router.get('/admin', (req, res) => {
  const products = sponsoredProducts.map(formatProduct).sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true, data: { products } });
});

// POST /admin - créer
router.post('/admin', (req, res) => {
  console.log('📨 POST /admin reçu:', req.body);
  const { postId, startDate, endDate, displayOrder, isActive, notes } = req.body;

  if (!postId || !endDate) {
    return res.status(400).json({ success: false, message: 'postId et endDate requis' });
  }

  const post = mockPosts[parseInt(postId, 10)];
  if (!post) {
    return res.status(404).json({ success: false, message: 'Produit introuvable' });
  }

  const newId = Math.max(...sponsoredProducts.map(p => p.id), 0) + 1;
  const newProduct = {
    id: newId,
    postId: parseInt(postId, 10),
    price: post.price,
    oldPrice: post.oldPrice || null,
    displayOrder: Number(displayOrder) || sponsoredProducts.length + 1,
    isActive: isActive !== undefined ? isActive : true,
    startDate: new Date(startDate || new Date()),
    endDate: new Date(endDate),
    notes: notes || null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  sponsoredProducts.push(newProduct);
  sponsoredProducts.sort((a, b) => a.displayOrder - b.displayOrder);

  res.status(201).json({ success: true, data: { product: formatProduct(newProduct) } });
});

// PUT /admin/:id - modifier
router.put('/admin/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = sponsoredProducts.findIndex(sp => sp.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Non trouvé' });

  const { startDate, endDate, displayOrder, isActive, notes } = req.body;
  sponsoredProducts[index] = {
    ...sponsoredProducts[index],
    startDate: startDate ? new Date(startDate) : sponsoredProducts[index].startDate,
    endDate: endDate ? new Date(endDate) : sponsoredProducts[index].endDate,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : sponsoredProducts[index].displayOrder,
    isActive: isActive !== undefined ? isActive : sponsoredProducts[index].isActive,
    notes: notes !== undefined ? notes : sponsoredProducts[index].notes,
    updatedAt: new Date()
  };
  sponsoredProducts.sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true, data: { product: formatProduct(sponsoredProducts[index]) } });
});

// PATCH /admin/:id/toggle - activer/désactiver
router.patch('/admin/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = sponsoredProducts.findIndex(sp => sp.id === id);
  if (index === -1) return res.status(404).json({ success: false });
  sponsoredProducts[index].isActive = !sponsoredProducts[index].isActive;
  sponsoredProducts[index].updatedAt = new Date();
  res.json({ success: true, data: { isActive: sponsoredProducts[index].isActive } });
});

// PATCH /admin/:id/order - changer ordre
router.patch('/admin/:id/order', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { displayOrder } = req.body;
  const index = sponsoredProducts.findIndex(sp => sp.id === id);
  if (index === -1) return res.status(404).json({ success: false });
  sponsoredProducts[index].displayOrder = Number(displayOrder);
  sponsoredProducts.sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ success: true });
});

// DELETE /admin/:id - supprimer
router.delete('/admin/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = sponsoredProducts.findIndex(sp => sp.id === id);
  if (index === -1) return res.status(404).json({ success: false });
  sponsoredProducts.splice(index, 1);
  sponsoredProducts = sponsoredProducts.map((sp, i) => ({ ...sp, displayOrder: i + 1 }));
  res.json({ success: true });
});

module.exports = router;