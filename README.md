# Tekstil Markaları Backend API

Bu proje, tekstil markalarını yönetmek için geliştirilmiş modern bir Node.js backend API'sidir.

## 🚀 Özellikler

- **RESTful API**: Markalar için tam CRUD işlemleri
- **Admin Paneli**: Web tabanlı yönetim arayüzü
- **Kimlik Doğrulama**: JWT tabanlı güvenli giriş sistemi
- **Veritabanı**: MongoDB ile veri saklama
- **Güvenlik**: Helmet, CORS, Rate Limiting
- **Validasyon**: Express-validator ile veri doğrulama
- **Responsive**: Mobil uyumlu admin paneli

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB (v4.4 veya üzeri)
- npm veya yarn

## 🛠️ Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd marka-backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın:**
```bash
# config.env dosyasını düzenleyin
MONGODB_URI=mongodb://localhost:27017/marka_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
ADMIN_EMAIL=admin@marka.com
ADMIN_PASSWORD=admin123
```

4. **MongoDB'yi başlatın:**
```bash
# MongoDB servisini başlatın
mongod
```

5. **Veritabanını başlatın:**
```bash
npm run init-db
```

6. **Sunucuyu başlatın:**
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

## 📚 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Admin girişi
- `GET /api/auth/verify` - Token doğrulama
- `POST /api/auth/change-password` - Şifre değiştirme
- `POST /api/auth/logout` - Çıkış yapma

### Markalar (Public)
- `GET /api/brands` - Tüm markaları listele
- `GET /api/brands/:id` - Tek marka getir
- `GET /api/brands/stats/categories` - Kategori istatistikleri

### Markalar (Admin)
- `POST /api/brands` - Yeni marka oluştur
- `PUT /api/brands/:id` - Marka güncelle
- `DELETE /api/brands/:id` - Marka sil
- `PATCH /api/brands/:id/toggle-status` - Marka durumunu değiştir
- `PATCH /api/brands/:id/sort-order` - Sıralama güncelle

### Admin Paneli
- `GET /api/admin/dashboard` - Dashboard istatistikleri
- `GET /api/admin/brands` - Admin için marka listesi
- `POST /api/admin/brands/bulk-action` - Toplu işlemler
- `POST /api/admin/brands/update-sort-orders` - Toplu sıralama

## 🎨 Admin Paneli

Admin paneli `admin.html` dosyasında bulunur ve şu özellikleri sunar:

- **Dashboard**: İstatistikler ve genel bakış
- **Marka Yönetimi**: Ekleme, düzenleme, silme
- **Toplu İşlemler**: Çoklu marka seçimi ve işlem
- **Arama ve Filtreleme**: Gelişmiş arama özellikleri
- **Responsive Tasarım**: Mobil uyumlu arayüz

### Admin Paneli Erişimi

1. Tarayıcıda `http://localhost:3000/admin.html` adresine gidin
2. Varsayılan giriş bilgileri:
   - **Email**: admin@marka.com
   - **Şifre**: admin123

## 🔧 Geliştirme

### Proje Yapısı
```
marka-backend/
├── models/           # Veritabanı modelleri
├── routes/           # API route'ları
├── middleware/       # Middleware fonksiyonları
├── scripts/          # Yardımcı scriptler
├── server.js         # Ana sunucu dosyası
├── admin.html        # Admin paneli
├── admin.js          # Admin paneli JavaScript
└── package.json      # Proje bağımlılıkları
```

### Script Komutları
```bash
npm start          # Sunucuyu başlat
npm run dev        # Geliştirme modunda başlat
npm run init-db    # Veritabanını başlat
npm test           # Testleri çalıştır
```

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifre hash'leme (bcrypt)
- Rate limiting (IP başına 100 istek/15dk)
- CORS koruması
- Helmet güvenlik başlıkları
- Input validasyonu

## 📊 Veritabanı Şeması

### Brand Modeli
```javascript
{
  name: String,           // Marka adı
  description: String,    // Açıklama
  logo: String,          // FontAwesome icon class
  telegram: String,      // Telegram linki
  whatsapp: String,      // WhatsApp linki
  website: String,       // Website linki
  category: String,      // Kategori
  isActive: Boolean,     // Aktif durumu
  sortOrder: Number,     // Sıralama
  contactInfo: Object,   // İletişim bilgileri
  socialMedia: Object,   // Sosyal medya linkleri
  tags: [String],        // Etiketler
  createdAt: Date,       // Oluşturulma tarihi
  updatedAt: Date        // Güncellenme tarihi
}
```

### Admin Modeli
```javascript
{
  username: String,      // Kullanıcı adı
  email: String,         // Email adresi
  password: String,      // Hash'lenmiş şifre
  role: String,          // Rol (admin/moderator)
  isActive: Boolean,     // Aktif durumu
  lastLogin: Date,       // Son giriş tarihi
  loginAttempts: Number, // Giriş deneme sayısı
  lockUntil: Date,       // Kilit bitiş tarihi
  createdAt: Date,       // Oluşturulma tarihi
  updatedAt: Date        // Güncellenme tarihi
}
```

## 🌐 Frontend Entegrasyonu

Mevcut frontend kodunuzu backend ile entegre etmek için:

1. **API çağrıları ekleyin:**
```javascript
// Markaları getir
fetch('http://localhost:3000/api/brands')
  .then(response => response.json())
  .then(data => {
    // Markaları göster
    data.data.forEach(brand => {
      // Frontend'e ekle
    });
  });
```

2. **Dinamik içerik oluşturun:**
```javascript
// Backend'den gelen verilerle marka kartları oluştur
function createBrandCard(brand) {
  return `
    <div class="brand-box" 
         data-telegram="${brand.telegram}" 
         data-whatsapp="${brand.whatsapp}">
      <div class="brand-logo"><i class="${brand.logo}"></i></div>
      <div class="brand-name">${brand.name}</div>
    </div>
  `;
}
```

## 🚀 Deployment

### Heroku
1. Heroku CLI'yi yükleyin
2. `heroku create your-app-name`
3. MongoDB Atlas bağlantısı ekleyin
4. `git push heroku main`

### Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

**Not**: Bu backend API, mevcut frontend kodunuzla tam uyumlu olacak şekilde tasarlanmıştır. Frontend kodunuzda herhangi bir değişiklik yapmadan API'yi kullanabilirsiniz.
