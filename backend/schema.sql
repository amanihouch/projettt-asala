-- backend/schema.sql
-- Création de la base de données
CREATE DATABASE IF NOT EXISTS turath_ikbel;
USE turath_ikbel;

-- Table: cart (inchangée)
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    items JSON,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Table: categories (inchangée)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    nameAr VARCHAR(255),
    slug VARCHAR(255),
    icon VARCHAR(10),
    description TEXT,
    parentId INT,
    sortOrder INT DEFAULT 0,
    isActive TINYINT DEFAULT 1,
    createdAt DATETIME,
    updatedAt DATETIME,
    imageUrl TEXT,
    nameFr VARCHAR(255)
);

-- Table: comments
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    post_id INT,
    content TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: contact_messages (inchangée)
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: conversations (inchangée)
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT,
    user2_id INT,
    user1_type VARCHAR(50),
    user2_type VARCHAR(50),
    last_message TEXT,
    last_message_at DATETIME,
    user1_unread TINYINT DEFAULT 0,
    user2_unread TINYINT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: email_verification_codes (inchangée)
CREATE TABLE email_verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    code VARCHAR(10),
    expires_at DATETIME,
    used TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: followers
CREATE TABLE followers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT,
    following_id INT,
    created_at DATETIME
);

-- Table: helpful_vote
CREATE TABLE helpful_vote (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT,
    user_id INT,
    created_at DATETIME
);

-- Table: likes
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    post_id INT,
    created_at DATETIME
);

-- Table: messages (inchangée)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT,
    sender_id INT,
    receiver_id INT,
    message TEXT,
    is_read TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: newsletter (inchangée)
CREATE TABLE newsletter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    subscribed_at DATETIME,
    is_active TINYINT DEFAULT 1,
    updated_at DATETIME
);

-- Table: newsletter_subscribers (inchangée)
CREATE TABLE newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    subscribedAt DATETIME,
    unsubscribedAt DATETIME,
    isActive TINYINT DEFAULT 1
);

-- Table: order_items (inchangée)
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    product_name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INT,
    image TEXT,
    created_at DATETIME
);

-- Table: order_notifications
CREATE TABLE order_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    message TEXT,
    is_read TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: order_status_history
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INT,
    created_at DATETIME
);

-- Table: orders (inchangée)
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50),
    orderNumber VARCHAR(50),
    userId INT,
    vendorId INT,
    vendorName VARCHAR(255),
    customerName VARCHAR(255),
    customerEmail VARCHAR(255),
    customerPhone1 VARCHAR(50),
    customerPhone2 VARCHAR(50),
    governorate VARCHAR(100),
    delegation VARCHAR(100),
    postalCode VARCHAR(20),
    address TEXT,
    items TEXT,
    subtotal DECIMAL(10,2),
    shipping DECIMAL(10,2),
    shippingCost DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2),
    paymentMethod VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    promo_code VARCHAR(100),
    promo_discount DECIMAL(10,2) DEFAULT 0.00,
    adminNotes TEXT,
    trackingNumber VARCHAR(100),
    cancellationReason TEXT,
    deliveredAt DATETIME,
    cancelledAt DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Table: page_views (inchangée)
CREATE TABLE page_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT,
    page_url VARCHAR(500),
    page_title VARCHAR(255),
    time_on_page INT,
    created_at DATETIME
);

-- Table: password_resets (inchangée)
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    code VARCHAR(10),
    expires_at DATETIME,
    used TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: phone_verifications
CREATE TABLE phone_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20),
    code VARCHAR(10),
    expires_at DATETIME,
    used TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: post_comments
CREATE TABLE post_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    content TEXT,
    created_at DATETIME
);

-- Table: post_likes
CREATE TABLE post_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    created_at DATETIME
);

-- Table: posts (inchangée)
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendorId INT,
    vendorName VARCHAR(255),
    vendorAvatar TEXT,
    vendorVerified TINYINT DEFAULT 0,
    category VARCHAR(100),
    categoryId INT,
    productName VARCHAR(255),
    description TEXT,
    content TEXT,
    price DECIMAL(10,2),
    oldPrice DECIMAL(10,2),
    colors JSON,
    quantity INT,
    unit VARCHAR(50),
    inStock TINYINT DEFAULT 1,
    images JSON,
    status VARCHAR(50) DEFAULT 'pending',
    adminNotes TEXT,
    publishedAt DATETIME,
    likes INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    createdAt DATETIME,
    updatedAt DATETIME,
    isPinned TINYINT DEFAULT 0,
    rejectionReason TEXT,
    sizes JSON,
    hasColors TINYINT DEFAULT 0,
    hasShipping TINYINT DEFAULT 0,
    shippingCost DECIMAL(10,2) DEFAULT 0.00,
    shippingTime INT DEFAULT 3,
    stockStatus VARCHAR(50) DEFAULT 'in_stock',
    videoPublicId VARCHAR(255),
    videoUrl VARCHAR(500)
);

-- Table: product_images
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    image_url TEXT,
    is_primary TINYINT DEFAULT 0,
    created_at DATETIME
);

-- Table: product_likes
CREATE TABLE product_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT,
    user_id INT,
    created_at DATETIME
);

-- Table: products
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    category_id INT,
    images JSON,
    stock INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: reel_comments
CREATE TABLE reel_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reel_id INT,
    user_id INT,
    content TEXT,
    created_at DATETIME
);

-- Table: reel_likes
CREATE TABLE reel_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reel_id INT,
    user_id INT,
    created_at DATETIME
);

-- Table: reels
CREATE TABLE reels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    title VARCHAR(255),
    description TEXT,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: reels_backup (inchangée)
CREATE TABLE reels_backup (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    videoUrl VARCHAR(500),
    productId INT,
    vendorId INT,
    status VARCHAR(50),
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    createdAt DATETIME,
    updatedAt DATETIME,
    approved TINYINT DEFAULT 0,
    approvedAt DATETIME,
    rejectionReason TEXT
);

-- Table: review (inchangée)
CREATE TABLE review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rating INT,
    comment TEXT,
    productId INT,
    userId INT,
    status VARCHAR(50) DEFAULT 'pending',
    helpfulCount INT DEFAULT 0,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Table: sponsoredproducts (inchangée)
CREATE TABLE sponsoredproducts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    postId INT,
    price DECIMAL(10,3),
    oldPrice DECIMAL(10,3),
    displayOrder INT,
    isActive TINYINT DEFAULT 1,
    startDate DATETIME,
    endDate DATETIME,
    notes TEXT,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Table: users (inchangée)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    avatar TEXT,
    address VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    isActive TINYINT DEFAULT 1,
    lastLogin DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME,
    googleId VARCHAR(255),
    facebookId VARCHAR(255),
    isVerified TINYINT DEFAULT 0,
    verificationToken VARCHAR(255),
    verificationTokenExpires DATETIME,
    verifiedAt DATETIME,
    lastVerificationSent DATETIME,
    verificationAttempts INT DEFAULT 0,
    email_verified TINYINT DEFAULT 0,
    verification_token VARCHAR(255),
    verification_token_expires DATETIME,
    verified_at DATETIME,
    last_verification_sent DATETIME,
    verification_attempts INT DEFAULT 0,
    email_verification_code VARCHAR(10),
    email_code_expires DATETIME,
    is_active TINYINT DEFAULT 1
);

-- Table: users_backup (inchangée)
CREATE TABLE users_backup (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50),
    avatar TEXT,
    address VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expire DATETIME,
    isActive TINYINT DEFAULT 1,
    lastLogin DATETIME,
    createdAt DATETIME,
    updatedAt DATETIME,
    last_login DATETIME,
    updated_at DATETIME,
    created_at DATETIME,
    googleId VARCHAR(255),
    facebookId VARCHAR(255)
);

-- Table: vendor_passwords (inchangée)
CREATE TABLE vendor_passwords (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    user_id INT,
    plain_password VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: vendors (inchangée)
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    shopName VARCHAR(255),
    slug VARCHAR(255),
    description TEXT,
    specialty VARCHAR(255),
    location VARCHAR(255),
    coverImage TEXT,
    socialLinks TEXT,
    verified TINYINT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    totalReviews INT DEFAULT 0,
    followersCount INT DEFAULT 0,
    productsCount INT DEFAULT 0,
    createdAt DATETIME,
    updatedAt DATETIME,
    experience INT,
    approved TINYINT DEFAULT 0,
    status VARCHAR(50),
    rejectedAt DATETIME,
    approvedAt DATETIME,
    rejectionReason TEXT,
    avatar TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255)
);

-- Table: visits (inchangée)
CREATE TABLE visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255),
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_url VARCHAR(500),
    referrer VARCHAR(500),
    pages_viewed INT,
    time_spent INT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Table: wishlist
CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    created_at DATETIME
);

-- =====================================================
-- CRÉATION DES PROCÉDURES ET TRIGGERS
-- =====================================================

DELIMITER $$

-- Procédure : obtenir les statistiques du tableau de bord
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'vendor') as total_vendors,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM products) as active_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_posts,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered') as total_revenue;
END$$

-- Trigger : mettre à jour productsCount après ajout d'un produit
CREATE TRIGGER trg_after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    UPDATE vendors SET productsCount = productsCount + 1 WHERE id = NEW.vendor_id;
END$$

-- Trigger : mettre à jour productsCount après suppression d'un produit
CREATE TRIGGER trg_after_product_delete
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    UPDATE vendors SET productsCount = productsCount - 1 WHERE id = OLD.vendor_id;
END$$

DELIMITER ;

-- =====================================================
-- INSERTION DES DONNÉES DE TEST
-- =====================================================

-- Insertion des catégories (basé sur vos données)
INSERT INTO categories (id, name, nameAr, nameFr, slug, isActive, createdAt, updatedAt, imageUrl) VALUES
(22, 'المنتوجات التقليدية', 'المنتوجات التقليدية', 'Produits traditionnels', 'المنتوجات-التقليدية', 1, NOW(), NOW(), 'https://res.cloudinary.com/djfj85bwe/image/upload/v1777192580/turath/categories/category_category_1777192581147_88597146.jpg'),
(23, 'الحرف اليدوية', 'الحرف اليدوية', 'Artisanat', 'الحرف-اليدوية', 1, NOW(), NOW(), 'https://res.cloudinary.com/djfj85bwe/image/upload/v1777192595/turath/categories/category_category_1777192595813_629936751.jpg');

-- Insertion des utilisateurs de test
INSERT INTO users (id, name, email, password, role, isActive, createdAt, updatedAt, is_active) VALUES
(101, 'Administrateur', 'admin@turath.tn', '$2a$10$RGcS8AXR6aMalSH4Ec25o.iw8OCgyQ5xiMUh2pTX2uB27Zi9KU7JW', 'admin', 1, NOW(), NOW(), 1),
(102, 'admin123', 'utilisateur456@turath.com', '$2a$10$FhcndnN.sTF5wnATO4v83OFW6igwvP1BFITiOYKpLz8zEqc7wvdha', 'vendor', 1, NOW(), NOW(), 1);

-- Insertion des vendeurs
INSERT INTO vendors (id, userId, shopName, slug, description, specialty, location, verified, approved, status, createdAt, updatedAt, avatar, phone, email) VALUES
(6, 102, 'ikbel', 'ikbel', 'qsjcpqcsscqnkscqnscqnscnscnjcsqnqscnl', 'leather', 'تونس', 0, 1, 'approved', NOW(), NOW(), 'https://res.cloudinary.com/djfj85bwe/image/upload/v1781136663/turath/avatars/hvycnznkpt9fjfc154ri.jpg', '23456789', 'utilisateur456@turath.com');

-- Insertion des mots de passe vendeurs
INSERT INTO vendor_passwords (vendor_id, user_id, plain_password, created_at, updated_at) VALUES
(6, 102, 'ikbeldamdoum', NOW(), NOW());

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
SELECT 'VENDEUR : utilisateur456@turath.com / ikbeldamdoum' as '';
SELECT '========================================' as '';
