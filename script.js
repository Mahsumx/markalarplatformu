document.addEventListener('DOMContentLoaded', () => {
    const brandContainer = document.querySelector('.brand-container');
    const modal = document.getElementById('contactModal');
    const modalBrandName = document.getElementById('modalBrandName');
    const telegramLink = document.getElementById('telegram-link');
    const whatsappLink = document.getElementById('whatsapp-link');
    const closeButton = document.querySelector('.close-button');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // ⚠️ DÜZELTME: Production ve development için dinamik API URL
    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
        ? 'http://localhost:3000/api' 
        : '/api'; 
    
    // Markaları saklamak için
    let allBrands = [];
    let filteredBrands = [];

    // Rastgele renk seçici
    const getRandomColor = () => {
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 
                        'color-6', 'color-7', 'color-8', 'color-9', 'color-10'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // Marka kutusu oluştur
    const createBrandBox = (brand) => {
        const brandBox = document.createElement('div');
        brandBox.className = 'brand-box';
        brandBox.setAttribute('data-telegram', brand.telegram || '');
        brandBox.setAttribute('data-whatsapp', brand.whatsapp || '');
        
        const randomColor = getRandomColor();
        
        // Marka logosu için özel tasarım
        let logoHtml = '';
        if (brand.logoType === 'image' && brand.logo) {
            // Gerçek logo resmi
            logoHtml = `<div class="brand-logo brand-logo-image">
                <img src="${brand.logo}" alt="${brand.name} Logo" class="brand-logo-img">
                <div class="logo-glow"></div>
            </div>`;
        } else if (brand.logo && brand.logo.startsWith('fas fa-')) {
            // FontAwesome ikonları için özel tasarım
            logoHtml = `<div class="brand-logo ${randomColor}">
                <i class="${brand.logo}"></i>
                <div class="logo-glow"></div>
            </div>`;
        } else {
            // Varsayılan logo
            logoHtml = `<div class="brand-logo ${randomColor}">
                <i class="fas fa-tag"></i>
                <div class="logo-glow"></div>
            </div>`;
        }
        
        // Kısa açıklama varsa ekle
        const descriptionHtml = brand.shortDescription ? 
            `<div class="brand-description">${brand.shortDescription}</div>` : '';
        
        brandBox.innerHTML = `
            ${logoHtml}
            <div class="brand-name">${brand.name}</div>
            <div class="brand-category">${brand.category || 'Tekstil'}</div>
            ${descriptionHtml}
        `;
        
        return brandBox;
    };

    // Marka event listener'larını ekle
    const addBrandEventListeners = () => {
        const brandBoxes = document.querySelectorAll('.brand-box');
        
        brandBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const brandName = box.querySelector('.brand-name').textContent;
                const telegramUrl = box.getAttribute('data-telegram');
                const whatsappUrl = box.getAttribute('data-whatsapp');

                modalBrandName.textContent = brandName;
                telegramLink.href = telegramUrl;
                whatsappLink.href = whatsappUrl;

                modal.style.display = 'flex';
            });
        });
    };

    // Markaları render et
    const renderBrands = () => {
        brandContainer.innerHTML = '';
        
        if (filteredBrands.length === 0) {
            brandContainer.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">Aradığınız kriterlere uygun marka bulunamadı.</p>';
        } else {
            // Markaları rastgele sırala (her render'da farklı sıralama)
            const shuffledBrands = [...filteredBrands].sort(() => Math.random() - 0.5);
            
            shuffledBrands.forEach(brand => {
                const brandBox = createBrandBox(brand);
                brandContainer.appendChild(brandBox);
            });
        }
        
        // Event listener'ları ekle
        addBrandEventListeners();
    };

    // Statik markaları yükle (fallback)
    const loadStaticBrands = () => {
        // Mevcut DOM'daki statik markaları API veri yapısına dönüştür
        allBrands = Array.from(document.querySelectorAll('.brand-box')).map(box => {
            const logoElement = box.querySelector('.brand-logo i');
            return {
                _id: box.getAttribute('data-id') || Math.random().toString(36).substr(2, 9),
                name: box.querySelector('.brand-name').textContent,
                telegram: box.getAttribute('data-telegram'),
                whatsapp: box.getAttribute('data-whatsapp'),
                logo: logoElement ? logoElement.className : 'fas fa-tag' 
            };
        });
        filteredBrands = [...allBrands];
        renderBrands(); 
    };

    // Backend'den markaları yükle
    const loadBrands = async () => {
        // Yükleniyor göstergesini göster (Eğer varsa)
        if (loadingIndicator) {
             loadingIndicator.style.display = 'block';
        }

        try {
            console.log('API_BASE:', API_BASE);
            const apiUrl = `${API_BASE}/brands?isActive=true&sortBy=sortOrder&sortOrder=asc`;
            console.log('API URL:', apiUrl);
            const response = await fetch(apiUrl);

            // Yanıtın başarılı (200-299) olup olmadığını kontrol et
            if (!response.ok) {
                 const errorBody = await response.text(); 
                 throw new Error(`HTTP Hatası: ${response.status} ${response.statusText}. API yanıtı beklenildiği gibi değil.`);
            }

            const data = await response.json();
            
            if (data.success) {
                allBrands = data.data;
                filteredBrands = [...allBrands];
                renderBrands();
            } else {
                console.error('Markalar yüklenemedi:', data.message);
                loadStaticBrands();
            }
        } catch (error) {
            console.error('API bağlantı hatası:', error.message);
            // Fallback: statik markaları göster
            loadStaticBrands();
        } finally {
             // Yükleniyor göstergesini gizle
            if (loadingIndicator) {
                 loadingIndicator.style.display = 'none';
            }
        }
    };

    // Arama ve filtreleme fonksiyonu
    const filterBrands = () => {
        const searchText = searchInput.value.toLowerCase();
        const activeFilterElement = document.querySelector('.filter-btn.active');
        const activeFilter = activeFilterElement ? activeFilterElement.getAttribute('data-filter') : 'all';

        filteredBrands = allBrands.filter(brand => {
            const brandName = brand.name.toLowerCase();
            let isVisible = true;

            // Marka adına göre filtreleme
            if (searchText && !brandName.includes(searchText)) {
                isVisible = false;
            }

            // Kategoriye göre filtreleme
            if (isVisible && activeFilter !== 'all') {
                if (brand.category !== activeFilter) {
                    isVisible = false;
                }
            }

            return isVisible;
        });
        
        renderBrands();
    };

    // Arama kutusuna yazıldığında filtrele
    searchInput.addEventListener('input', filterBrands);

    // Filtre düğmelerine tıklandığında filtrele
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif düğmeyi değiştir
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterBrands();
        });
    });

    // Modal kapatma olayları
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Sayfa yüklendiğinde markaları yükle
    loadBrands();
});

// Yasal sayfalar için global fonksiyonlar
function showPrivacyPolicy() {
    const content = `
        <h2>Gizlilik Politikası</h2>
        <div style="text-align: left; line-height: 1.6;">
            <h3>1. Toplanan Bilgiler</h3>
            <p>Markalar Platformu olarak, sadece hizmetimizi sunabilmek için gerekli olan minimum bilgileri topluyoruz.</p>
            
            <h3>2. Bilgi Kullanımı</h3>
            <p>Toplanan bilgiler sadece markalar ve kullanıcılar arasında iletişim kurulması için kullanılır.</p>
            
            <h3>3. Bilgi Paylaşımı</h3>
            <p>Kişisel bilgileriniz üçüncü taraflarla paylaşılmaz.</p>
            
            <h3>4. Güvenlik</h3>
            <p>Bilgilerinizin güvenliği için gerekli teknik önlemleri alıyoruz.</p>
            
            <h3>5. İletişim</h3>
            <p>Sorularınız için: info@markalarplatformu.com</p>
        </div>
    `;
    showLegalModal(content);
}

function showTermsOfService() {
    const content = `
        <h2>Hizmet Şartları</h2>
        <div style="text-align: left; line-height: 1.6;">
            <h3>1. Hizmet Tanımı</h3>
            <p>Markalar Platformu, tekstil markaları ile kullanıcılar arasında iletişim kurulmasını sağlayan bir platformdur.</p>
            
            <h3>2. Kullanıcı Sorumlulukları</h3>
            <p>Kullanıcılar platformu yasal amaçlarla kullanmalı ve markalar ile saygılı iletişim kurmalıdır.</p>
            
            <h3>3. Platform Sorumlulukları</h3>
            <p>Platform, markalar ve kullanıcılar arasında iletişim sağlar ancak ticari işlemlerden sorumlu değildir.</p>
            
            <h3>4. Fikri Mülkiyet</h3>
            <p>Platform üzerindeki tüm içerikler telif hakkı ile korunmaktadır.</p>
            
            <h3>5. Değişiklikler</h3>
            <p>Bu şartlar önceden haber verilmeksizin değiştirilebilir.</p>
        </div>
    `;
    showLegalModal(content);
}

function showContact() {
    const content = `
        <h2>İletişim</h2>
        <div style="text-align: left; line-height: 1.6;">
            <h3>📧 E-posta</h3>
            <p>info@markalarplatformu.com</p>
            
            <h3>📱 Telefon</h3>
            <p>+90 555 123 45 67</p>
            
            <h3>📍 Adres</h3>
            <p>İstanbul, Türkiye</p>
            
            <h3>🕒 Çalışma Saatleri</h3>
            <p>Pazartesi - Cuma: 09:00 - 18:00</p>
            
            <h3>💬 Sosyal Medya</h3>
            <p>Instagram: @markalarplatformu</p>
            <p>LinkedIn: Markalar Platformu</p>
        </div>
    `;
    showLegalModal(content);
}

function showLegalModal(content) {
    const modal = document.getElementById('legalModal');
    const contentDiv = document.getElementById('legalContent');
    contentDiv.innerHTML = content;
    modal.style.display = 'flex';
}

function closeLegalModal() {
    const modal = document.getElementById('legalModal');
    modal.style.display = 'none';
}