// In src/lib/utils/cloudinary.js (DEFINITIVE VERSION)

const CLOUD_NAME = "verynice";

export function getCloudinaryUrl(publicId, options = {}) {
    if (!publicId) return '';
    const defaultOptions = { quality: 'auto', fetch_format: 'auto' };
    const combinedOptions = { ...defaultOptions, ...options };
    const transformations = Object.entries(combinedOptions)
        .map(([key, value]) => {
            const shortCodes = { width: 'w', height: 'h', crop: 'c', quality: 'q', fetch_format: 'f', gravity: 'g' };
            const shortKey = shortCodes[key] || key;
            return `${shortKey}_${value}`;
        })
        .join(',');
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}