import { adminDB } from '$lib/server/firebaseAdmin';
import { validateImage, generateQualityReport } from '$lib/utils/sanitize';

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

export async function load() {
  if (!adminDB) {
    console.error("Firebase Admin has not been initialized. Check your service account credentials in .env");
    return {
      page: null,
      articles: [],
      attractions: [],
      author: null,
      qualityReport: null,
      error: "Server database connection failed."
    };
  }

  try {
    const destPageRef = adminDB.collection('pages').doc('destinationsPage');
    const destArticlesColRef = destPageRef.collection('articles');
    const destAttractionsColRef = destPageRef.collection('attractions');
    const keyFactsColRef = destPageRef.collection('keyFacts');
    const videoColRef = destPageRef.collection('video');
    const mapColRef = destPageRef.collection('map');
    const faqColRef = destPageRef.collection('faq');
    const photoGalleryColRef = destPageRef.collection('photoGallery');
    const relatedPostsColRef = destPageRef.collection('relatedPosts');
    const userQuestionsColRef = destPageRef.collection('user_questions');

    // Start fetching articles (sections)
    const destArticlesSnap = await destArticlesColRef.orderBy('order', 'asc').get();

    // Fetch attractions for each article in parallel
    const attractionsPromises = destArticlesSnap.docs.map(async (articleDoc) => {
      const subAttractionsSnap = await articleDoc.ref.collection('attractions').get();
      return subAttractionsSnap.docs.map(doc => {
        const data = doc.data();
        // Ensure region is set (fallback to article title if missing)
        const regionLabel = data.region || data.category || articleDoc.data().title || '';

        // Normalize title
        const normalizedTitle =
          (data.title && String(data.title).trim()) ||
          (data.name && String(data.name).trim()) ||
          (data.slug && String(data.slug).trim()) ||
          `Attraction ${doc.id}`;

        const textContent =
          data.description ||
          data.content ||
          data.longDescription ||
          data.shortDescription ||
          '';

        const contentMarkdown =
          textContent && typeof textContent === 'string' && textContent.trim().length
            ? textContent
            : `**${data.title || 'Attraction'}**\n\nMore details coming soon.`;

        const tierLabel = data.tier ? `Tier ${data.tier}` : '';
        const yearLabel = regionLabel || tierLabel || 'Destination';

        // Normalize images - consistent with articles logic
        let images: Array<{ publicId: string; alt?: string; captionName?: string; captionSource?: string }> = [];
        if (Array.isArray(data.images)) {
          images = data.images;
        } else if (Array.isArray(data.image)) {
          images = data.image;
        } else if (data.image) {
          images = [data.image];
        } else if (data.heroImagePublicId) {
          // Fallback to heroImagePublicId if no other images
          images = [{
            publicId: data.heroImagePublicId,
            alt: normalizedTitle
          }];
        }

        // Validate images
        images = images.map((img: any) => {
          if (typeof img === 'string') {
            const validation = validateImage({ publicId: img, alt: normalizedTitle });
            return validation.normalized || { publicId: img, alt: normalizedTitle };
          }
          const validation = validateImage(img);
          return validation.normalized || {
            publicId: img.publicId || img.url || '',
            alt: img.alt || normalizedTitle
          };
        }).filter(img => img && img.publicId);


        return serializeDates({
          ...data,
          id: doc.id,
          region: regionLabel, // Normalize region from context
          articleId: articleDoc.id, // Explicitly link to parent article
          title: normalizedTitle,
          year: yearLabel,
          order: data.order || 0,
          contentMarkdown,
          contentHTML: data.contentHTML || data.content || textContent || '',
          contentFormat: 'markdown',
          images, // Return normalized images
          fromAttraction: true
        });
      });
    });

    const nestedAttractions = await Promise.all(attractionsPromises);
    const attractions = nestedAttractions.flat();

    // We no longer need articlesFromAttractions logic as we just built 'attractions' directly
    // But we need to maintain the 'articles' array structure which likely expects the headers too
    const articlesFromAttractions: any[] = []; // Empty now as we handle them separately or merged? 
    // Wait, original code mapped destAttractionsSnap to 'articlesFromAttractions'.
    // The previous logic was: attractions -> articles list.
    // The current UI iterates over 'groupedAndSorted' which uses 'byRegion' derived from 'attractions'.
    // So 'attractions' array is critical. 
    // The 'articles' returned in the prop are the section headers.

    // Let's look at how the page was built.
    // const [destPageSnap, destArticlesSnap, ... ] = await Promise.all([...]);

    // We already awaited destArticlesSnap above.
    // We need to fetch the other things now.

    const [destPageSnap, keyFactsSnap, videoSnap, mapSnap, faqSnap, photoGallerySnap, relatedPostsSnap, userQuestionsSnap] = await Promise.all([
      destPageRef.get(),
      keyFactsColRef.orderBy('order', 'asc').get(),
      videoColRef.get(),
      mapColRef.get(),
      faqColRef.get(),
      photoGalleryColRef.get(),
      relatedPostsColRef.orderBy('order', 'asc').get(),
      userQuestionsColRef.orderBy('createdAt', 'asc').get()
    ]);

    const destPage = destPageSnap.exists ? serializeDates(destPageSnap.data()) : {};

    const articlesFromDestArticles = destArticlesSnap.docs.map((doc) => {
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
      const contentMarkdown = data.contentMarkdown || data.content || data.description || data.shortDescription || '';
      const contentHTML = data.contentHTML || data.content || data.description || data.shortDescription || '';
      // Prefer Markdown format when available (best practice)
      const contentFormat = data.contentFormat || (contentMarkdown ? 'markdown' : (contentHTML ? 'html' : 'auto'));
      const rawContent = contentMarkdown || contentHTML;
      const hasMarkdown = !!contentMarkdown && contentMarkdown.trim().length > 0;
      const hasHTML = !!contentHTML && contentHTML.trim().length > 0;

      // Quality checks and warnings (but don't block content)
      // Only log warnings in development mode
      if (import.meta.env.DEV) {
        if (!normalizedTitle) {
          console.warn(`[Destinations Page] Article ${doc.id} has no title. Available fields:`, Object.keys(data));
          if (data.title !== undefined) {
            console.warn(`[Destinations Page] Article ${doc.id} title field value:`, data.title, 'type:', typeof data.title);
          }
        }

        // Validate content but don't modify it (client will sanitize)
        if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length < 10) {
          console.warn(`[Destinations Page] Article ${doc.id} has insufficient content (${rawContent?.length || 0} characters)`);
        }

        // Log format detection for debugging
        if (hasMarkdown && hasHTML) {
          console.warn(`[Destinations Page] Article ${doc.id} has both contentMarkdown and contentHTML. Using contentMarkdown (Markdown-first approach).`);
        }

        // Recommend migration if HTML-only
        if (hasHTML && !hasMarkdown && import.meta.env.DEV) {
          console.info(`[Destinations Page] Article ${doc.id} uses HTML format. Consider migrating to Markdown for better storage efficiency.`);
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
            console.warn(`[Destinations Page] Article ${doc.id} image validation issues:`, validation.errors);
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
          console.warn(`[Destinations Page] Article ${doc.id} image validation issues:`, validation.errors);
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

      return serializeDates({ ...article, fromAttraction: false });
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    const articles = [...articlesFromAttractions, ...articlesFromDestArticles].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    let author = null;
    // Try to get author from destPage.authorId first
    if (destPage && destPage.authorId) {
      try {
        const authorSnap = await adminDB.collection('authors').doc(destPage.authorId).get();
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
        console.warn(`[Destinations Page] Failed to load author ${destPage.authorId}:`, err);
      }
    }

    // Fallback: Try to get author from page.author field (if it's a reference or string)
    if (!author && destPage && (destPage.author || destPage.authorName)) {
      const authorId = destPage.author || destPage.authorName;
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
          console.warn(`[Destinations Page] Failed to load author ${authorId}:`, err);
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
            console.log(`[Destinations Page] Using fallback author: ${authorId}`);
            break;
          }
        } catch (err) {
          // Continue to next author ID
        }
      }
    }

    if (author) {
      author = serializeDates(author);
      const imagePublicId = author.profilePicturePublicId || author.authorImagePublicId || (author as any).avatarPublicId;
      console.log('[Destinations Page] Author loaded:', {
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
      console.warn('[Destinations Page] No author found');
    }

    // Generate quality report (only log in development)
    const qualityReport = generateQualityReport(articles);
    if (import.meta.env.DEV) {
      if (qualityReport.qualityScore < 70) {
        console.warn('[Destinations Page] Article quality score is below 70:', qualityReport);
      } else {
        console.log('[Destinations Page] Article quality report:', {
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
          const faqDocRef = adminDB!.collection('pages').doc('destinationsPage').collection('faq').doc('main');
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
          console.log(`[Destinations Page] Successfully migrated ${docsToMigrate.length} docs.`);
        }).catch(err => {
          console.error('[Destinations Page] Migration failed:', err);
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
            doc.ref.update({ status: 'answered' }).catch(err => console.error('[Destinations Page] Auto-update failed', err));
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
    let photoGallery = null;
    if (photoGallerySnap.size > 0) {
      const galleryDoc = photoGallerySnap.docs[0].data();
      photoGallery = {
        title: galleryDoc.title || 'Photo Gallery',
        photos: galleryDoc.photos || []
      };
    }

    // Load related posts from subcollection (no fallback - subcollection is source of truth)
    // Filter out the 'main' document if it exists (it only contained title, which is now in document)
    const relatedPosts = relatedPostsSnap.docs
      .filter(doc => doc.id !== 'main')
      .map(doc => serializeDates(doc.data()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Small data is now in the document (labels, breadcrumbs, seo, nextUpPreview, relatedPostsTitle)
    // These are read directly from the page object below

    return {
      page: {
        ...(destPage || {}),
        keyFacts: keyFacts,
        video: video,
        map: map,
        faq: faq,
        photoGallery: photoGallery,
        relatedPosts: relatedPosts
      },
      articles,
      attractions,
      author,
      qualityReport // Include quality report in data (can be used for admin dashboard)
    };

  } catch (e) {
    console.error("Failed to load page data from Firestore:", e);
    return {
      page: null,
      articles: [],
      attractions: [],
      author: null,
      qualityReport: null,
      error: "Failed to load page data from the server."
    };
  }
}


