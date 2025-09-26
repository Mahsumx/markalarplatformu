const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { validateLogin, validateAdminCreate } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin girişi
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Admin bul
        const admin = await Admin.findOne({ email, isActive: true });
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }
        
        // Hesap kilitli mi kontrol et
        if (admin.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Hesap geçici olarak kilitlenmiştir. Lütfen daha sonra tekrar deneyin.'
            });
        }
        
        // Şifre kontrolü
        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            // Başarısız giriş denemesini kaydet
            await admin.incLoginAttempts();
            
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }
        
        // Başarılı giriş - deneme sayısını sıfırla
        await admin.resetLoginAttempts();
        
        // JWT token oluştur
        const token = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Giriş başarılı',
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş yapılamadı'
        });
    }
});

// Token doğrulama
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            admin: {
                id: req.admin._id,
                username: req.admin.username,
                email: req.admin.email,
                role: req.admin.role
            }
        }
    });
});

// Şifre değiştirme
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre ve yeni şifre gereklidir'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır'
            });
        }
        
        const admin = await Admin.findById(req.admin._id);
        
        // Mevcut şifre kontrolü
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Mevcut şifre yanlış'
            });
        }
        
        // Yeni şifreyi kaydet
        admin.password = newPassword;
        await admin.save();
        
        res.json({
            success: true,
            message: 'Şifre başarıyla değiştirildi'
        });
    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre değiştirilemedi'
        });
    }
});

// Yeni admin oluştur (sadece admin)
router.post('/create-admin', authenticateToken, requireAdmin, validateAdminCreate, async (req, res) => {
    try {
        const { username, email, password, role = 'moderator' } = req.body;
        
        // Email benzersizlik kontrolü
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor'
            });
        }
        
        // Username benzersizlik kontrolü
        const existingUsername = await Admin.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Bu kullanıcı adı zaten kullanılıyor'
            });
        }
        
        const admin = new Admin({
            username,
            email,
            password,
            role
        });
        
        await admin.save();
        
        res.status(201).json({
            success: true,
            message: 'Admin kullanıcısı başarıyla oluşturuldu',
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Admin kullanıcısı oluşturulamadı'
        });
    }
});

// Admin listesi (sadece admin)
router.get('/admins', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const admins = await Admin.find({})
            .select('-password -__v')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Admin listesi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Admin listesi getirilemedi'
        });
    }
});

// Admin durumunu değiştir (aktif/pasif)
router.patch('/admins/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin bulunamadı'
            });
        }
        
        // Kendi hesabını pasif yapmaya izin verme
        if (admin._id.toString() === req.admin._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Kendi hesabınızı pasif yapamazsınız'
            });
        }
        
        admin.isActive = !admin.isActive;
        await admin.save();
        
        res.json({
            success: true,
            message: `Admin ${admin.isActive ? 'aktif' : 'pasif'} hale getirildi`,
            data: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                isActive: admin.isActive
            }
        });
    } catch (error) {
        console.error('Admin durum değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Admin durumu değiştirilemedi'
        });
    }
});

// Çıkış yapma (token'ı geçersiz kılma için client-side'da token'ı silmek yeterli)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Çıkış yapıldı'
    });
});

module.exports = router;
