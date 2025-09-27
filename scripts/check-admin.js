// Admin kullanıcısını kontrol etme scripti
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://marka-user:Mahsum.47@mahsumx.7mtvimh.mongodb.net/marka_db?retryWrites=true&w=majority&appName=Mahsumx';

async function checkAdmin() {
    try {
        console.log('🔍 Admin kullanıcısı kontrol ediliyor...');
        
        // MongoDB bağlantısı
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB bağlantısı başarılı');

        // Admin kullanıcısını bul
        const admin = await Admin.findOne({ email: 'admin@marka.com' });
        if (admin) {
            console.log('✅ Admin kullanıcısı bulundu:');
            console.log('📧 Email:', admin.email);
            console.log('👤 Username:', admin.username);
            console.log('🔑 Role:', admin.role);
            console.log('✅ Active:', admin.isActive);
            
            // Şifre kontrolü
            const isPasswordValid = await admin.comparePassword('Mahsum.47');
            console.log('🔐 Şifre kontrolü:', isPasswordValid ? '✅ Doğru' : '❌ Yanlış');
            
        } else {
            console.log('❌ Admin kullanıcısı bulunamadı');
            
            // Tüm admin'leri listele
            const allAdmins = await Admin.find({});
            console.log('📋 Mevcut admin kullanıcıları:');
            allAdmins.forEach(admin => {
                console.log(`- ${admin.email} (${admin.username})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Kontrol hatası:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Script çalıştır
checkAdmin();
