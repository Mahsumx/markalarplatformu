// Production veritabanı başlatma scripti
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Brand = require('../models/Brand');

// Production environment variables
require('dotenv').config({ path: './config.production.env' });

async function initProductionDatabase() {
    try {
        console.log('🚀 Production veritabanı başlatılıyor...');
        
        // MongoDB bağlantısı
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB bağlantısı başarılı');

        // Admin kullanıcısı oluştur
        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (!existingAdmin) {
            const admin = new Admin({
                username: 'admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            
            await admin.save();
            console.log('✅ Admin kullanıcısı oluşturuldu');
            console.log('📧 Email:', process.env.ADMIN_EMAIL);
        } else {
            console.log('ℹ️ Admin kullanıcısı zaten mevcut');
        }

        // Örnek markalar oluştur
        const existingBrands = await Brand.countDocuments();
        if (existingBrands === 0) {
            const sampleBrands = [
                {
                    name: 'Jakaro',
                    description: 'Kaliteli erkek giyim markası',
                    category: 'giyim',
                    logo: 'fas fa-crown',
                    telegram: 'https://t.me/jakaro',
                    whatsapp: 'https://wa.me/905xxxxxxxxx1',
                    website: 'https://jakaro.com',
                    isActive: true,
                    sortOrder: 1,
                    tags: ['erkek', 'kaliteli', 'moda']
                },
                {
                    name: 'Show Time',
                    description: 'Eğlenceli ve renkli giyim koleksiyonu',
                    category: 'giyim',
                    logo: 'fas fa-theater-masks',
                    telegram: 'https://t.me/showtime',
                    whatsapp: 'https://wa.me/905xxxxxxxxx2',
                    isActive: true,
                    sortOrder: 2,
                    tags: ['eğlenceli', 'renkli', 'genç']
                },
                {
                    name: 'Carlos',
                    description: 'Spor ve günlük giyim',
                    category: 'giyim',
                    logo: 'fas fa-car-side',
                    telegram: 'https://t.me/carlos',
                    whatsapp: 'https://wa.me/905xxxxxxxxx3',
                    isActive: true,
                    sortOrder: 3,
                    tags: ['spor', 'günlük', 'rahat']
                },
                {
                    name: 'The Champ',
                    description: 'Spor ve fitness giyim',
                    category: 'giyim',
                    logo: 'fas fa-trophy',
                    telegram: 'https://t.me/thechamp',
                    whatsapp: 'https://wa.me/905xxxxxxxxx4',
                    isActive: true,
                    sortOrder: 4,
                    tags: ['spor', 'fitness', 'aktif']
                },
                {
                    name: 'freestyle',
                    description: 'Özgür ve yaratıcı tasarımlar',
                    category: 'giyim',
                    logo: 'fas fa-wind',
                    telegram: 'https://t.me/freestyle',
                    whatsapp: 'https://wa.me/905xxxxxxxxx5',
                    isActive: true,
                    sortOrder: 5,
                    tags: ['özgür', 'yaratıcı', 'sanat']
                },
                {
                    name: 'Aranjor',
                    description: 'Müzik ve sanat temalı giyim',
                    category: 'giyim',
                    logo: 'fas fa-compact-disc',
                    telegram: 'https://t.me/aranjor',
                    whatsapp: 'https://wa.me/905xxxxxxxxx6',
                    isActive: true,
                    sortOrder: 6,
                    tags: ['müzik', 'sanat', 'kültür']
                },
                {
                    name: 'By Kaçan Tekstil',
                    description: 'Geleneksel ve modern tekstil ürünleri',
                    category: 'giyim',
                    logo: 'fas fa-running',
                    telegram: 'https://t.me/bykacan',
                    whatsapp: 'https://wa.me/905xxxxxxxxx7',
                    isActive: true,
                    sortOrder: 7,
                    tags: ['geleneksel', 'modern', 'tekstil']
                },
                {
                    name: 'Ebru Nakış',
                    description: 'El işi nakış ve dekoratif ürünler',
                    category: 'ev tekstili',
                    logo: 'fas fa-pen-nib',
                    telegram: 'https://t.me/ebrunakis',
                    whatsapp: 'https://wa.me/905xxxxxxxxx8',
                    isActive: true,
                    sortOrder: 8,
                    tags: ['el işi', 'nakış', 'dekoratif']
                },
                {
                    name: 'Eren Nakış',
                    description: 'Profesyonel nakış hizmetleri',
                    category: 'ev tekstili',
                    logo: 'fas fa-feather-alt',
                    telegram: 'https://t.me/erennakis',
                    whatsapp: 'https://wa.me/905xxxxxxxxx9',
                    isActive: true,
                    sortOrder: 9,
                    tags: ['profesyonel', 'nakış', 'hizmet']
                },
                {
                    name: 'Bizim Nakış',
                    description: 'Aile işletmesi nakış atölyesi',
                    category: 'ev tekstili',
                    logo: 'fas fa-handshake',
                    telegram: 'https://t.me/bizimnakis',
                    whatsapp: 'https://wa.me/905xxxxxxxxx10',
                    isActive: true,
                    sortOrder: 10,
                    tags: ['aile', 'atölye', 'nakış']
                }
            ];

            await Brand.insertMany(sampleBrands);
            console.log('✅ Örnek markalar oluşturuldu');
        } else {
            console.log('ℹ️ Markalar zaten mevcut');
        }

        console.log('🎉 Production veritabanı başlatma tamamlandı!');
        console.log('🌐 Site URL:', 'https://markalarplatformu.com');
        console.log('📧 Admin Email:', process.env.ADMIN_EMAIL);
        
    } catch (error) {
        console.error('❌ Production veritabanı başlatma hatası:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Script çalıştır
initProductionDatabase();
