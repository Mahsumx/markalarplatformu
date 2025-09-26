const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const brandRoutes = require('./routes/brandRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(cors({
	origin: process.env.NODE_ENV === 'production' 
		? [process.env.CORS_ORIGIN, 'https://markalarplatformu.com', 'https://www.markalarplatformu.com']
		: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
	credentials: true
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static dosyalar - root klasöründen serve et
app.use(express.static('.'));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marka_db', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// Ana sayfa
app.get('/api', (req, res) => {
	res.json({
		message: 'Tekstil Markaları API',
		version: '1.0.0',
		endpoints: {
			brands: '/api/brands',
			admin: '/api/admin',
			auth: '/api/auth'
		}
	});
});

// API Routes
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Endpoint bulunamadı'
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error('Hata:', err);
	res.status(500).json({
		success: false,
		message: 'Sunucu hatası',
		error: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
	});
});

module.exports = app;


