const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Environment variables
require('dotenv').config({ path: './config.env' });

// Routes
const brandRoutes = require('./routes/brandRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://markalarplatformu.com', 'https://www.markalarplatformu.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (Frontend)
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/markalarplatformu';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB bağlantısı başarılı');
    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Markalar Platformu API',
        version: '1.0.0',
        endpoints: {
            brands: '/api/brands',
            admin: '/api/admin',
            auth: '/api/auth'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API çalışıyor!',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Root route: serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı',
        availableEndpoints: ['/api', '/api/brands', '/api/admin', '/api/auth']
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Sunucu hatası oluştu' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

module.exports = app;