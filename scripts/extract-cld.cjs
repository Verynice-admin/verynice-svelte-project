const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to load .env or .env.local
const envPath = path.resolve('.env');
const envLocalPath = path.resolve('.env.local');

let config = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath);
    config = { ...config, ...dotenv.parse(content) };
}
if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath);
    config = { ...config, ...dotenv.parse(content) };
}

console.log('CLOUDINARY_CLOUD_NAME=' + (config.VITE_CLOUDINARY_CLOUD_NAME || config.CLOUDINARY_CLOUD_NAME || ''));
console.log('CLOUDINARY_API_KEY=' + (config.CLOUDINARY_API_KEY || ''));
console.log('CLOUDINARY_API_SECRET=' + (config.CLOUDINARY_API_SECRET || ''));
