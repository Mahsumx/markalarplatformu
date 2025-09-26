const express = require('express');
const Brand = require('../models/Brand');
const Admin = require('../models/Admin');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// Admin dashboard istatistikleri
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const [
            totalBrands,
            activeBrands,
            inactiveBrands,
            categoryStats,
            recentBrands,
            adminStats
        ] = await Promise.all([
            Brand.countDocuments(),
            Brand.countDocuments({ isActive: true }),
            Brand.countDocuments({ isActive: false }),
            Brand.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            Brand.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name category isActive createdAt'),
            Admin.countDocuments({ isActive: true })
        ]);
        
        res.json({
            success: true,
            data: {
                brands: {
                    total: totalBrands,
                    active: activeBrands,
                    inactive: inactiveBrands
                },
                categories: categoryStats,
                recentBrands,
                admins: {
                    total: adminStats
                }
            }
        });
    } catch (error) {
        console.error('Dashboard istatistikleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler getirilemedi'
        });
    }
});

// Tüm markaları admin paneli için getir
router.get('/brands', authenticateToken, validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const { search, category, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Filtreleme kriterleri
        const filter = {};
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        if (category) {
            filter.category = category;
        }
        
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        
        // Sıralama
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const brands = await Brand.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v');
        
        const total = await Brand.countDocuments(filter);
        
        res.json({
            success: true,
            data: brands,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Admin marka listesi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka listesi getirilemedi'
        });
    }
});

// Marka detayları (admin paneli için)
router.get('/brands/:id', authenticateToken, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id).select('-__v');
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }
        
        res.json({
            success: true,
            data: brand
        });
    } catch (error) {
        console.error('Marka detay hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka detayları getirilemedi'
        });
    }
});

// Toplu marka işlemleri
router.post('/brands/bulk-action', authenticateToken, async (req, res) => {
    try {
        const { action, brandIds } = req.body;
        
        if (!action || !brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir işlem ve marka ID listesi giriniz'
            });
        }
        
        let result;
        
        switch (action) {
            case 'activate':
                result = await Brand.updateMany(
                    { _id: { $in: brandIds } },
                    { isActive: true }
                );
                break;
                
            case 'deactivate':
                result = await Brand.updateMany(
                    { _id: { $in: brandIds } },
                    { isActive: false }
                );
                break;
                
            case 'delete':
                result = await Brand.deleteMany({ _id: { $in: brandIds } });
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz işlem türü'
                });
        }
        
        res.json({
            success: true,
            message: `${result.modifiedCount || result.deletedCount} marka işlendi`,
            data: {
                action,
                processedCount: result.modifiedCount || result.deletedCount
            }
        });
    } catch (error) {
        console.error('Toplu işlem hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Toplu işlem gerçekleştirilemedi'
        });
    }
});

// Marka sıralamasını toplu güncelle
router.post('/brands/update-sort-orders', authenticateToken, async (req, res) => {
    try {
        const { sortOrders } = req.body; // [{ id: '...', sortOrder: 1 }, ...]
        
        if (!Array.isArray(sortOrders)) {
            return res.status(400).json({
                success: false,
                message: 'Sıralama verileri bir dizi olmalıdır'
            });
        }
        
        const bulkOps = sortOrders.map(item => ({
            updateOne: {
                filter: { _id: item.id },
                update: { sortOrder: item.sortOrder }
            }
        }));
        
        const result = await Brand.bulkWrite(bulkOps);
        
        res.json({
            success: true,
            message: 'Sıralamalar güncellendi',
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Sıralama güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sıralamalar güncellenemedi'
        });
    }
});

// Sistem ayarları
router.get('/settings', authenticateToken, requireAdmin, (req, res) => {
    res.json({
        success: true,
        data: {
            appName: 'Tekstil Markaları Yönetim Sistemi',
            version: '1.0.0',
            maxFileSize: '10MB',
            allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            categories: ['giyim', 'ayakkabı', 'aksesuar', 'ev tekstili', 'diğer'],
            pagination: {
                defaultLimit: 20,
                maxLimit: 100
            }
        }
    });
});

// Sistem ayarlarını güncelle
router.put('/settings', authenticateToken, requireAdmin, (req, res) => {
    // Bu endpoint gelecekte sistem ayarlarını veritabanında saklamak için kullanılabilir
    res.json({
        success: true,
        message: 'Ayarlar güncellendi (şu anda sadece demo)'
    });
});

// Yedekleme bilgileri
router.get('/backup-info', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const brandCount = await Brand.countDocuments();
        const adminCount = await Admin.countDocuments();
        
        res.json({
            success: true,
            data: {
                lastBackup: new Date().toISOString(), // Gerçek uygulamada veritabanından alınmalı
                totalBrands: brandCount,
                totalAdmins: adminCount,
                databaseSize: 'N/A', // Gerçek uygulamada hesaplanmalı
                backupFrequency: 'Günlük'
            }
        });
    } catch (error) {
        console.error('Yedekleme bilgileri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Yedekleme bilgileri getirilemedi'
        });
    }
});

module.exports = router;
