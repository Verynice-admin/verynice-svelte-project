/**
 * Legacy Cloudinary helper function
 * @deprecated Use getCloudinaryUrl from '$lib/utils/cloudinary' instead
 */
import { getCloudinaryUrl } from './utils/cloudinary';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice';
const DEFAULT_PLACEHOLDER = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/v1720000000/placeholders/placeholder.png`;

/**
 * Legacy Cloudinary URL generator
 * @deprecated Use getCloudinaryUrl instead
 */
export function cld(publicId: string | null | undefined, opts: string = 'q_auto,f_auto'): string {
  if (!publicId) return DEFAULT_PLACEHOLDER;
  if (publicId.startsWith('http')) return publicId;
  
  // Use the new function for consistency
  const optsObj: any = {};
  if (opts.includes('q_')) {
    const qMatch = opts.match(/q_([^,]+)/);
    if (qMatch) optsObj.quality = qMatch[1];
  }
  if (opts.includes('f_')) {
    const fMatch = opts.match(/f_([^,]+)/);
    if (fMatch) optsObj.fetch_format = fMatch[1] as any;
  }
  
  return getCloudinaryUrl(publicId, optsObj) || `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${opts}/${publicId}`;
}


