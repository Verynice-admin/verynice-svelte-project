/**
 * Cloudinary image URL generator
 * Uses environment variable for cloud name with fallback
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice';
const FALLBACK_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/placeholders/placeholder`;

type CloudinaryOpts = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'crop' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
  quality?: string | number | 'auto';
  fetch_format?: 'auto' | 'png' | 'jpg' | 'webp';
};

/**
 * Generates a Cloudinary image URL with transformations
 * @param publicId - The Cloudinary public ID of the image
 * @param opts - Transformation options
 * @returns The Cloudinary URL or empty string if publicId is invalid
 */
export function getCloudinaryUrl(publicId: string | undefined | null, opts: CloudinaryOpts = {}): string {
  if (!publicId || typeof publicId !== 'string') return FALLBACK_URL;
  
  // If already a full URL, return as-is
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  const transformations: string[] = [];

  // Map options to Cloudinary transformation parameters
  if (opts.width) transformations.push(`w_${opts.width}`);
  if (opts.height) transformations.push(`h_${opts.height}`);
  if (opts.crop) transformations.push(`c_${opts.crop}`);
  if (opts.gravity) transformations.push(`g_${opts.gravity}`);
  // Default to auto quality and format unless explicitly overridden
  transformations.push(`q_${opts.quality ?? 'auto'}`);
  transformations.push(`f_${opts.fetch_format ?? 'auto'}`);

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}
