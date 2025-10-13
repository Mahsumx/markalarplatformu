const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Marka adı gereklidir'],
        trim: true,
        unique: true,
        maxlength: [100, 'Marka adı 100 karakterden fazla olamaz']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Açıklama 500 karakterden fazla olamaz']
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [150, 'Kısa açıklama 150 karakterden fazla olamaz']
    },
    logo: {
        type: String,
        default: 'fas fa-tag' // FontAwesome icon class or image URL
    },
    logoType: {
        type: String,
        enum: ['icon', 'image'],
        default: 'icon'
    },
    telegram: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https:\/\/t\.me\/.+/.test(v);
            },
            message: 'Geçerli bir Telegram linki giriniz'
        }
    },
    whatsapp: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https:\/\/wa\.me\/.+/.test(v);
            },
            message: 'Geçerli bir WhatsApp linki giriniz'
        }
    },
    website: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Geçerli bir website linki giriniz'
        }
    },
    category: {
        type: String,
        enum: ['giyim', 'ayakkabı', 'aksesuar', 'ev tekstili', 'diğer'],
        default: 'giyim'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    contactInfo: {
        phone: String,
        email: String,
        address: String
    },
    socialMedia: {
        instagram: String,
        facebook: String,
        twitter: String
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Güncelleme tarihini otomatik güncelle
brandSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index'ler
brandSchema.index({ name: 'text', description: 'text', tags: 'text' });
brandSchema.index({ category: 1 });
brandSchema.index({ isActive: 1 });
brandSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Brand', brandSchema);
