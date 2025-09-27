// Yeni admin kullanıcısı oluşturma scripti
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://marka-user:Mahsum.47@mahsumx.7mtvimh.mongodb.net/marka_db?retryWrites=true&w=majority&appName=Mahsumx';

async function createNewAdmin() {
    try {
        console.log('🚀 Yeni admin kullanıcısı oluşturuluyor...');
        
        // MongoDB bağlantısı
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB bağlantısı başarılı');

        // Eski admin'i sil
        await Admin.deleteMany({ username: 'admin' });
        console.log('🗑️ Eski admin kullanıcısı silindi');

        // Yeni admin oluştur
        const admin = new Admin({
            username: 'admin',
            email: 'admin@marka.com',
            password: 'Mahsum.47',
            role: 'admin'
        });
        
        await admin.save();
        console.log('✅ Yeni admin kullanıcısı oluşturuldu');
        console.log('📧 Email: admin@marka.com');
        console.log('🔑 Şifre: Mahsum.47');
        
    } catch (error) {
        console.error('❌ Admin oluşturma hatası:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Script çalıştır
createNewAdmin();
