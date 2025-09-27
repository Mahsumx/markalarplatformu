// Admin bilgilerini güncelleme scripti
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://marka-user:Mahsum.47@mahsumx.7mtvimh.mongodb.net/marka_db?retryWrites=true&w=majority&appName=Mahsumx';

async function updateAdminCredentials() {
    try {
        console.log('🚀 Admin bilgileri güncelleniyor...');
        
        // MongoDB bağlantısı
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB bağlantısı başarılı');

        // Mevcut admin'i bul ve güncelle
        const admin = await Admin.findOne({ username: 'admin' });
        if (admin) {
            admin.email = 'admin@marka.com';
            admin.password = 'Mahsum.47';
            await admin.save();
            console.log('✅ Admin bilgileri güncellendi');
            console.log('📧 Email: admin@marka.com');
            console.log('🔑 Şifre: Mahsum.47');
        } else {
            console.log('❌ Admin kullanıcısı bulunamadı');
        }
        
    } catch (error) {
        console.error('❌ Admin güncelleme hatası:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Script çalıştır
updateAdminCredentials();
