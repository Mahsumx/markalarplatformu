const express = require('express');
require('dotenv').config({ path: './config.env' });
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Sadece lokal geliştirme için server'ı başlat
if (require.main === module) {
    const server = express().use(app);
    server.listen(PORT, () => {
        console.log(`🚀 Server ${PORT} portunda çalışıyor`);
        console.log(`📱 API: http://localhost:${PORT}/api`);
        console.log(`🌐 Web: http://localhost:${PORT}`);
    });
}

module.exports = app;
