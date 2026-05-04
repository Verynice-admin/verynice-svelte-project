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

async function updateAlmatyPageWithAllImages() {
    console.log('Reading Cloudinary dump for Almaty city images...');
    const dumpPath = path.join(PROJECT_ROOT, 'cloudinary_dump.json');

    if (!fs.existsSync(dumpPath)) {
        console.error('cloudinary_dump.json not found!');
        return;
    }

    const allImages: CloudinaryImage[] = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    
    // Filter for Almaty_city folder
    const almatyImages = allImages.filter((img) => 
        img.asset_folder && img.asset_folder.includes('Almaty_city')
    );

    console.log(`Found ${almatyImages.length} Almaty city images in Cloudinary.`);

    if (almatyImages.length === 0) {
        console.log('No Almaty city images found.');
        return;
    }

    // Sort by filename (numeric)
    almatyImages.sort((a, b) => {
        const nameA = a.display_name || '';
        const nameB = b.display_name || '';
        return nameA.localeCompare(nameB, undefined, { numeric: true });
    });

    // Create gallery photos with Cloudinary public IDs
    const galleryPhotos = almatyImages.map((img, index) => ({
        publicId: img.public_id,
        imageUrl: img.secure_url,
        thumbnailUrl: img.secure_url.replace('/upload/', '/upload/c_thumb,w_400,h_300,g_auto,f_auto/'),
        altText: img.display_name || `Almaty city photo ${index + 1}`,
        caption: '',
        captionSource: ''
    }));

    // Find the best hero image (largest by bytes)
    const sortedBySize = [...almatyImages].sort((a, b) => b.bytes - a.bytes);
    const heroImage = sortedBySize[0];
    
    console.log(`Hero image: ${heroImage.public_id} (${heroImage.bytes} bytes)`);
    console.log(`Gallery has ${galleryPhotos.length} photos`);

    // Firestore path for Almaty city
    const attractionPath = 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-city';

    // Update the attraction document with all image data
    console.log('\nUpdating attraction document...');
    await db.doc(attractionPath).set({
        headerBackgroundPublicId: heroImage.public_id,
        mainImage: heroImage.public_id,
        heroImagePublicId: heroImage.public_id,
        headerBackgroundImageAriaLabel: 'Panoramic view of Almaty city',
        heroImageCaption: 'Almaty cityscape',
        heroImageSource: 'VeryNice Gallery'
    }, { merge: true });
    console.log('Attraction document updated with hero image.');

    // Update the photo gallery subcollection
    console.log('\nUpdating photo gallery subcollection...');
    await db.doc(`${attractionPath}/photoGallery/main`).set({
        id: 'main',
        title: 'Photo Gallery',
        photos: galleryPhotos
    });
    console.log('Photo gallery updated with ' + galleryPhotos.length + ' photos.');

    // Also update the main photos array on the attraction document as a fallback
    const simplePhotoArray = almatyImages.map((img) => ({
        publicId: img.public_id,
        url: img.secure_url,
        alt: img.display_name
    }));
    
    console.log('\nUpdating fallback photos array on main document...');
    await db.doc(attractionPath).set({
        photos: simplePhotoArray
    }, { merge: true });
    console.log('Fallback photos array updated.');

    // Create sample articles with images (to test inline image rendering in timeline)
    const articles = [
        {
            id: 'city-overview',
            order: 1,
            title: 'City Overview',
            year: 'Overview',
            contentMarkdown: `Almaty, Kazakhstan's largest city, sits at the foot of the majestic Tian Shan mountains. With a population of over 2 million, it serves as the country's cultural and economic heart.

The city offers a unique blend of Soviet-era architecture, modern skyscrapers, and traditional Central Asian charm. Tree-lined streets, bustling markets, and serene parks create a welcoming atmosphere for visitors.

**Key Highlights:**
- The stunning Zailiysky Alatau mountain range as a backdrop
- A vibrant food scene featuring Kazakh and international cuisine
- Rich history dating back to the 19th century
- Excellent infrastructure and public transportation`,
            images: almatyImages.slice(0, 4).map((img, i) => ({
                publicId: img.public_id,
                alt: `Almaty city view ${i + 1}`,
                captionName: img.display_name,
                captionSource: 'VeryNice Gallery'
            }))
        },
        {
            id: 'historic-district',
            order: 2,
            title: 'Historic District',
            year: 'Heritage',
            contentMarkdown: `The historic center of Almaty preserves the architectural heritage of the Russian imperial period. Beautiful facades, ornate balconies, and cobblestone streets tell stories of a bygone era.

Notable buildings include the Colorfulness Cathedral, the Zenkov Cathedral, and the Central State Museum. Walking tours through the old quarter reveal hidden courtyards and local artisan workshops.

**Must-See Landmarks:**
- Ascension Cathedral (Zenkov Cathedral)
- Central State Museum of the Republic of Kazakhstan
- Panfilov Park and the Museum of Folk Musical Instruments
- The Arbat pedestrian street`,
            images: almatyImages.slice(4, 8).map((img, i) => ({
                publicId: img.public_id,
                alt: `Historic Almaty ${i + 1}`,
                captionName: img.display_name,
                captionSource: 'VeryNice Gallery'
            }))
        },
        {
            id: 'modern-almaty',
            order: 3,
            title: 'Modern Development',
            year: 'Today',
            contentMarkdown: `Today's Almaty is a dynamic metropolis with impressive modern infrastructure. The Esentai Tower, Almaty Tower, and the B1 Shopping Mall represent the city's rapid development.

The financial district features world-class hotels, offices, and entertainment venues. Green spaces like the Almaty Central Park provide residents and visitors with areas to relax and unwind.

**Modern Attractions:**
- Esentai Tower - tallest building in Central Asia
- Almaty Park and Recreation Zone
- Modern shopping centers and restaurants
- Sports facilities including the Almaty Arena`,
            images: almatyImages.slice(8, 12).map((img, i) => ({
                publicId: img.public_id,
                alt: `Modern Almaty ${i + 1}`,
                captionName: img.display_name,
                captionSource: 'VeryNice Gallery'
            }))
        }
    ];

    // Add articles with images to Firestore
    console.log('\nUpdating articles with images...');
    for (const article of articles) {
        await db.doc(`${attractionPath}/articles/${article.id}`).set({
            id: article.id,
            articleId: article.id,
            title: article.title,
            year: article.year,
            order: article.order,
            contentMarkdown: article.contentMarkdown,
            contentFormat: 'markdown',
            images: article.images
        }, { merge: true });
        console.log(`  - Added article: ${article.title}`);
    }

    console.log('\n✅ Almaty page successfully updated with all image data!');
    console.log(`   - Hero image: ${heroImage.public_id}`);
    console.log(`   - Gallery photos: ${galleryPhotos.length}`);
    console.log(`   - Articles with images: ${articles.length}`);
    console.log(`   - Source: content/pages/destinations/Almaty_nearby/Almaty_city/`);
}

updateAlmatyPageWithAllImages().catch(console.error);