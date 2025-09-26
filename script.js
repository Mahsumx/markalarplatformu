document.addEventListener('DOMContentLoaded', () => {
    const brandContainer = document.querySelector('.brand-container');
    const modal = document.getElementById('contactModal');
    const modalBrandName = document.getElementById('modalBrandName');
    const telegramLink = document.getElementById('telegram-link');
    const whatsappLink = document.getElementById('whatsapp-link');
    const closeButton = document.querySelector('.close-button');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // API base URL
    const API_BASE = 'http://localhost:3000/api';
    
    // Markaları saklamak için
    let allBrands = [];
    let filteredBrands = [];

    // Backend'den markaları yükle
    const loadBrands = async () => {
        try {
            const response = await fetch(`${API_BASE}/brands?isActive=true&sortBy=sortOrder&sortOrder=asc`);
            const data = await response.json();
            
            if (data.success) {
                allBrands = data.data;
                filteredBrands = [...allBrands];
                renderBrands();
            } else {
                console.error('Markalar yüklenemedi:', data.message);
                // Fallback: statik markaları göster
                loadStaticBrands();
            }
        } catch (error) {
            console.error('API bağlantı hatası:', error);
            // Fallback: statik markaları göster
            loadStaticBrands();
        }
    };

    // Statik markaları yükle (fallback)
    const loadStaticBrands = () => {
        // Mevcut statik markaları koru
        allBrands = Array.from(document.querySelectorAll('.brand-box')).map(box => ({
            _id: Math.random().toString(36).substr(2, 9),
            name: box.querySelector('.brand-name').textContent,
            telegram: box.getAttribute('data-telegram'),
            whatsapp: box.getAttribute('data-whatsapp'),
            logo: box.querySelector('.brand-logo i').className
        }));
        filteredBrands = [...allBrands];
    };

    // Markaları render et
    const renderBrands = () => {
        brandContainer.innerHTML = '';
        
        filteredBrands.forEach(brand => {
            const brandBox = createBrandBox(brand);
            brandContainer.appendChild(brandBox);
        });
        
        // Event listener'ları ekle
        addBrandEventListeners();
    };

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
        
        brandBox.innerHTML = `
            <div class="brand-logo ${randomColor}"><i class="${brand.logo || 'fas fa-tag'}"></i></div>
            <div class="brand-name">${brand.name}</div>
        `;
        
        return brandBox;
    };

    // Arama ve filtreleme fonksiyonu
    const filterBrands = () => {
        const searchText = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        filteredBrands = allBrands.filter(brand => {
            const brandName = brand.name.toLowerCase();
            let isVisible = true;

            // Marka adına göre filtreleme
            if (searchText && !brandName.includes(searchText)) {
                isVisible = false;
            }

            // Harf aralığına göre filtreleme
            if (activeFilter !== 'all') {
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
