-- backend/schema.sql
DROP DATABASE IF EXISTS turath_ikbel;
CREATE DATABASE turath_ikbel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE turath_ikbel;

-- =====================================================
-- TABLE : users
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'customer', 'vendor') DEFAULT 'customer',
    avatar VARCHAR(500),
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : vendors
-- =====================================================
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    shopName VARCHAR(150) NOT NULL,
    specialty VARCHAR(200),
    description TEXT,
    phone VARCHAR(20),
    address VARCHAR(300),
    location VARCHAR(200),
    avatar VARCHAR(500),
    coverImage VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    followers INT DEFAULT 0,
    rating FLOAT DEFAULT 0,
    totalProducts INT DEFAULT 0,
    socialLinks JSON,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : categories
-- =====================================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    nameAr VARCHAR(100),
    icon VARCHAR(10) DEFAULT '🛍️',
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(500),
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : products
-- =====================================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendorId INT NOT NULL,
    categoryId INT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,3) NOT NULL DEFAULT 0,
    originalPrice DECIMAL(10,3),
    stock INT DEFAULT 0,
    images JSON DEFAULT ('[]'),
    colors JSON DEFAULT ('[]'),
    tags JSON DEFAULT ('[]'),
    rating FLOAT DEFAULT 0,
    reviewsCount INT DEFAULT 0,
    likesCount INT DEFAULT 0,
    isSponsored BOOLEAN DEFAULT FALSE,
    isFeatured BOOLEAN DEFAULT FALSE,
    isNew BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'outOfStock') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_vendorId (vendorId),
    INDEX idx_categoryId (categoryId),
    INDEX idx_status (status),
    FULLTEXT INDEX idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : product_images
-- =====================================================
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    productId INT NOT NULL,
    imageUrl VARCHAR(500) NOT NULL,
    displayOrder INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_productId (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : orders
-- =====================================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    orderNumber VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total DECIMAL(10,3) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,3) DEFAULT 0,
    shippingCost DECIMAL(10,3) DEFAULT 7,
    shippingAddress JSON,
    paymentMethod VARCHAR(50) DEFAULT 'cash_on_delivery',
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    items JSON DEFAULT ('[]'),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_orderNumber (orderNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : order_items
-- =====================================================
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    productId INT,
    productName VARCHAR(200) NOT NULL,
    price DECIMAL(10,3) NOT NULL,
    quantity INT NOT NULL,
    image VARCHAR(500),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_orderId (orderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : posts
-- =====================================================
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendorId INT NOT NULL,
    vendorName VARCHAR(150),
    vendorAvatar VARCHAR(500),
    productName VARCHAR(200),
    description TEXT,
    content TEXT,
    category VARCHAR(100),
    price DECIMAL(10,3),
    oldPrice DECIMAL(10,3),
    images JSON DEFAULT ('[]'),
    rating FLOAT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    inStock BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejectionReason TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendorId (vendorId),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : likes
-- =====================================================
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    productId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (userId, productId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_productId (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : comments
-- =====================================================
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    postId INT NOT NULL,
    userName VARCHAR(100),
    userAvatar VARCHAR(500),
    comment TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_postId (postId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE : followers
-- =====================================================
CREATE TABLE followers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    followerId INT NOT NULL,
    vendorId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (followerId, vendorId),
    FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_followerId (followerId),
    INDEX idx_vendorId (vendorId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTION DES DONNÉES DE TEST
-- =====================================================

-- 1. UTILISATEURS (mots de passe hashés avec bcrypt)
-- Mots de passe :
--   admin123 pour admin
--   vendor123 pour vendeurs
--   client123 pour clients
INSERT INTO users (name, email, password, phone, role, avatar, isActive, createdAt) VALUES
('مدير النظام', 'admin@turath.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 70 000 001', 'admin', 'https://ui-avatars.com/api/?name=Admin+Turath&background=7c3aed&color=fff', TRUE, NOW()),
('محمد الفخراني', 'vendor1@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 98 765 432', 'vendor', 'https://i.pravatar.cc/300?img=12', TRUE, NOW()),
('فاطمة النساجة', 'vendor2@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 97 654 321', 'vendor', 'https://i.pravatar.cc/300?img=25', TRUE, NOW()),
('يوسف الصائغ', 'vendor3@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 96 543 210', 'vendor', 'https://i.pravatar.cc/300?img=33', TRUE, NOW()),
('خديجة القفصية', 'vendor4@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 95 432 109', 'vendor', 'https://i.pravatar.cc/300?img=47', TRUE, NOW()),
('عميل تجريبي', 'client@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 20 123 456', 'customer', 'https://i.pravatar.cc/300?img=1', TRUE, NOW()),
('سارة بن علي', 'sara@test.tn', '$2a$12$LQv3c6Uq1qWx7Yx7Yx7YxO7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Yx7Y', '+216 20 234 567', 'customer', 'https://i.pravatar.cc/300?img=5', TRUE, NOW());

-- 2. PROFILS VENDEURS
INSERT INTO vendors (userId, shopName, specialty, description, phone, address, location, avatar, coverImage, verified, followers, rating, totalProducts, socialLinks, isActive, createdAt) VALUES
(2, 'فخاريات الفخراني', 'الفخار والخزف', 'فخار تونسي تقليدي أصيل مصنوع يدوياً بتقنيات متوارثة عبر الأجيال.', '+216 98 765 432', 'شارع الحرفيين، مدينة مدنين', 'تونس، مدنين', 'https://i.pravatar.cc/300?img=12', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200', TRUE, 1250, 4.8, 4, '{"facebook": "https://facebook.com/fakhrany", "instagram": "https://instagram.com/fakhrany"}', TRUE, NOW()),
(3, 'نسيج تونس', 'النسيج والسجاد', 'سجاد ونسيج تقليدي تونسي أصيل منسوج يدوياً من الصوف الطبيعي.', '+216 97 654 321', 'حي النسيج، القيروان', 'تونس، القيروان', 'https://i.pravatar.cc/300?img=25', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200', TRUE, 980, 4.6, 3, '{"instagram": "https://instagram.com/nesij_tounes"}', TRUE, NOW()),
(4, 'مجوهرات يوسف', 'المجوهرات والحلي', 'مجوهرات وحلي تقليدية تونسية مصنوعة يدوياً.', '+216 96 543 210', 'سوق الصياغة، سوسة', 'تونس، سوسة', 'https://i.pravatar.cc/300?img=33', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200', TRUE, 1560, 4.9, 3, '{"facebook": "https://facebook.com/jawharat.youssef"}', TRUE, NOW()),
(5, 'عطور قفصة', 'العطور والبخور', 'عطور طبيعية وبخور تونسية أصيلة.', '+216 95 432 109', 'شارع العطارين، قفصة', 'تونس، قفصة', 'https://i.pravatar.cc/300?img=47', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=1200', FALSE, 430, 4.5, 2, '{}', TRUE, NOW());

-- 3. CATÉGORIES
INSERT INTO categories (name, nameAr, icon, slug, description, sortOrder, isActive, createdAt) VALUES
('Pottery', 'الفخار والخزف', '🏺', 'pottery', 'فخار تقليدي تونسي أصيل', 1, TRUE, NOW()),
('Textiles', 'النسيج والسجاد', '🧵', 'textiles', 'منسوجات وسجاد تقليدي', 2, TRUE, NOW()),
('Jewelry', 'المجوهرات والحلي', '💍', 'jewelry', 'مجوهرات تقليدية تونسية', 3, TRUE, NOW()),
('Perfumes', 'العطور والبخور', '🌸', 'perfumes', 'عطور طبيعية وبخور', 4, TRUE, NOW()),
('Decoration', 'الديكور والتحف', '🪔', 'decoration', 'تحف وديكور تقليدي', 5, TRUE, NOW()),
('Leather', 'الجلود والحقائب', '👜', 'leather', 'منتجات جلدية تقليدية', 6, TRUE, NOW()),
('Copperware', 'النحاسيات', '🥁', 'copperware', 'أواني نحاسية تقليدية', 7, TRUE, NOW()),
('Wood', 'المنحوتات الخشبية', '🪵', 'wood', 'منحوتات خشبية يدوية', 8, TRUE, NOW()),
('Ceramics', 'الخزف', '🍶', 'ceramics', 'خزف تقليدي تونسي', 9, TRUE, NOW()),
('Basketry', 'الخوص', '🧺', 'basketry', 'منتجات الخوص التقليدية', 10, TRUE, NOW());

-- 4. PRODUITS
INSERT INTO products (vendorId, categoryId, name, description, price, originalPrice, stock, images, colors, rating, likesCount, isFeatured, isSponsored, status, createdAt) VALUES
(1, 1, 'إناء فخاري زخرفي كبير', 'إناء فخاري تقليدي تونسي مصنوع يدوياً.', 120.000, 150.000, 15, '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"]', '["Rouge", "Marron"]', 4.8, 45, TRUE, FALSE, 'active', NOW()),
(1, 1, 'طبق فخاري للتقديم', 'طبق فخاري كبير مزين بألوان زاهية.', 85.000, NULL, 20, '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"]', '["Bleu", "Vert"]', 4.6, 32, FALSE, FALSE, 'active', NOW()),
(1, 7, 'صينية نحاسية مطرقة', 'صينية نحاسية مصنوعة يدوياً.', 280.000, 320.000, 8, '["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"]', '["Or", "Argent"]', 4.9, 28, FALSE, TRUE, 'active', NOW()),
(2, 2, 'سجادة تونسية تقليدية', 'سجادة تونسية تقليدية منسوجة يدوياً.', 450.000, 550.000, 5, '["https://images.unsplash.com/photo-1600166898405-da9535204843?w=800"]', '["Rouge", "Noir", "Blanc"]', 4.9, 78, TRUE, TRUE, 'active', NOW()),
(2, 2, 'وشاح حريري مطرز', 'وشاح حريري فاخر مطرز يدوياً.', 180.000, NULL, 12, '["https://images.unsplash.com/photo-1549887534-1541e9326642?w=800"]', '["Rouge", "Bleu", "Vert"]', 4.7, 41, TRUE, FALSE, 'active', NOW()),
(3, 3, 'عقد تونسي تقليدي ذهبي', 'عقد ذهبي تقليدي تونسي.', 850.000, 950.000, 3, '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]', '["Or"]', 4.9, 92, TRUE, FALSE, 'active', NOW()),
(3, 3, 'أسورة فضية مرصعة', 'أسورة فضية مرصعة بأحجار كريمة.', 350.000, NULL, 10, '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]', '["Argent"]', 4.7, 63, TRUE, FALSE, 'active', NOW()),
(4, 4, 'عطر ورد الجوري التونسي', 'عطر طبيعي مستخلص من ورد الجوري.', 95.000, NULL, 30, '["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800"]', '[]', 4.5, 38, FALSE, TRUE, 'active', NOW()),
(4, 4, 'بخور عربي فاخر', 'مجموعة بخور عربية فاخرة.', 150.000, NULL, 20, '["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800"]', '[]', 4.8, 52, TRUE, FALSE, 'active', NOW());

-- 5. POSTS
INSERT INTO posts (vendorId, vendorName, vendorAvatar, productName, description, content, category, price, oldPrice, images, rating, likes, comments, shares, inStock, status, createdAt) VALUES
(1, 'فخاريات الفخراني', 'https://i.pravatar.cc/150?img=12', 'إناء فخاري زخرفي', 'إناء فخاري تقليدي جميل', '🏺 اكتشفوا روعة الفخار التونسي الأصيل!', 'pottery', 120.000, 150.000, '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"]', 4.8, 45, 12, 5, TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'نسيج تونس', 'https://i.pravatar.cc/150?img=25', 'سجادة قيروانية', 'سجادة صوف تقليدية', '🧵 السجادة القيروانية التقليدية', 'textiles', 450.000, 550.000, '["https://images.unsplash.com/photo-1600166898405-da9535204843?w=800"]', 4.9, 78, 23, 8, TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'مجوهرات يوسف', 'https://i.pravatar.cc/150?img=33', 'عقد ذهبي تونسي', 'عقد ذهبي تقليدي', '💍 تألقي بالمجوهرات التونسية الأصيلة!', 'jewelry', 850.000, NULL, '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]', 4.9, 120, 35, 12, TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'عطور قفصة', 'https://i.pravatar.cc/150?img=47', 'عطر ورد الجوري', 'عطر طبيعي من ورد الجوري', '🌸 عطور طبيعية 100% من قلب تونس', 'perfumes', 95.000, NULL, '["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800"]', 4.5, 56, 18, 3, TRUE, 'approved', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'فخاريات الفخراني', 'https://i.pravatar.cc/150?img=12', 'مجموعة أواني فخارية', 'مجموعة من الأواني الفخارية', 'مجموعة جديدة من الأواني الفخارية', 'pottery', 250.000, NULL, '["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"]', 0, 0, 0, 0, TRUE, 'pending', NOW()),
(2, 'نسيج تونس', 'https://i.pravatar.cc/150?img=25', 'وشاح مطرز جديد', 'وشاح حريري جديد', 'أحدث إصداراتنا من الوشاحات الحريرية', 'textiles', 180.000, NULL, '["https://images.unsplash.com/photo-1549887534-1541e9326642?w=800"]', 0, 0, 0, 0, TRUE, 'pending', NOW());

-- 6. COMMANDES
INSERT INTO orders (userId, orderNumber, status, items, subtotal, shippingCost, total, shippingAddress, paymentMethod, paymentStatus, notes, createdAt) VALUES
(6, 'ORD-2024-001', 'delivered', '[{"id": 1, "name": "إناء فخاري زخرفي كبير", "price": 120, "quantity": 1, "image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400", "vendorName": "فخاريات الفخراني"}]', 120.000, 7.000, 127.000, '{"name": "عميل تجريبي", "phone": "+216 20 123 456", "address": "شارع الحبيب بورقيبة", "city": "تونس", "postalCode": "1000"}', 'cash_on_delivery', 'paid', NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(6, 'ORD-2024-002', 'processing', '[{"id": 5, "name": "سجادة تونسية تقليدية", "price": 450, "quantity": 1, "image": "https://images.unsplash.com/photo-1600166898405-da9535204843?w=400", "vendorName": "نسيج تونس"}]', 450.000, 7.000, 457.000, '{"name": "عميل تجريبي", "phone": "+216 20 123 456", "address": "شارع الحبيب بورقيبة", "city": "تونس", "postalCode": "1000"}', 'cash_on_delivery', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, 'ORD-2024-003', 'pending', '[{"id": 8, "name": "عقد تونسي تقليدي ذهبي", "price": 850, "quantity": 1, "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", "vendorName": "مجوهرات يوسف"}]', 850.000, 7.000, 857.000, '{"name": "سارة بن علي", "phone": "+216 20 234 567", "address": "شارع الجمهورية", "city": "سوسة", "postalCode": "4000"}', 'cash_on_delivery', 'pending', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'ORD-2024-004', 'shipped', '[{"id": 11, "name": "عطر ورد الجوري التونسي", "price": 95, "quantity": 2, "image": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400", "vendorName": "عطور قفصة"}]', 190.000, 7.000, 197.000, '{"name": "سارة بن علي", "phone": "+216 20 234 567", "address": "شارع الجمهورية", "city": "سوسة", "postalCode": "4000"}', 'cash_on_delivery', 'pending', NULL, NOW());

-- =====================================================
-- CRÉATION DES INDEX POUR OPTIMISATION
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vendors_userId ON vendors(userId);
CREATE INDEX idx_vendors_verified ON vendors(verified);
CREATE INDEX idx_products_vendorId ON products(vendorId);
CREATE INDEX idx_products_categoryId ON products(categoryId);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_posts_vendorId ON posts(vendorId);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category ON posts(category);

-- =====================================================
-- CRÉATION DES VUES
-- =====================================================

-- Vue : produits avec infos vendeur
CREATE VIEW view_products_with_vendor AS
SELECT p.*, v.shopName as vendor_shop, v.verified as vendor_verified, v.rating as vendor_rating
FROM products p
LEFT JOIN vendors v ON p.vendorId = v.id;

-- Vue : commandes avec infos client
CREATE VIEW view_orders_with_customer AS
SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
FROM orders o
LEFT JOIN users u ON o.userId = u.id;

-- Vue : statistiques des vendeurs
CREATE VIEW view_vendor_stats AS
SELECT
    v.id,
    v.shopName,
    v.verified,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT po.id) as total_posts,
    COALESCE(AVG(p.rating), 0) as avg_product_rating
FROM vendors v
LEFT JOIN products p ON v.id = p.vendorId
LEFT JOIN posts po ON v.id = po.vendorId
GROUP BY v.id;

-- =====================================================
-- CRÉATION DES PROCÉDURES STOCKÉES
-- =====================================================

DELIMITER $$

-- Procédure : mettre à jour le compteur de produits d'un vendeur
CREATE PROCEDURE sp_update_vendor_product_count(IN vendor_id INT)
BEGIN
    UPDATE vendors
    SET totalProducts = (SELECT COUNT(*) FROM products WHERE vendorId = vendor_id AND status = 'active')
    WHERE id = vendor_id;
END$$

-- Procédure : obtenir les statistiques du tableau de bord
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'vendor') as total_vendors,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered') as total_revenue;
END$$

DELIMITER ;

-- =====================================================
-- CRÉATION DES TRIGGERS
-- =====================================================

DELIMITER $$

-- Trigger : mettre à jour totalProducts après ajout d'un produit
CREATE TRIGGER trg_after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    UPDATE vendors SET totalProducts = totalProducts + 1 WHERE id = NEW.vendorId;
END$$

-- Trigger : mettre à jour totalProducts après suppression d'un produit
CREATE TRIGGER trg_after_product_delete
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    UPDATE vendors SET totalProducts = totalProducts - 1 WHERE id = OLD.vendorId;
END$$

DELIMITER ;

-- =====================================================
-- AFFICHAGE DES RÉSULTATS
-- =====================================================
SELECT '✅ Base de données turath_ikbel créée avec succès!' as Message;
SELECT CONCAT('📊 Utilisateurs: ', (SELECT COUNT(*) FROM users)) as Stats;
SELECT CONCAT('🏪 Vendeurs: ', (SELECT COUNT(*) FROM vendors)) as Stats;
SELECT CONCAT('📂 Catégories: ', (SELECT COUNT(*) FROM categories)) as Stats;
SELECT CONCAT('🛍️ Produits: ', (SELECT COUNT(*) FROM products)) as Stats;
SELECT CONCAT('📝 Posts: ', (SELECT COUNT(*) FROM posts)) as Stats;
SELECT CONCAT('📦 Commandes: ', (SELECT COUNT(*) FROM orders)) as Stats;

-- =====================================================
-- AFFICHAGE DES COMPTES DE TEST
-- =====================================================
SELECT '========================================' as '';
SELECT '🔑 COMPTES DE CONNEXION' as '';
SELECT '========================================' as '';
SELECT 'ADMIN   : admin@turath.tn / admin123' as '';
SELECT 'VENDEUR1: vendor1@test.tn / vendor123' as '';
SELECT 'VENDEUR2: vendor2@test.tn / vendor123' as '';
SELECT 'VENDEUR3: vendor3@test.tn / vendor123' as '';
SELECT 'VENDEUR4: vendor4@test.tn / vendor123' as '';
SELECT 'CLIENT1 : client@test.tn / client123' as '';
SELECT 'CLIENT2 : sara@test.tn / client123' as '';
SELECT '========================================' as '';