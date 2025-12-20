/**
 * Advanced image optimization utilities
 * Extends existing Cloudinary utilities with responsive image generation
 */

export interface ImageTransformOptions {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    gravity?: 'auto' | 'face' | 'center';
}

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateResponsiveSrcSet(
    imageUrl: string,
    widths: number[] = [320, 640, 960, 1280, 1920]
): string {
    return widths
        .map((width) => {
            const optimizedUrl = optimizeImage(imageUrl, { width, quality: 'auto', format: 'auto' });
            return `${optimizedUrl} ${width}w`;
        })
        .join(', ');
}

/**
 * Optimize image URL with transformations
 */
export function optimizeImage(imageUrl: string, options: ImageTransformOptions = {}): string {
    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity = 'auto'
    } = options;

    // If not a Cloudinary URL, return as-is
    if (!imageUrl.includes('cloudinary') && !imageUrl.includes('res.cloudinary.com')) {
        return imageUrl;
    }

    // Build transformation string
    const transforms: string[] = [];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);
    if (crop) transforms.push(`c_${crop}`);
    if (gravity && crop !== 'scale') transforms.push(`g_${gravity}`);

    const transformString = transforms.join(',');

    // Insert transformation into Cloudinary URL
    return imageUrl.replace(/\/upload\//, `/upload/${transformString}/`);
}

/**
 * Generate blur placeholder for lazy loading
 */
export function generateBlurPlaceholder(imageUrl: string): string {
    return optimizeImage(imageUrl, {
        width: 20,
        quality: 10,
        format: 'auto'
    });
}

/**
 * Preload critical images
 */
export function preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
    });
}
