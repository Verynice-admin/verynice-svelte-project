// src/lib/utils/cloudinary.js
const CLOUD_NAME = "verynice";

export function getCloudinaryUrl(publicId, options = 'q_auto,f_auto') {
    if (!publicId) return '';
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${options}/${publicId}`;
}