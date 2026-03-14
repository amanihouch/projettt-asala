const { Op } = require('sequelize');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Like = require('../models/Like');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sequelize } = require('../config/database');

// ===== GET ALL PRODUCTS =====
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'DESC',
    category,
    minPrice,
    maxPrice,
    vendorId,
    search,
    featured,
    sponsored,
    inStock
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  if (category) {
    where.category = category;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
  }

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (featured === 'true') {
    where.isFeatured = true;
  }

  if (sponsored === 'true') {
    where.isSponsored = true;
  }

  if (inStock === 'true') {
    where.inStock = true;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { tags: { [Op.like]: `%${search}%` } }
    ];
  }

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      },
      {
        model: Category,
        as: 'productCategory',
        attributes: ['id', 'name', 'slug', 'icon']
      }
    ],
    order: [[sort, order]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true
  });

  let likedProducts = [];
  if (req.user) {
    const likes = await Like.findAll({
      where: { userId: req.user.id },
      attributes: ['productId']
    });
    likedProducts = likes.map(like => like.productId);
  }

  const productsWithLikes = products.map(product => {
    const productData = product.toJSON();
    productData.isLiked = req.user ? likedProducts.includes(product.id) : false;
    return productData;
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: { products: productsWithLikes }
  });
});

// ===== GET SINGLE PRODUCT =====
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, {
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      },
      {
        model: Category,
        as: 'productCategory',
        attributes: ['id', 'name', 'slug', 'icon']
      }
    ]
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  let isLiked = false;
  if (req.user) {
    const like = await Like.findOne({
      where: {
        userId: req.user.id,
        productId: product.id
      }
    });
    isLiked = !!like;
  }

  const likesCount = await Like.count({
    where: { productId: product.id }
  });

  const relatedProducts = await Product.findAll({
    where: {
      category: product.category,
      id: { [Op.ne]: product.id },
      inStock: true
    },
    limit: 4,
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      }
    ]
  });

  const productData = product.toJSON();
  productData.isLiked = isLiked;
  productData.likesCount = likesCount;
  productData.relatedProducts = relatedProducts;

  res.status(200).json({
    status: 'success',
    data: { product: productData }
  });
});

// ===== CREATE PRODUCT =====
exports.createProduct = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  
  if (!vendor && req.user.role !== 'admin') {
    return next(new AppError('You must be a vendor to create products', 403));
  }

  const productData = {
    ...req.body,
    vendorId: vendor ? vendor.id : req.body.vendorId
  };

  if (req.files) {
    productData.images = req.files.map(file => `/uploads/${file.filename}`);
  }

  const product = await Product.create(productData);

  await Vendor.increment('productsCount', {
    where: { id: product.vendorId }
  });

  res.status(201).json({
    status: 'success',
    data: { product }
  });
});

// ===== UPDATE PRODUCT =====
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  if (req.user.role !== 'admin' && product.vendorId !== vendor?.id) {
    return next(new AppError('You do not have permission to update this product', 403));
  }

  const updateData = { ...req.body };
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `/uploads/${file.filename}`);
    updateData.images = [...(product.images || []), ...newImages];
  }

  await product.update(updateData);

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// ===== DELETE PRODUCT =====
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
  if (req.user.role !== 'admin' && product.vendorId !== vendor?.id) {
    return next(new AppError('You do not have permission to delete this product', 403));
  }

  await product.destroy();

  await Vendor.decrement('productsCount', {
    where: { id: product.vendorId }
  });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ===== LIKE/UNLIKE PRODUCT =====
exports.likeProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const existingLike = await Like.findOne({
    where: {
      userId: req.user.id,
      productId: product.id
    }
  });

  if (existingLike) {
    await existingLike.destroy();
    res.status(200).json({
      status: 'success',
      data: { liked: false }
    });
  } else {
    await Like.create({
      userId: req.user.id,
      productId: product.id,
      vendorId: product.vendorId
    });
    res.status(200).json({
      status: 'success',
      data: { liked: true }
    });
  }
});

// ===== GET FEATURED PRODUCTS =====
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isFeatured: true, inStock: true },
    limit: 8,
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      }
    ],
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// ===== GET SPONSORED PRODUCTS =====
exports.getSponsoredProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { isSponsored: true, inStock: true },
    limit: 4,
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// ===== GET PRODUCTS BY VENDOR =====
exports.getProductsByVendor = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findByPk(req.params.vendorId);

  if (!vendor) {
    return next(new AppError('No vendor found with that ID', 404));
  }

  const products = await Product.findAll({
    where: { vendorId: vendor.id },
    include: [
      {
        model: Category,
        as: 'productCategory',
        attributes: ['id', 'name', 'slug', 'icon']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// ===== GET RELATED PRODUCTS =====
exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const products = await Product.findAll({
    where: {
      category: product.category,
      id: { [Op.ne]: product.id },
      inStock: true
    },
    limit: 4,
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// ===== SEARCH PRODUCTS =====
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError('Please provide a search query', 400));
  }

  const products = await Product.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { tags: { [Op.like]: `%${q}%` } }
      ],
      inStock: true
    },
    include: [
      {
        model: Vendor,
        as: 'productVendor',
        include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
      }
    ],
    limit: 20
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});