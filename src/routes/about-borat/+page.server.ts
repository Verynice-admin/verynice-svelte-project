import { adminDB } from '$lib/server/firebaseAdmin';
import { validateImage, generateQualityReport } from '$lib/utils/sanitize';

// Mock data generator for fallback
const getBoratData = () => {
  return {
    page: {
      seo: {
        title: 'About Borat | VeryNice.kz',
        description: 'The truth about Borat, the movie, and its impact on Kazakhstan.'
      },
      mainTitle: 'About Borat',
      headerDescription:
        'The movie "Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan" changed the world\'s view of us forever.',
      headerBackgroundPublicId: 'borat_header_bg',
      location: 'Glod, Romania (Not Kazakhstan)',
      articleViews: 69420,
      articleComments: 128,
      articleLikes: 3005,
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'About Borat' }],
      labels: { authorSectionTitle: 'Fact Checker' }
    },
    articles: [
      // Fallback content in case DB is down
      {
        id: 'movie-intro',
        title: 'The Movie: "Kazakhstan Heroes Country"',
        year: '2006',
        contentHTML: `<p>The movie, officially titled <strong>"Borat: Cultural Learnings of America for Make Benefit Glorious Nation of Kazakhstan"</strong>, was released in 2006.</p>`,
        order: 1
      }
    ],
    author: {
      name: 'Borat Sagdiyev',
      title: 'Lead Country promoter',
      bio: 'Providing accurate facts about our glorious nation.',
      profilePicturePublicId: 'logo'
    },
    qualityReport: { qualityScore: 100 }
  };
};

// Serialize Firestore Timestamps to ISO strings for client-side
function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDates(item));
  }
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && typeof v.toDate === 'function') {
      // Firestore Timestamp
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      // Check if it's a Firestore GeoPoint (has latitude and longitude)
      if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
        // Convert GeoPoint to standard format
        out[k] = { lat: v.latitude, lng: v.longitude };
      } else {
        // Recursively serialize nested objects
        out[k] = serializeDates(v);
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function load() {
  if (!adminDB) {
    console.error(
      'Firebase Admin has not been initialized. Check your service account credentials in .env'
    );
    return getBoratData();
  }

  try {
    // Target the 'boratPage' document
    const pageDocRef = adminDB.collection('pages').doc('boratPage');

    const articlesColRef = pageDocRef.collection('articles');
    const keyFactsColRef = pageDocRef.collection('keyFacts');
    const videoColRef = pageDocRef.collection('video');
    const mapColRef = pageDocRef.collection('map');
    const faqColRef = pageDocRef.collection('faq');
    const photoGalleryColRef = pageDocRef.collection('photoGallery');
    const relatedPostsColRef = pageDocRef.collection('relatedPosts');
    const userQuestionsColRef = pageDocRef.collection('user_questions');

    // Fetch page and subcollections in parallel
    const [
      pageSnap,
      articlesSnap,
      keyFactsSnap,
      videoSnap,
      mapSnap,
      faqSnap,
      photoGallerySnap,
      relatedPostsSnap,
      userQuestionsSnap
    ] = await Promise.all([
      pageDocRef.get(),
      articlesColRef.orderBy('order', 'asc').get(),
      keyFactsColRef.orderBy('order', 'asc').get(),
      videoColRef.get(),
      mapColRef.get(),
      faqColRef.get(),
      photoGalleryColRef.get(),
      relatedPostsColRef.orderBy('order', 'asc').get(),
      userQuestionsColRef.orderBy('createdAt', 'asc').get()
    ]);

    if (!pageSnap.exists) {
      console.warn("Document 'boratPage' does not exist in 'pages' collection.");
      return getBoratData();
    }

    const page = serializeDates(pageSnap.data());

    const articles = articlesSnap.docs
      .map((doc) => {
        const data = doc.data();

        // Normalize title
        const getTitle = (val: unknown): string | null => {
          if (val === null || val === undefined) return null;
          const str = String(val).trim();
          return str.length > 0 ? str : null;
        };

        const normalizedTitle =
          getTitle(data.title) ||
          getTitle(data.name) ||
          getTitle(data.heading) ||
          getTitle(data.sectionTitle) ||
          null;

        const contentMarkdown = data.contentMarkdown || '';
        const contentHTML = data.contentHTML || data.content || '';
        const contentFormat =
          data.contentFormat || (contentMarkdown ? 'markdown' : contentHTML ? 'html' : 'auto');

        // Normalize images
        let images = [];
        if (Array.isArray(data.images)) images = data.images;
        else if (data.image) images = [data.image];

        images = images
          .map((img: any) => {
            if (typeof img === 'string') {
              const validation = validateImage({
                publicId: img,
                alt: `Image for article ${doc.id}`
              });
              return (
                validation.normalized || {
                  publicId: img,
                  alt: `Image for article ${doc.id}`
                }
              );
            }
            const validation = validateImage(img);
            return (
              validation.normalized || {
                publicId: img.publicId || img.url || '',
                alt: img.alt || `Image for article ${doc.id}`
              }
            );
          })
          .filter((img) => img && img.publicId);

        const article = {
          ...data,
          id: doc.id,
          articleId: data.articleId || doc.id,
          title: normalizedTitle || `Article ${doc.id}`,
          contentMarkdown,
          contentHTML,
          contentFormat,
          order: data.order || 0,
          images,
          _quality: {
            hasTitle: !!normalizedTitle
          }
        };

        return serializeDates(article);
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Load Author
    let author = null;
    if (page && page.authorId) {
      try {
        const authorSnap = await adminDB.collection('authors').doc(page.authorId).get();
        if (authorSnap.exists) {
          author = serializeDates(authorSnap.data());
        }
      } catch (err) {
        console.warn(`[Borat Page] Failed to load author ${page.authorId}:`, err);
      }
    }

    // Fallback or generic author handling could go here if needed

    // Generate quality report
    const qualityReport = generateQualityReport(articles);

    // Load keyFacts
    const keyFacts = keyFactsSnap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          label: data.label || '',
          value: data.value || '',
          order: data.order || 0
        };
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Load videos
    let videos: any[] = [];
    if (videoSnap.size > 0) {
      videos = videoSnap.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.title || 'Video',
          url: data.url || ''
        };
      });
    }

    // For backward compatibility with UI that expects a single 'video' object
    // We'll set 'video' to the first one, but also return 'videos' array
    let video = videos.length > 0 ? videos[0] : null;

    // Load map
    let map = null;
    if (mapSnap.size > 0) {
      const mapDoc = mapSnap.docs[0].data();
      map = {
        coordinates: mapDoc.coordinates || null,
        title: mapDoc.title || 'Location on Map'
      };
    }

    // Load FAQ
    let faq = null;
    let newFaqItems: any[] = [];

    // Process user questions (migration logic similar to History page could be here)
    if (userQuestionsSnap.size > 0) {
      // ... simplified logic: just append answered ones
      userQuestionsSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.answer && data.answer !== 'TYPE ANSWER HERE (Then refresh website)') {
          newFaqItems.push({
            question: data.question,
            answer: data.answer,
            source: 'user_submission'
          });
        }
      });
    }

    if (faqSnap.size > 0) {
      const faqDoc = faqSnap.docs[0].data();
      faq = {
        title: faqDoc.title || 'Frequently Asked Questions',
        items: [...(faqDoc.items || []), ...newFaqItems]
      };
    } else if (newFaqItems.length > 0) {
      faq = {
        title: 'Frequently Asked Questions',
        items: newFaqItems
      }
    }

    // Load photoGallery
    let photoGallery = null;
    if (photoGallerySnap.size > 0) {
      const galleryDoc = photoGallerySnap.docs[0].data();
      photoGallery = {
        title: galleryDoc.title || 'Photo Gallery',
        photos: galleryDoc.photos || []
      };
    }

    // Load relatedPosts
    const relatedPosts = relatedPostsSnap.docs
      .filter((doc) => doc.id !== 'main')
      .map((doc) => serializeDates(doc.data()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      page: {
        ...page,
        keyFacts,
        video,
        videos, // Return full list
        map,
        faq,
        photoGallery,
        relatedPosts
      },
      articles,
      author,
      qualityReport
    };
  } catch (e) {
    console.error('Failed to load Borat page data from Firestore:', e);
    return getBoratData();
  }
}















