import { adminDB } from '$lib/server/firebaseAdmin';
import { loadHistoryPage } from '$lib/data-loaders/history';
import { validateImage, generateQualityReport } from '$lib/utils/sanitize';

// Default FAQ items for the History page when Firestore has no FAQ yet
const defaultHistoryFaqItems = [
  {
    question: 'Who is Gagarin?',
    answer:
      'Yuri Gagarin was a Soviet cosmonaut who became the **first human in space** on 12 April 1961. ' +
      'His historic Vostok 1 mission launched from the Baikonur Cosmodrome, which is located in present-day Kazakhstan.',
    answerFormat: 'markdown'
  },
  {
    question: 'What is the current time in Kazakhstan?',
    answer:
      'Kazakhstan spans **two time zones** (UTC+5 and UTC+6). Major cities like Astana and Almaty usually observe UTC+5 or UTC+6 ' +
      'depending on the region and season. For the exact current time, search “time in Kazakhstan” or in a specific city (e.g. “time in Almaty”) in your browser.',
    answerFormat: 'markdown'
  },
  {
    question: 'What year did Kazakhstan gain independence from the USSR?',
    answer:
      'Kazakhstan declared its independence from the Soviet Union on **16 December 1991**, becoming the last of the Soviet republics to do so.',
    answerFormat: 'markdown'
  }
];

// Serialize Firestore Timestamps to ISO strings for client-side
function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
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

async function getFallbackHistory(errorMessage?: string) {
  const fallback = await loadHistoryPage();
  const { page, articles, author } = fallback;
  return {
    page,
    articles,
    author,
    qualityReport: generateQualityReport(articles ?? []),
    ...(errorMessage ? { error: errorMessage } : {})
  };
}

export async function load() {
  if (!adminDB) {
    console.error("Firebase Admin has not been initialized. Check your service account credentials in .env");
    return await getFallbackHistory("Server database connection failed.");
  }

  try {
    const pageDocRef = adminDB.collection('pages').doc('historyPage');
    const articlesColRef = pageDocRef.collection('articles');
    const keyFactsColRef = pageDocRef.collection('keyFacts');
    const videoColRef = pageDocRef.collection('video');
    const mapColRef = pageDocRef.collection('map');
    const faqColRef = pageDocRef.collection('faq');
    const photoGalleryColRef = pageDocRef.collection('photoGallery');
    const relatedPostsColRef = pageDocRef.collection('relatedPosts');
    const userQuestionsColRef = pageDocRef.collection('user_questions');

    // Fetch page and subcollections in parallel
    // Note: labels, breadcrumbs, seo, nextUpPreview, relatedPostsTitle are now in the document
    const [pageSnap, articlesSnap, keyFactsSnap, videoSnap, mapSnap, faqSnap, photoGallerySnap, relatedPostsSnap, userQuestionsSnap] = await Promise.all([
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
      console.warn("Document 'historyPage' does not exist in 'pages' collection.");
      return await getFallbackHistory("Document 'historyPage' does not exist in 'pages' collection.");
    }

    const page = serializeDates(pageSnap.data());
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('[History Page] Page data:', {
        hasAuthorId: !!page?.authorId,
        authorId: page?.authorId,
        hasAuthor: !!page?.author,
        author: page?.author
      });
    }
    const articles = articlesSnap.docs.map(doc => {
      const data = doc.data();

      // Normalize title - check multiple possible field names, handle empty strings
      const getTitle = (val: unknown): string | null => {
        if (val === null || val === undefined) return null;
        const str = String(val).trim();
        return str.length > 0 ? str : null;
      };

      // Try to find title in various field names
      const normalizedTitle = getTitle(data.title) ||
        getTitle(data.name) ||
        getTitle(data.heading) ||
        getTitle(data.sectionTitle) ||
        null;

      // Get raw content - support both HTML and Markdown formats
      // Priority: contentMarkdown > contentHTML > content (Markdown-first approach)
      // This allows gradual migration from HTML to Markdown
      const contentMarkdown = data.contentMarkdown || '';
      const contentHTML = data.contentHTML || data.content || '';
      // Prefer Markdown format when available (best practice)
      const contentFormat = data.contentFormat || (contentMarkdown ? 'markdown' : (contentHTML ? 'html' : 'auto'));
      const rawContent = contentMarkdown || contentHTML;
      const hasMarkdown = !!contentMarkdown && contentMarkdown.trim().length > 0;
      const hasHTML = !!contentHTML && contentHTML.trim().length > 0;

      // Quality checks and warnings (but don't block content)
      // Only log warnings in development mode
      if (import.meta.env.DEV) {
        if (!normalizedTitle) {
          console.warn(`[History Page] Article ${doc.id} has no title. Available fields:`, Object.keys(data));
          if (data.title !== undefined) {
            console.warn(`[History Page] Article ${doc.id} title field value:`, data.title, 'type:', typeof data.title);
          }
        }

        // Validate content but don't modify it (client will sanitize)
        if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length < 10) {
          console.warn(`[History Page] Article ${doc.id} has insufficient content (${rawContent?.length || 0} characters)`);
        }

        // Log format detection for debugging
        if (hasMarkdown && hasHTML) {
          console.warn(`[History Page] Article ${doc.id} has both contentMarkdown and contentHTML. Using contentMarkdown (Markdown-first approach).`);
        }

        // Recommend migration if HTML-only
        if (hasHTML && !hasMarkdown && import.meta.env.DEV) {
          console.info(`[History Page] Article ${doc.id} uses HTML format. Consider migrating to Markdown for better storage efficiency.`);
        }
      }

      // Normalize images array - check multiple possible field names
      let images: Array<{ publicId: string; alt?: string; captionName?: string; captionSource?: string }> = [];
      if (Array.isArray(data.images)) {
        images = data.images;
      } else if (Array.isArray(data.image)) {
        images = data.image;
      } else if (data.image) {
        // Single image, convert to array
        images = [data.image];
      }

      // Normalize and validate images
      images = images.map((img: any) => {
        // If image is already a string (just publicId), convert to object
        if (typeof img === 'string') {
          const validation = validateImage({ publicId: img, alt: `Image for article ${doc.id}` });
          if (!validation.isValid && import.meta.env.DEV) {
            console.warn(`[History Page] Article ${doc.id} image validation issues:`, validation.errors);
          }
          return validation.normalized || {
            publicId: img,
            alt: `Image for article ${doc.id}`,
            captionName: '',
            captionSource: ''
          };
        }

        // Validate image object
        const validation = validateImage(img);
        if (!validation.isValid && import.meta.env.DEV) {
          console.warn(`[History Page] Article ${doc.id} image validation issues:`, validation.errors);
        }

        return validation.normalized || {
          publicId: img.publicId || img.public_id || img.url || '',
          alt: img.alt || img.altText || `Image for article ${doc.id}`,
          captionName: img.captionName || img.caption || '',
          captionSource: img.captionSource || img.source || ''
        };
      }).filter((img) => {
        // Remove images without publicId
        if (!img || !img.publicId) {
          return false;
        }
        return true;
      });

      // Build article object - spread data first, then override with normalized values
      // Use articleId from data if it exists, otherwise use doc.id
      // Fallback to sectionId for backward compatibility
      const articleId = data.articleId || data.sectionId || doc.id;
      const article = {
        ...data,
        id: doc.id,
        articleId: articleId, // Ensure articleId is set for TOC navigation
        title: normalizedTitle || `Article ${doc.id}`,
        // Prefer Markdown, but keep HTML for backward compatibility
        contentMarkdown: contentMarkdown, // Primary format (Markdown-first)
        contentHTML: contentHTML, // Fallback for backward compatibility
        contentFormat: contentFormat, // Format hint: 'markdown' | 'html' | 'auto'
        order: data.order || 0,
        images: images, // Ensure images array is always present
        // Quality metadata
        _quality: {
          hasTitle: !!normalizedTitle,
          hasContent: !!(rawContent && typeof rawContent === 'string' && rawContent.trim().length >= 10),
          contentLength: typeof rawContent === 'string' ? rawContent.trim().length : 0,
          contentFormat: contentFormat,
          imageCount: images.length,
          imagesWithAltText: images.filter(img => img.alt && img.alt.trim().length >= 3).length
        }
      };

      return serializeDates(article);
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    let author = null;
    // Try to get author from page.authorId first
    if (page && page.authorId) {
      try {
        const authorSnap = await adminDB.collection('authors').doc(page.authorId).get();
        if (authorSnap.exists) {
          const authorData = authorSnap.data();
          // Normalize author data - handle different field name variations
          // Prioritize profilePicturePublicId as that's what's used in Firebase
          const rawImagePublicId = authorData?.profilePicturePublicId ||
            authorData?.authorImagePublicId ||
            authorData?.avatarPublicId ||
            authorData?.avatarUrl ||
            null;
          // Clean and validate the public ID
          const imagePublicId = rawImagePublicId && typeof rawImagePublicId === 'string'
            ? rawImagePublicId.trim()
            : (rawImagePublicId || null);
          author = serializeDates({
            ...authorData,
            name: authorData?.name || authorData?.authorName || '',
            description: authorData?.description || authorData?.bio || authorData?.authorBio || '',
            profilePicturePublicId: imagePublicId, // Keep original field name
            authorImagePublicId: imagePublicId, // Also provide normalized field name
            avatarPublicId: imagePublicId, // Also provide avatar field name
            bio: authorData?.bio || authorData?.description || '',
            title: authorData?.title || authorData?.authorTitle || ''
          });
        }
      } catch (err) {
        console.warn(`[History Page] Failed to load author ${page.authorId}:`, err);
      }
    }

    // Fallback: Try to get author from page.author field (if it's a reference or string)
    if (!author && page && (page.author || page.authorName)) {
      const authorId = page.author || page.authorName;
      if (typeof authorId === 'string') {
        try {
          const authorSnap = await adminDB.collection('authors').doc(authorId).get();
          if (authorSnap.exists) {
            const authorData = authorSnap.data();
            // Prioritize profilePicturePublicId as that's what's used in Firebase
            const rawImagePublicId = authorData?.profilePicturePublicId ||
              authorData?.authorImagePublicId ||
              authorData?.avatarPublicId ||
              authorData?.avatarUrl ||
              null;
            // Clean and validate the public ID
            const imagePublicId = rawImagePublicId && typeof rawImagePublicId === 'string'
              ? rawImagePublicId.trim()
              : (rawImagePublicId || null);
            author = {
              ...authorData,
              name: authorData?.name || authorData?.authorName || '',
              description: authorData?.description || authorData?.bio || authorData?.authorBio || '',
              profilePicturePublicId: imagePublicId, // Keep original field name
              authorImagePublicId: imagePublicId, // Also provide normalized field name
              bio: authorData?.bio || authorData?.description || '',
              title: authorData?.title || authorData?.authorTitle || ''
            };
          }
        } catch (err) {
          console.warn(`[History Page] Failed to load author ${authorId}:`, err);
        }
      }
    }

    // Final fallback: Try common author IDs if no author found
    if (!author) {
      const commonAuthorIds = ['aliya-askar', 'aliya_askar', 'aliyaaskar'];
      for (const authorId of commonAuthorIds) {
        try {
          const authorSnap = await adminDB.collection('authors').doc(authorId).get();
          if (authorSnap.exists) {
            const authorData = authorSnap.data();
            // Prioritize profilePicturePublicId as that's what's used in Firebase
            const rawImagePublicId = authorData?.profilePicturePublicId ||
              authorData?.authorImagePublicId ||
              authorData?.avatarPublicId ||
              authorData?.avatarUrl ||
              null;
            // Clean and validate the public ID
            const imagePublicId = rawImagePublicId && typeof rawImagePublicId === 'string'
              ? rawImagePublicId.trim()
              : (rawImagePublicId || null);
            author = {
              ...authorData,
              name: authorData?.name || authorData?.authorName || '',
              description: authorData?.description || authorData?.bio || authorData?.authorBio || '',
              profilePicturePublicId: imagePublicId, // Keep original field name
              authorImagePublicId: imagePublicId, // Also provide normalized field name
              bio: authorData?.bio || authorData?.description || '',
              title: authorData?.title || authorData?.authorTitle || ''
            };
            console.log(`[History Page] Using fallback author: ${authorId}`);
            break;
          }
        } catch (err) {
          // Continue to next author ID
        }
      }
    }

    if (author) {
      const imagePublicId = author.profilePicturePublicId || author.authorImagePublicId || (author as any).avatarPublicId;
      console.log('[History Page] Author loaded:', {
        name: author.name,
        hasImage: !!imagePublicId,
        imagePublicId: imagePublicId,
        profilePicturePublicId: author.profilePicturePublicId,
        authorImagePublicId: author.authorImagePublicId,
        avatarPublicId: (author as any).avatarPublicId,
        hasBio: !!(author.bio || author.description),
        allAuthorFields: Object.keys(author)
      });
    } else {
      console.warn('[History Page] No author found');
    }

    // Generate quality report (only log in development)
    const qualityReport = generateQualityReport(articles);
    if (import.meta.env.DEV) {
      if (qualityReport.qualityScore < 70) {
        console.warn('[History Page] Article quality score is below 70:', qualityReport);
      } else {
        console.log('[History Page] Article quality report:', {
          qualityScore: qualityReport.qualityScore,
          totalArticles: qualityReport.totalArticles,
          articlesWithTitle: qualityReport.articlesWithTitle,
          articlesWithContent: qualityReport.articlesWithContent,
          imagesWithAltText: `${qualityReport.imagesWithAltText}/${qualityReport.totalImages}`
        });
      }
    }

    // Load keyFacts from subcollection
    const keyFacts = keyFactsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        label: data.label || '',
        value: data.value || '',
        order: data.order || 0
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    // Load video from subcollection (no fallback - subcollection is source of truth)
    let video = null;
    if (videoSnap.size > 0) {
      const videoDoc = videoSnap.docs[0].data();
      video = {
        url: videoDoc.url || '',
        title: videoDoc.title || 'Video'
      };
    } else {
      // Fallback if no video in DB
      video = {
        url: 'https://youtu.be/fesLbWZcR4Q',
        title: 'Journey Through Kazakhstan'
      };
    }

    // Load map from subcollection (no fallback - subcollection is source of truth)
    let map = null;
    if (mapSnap.size > 0) {
      const mapDoc = mapSnap.docs[0].data();
      map = {
        coordinates: mapDoc.coordinates || null,
        title: mapDoc.title || 'Location on Map'
      };
    }

    // Load FAQ from subcollection (no fallback - subcollection is source of truth)
    let faq = null;
    let combinedFaqItems = [];

    // 1. Get manual FAQ items
    if (faqSnap.size > 0) {
      const faqDoc = faqSnap.docs[0].data();
      combinedFaqItems = faqDoc.items || [];
      faq = {
        title: faqDoc.title || 'Frequently Asked Questions',
        items: combinedFaqItems
      };
    }

    // 2. Process answered user questions (Migrate to FAQ + Delete from Inbox)
    if (userQuestionsSnap.size > 0) {
      const docsToMigrate: any[] = [];
      const newFaqItems: any[] = [];

      userQuestionsSnap.docs.forEach(doc => {
        const data = doc.data();
        const placeholderText = 'TYPE ANSWER HERE (Then refresh website)';
        const rawAnswer = data.answer;

        // Check if answer is valid (exists, string, not empty, and NOT the placeholder)
        const isValidAnswer = rawAnswer &&
          typeof rawAnswer === 'string' &&
          rawAnswer.trim().length > 0 &&
          rawAnswer !== placeholderText;

        if (isValidAnswer) {
          const newItem = {
            question: data.question || '',
            answer: rawAnswer,
            answerFormat: 'markdown',
            source: 'user_submission'
          };
          docsToMigrate.push(doc.ref);
          newFaqItems.push(newItem);
        }
      });

      if (docsToMigrate.length > 0) {
        // Run migration in a transaction
        // Note: We need to use adminDB directly here
        const migrationPromise = adminDB!.runTransaction(async (t) => {
          const faqDocRef = adminDB!.collection('pages').doc('historyPage').collection('faq').doc('main');
          const currentFaqSnap = await t.get(faqDocRef);

          let currentItems = [];
          if (currentFaqSnap.exists) {
            currentItems = currentFaqSnap.data()?.items || [];
          } else {
            t.set(faqDocRef, { title: 'Frequently Asked Questions', items: [] });
          }

          const combinedItems = [...currentItems, ...newFaqItems];
          // Limit to 30 items, removing the oldest if limit exceeded
          const updatedItems = combinedItems.slice(-30);
          t.update(faqDocRef, { items: updatedItems });

          docsToMigrate.forEach(ref => {
            t.delete(ref);
          });
        }).then(() => {
          console.log(`[History Page] Successfully migrated ${docsToMigrate.length} docs.`);
        }).catch(err => {
          console.error('[History Page] Migration failed:', err);
        });

        // We can await it or let it run in background. Await is safer for consistency.
        // await migrationPromise; // However, we are inside load() which is async. 
        // We can't await easily inside this forEach/map structure if we were keeping old logic, but here we are in the main body.
      }

      // Update local data for immediate rendering
      if (newFaqItems.length > 0) {
        if (!faq) {
          faq = { title: 'Frequently Asked Questions', items: [] };
        }
        faq.items = [...(faq.items || []), ...newFaqItems];
      }
    }

    // 3. If there are still no FAQ items in Firestore, use the default History FAQ
    if (!faq || !Array.isArray(faq.items) || faq.items.length === 0) {
      faq = {
        title: 'Frequently Asked Questions',
        items: defaultHistoryFaqItems
      };
    }

    // Old Logic (Disabled)
    if (false) {
      const userQuestions = userQuestionsSnap.docs
        .map(doc => {
          const data = doc.data();
          const placeholderText = 'TYPE ANSWER HERE (Then refresh website)';
          const rawAnswer = data.answer;

          // Check if answer is valid (exists, string, not empty, and NOT the placeholder)
          const isValidAnswer = rawAnswer &&
            typeof rawAnswer === 'string' &&
            rawAnswer.trim().length > 0 &&
            rawAnswer !== placeholderText;

          const isPending = data.status === 'pending';

          // Check if we need to auto-update status
          if (isValidAnswer && isPending) {
            // Queue an update to set status to 'answered'
            doc.ref.update({ status: 'answered' }).catch(err => console.error('[History Page] Auto-update failed', err));
          }

          // Only include if it has a valid answer
          if (isValidAnswer) {
            return {
              question: data.question || '',
              answer: rawAnswer,
              answerFormat: 'markdown', // Default to markdown for user answers
              source: 'user' // Flag to identify origin if needed
            };
          }
          return null;
        })
        .filter(item => item !== null);

      if (userQuestions.length > 0) {
        // Initialize FAQ object if it didn't exist from manual items
        if (!faq) {
          faq = {
            title: 'Frequently Asked Questions',
            items: []
          };
        }
        // Append user questions to the end (or beginning? users typically want to see new stuff, but pinned/manual might be priority. Let's append.)
        faq.items = [...(faq.items || []), ...userQuestions];
      }
    }

    // Load photo gallery from subcollection (no fallback - subcollection is source of truth)
    // Load photo gallery from subcollection (no fallback - subcollection is source of truth)
    let photoGallery = null;
    if (photoGallerySnap.size > 0) {
      const galleryDoc = photoGallerySnap.docs[0].data();
      photoGallery = {
        title: galleryDoc.title || 'Photo Gallery',
        photos: galleryDoc.photos || []
      };
    }

    // --- UNIVERSAL "MORE TO EXPLORE" STRATEGY (Copied from Destinations) ---
    // Fetch random attractions to ensure freshness and working images
    let relatedPosts: any[] = [];

    try {
      // Fetch all attractions from the database
      const allAttractionsSnap = await adminDB.collectionGroup('attractions').get();

      let allAttractions = allAttractionsSnap.docs
        .map((doc: any) => {
          const data = doc.data();
          return { id: doc.id, ...data };
        })
        .filter((item: any) => {
          // Filter out items that definitely have no image
          const hasImage = item.headerBackgroundPublicId ||
            item.mainImage ||
            item.image ||
            item.heroImagePublicId ||
            (item.photos && item.photos.length > 0) ||
            (item.images && item.images.length > 0);
          return !!hasImage;
        });

      // Shuffle Array (Fisher-Yates) for randomness
      for (let i = allAttractions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAttractions[i], allAttractions[j]] = [allAttractions[j], allAttractions[i]];
      }

      // Select top 12 (User requested "e.g. 10", 12 is a good grid number)
      const randomSelection = allAttractions.slice(0, 12);

      // Map to RelatedPostCard format
      relatedPosts = randomSelection.map(attraction => {
        // Resolve Image - Robust Logic from Destinations Page
        let imagePublicId = null;

        // Prioritize the reliably restored headerBackgroundPublicId
        if (attraction.headerBackgroundPublicId) {
          imagePublicId = attraction.headerBackgroundPublicId;
        } else if (attraction.mainImage) {
          imagePublicId = attraction.mainImage;
        } else if (attraction.image) {
          if (typeof attraction.image === 'string') imagePublicId = attraction.image;
          else if (typeof attraction.image === 'object') imagePublicId = attraction.image.publicId;
        } else if (attraction.photos && attraction.photos.length > 0) {
          imagePublicId = attraction.photos[0];
        } else if (attraction.images && attraction.images.length > 0) {
          // Fallback to images array if main image missing
          const first = attraction.images[0];
          imagePublicId = typeof first === 'string' ? first : first.publicId;
        } else if (attraction.heroImage) {
          imagePublicId = attraction.heroImage;
        } else if (attraction.heroImagePublicId) {
          imagePublicId = attraction.heroImagePublicId;
        }

        // Resolve URL
        let url = attraction.url;
        if (!url) {
          if (attraction.id && !attraction.id.startsWith('item-')) {
            url = `/destinations/${attraction.id}`;
          } else {
            url = '#';
          }
        }

        // Special overrides for known slugs to ensure perfect linking
        const titleLower = (attraction.title || '').toLowerCase();
        if (titleLower.includes('altyn-emel')) url = '/destinations/altyn-emel-national-park';
        if (titleLower.includes('big almaty lake')) url = '/destinations/big-almaty-lake';
        if (titleLower.includes('almaty') && titleLower.includes('city')) url = '/destinations/almaty-city';

        return {
          id: attraction.id,
          title: attraction.title || attraction.name || 'Discover',
          category: attraction.category || attraction.region || 'Destinations',
          imagePublicId: imagePublicId,
          headerBackgroundPublicId: imagePublicId,
          url: url,
          mainTitle: attraction.mainTitle // Pass mainTitle if available
        };
      });

    } catch (err) {
      console.warn('[History Page] Failed to generate random related posts:', err);
      // Fallback: Use manual list if random generation fails completely
      relatedPosts = relatedPostsSnap.docs
        .filter(doc => doc.id !== 'main')
        .map(doc => serializeDates(doc.data()))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Small data is now in the document (labels, breadcrumbs, seo, nextUpPreview, relatedPostsTitle)
    // These are read directly from the page object below

    return {
      page: {
        ...page,
        // Large, dynamic content from subcollections
        keyFacts: keyFacts, // From keyFacts subcollection
        video: video, // From video subcollection
        map: map, // From map subcollection
        faq: faq, // From faq subcollection
        photoGallery: photoGallery, // From photoGallery subcollection
        relatedPosts: relatedPosts, // From relatedPosts subcollection
        // Small, static data from document (labels, breadcrumbs, seo, nextUpPreview, relatedPostsTitle)
        // These are already in the page object via spread operator above
      },
      articles,
      author,
      qualityReport // Include quality report in data (can be used for admin dashboard)
    };

  } catch (e) {
    console.error("Failed to load page data from Firestore:", e);
    return await getFallbackHistory("Failed to load page data from the server.");
  }
}


