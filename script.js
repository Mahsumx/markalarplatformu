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
    const API_BASE = window.location.hostname === 'localhost' 
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
        
        // Marka logosu API'den gelen değere göre ayarlanır
        brandBox.innerHTML = `
            <div class="brand-logo ${randomColor}"><i class="${brand.logo || 'fas fa-tag'}"></i></div>
            <div class="brand-name">${brand.name}</div>
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
            filteredBrands.forEach(brand => {
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
            const response = await fetch(`${API_BASE}/brands?isActive=true&sortBy=sortOrder&sortOrder=asc`);

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

            // Harf aralığına göre filtreleme
            if (isVisible && activeFilter !== 'all') {
                const firstLetter = brandName.charAt(0);
                let letterRange = '';

                if (firstLetter >= 'a' && firstLetter <= 'g') {
                    letterRange = 'A-G';
                } else if (firstLetter >= 'h' && firstLetter <= 'o') {
                    letterRange = 'H-O';
                } else if (firstLetter >= 'p' && firstLetter <= 'z') {
                    letterRange = 'P-Z';
                }

                if (letterRange !== activeFilter) {
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