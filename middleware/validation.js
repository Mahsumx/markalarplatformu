const { body, param, query, validationResult } = require('express-validator');

// Validation hatalarını işleme
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz veri',
            errors: errors.array()
        });
    }
    next();
};

// Marka oluşturma validasyonu
const validateBrandCreate = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Marka adı gereklidir')
        .isLength({ min: 2, max: 100 })
        .withMessage('Marka adı 2-100 karakter arasında olmalıdır'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama 500 karakterden fazla olamaz'),
    
    body('shortDescription')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Kısa açıklama 150 karakterden fazla olamaz'),
    
    body('logo')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Logo 200 karakterden fazla olamaz'),
    
    body('logoType')
        .optional()
        .isIn(['icon', 'image'])
        .withMessage('Logo türü icon veya image olmalıdır'),
    
    body('telegram')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('Telegram URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('whatsapp')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('WhatsApp URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('website')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '' && value !== 'https://example.com') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('Website URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('category')
        .optional()
        .isIn(['giyim', 'ayakkabı', 'aksesuar', 'ev tekstili', 'diğer'])
        .withMessage('Geçerli bir kategori seçiniz'),
    
    body('sortOrder')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Sıralama değeri 0 veya pozitif bir sayı olmalıdır'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Etiketler bir dizi olmalıdır'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Her etiket 1-30 karakter arasında olmalıdır'),
    
    handleValidationErrors
];

// Marka güncelleme validasyonu
const validateBrandUpdate = [
    param('id')
        .isMongoId()
        .withMessage('Geçerli bir marka ID\'si giriniz'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Marka adı 2-100 karakter arasında olmalıdır'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama 500 karakterden fazla olamaz'),
    
    body('shortDescription')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Kısa açıklama 150 karakterden fazla olamaz'),
    
    body('logo')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Logo 200 karakterden fazla olamaz'),
    
    body('logoType')
        .optional()
        .isIn(['icon', 'image'])
        .withMessage('Logo türü icon veya image olmalıdır'),
    
    body('telegram')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('Telegram URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('whatsapp')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('WhatsApp URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('website')
        .optional()
        .custom((value) => {
            if (value && value.trim() !== '' && value !== 'https://example.com') {
                // Boş değilse URL formatında olmalı
                if (!value.startsWith('http')) {
                    throw new Error('Website URL\'si http:// veya https:// ile başlamalıdır');
                }
            }
            return true;
        }),
    
    body('category')
        .optional()
        .isIn(['giyim', 'ayakkabı', 'aksesuar', 'ev tekstili', 'diğer'])
        .withMessage('Geçerli bir kategori seçiniz'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive değeri boolean olmalıdır'),
    
    body('sortOrder')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Sıralama değeri 0 veya pozitif bir sayı olmalıdır'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Etiketler bir dizi olmalıdır'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Her etiket 1-30 karakter arasında olmalıdır'),
    
    handleValidationErrors
];

// Admin oluşturma validasyonu
const validateAdminCreate = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Kullanıcı adı gereklidir')
        .isLength({ min: 3, max: 30 })
        .withMessage('Kullanıcı adı 3-30 karakter arasında olmalıdır')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Kullanıcı adı sadece harf, rakam ve _ içerebilir'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email gereklidir')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    
    body('password')
        .notEmpty()
        .withMessage('Şifre gereklidir')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    
    body('role')
        .optional()
        .isIn(['admin', 'moderator'])
        .withMessage('Geçerli bir rol seçiniz'),
    
    handleValidationErrors
];

// Giriş validasyonu
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email gereklidir')
        .isEmail()
        .withMessage('Geçerli bir email adresi giriniz'),
    
    body('password')
        .notEmpty()
        .withMessage('Şifre gereklidir'),
    
    handleValidationErrors
];

// ID parametresi validasyonu
const validateId = [
    param('id')
        .isMongoId()
        .withMessage('Geçerli bir ID giriniz'),
    
    handleValidationErrors
];

// Sayfalama validasyonu
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Sayfa numarası 1 veya daha büyük olmalıdır'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit 1-100 arasında olmalıdır'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateBrandCreate,
    validateBrandUpdate,
    validateAdminCreate,
    validateLogin,
    validateId,
    validatePagination
};