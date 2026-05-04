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

async function updateCaravanseraiPageWithImages() {
    console.log('Reading Cloudinary dump for Caravanserai Turkistan images...');
    const dumpPath = path.join(PROJECT_ROOT, 'cloudinary_dump.json');

    if (!fs.existsSync(dumpPath)) {
        console.error('cloudinary_dump.json not found!');
        return;
    }

    const allImages: CloudinaryImage[] = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    
    // Filter for karavan-saray-center folder
    const caravanseraiImages = allImages.filter((img) => 
        img.asset_folder && img.asset_folder.includes('karavan-saray-center')
    );

    console.log(`Found ${caravanseraiImages.length} Caravanserai images in Cloudinary.`);

    if (caravanseraiImages.length === 0) {
        console.log('No Caravanserai images found.');
        return;
    }

    // Sort by filename (numeric)
    caravanseraiImages.sort((a, b) => {
        const nameA = a.display_name || '';
        const nameB = b.display_name || '';
        return nameA.localeCompare(nameB, undefined, { numeric: true });
    });

    // Create gallery photos with Cloudinary public IDs
    const galleryPhotos = caravanseraiImages.map((img, index) => ({
        publicId: img.public_id,
        imageUrl: img.secure_url,
        thumbnailUrl: img.secure_url.replace('/upload/', '/upload/c_thumb,w_400,h_300,g_auto,f_auto/'),
        altText: img.display_name || `Caravanserai photo ${index + 1}`,
        caption: '',
        captionSource: ''
    }));

    // Find the best hero image (largest by bytes)
    const sortedBySize = [...caravanseraiImages].sort((a, b) => b.bytes - a.bytes);
    const heroImage = sortedBySize[0];
    
    console.log(`Hero image: ${heroImage.public_id} (${heroImage.bytes} bytes)`);
    console.log(`Gallery has ${galleryPhotos.length} photos`);

    // Firestore path for Caravanserai Turkistan
    // Based on the slug mapping: 'karavan-saray-center': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/karavan-saray-center'
    const attractionPath = 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/karavan-saray-center';

    // Update the attraction document with all image data
    console.log('\nUpdating attraction document...');
    await db.doc(attractionPath).set({
        headerBackgroundPublicId: heroImage.public_id,
        mainImage: heroImage.public_id,
        heroImagePublicId: heroImage.public_id,
        headerBackgroundImageAriaLabel: 'The historic Caravanserai of Turkistan',
        heroImageCaption: 'The Khawaja Ahmed Yasawi Caravanserai',
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
    const simplePhotoArray = caravanseraiImages.map((img) => ({
        publicId: img.public_id,
        url: img.secure_url,
        alt: img.display_name
    }));
    
    console.log('\nUpdating fallback photos array on main document...');
    await db.doc(attractionPath).set({
        photos: simplePhotoArray
    }, { merge: true });
    console.log('Fallback photos array updated.');

    // Create articles with images (to test inline image rendering in timeline)
    const articles = [
        {
            id: 'caravanserai-history',
            order: 1,
            title: 'Historical Significance',
            year: 'Heritage',
            contentMarkdown: `The **Khaja Ahmed Yasawi Caravanserai** stands as one of the most remarkable architectural achievements of the 14th century Silk Road. Built during the reign of Timur (Tamerlane), this massive structure served as a vital rest stop for merchants, pilgrims, and travelers crossing the vast Central Asian steppes.

**Key Features:**
- Spans over 2,000 square meters of enclosed space
- 18-meter high dome that dominates the local skyline
- Thick walls providing protection from harsh desert winds
- Central courtyard with access to multiple chambers

The caravanserai represents the pinnacle of medieval Islamic architecture, showcasing advanced engineering techniques and sophisticated aesthetic sensibilities that continue to inspire architects today.`,
            images: caravanseraiImages.slice(0, 4).map((img, i) => ({
                publicId: img.public_id,
                alt: `Caravanserai interior ${i + 1}`,
                captionName: img.display_name,
                captionSource: 'VeryNice Gallery'
            }))
        },
        {
            id: 'architecture',
            order: 2,
            title: 'Architectural Marvel',
            year: 'Design',
            contentMarkdown: `The caravanserai's design exemplifies the sophisticated architectural traditions of the Timurid era. The structure features:

**Structural Elements:**
- Massive rectangular layout with fortified walls
- Central dome rising to impressive heights
- Symmetrical chambers arranged around a central hall
- Decorative tilework and geometric patterns adorning surfaces

**Functionality:**
- Provisions for both human and animal guests
- Storage rooms for valuable trade goods
- Bath facilities for weary travelers
- Small mosque for spiritual observance

The engineering ingenuity displayed in the construction methods, including the use of local materials and climate-responsive design, ensured the building's longevity through centuries.`,
            images: caravanseraiImages.slice(4, 8).map((img, i) => ({
                publicId: img.public_id,
                alt: `Caravanserai architecture ${i + 1}`,
                captionName: img.display_name,
                captionSource: 'VeryNice Gallery'
            }))
        },
        {
            id: 'cultural-significance',
            order: 3,
            title: 'Cultural Legacy',
            year: 'Today',
            contentMarkdown: `Today, the Caravanserai of Turkistan stands as a testament to the region's rich trading heritage and spiritual importance. It forms part of a UNESCO World Heritage Site that draws visitors from around the globe.

**Modern Significance:**
- Central to the Yasawi Complex pilgrimage
- UNESCO World Heritage candidate status
- Preserved as a museum and cultural center
- Popular venue for traditional crafts and performances

**Visiting Information:**
The site is open to visitors throughout the year, with guided tours available in multiple languages. The surrounding market area offers traditional crafts and local delicacies for those seeking an authentic experience.`,
            images: caravanseraiImages.slice(8, 12).map((img, i) => ({
                publicId: img.public_id,
                alt: `Caravanserai today ${i + 1}`,
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

    console.log('\n✅ Caravanserai Turkistan page successfully updated with image data!');
    console.log(`   - Hero image: ${heroImage.public_id}`);
    console.log(`   - Gallery photos: ${galleryPhotos.length}`);
    console.log(`   - Articles with images: ${articles.length}`);
    console.log(`   - Source: content/pages/destinations/Turkistan_Shymkent/karavan-saray-center/`);
    console.log(`   - Page URL: http://localhost:5173/destinations/caravanserai-turkistan`);
}

updateCaravanseraiPageWithImages().catch(console.error);