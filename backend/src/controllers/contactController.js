const db = require('../models/db');

exports.getUnreadCount = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM contact_messages 
      WHERE status IN ('pending', 'unread')
    `);
    
    const count = result && result[0] ? result[0].count : 0;
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('❌ getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('pending', 'unread') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as \`read\`,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
      FROM contact_messages
    `);

    const result = stats && stats[0]
      ? stats[0]
      : { total: 0, pending: 0, read: 0, replied: 0, archived: 0, today: 0 };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let sql = `SELECT * FROM contact_messages WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const messages = await db.query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM contact_messages WHERE 1=1`;
    const countParams = [];

    if (status) {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }

    if (search) {
      countSql += ` AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)`;
      const term = `%${search}%`;
      countParams.push(term, term, term, term);
    }

    const totalResult = await db.query(countSql, countParams);
    const total = totalResult && totalResult[0] ? totalResult[0].total : 0;

    res.json({
      success: true,
      data: messages || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ getAdminMessages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAdminMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await db.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );

    const message = messages && messages[0] ? messages[0] : null;

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ getAdminMessageById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, source } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'الاسم والبريد الإلكتروني والموضوع والرسالة مطلوبة'
      });
    }

    const result = await db.query(`
      INSERT INTO contact_messages
      (name, email, phone, subject, message, source, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
    `, [
      name,
      email,
      phone || null,
      subject,
      message,
      source || 'contact_page'
    ]);

    res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح',
      data: {
        id: result?.insertId || null
      }
    });
  } catch (error) {
    console.error('❌ sendContactMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`
      UPDATE contact_messages
      SET status = 'read', updated_at = NOW()
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
  } catch (error) {
    console.error('❌ markAsRead:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['pending', 'unread', 'read', 'replied', 'archived'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    let updateSql = 'UPDATE contact_messages SET updated_at = NOW()';
    const updateParams = [];

    if (status) {
      updateSql += ', status = ?';
      updateParams.push(status);
    }

    if (adminNotes !== undefined) {
      updateSql += ', admin_notes = ?';
      updateParams.push(adminNotes);
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(id);

    await db.query(updateSql, updateParams);

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ updateMessageStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId || req.body.id;
    const replyMessage = req.body.reply || req.body.message || req.body.replyMessage || '';
    const adminNotes = req.body.adminNotes || '';

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'messageId est requis'
      });
    }

    const existing = await db.query(
      'SELECT * FROM contact_messages WHERE id = ?',
      [messageId]
    );

    if (!existing || !existing[0]) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    const previousNotes = existing[0].admin_notes || '';
    const combinedNotes = [
      previousNotes,
      adminNotes,
      replyMessage ? `Réponse admin: ${replyMessage}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');

    await db.query(`
      UPDATE contact_messages
      SET status = 'replied',
          admin_notes = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [combinedNotes, messageId]);

    res.json({
      success: true,
      message: 'Réponse enregistrée avec succès'
    });
  } catch (error) {
    console.error('❌ replyToMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Alias pour compatibilité
exports.getContactStats = exports.getAdminStats;
exports.getContactMessages = exports.getAdminMessages;
exports.getContactMessageById = exports.getAdminMessageById;
exports.deleteContactMessage = exports.deleteMessage;