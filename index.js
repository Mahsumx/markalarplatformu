// api/index.js

const mongoose = require('mongoose');

// ===================================================================
// DİKKAT: Veritabanı modeli (Marka şeması) henüz tanımlanmadı.
// Projenizdeki marka modelinizin yolunu ve adını buraya eklemelisiniz.
// Aşağıdaki satır örnek bir yoldur, kendi dosyanıza göre düzeltin.
// ===================================================================
// const Marka = require('../models/markaModel'); 

// Global bağlantı durumunu Vercel'de yeniden başlatma maliyetini azaltmak için tutarız
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const dbUrl = process.env.DATABASE_URL;

        if (!dbUrl) {
            throw new Error("DATABASE_URL Vercel'de tanımlanmadı!");
        }

        cached.promise = mongoose.connect(dbUrl, {
            bufferCommands: false, // Sunucusuz fonksiyonlar için önerilir
        }).then(mongoose => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = async (req, res) => {
    // API çağrılarında tarayıcıların sorun yaşamaması için CORS izni ekleyelim
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Content-Type', 'application/json');

    try {
        // 1. Veritabanına Bağlan
        const conn = await connectToDatabase();
        // db.connection.readyState kontrolü ile bağlantıyı kontrol edebilirsiniz

        // 2. Markaları Çek
        
        // ===================================================================
        // Marka modeliniz varsa, aşağıdaki satırı kullanın:
        // const markalar = await conn.model('Marka').find({});
        // (model adınız Marka ise)
        // ===================================================================
        
        // Eğer modelinizi henüz import edemiyorsanız, test için boş dizi gönderelim:
        const markalar = []; 

        // 3. Başarılı Yanıtı Gönderme
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: markalar }));

    } catch (error) {
        console.error("API hatası:", error);

        // 4. Hata Yanıtını Gönderme
        res.statusCode = 500;
        res.end(JSON.stringify({ 
            success: false, 
            message: 'Sunucu hatası: Markalar yüklenemedi. Logları kontrol edin.',
            error: error.message // Hata mesajını geçmek, sorunu anlamanıza yardımcı olur
        }));
    }
};