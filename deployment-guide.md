# 🚀 Markalar Platformu (markalarplatformu.com) Deployment Rehberi

## 📋 Ön Gereksinimler

### 1. Domain Satın Alma
- **Domain:** `markalarplatformu.com` (✅ Mevcut ve satın alınabilir)
- **Domain Registrar:** GoDaddy, Namecheap, Türk.net, vs.
- **Fiyat:** Yıllık $8-15 arası

### 2. Hosting Seçimi

#### A) **Vercel (Önerilen - Ücretsiz)**
- ✅ Node.js desteği
- ✅ Otomatik SSL
- ✅ CDN
- ✅ Ücretsiz plan

#### B) **Heroku**
- ✅ Kolay deployment
- ✅ MongoDB Atlas entegrasyonu
- ⚠️ Ücretli plan gerekli

#### C) **DigitalOcean**
- ✅ Tam kontrol
- ✅ Uygun fiyat
- ⚠️ Teknik bilgi gerekli

### 3. Veritabanı (MongoDB Atlas)
- ✅ Ücretsiz plan (512MB)
- ✅ Cloud hosting
- ✅ Otomatik yedekleme

## 🛠️ Adım Adım Deployment

### Adım 1: MongoDB Atlas Kurulumu

1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Yeni cluster oluşturun (M0 - Free)
3. Database User oluşturun
4. Network Access ayarlayın (0.0.0.0/0)
5. Connection string'i alın:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/marka_db
   ```

### Adım 2: Domain Satın Alma

1. Domain registrar'da hesap oluşturun
2. İstediğiniz domain'i satın alın
3. DNS ayarlarını not edin

### Adım 3: Vercel ile Deployment

#### A) Vercel Hesabı
1. [Vercel.com](https://vercel.com) hesabı oluşturun
2. GitHub ile bağlayın

#### B) Proje Hazırlığı
1. Projeyi GitHub'a yükleyin
2. `package.json`'a build script ekleyin:
   ```json
   {
     "scripts": {
       "build": "echo 'No build step required'",
       "start": "node server.js"
     }
   }
   ```

#### C) Vercel Deployment
1. Vercel'de "New Project" tıklayın
2. GitHub repository'nizi seçin
3. Environment Variables ekleyin:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marka_db
   JWT_SECRET=your_strong_secret_here
   NODE_ENV=production
   CORS_ORIGIN=https://yourdomain.com
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourStrongPassword123
   ```
4. Deploy edin

### Adım 4: Domain Bağlama

#### A) Vercel'de Domain Ekleme
1. Project Settings > Domains
2. Custom domain ekleyin
3. DNS ayarlarını alın

#### B) DNS Ayarları
Domain registrar'da DNS ayarlarını yapın:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Adım 5: SSL Sertifikası
- Vercel otomatik SSL sağlar
- Domain bağlandıktan sonra aktif olur

## 🔧 Production Ayarları

### 1. Environment Variables Güncelleme
`config.production.env` dosyasını kullanarak:

```bash
# Güçlü JWT secret oluşturun
JWT_SECRET=$(openssl rand -base64 32)

# Güçlü admin şifresi
ADMIN_PASSWORD=YourVeryStrongPassword123!@#
```

### 2. Güvenlik Kontrolleri
- [ ] Admin şifresi değiştirildi
- [ ] JWT secret güçlü
- [ ] CORS sadece domain'inize izin veriyor
- [ ] HTTPS aktif
- [ ] Rate limiting aktif

### 3. Veritabanı Başlatma
```bash
# Admin kullanıcısını oluşturun
npm run init-db
```

## 📱 Test Etme

### 1. Ana Sayfa Testi
- `https://yourdomain.com` - Ana sayfa
- `https://yourdomain.com/admin.html` - Admin paneli

### 2. API Testi
```bash
curl https://yourdomain.com/api/brands
```

### 3. Admin Paneli Testi
- Giriş: `admin@yourdomain.com` / `YourStrongPassword123!@#`

## 🚨 Yaygın Sorunlar ve Çözümler

### 1. CORS Hatası
```javascript
// server.js'de domain'inizi ekleyin
origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
```

### 2. MongoDB Bağlantı Hatası
- MongoDB Atlas'ta IP whitelist kontrolü
- Connection string doğruluğu
- Database user permissions

### 3. SSL Sertifika Sorunu
- Vercel otomatik SSL sağlar
- 24 saat içinde aktif olur

## 💰 Maliyet Tahmini

### Aylık Maliyetler:
- **Domain:** $1-4/ay
- **Vercel:** Ücretsiz
- **MongoDB Atlas:** Ücretsiz (M0 plan)
- **Toplam:** $1-4/ay

### Yıllık Maliyetler:
- **Domain:** $10-50/yıl
- **Diğer:** Ücretsiz
- **Toplam:** $10-50/yıl

## 📞 Destek

Sorun yaşarsanız:
1. Vercel Dashboard'da logs kontrol edin
2. MongoDB Atlas'ta connection status kontrol edin
3. Browser Developer Tools'da network errors kontrol edin

---

**Not:** Bu rehber Vercel için hazırlanmıştır. Diğer hosting sağlayıcıları için benzer adımlar uygulanabilir.
