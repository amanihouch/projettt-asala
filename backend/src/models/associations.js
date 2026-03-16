// backend/src/models/associations.js
const User = require('./User');
const Vendor = require('./Vendor');
const Product = require('./Product');
const Order = require('./Order');
const Category = require('./Category');
const Like = require('./Like');
const Post = require('./Post');
const Comment = require('./Comment');

// User associations
User.hasOne(Vendor, { foreignKey: 'userId', as: 'vendor' });
Vendor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Vendor associations
Vendor.hasMany(Product, { foreignKey: 'vendorId', as: 'products' });
Product.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

Vendor.hasMany(Like, { foreignKey: 'vendorId', as: 'likes' });
Like.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

Vendor.hasMany(Post, { foreignKey: 'vendorId', as: 'posts' });
Post.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

Vendor.hasMany(Order, { foreignKey: 'vendorId', as: 'orders' });
Order.belongsTo(Vendor, { foreignKey: 'vendorId', as: 'vendor' });

// Product associations
Product.hasMany(Like, { foreignKey: 'productId', as: 'likes' });
Like.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Comment, { foreignKey: 'productId', as: 'comments' });
Comment.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Category associations
Category.belongsTo(Category, { as: 'parentCategory', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'childCategories', foreignKey: 'parentId' });

// Order associations
Order.hasMany(Order, { foreignKey: 'orderId', as: 'items' });
Order.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Post associations
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

console.log('✅ Associations définies');