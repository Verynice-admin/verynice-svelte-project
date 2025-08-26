// In src/lib/utils/cloudinary.js (UPGRADED VERSION)

const CLOUD_NAME = "verynice"; // Your Cloudinary cloud name

/**
 * Builds a full, optimized Cloudinary URL from a public ID and an options object.
 * This new version can handle objects like { width: 800, crop: 'fill' }.
 * @param {string} publicId The full public ID from Cloudinary (e.g., 'home/content/pages/homepage/image').
 * @param {object} [options] Optional transformation parameters.
 * @returns {string} The complete Cloudinary image URL.
 */
export function getCloudinaryUrl(publicId, options = {}) {
    // 1. Basic validation: If no publicId is provided, return an empty string.
    if (!publicId) {
        // console.warn('getCloudinaryUrl was called without a publicId.');
        return '';
    }

    // 2. Default transformations that should apply to almost all images.
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto'
    };

    // 3. Merge the default options with any specific options provided for this image.
    //    The specific options (like `width`) will override the defaults if there's a conflict.
    const combinedOptions = { ...defaultOptions, ...options };

    // 4. Convert the options object into a URL-friendly transformation string.
    //    For example: { width: 800, quality: 'auto' } becomes "w_800,q_auto"
    const transformations = Object.entries(combinedOptions)
        .map(([key, value]) => {
            // Use common short-codes for Cloudinary transformations
            const shortCodes = {
                width: 'w',
                height: 'h',
                crop: 'c',
                quality: 'q',
                fetch_format: 'f',
                gravity: 'g'
            };
            const shortKey = shortCodes[key] || key;
            return `${shortKey}_${value}`;
        })
        .join(',');

    // 5. Assemble and return the final, complete URL.
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}