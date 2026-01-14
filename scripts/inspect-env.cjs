const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envLocal = path.resolve('.env.local');
const env = path.resolve('.env');

let config = {};
if (fs.existsSync(env)) config = { ...config, ...dotenv.parse(fs.readFileSync(env)) };
if (fs.existsSync(envLocal)) config = { ...config, ...dotenv.parse(fs.readFileSync(envLocal)) };

for (const key in config) {
    const val = config[key];
    if (key.includes('CLOUDINARY')) {
        console.log(`${key}=${val.substring(0, 4)}...${val.substring(val.length - 2)}`);
    }
}
