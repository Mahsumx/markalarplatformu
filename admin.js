// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        // ⚠️ DÜZELTME: Production ve development için dinamik API URL
        this.apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:3000/api' 
            : '/api';
        this.token = localStorage.getItem('adminToken');
        this.currentPage = 1;
        this.totalPages = 1;
        this.brands = [];
        this.selectedBrands = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLoginForm();
        }
    }

    setupEventListeners() {
        // Giriş formu
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Arama ve filtreleme
        document.getElementById('searchInput').addEventListener('input', () => {
            this.currentPage = 1;
            this.loadBrands();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.loadBrands();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.currentPage = 1;
            this.loadBrands();
        });

        // Tümünü seç
        document.getElementById('selectAll').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.brand-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                if (e.target.checked) {
                    this.selectedBrands.add(checkbox.value);
                } else {
                    this.selectedBrands.delete(checkbox.value);
                }
            });
        });

        // Marka formu
        document.getElementById('brandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBrand();
        });

        // Buton event listener'ları
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('addBrandBtn').addEventListener('click', () => {
            this.openAddModal();
        });

        document.getElementById('activateSelectedBtn').addEventListener('click', () => {
            this.bulkAction('activate');
        });

        document.getElementById('deactivateSelectedBtn').addEventListener('click', () => {
            this.bulkAction('deactivate');
        });

        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.bulkAction('delete');
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelModalBtn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('loginError');

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // Response'un başarılı olup olmadığını kontrol et
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Response'un boş olup olmadığını kontrol et
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Sunucudan boş yanıt alındı');
            }

            // JSON parse et
            const data = JSON.parse(responseText);

            if (data.success) {
                this.token = data.data.token;
                localStorage.setItem('adminToken', this.token);
                this.showDashboard();
                this.loadDashboard();
            } else {
                this.showError(errorDiv, data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(errorDiv, 'Bağlantı hatası: ' + error.message);
        } finally {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş Yap';
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.apiBase}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            // Response'un başarılı olup olmadığını kontrol et
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Response'un boş olup olmadığını kontrol et
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Sunucudan boş yanıt alındı');
            }

            // JSON parse et
            const data = JSON.parse(responseText);

            if (data.success) {
                this.showDashboard();
                this.loadDashboard();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.logout();
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch(`${this.apiBase}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.updateStats(data.data);
                this.loadBrands();
            }
        } catch (error) {
            console.error('Dashboard yükleme hatası:', error);
        }
    }

    updateStats(stats) {
        document.getElementById('totalBrands').textContent = stats.brands.total;
        document.getElementById('activeBrands').textContent = stats.brands.active;
        document.getElementById('inactiveBrands').textContent = stats.brands.inactive;
        document.getElementById('totalAdmins').textContent = stats.admins.total;
    }

    async loadBrands() {
        const search = document.getElementById('searchInput').value;
        const category = document.getElementById('categoryFilter').value;
        const isActive = document.getElementById('statusFilter').value;

        const params = new URLSearchParams({
            page: this.currentPage,
            limit: 20
        });

        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (isActive) params.append('isActive', isActive);

        try {
            document.getElementById('loadingIndicator').style.display = 'block';
            document.getElementById('brandsTable').style.display = 'none';

            const response = await fetch(`${this.apiBase}/admin/brands?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.brands = data.data;
                this.totalPages = data.pagination.totalPages;
                this.renderBrandsTable();
                this.renderPagination();
            }
        } catch (error) {
            console.error('Markalar yükleme hatası:', error);
        } finally {
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('brandsTable').style.display = 'table';
        }
    }

    renderBrandsTable() {
        const tbody = document.getElementById('brandsTableBody');
        tbody.innerHTML = '';

        this.brands.forEach(brand => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="brand-checkbox" value="${brand._id}"></td>
                <td>${brand.name}</td>
                <td>${this.getCategoryName(brand.category)}</td>
                <td><span class="status-badge ${brand.isActive ? 'status-active' : 'status-inactive'}">${brand.isActive ? 'Aktif' : 'Pasif'}</span></td>
                <td>${brand.telegram ? '<i class="fab fa-telegram"></i>' : '-'}</td>
                <td>${brand.whatsapp ? '<i class="fab fa-whatsapp"></i>' : '-'}</td>
                <td>${new Date(brand.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm" onclick="adminPanel.editBrand('${brand._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm ${brand.isActive ? 'btn-secondary' : 'btn-success'}" onclick="adminPanel.toggleBrandStatus('${brand._id}')">
                            <i class="fas fa-${brand.isActive ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteBrand('${brand._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Checkbox event listeners
        document.querySelectorAll('.brand-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedBrands.add(e.target.value);
                } else {
                    this.selectedBrands.delete(e.target.value);
                }
            });
        });
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (this.totalPages <= 1) return;

        // Önceki sayfa
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadBrands();
            }
        };
        pagination.appendChild(prevBtn);

        // Sayfa numaraları
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.className = i === this.currentPage ? 'active' : '';
                pageBtn.onclick = () => {
                    this.currentPage = i;
                    this.loadBrands();
                };
                pagination.appendChild(pageBtn);
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                pagination.appendChild(dots);
            }
        }

        // Sonraki sayfa
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.onclick = () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadBrands();
            }
        };
        pagination.appendChild(nextBtn);
    }

    openAddModal() {
        document.getElementById('modalTitle').textContent = 'Yeni Marka Ekle';
        document.getElementById('brandForm').reset();
        document.getElementById('brandId').value = '';
        document.getElementById('brandModal').style.display = 'block';
    }

    async editBrand(brandId) {
        try {
            const response = await fetch(`${this.apiBase}/admin/brands/${brandId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                const brand = data.data;
                document.getElementById('modalTitle').textContent = 'Marka Düzenle';
                document.getElementById('brandId').value = brand._id;
                document.getElementById('brandName').value = brand.name;
                document.getElementById('brandDescription').value = brand.description || '';
                document.getElementById('brandShortDescription').value = brand.shortDescription || '';
                document.getElementById('brandCategory').value = brand.category;
                document.getElementById('brandTelegram').value = brand.telegram || '';
                document.getElementById('brandWhatsapp').value = brand.whatsapp || '';
                document.getElementById('brandWebsite').value = brand.website || '';
                document.getElementById('brandLogo').value = brand.logo || '';
                document.getElementById('brandLogoType').value = brand.logoType || 'icon';
                document.getElementById('brandSortOrder').value = brand.sortOrder || 0;
                document.getElementById('brandTags').value = brand.tags ? brand.tags.join(', ') : '';
                document.getElementById('brandModal').style.display = 'block';
            }
        } catch (error) {
            console.error('Marka düzenleme hatası:', error);
        }
    }

    async saveBrand() {
        const brandId = document.getElementById('brandId').value;
        const isEdit = !!brandId;

        const brandData = {
            name: document.getElementById('brandName').value,
            description: document.getElementById('brandDescription').value,
            shortDescription: document.getElementById('brandShortDescription').value,
            category: document.getElementById('brandCategory').value,
            telegram: document.getElementById('brandTelegram').value,
            whatsapp: document.getElementById('brandWhatsapp').value,
            website: document.getElementById('brandWebsite').value,
            logo: document.getElementById('brandLogo').value,
            logoType: document.getElementById('brandLogoType').value,
            sortOrder: parseInt(document.getElementById('brandSortOrder').value),
            tags: document.getElementById('brandTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            const url = isEdit ? `${this.apiBase}/brands/${brandId}` : `${this.apiBase}/brands`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(brandData)
            });

            const data = await response.json();

            if (data.success) {
                this.closeModal();
                this.loadBrands();
                this.showSuccess(isEdit ? 'Marka güncellendi' : 'Marka eklendi');
            } else {
                this.showError(null, data.message);
            }
        } catch (error) {
            this.showError(null, 'Hata: ' + error.message);
        }
    }

    async toggleBrandStatus(brandId) {
        try {
            const response = await fetch(`${this.apiBase}/brands/${brandId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.loadBrands();
                this.showSuccess(data.message);
            } else {
                this.showError(null, data.message);
            }
        } catch (error) {
            this.showError(null, 'Hata: ' + error.message);
        }
    }

    async deleteBrand(brandId) {
        if (!confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/brands/${brandId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.loadBrands();
                this.showSuccess('Marka silindi');
            } else {
                this.showError(null, data.message);
            }
        } catch (error) {
            this.showError(null, 'Hata: ' + error.message);
        }
    }

    async bulkAction(action) {
        if (this.selectedBrands.size === 0) {
            this.showError(null, 'Lütfen en az bir marka seçin');
            return;
        }

        const actionText = {
            'activate': 'aktif',
            'deactivate': 'pasif',
            'delete': 'sil'
        };

        if (!confirm(`Seçilen ${this.selectedBrands.size} markayı ${actionText[action]} yapmak istediğinizden emin misiniz?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/admin/brands/bulk-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    action,
                    brandIds: Array.from(this.selectedBrands)
                })
            });

            const data = await response.json();

            if (data.success) {
                this.selectedBrands.clear();
                document.getElementById('selectAll').checked = false;
                this.loadBrands();
                this.showSuccess(data.message);
            } else {
                this.showError(null, data.message);
            }
        } catch (error) {
            this.showError(null, 'Hata: ' + error.message);
        }
    }

    getCategoryName(category) {
        const categories = {
            'giyim': 'Giyim',
            'ayakkabı': 'Ayakkabı',
            'aksesuar': 'Aksesuar',
            'ev tekstili': 'Ev Tekstili',
            'diğer': 'Diğer'
        };
        return categories[category] || category;
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    }

    closeModal() {
        document.getElementById('brandModal').style.display = 'none';
    }

    logout() {
        this.token = null;
        localStorage.removeItem('adminToken');
        this.showLoginForm();
    }

    showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        } else {
            alert('Hata: ' + message);
        }
    }

    showSuccess(message) {
        // Basit bir success mesajı göster
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.zIndex = '9999';
        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Global fonksiyonlar
function logout() {
    adminPanel.logout();
}

function closeModal() {
    adminPanel.closeModal();
}

function openAddModal() {
    adminPanel.openAddModal();
}

// Admin paneli başlat
const adminPanel = new AdminPanel();
