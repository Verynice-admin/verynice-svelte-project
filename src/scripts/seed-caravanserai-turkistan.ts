import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

function initFirebase() {
    if (getApps().length > 0) return getFirestore();

    const serviceAccountPath = path.join(PROJECT_ROOT, '.secrets', 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`Service account not found at ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    initializeApp({
        credential: cert(serviceAccount)
    });
    return getFirestore();
}

const db = initFirebase();

interface CloudinaryImage {
    asset_folder?: string;
    public_id: string;
    secure_url: string;
    display_name: string;
    bytes: number;
}

async function updateCaravanseraiTurkistanSlug() {
    console.log('Updating caravanserai-turkistan slug path...');
    const dumpPath = path.join(PROJECT_ROOT, 'cloudinary_dump.json');

    if (!fs.existsSync(dumpPath)) {
        console.error('cloudinary_dump.json not found!');
        return;
    }

    const allImages: CloudinaryImage[] = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    
    const caravanseraiImages = allImages.filter((img) => 
        img.asset_folder && img.asset_folder.includes('karavan-saray-center')
    ).sort((a, b) => (a.display_name || '').localeCompare(b.display_name || '', undefined, { numeric: true }));

    console.log(`Found ${caravanseraiImages.length} images`);

    if (caravanseraiImages.length === 0) {
        console.log('No images found.');
        return;
    }

    const galleryPhotos = caravanseraiImages.map((img, index) => ({
        publicId: img.public_id,
        imageUrl: img.secure_url,
        thumbnailUrl: img.secure_url.replace('/upload/', '/upload/c_thumb,w_400,h_300,g_auto,f_auto/'),
        altText: img.display_name || `Caravanserai photo ${index + 1}`,
        caption: ''
    }));

    const sortedBySize = [...caravanseraiImages].sort((a, b) => b.bytes - a.bytes);
    const heroImage = sortedBySize[0];
    
    console.log(`Hero: ${heroImage.public_id}`);

    // Use caravanserai-turkistan path (the slug used in URL)
    const attractionPath = 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/caravanserai-turkistan';

    console.log('\nUpdating caravanserai-turkistan path...');
    await db.doc(attractionPath).set({
        id: 'caravanserai-turkistan',
        title: 'Caravanserai Turkistan',
        mainTitle: 'Caravanserai Turkistan',
        headerDescription: 'The historic Khaja Ahmed Yasawi Caravanserai - a masterpiece of medieval Islamic architecture',
        headerBackgroundPublicId: heroImage.public_id,
        mainImage: heroImage.public_id,
        heroImagePublicId: heroImage.public_id,
        url: '/destinations/caravanserai-turkistan'
    }, { merge: true });

    await db.doc(`${attractionPath}/photoGallery/main`).set({
        id: 'main',
        title: 'Photo Gallery',
        photos: galleryPhotos
    });

    await db.doc(attractionPath).set({
        photos: caravanseraiImages.map(img => ({
            publicId: img.public_id,
            url: img.secure_url
        }))
    }, { merge: true });

    console.log('\n✅ caravanserai-turkistan path updated!');
    console.log(`   - Hero: ${heroImage.public_id}`);
    console.log(`   - Gallery: ${galleryPhotos.length} photos`);
    console.log(`   - URL: http://localhost:5173/destinations/caravanserai-turkistan`);
}

updateCaravanseraiTurkistanSlug().catch(console.error);