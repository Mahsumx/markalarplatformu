const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT token doğrulama middleware'i
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Erişim token\'ı gerekli'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token veya kullanıcı aktif değil'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş'
            });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

// Admin rolü kontrolü
const requireAdmin = (req, res, next) => {
    if (req.admin.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gerekli'
        });
    }
    next();
};

// Moderator veya Admin rolü kontrolü
const requireModerator = (req, res, next) => {
    if (!['admin', 'moderator'].includes(req.admin.role)) {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için yetki gerekli'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireModerator
};
