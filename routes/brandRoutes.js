const express = require('express');
const Brand = require('../models/Brand');
const { validateBrandCreate, validateBrandUpdate, validateId, validatePagination } = require('../middleware/validation');
const { authenticateToken, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Tüm markaları getir (public)
router.get('/', validatePagination, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const { search, category, isActive, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;
        
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
        console.error('Markalar getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Markalar getirilemedi'
        });
    }
});

// Tek marka getir (public)
router.get('/:id', validateId, async (req, res) => {
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
        console.error('Marka getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka getirilemedi'
        });
    }
});

// Yeni marka oluştur (admin/moderator)
router.post('/', authenticateToken, requireModerator, validateBrandCreate, async (req, res) => {
    try {
        const brandData = req.body;
        
        // Marka adı benzersizlik kontrolü
        const existingBrand = await Brand.findOne({ name: brandData.name });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir marka zaten mevcut'
            });
        }
        
        const brand = new Brand(brandData);
        await brand.save();
        
        res.status(201).json({
            success: true,
            message: 'Marka başarıyla oluşturuldu',
            data: brand
        });
    } catch (error) {
        console.error('Marka oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka oluşturulamadı'
        });
    }
});

// Marka güncelle (admin/moderator)
router.put('/:id', authenticateToken, requireModerator, validateBrandUpdate, async (req, res) => {
    try {
        const brandData = req.body;
        
        // Marka adı benzersizlik kontrolü (eğer isim değiştiriliyorsa)
        if (brandData.name) {
            const existingBrand = await Brand.findOne({ 
                name: brandData.name, 
                _id: { $ne: req.params.id } 
            });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu isimde bir marka zaten mevcut'
                });
            }
        }
        
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            brandData,
            { new: true, runValidators: true }
        ).select('-__v');
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }
        
        res.json({
            success: true,
            message: 'Marka başarıyla güncellendi',
            data: brand
        });
    } catch (error) {
        console.error('Marka güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka güncellenemedi'
        });
    }
});

// Marka sil (admin/moderator)
router.delete('/:id', authenticateToken, requireModerator, validateId, async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }
        
        res.json({
            success: true,
            message: 'Marka başarıyla silindi'
        });
    } catch (error) {
        console.error('Marka silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka silinemedi'
        });
    }
});

// Marka durumunu değiştir (aktif/pasif)
router.patch('/:id/toggle-status', authenticateToken, requireModerator, validateId, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }
        
        brand.isActive = !brand.isActive;
        await brand.save();
        
        res.json({
            success: true,
            message: `Marka ${brand.isActive ? 'aktif' : 'pasif'} hale getirildi`,
            data: brand
        });
    } catch (error) {
        console.error('Marka durum değiştirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka durumu değiştirilemedi'
        });
    }
});

// Marka sıralamasını güncelle
router.patch('/:id/sort-order', authenticateToken, requireModerator, validateId, async (req, res) => {
    try {
        const { sortOrder } = req.body;
        
        if (typeof sortOrder !== 'number' || sortOrder < 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir sıralama değeri giriniz'
            });
        }
        
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { sortOrder },
            { new: true }
        ).select('-__v');
        
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Marka bulunamadı'
            });
        }
        
        res.json({
            success: true,
            message: 'Marka sıralaması güncellendi',
            data: brand
        });
    } catch (error) {
        console.error('Marka sıralama güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Marka sıralaması güncellenemedi'
        });
    }
});

// Kategorilere göre istatistikler
router.get('/stats/categories', async (req, res) => {
    try {
        const stats = await Brand.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    active: { $sum: { $cond: ['$isActive', 1, 0] } }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Kategori istatistikleri hatası:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler getirilemedi'
        });
    }
});

module.exports = router;
