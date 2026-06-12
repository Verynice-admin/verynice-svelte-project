import { adminDB } from '$lib/server/firebaseAdmin';

function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => serializeDates(item));
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v && typeof v.toDate === 'function') {
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
        out[k] = { lat: v.latitude, lng: v.longitude };
      } else {
        out[k] = serializeDates(v);
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

const FALLBACK_PAGE = {
  seo: {
    title: 'Culture | VeryNice',
    description: 'Discover the rich traditions, customs, arts, and heritage of Kazakh culture.'
  },
  mainTitle: 'Kazakh Culture & Heritage',
  headerDescription:
    'Nomadic traditions, vibrant arts, ancient mythology, and the warm hospitality that defines the soul of Kazakhstan.',
  heroKicker: 'Experience the Heritage',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Culture' }],
  headerBackgroundPublicId: 'content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/khoja-ahmed-yasawi-mausoleum-01',
  introMarkdown:
    'Kazakh culture is rooted in **centuries of nomadic tradition**, shaped by the vast steppes, harsh winters, and the deep connection between people, nature, and community. From the ornate **Saukele** headdresses to the warm embrace of **konakasy** (hospitality), every aspect tells a story of resilience, beauty, and unity.'
};

const FALLBACK_HIGHLIGHTS = [
  {
    title: 'Traditional Clothing',
    description: 'The Saukele, Shapan, and Chapan — symbols of status, beauty, and cultural identity.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01'
  },
  {
    title: 'Yurt & Nomadic Life',
    description: 'The portable home that embodies Kazakh mobility, family values, and connection to nature.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02'
  },
  {
    title: 'Kazakh Melodies',
    description: 'Dombra melodies, throat singing, and the lively Kara Zhorga that unite generations.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-03'
  },
  {
    title: 'Arts & Crafts',
    description: 'Intricate embroidery, felt-making, jewelry, and the ancient art of eagle hunting.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-04'
  },
  {
    title: 'Traditions & Customs',
    description: 'Konakasy hospitality, Besikke Salu ceremonies, and the sacred Tüsau Keser.',
    imagePublicId: 'content/pages/destinations/Turkistan_Shymkent/khoja-ahmed-yasawi-mausoleum/khoja-ahmed-yasawi-mausoleum-01'
  },
  {
    title: 'Mythology & Folklore',
    description: 'Epic tales of heroes, spirits of the steppe, and the legendary Tulpar horses.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01'
  },
  {
    title: 'Traditional Games',
    description: 'Kokpar, Audaryspak, Kyz Kuu — ancient sports that test strength, skill, and courage.',
    imagePublicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01'
  }
];

const FALLBACK_ARTICLES: any[] = [];

const FALLBACK_GALLERY = {
  title: 'Kazakh Culture Gallery',
  photos: [
    // Traditional Clothing (5)
    { publicId: 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01', alt: 'Shapan - Traditional robe', caption: 'Shapan — A richly embroidered robe worn by Kazakh men, symbolizing dignity and status' },
    { publicId: 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-02', alt: 'Saukele - Bridal headdress', caption: 'Saukele — An ornate bridal headdress adorned with gold, pearls, and feathers, worn by brides' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01', alt: 'Kalpak - White felt hat', caption: 'Kalpak — A distinctive white felt hat, a symbol of Kazakh identity and craftsmanship' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02', alt: 'Kamzol - Embroidered vest', caption: 'Kamzol — An embroidered vest showcasing intricate patterns passed through generations' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-03', alt: 'Beldemshe - Embroidered apron', caption: 'Beldemshe — A beautifully embroidered apron worn by married women as a sign of skill' },
    // Yurt & Nomadic Life (5)
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-04', alt: 'Shanyrak - Yurt roof crown', caption: 'Shanyrak — The crown of the yurt, symbolizing the connection between earth and sky' },
    { publicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01', alt: 'Kerege - Lattice walls', caption: 'Kerege — The intricate lattice walls that make the yurt portable and resilient' },
    { publicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-02', alt: 'Uyk - Roof poles', caption: 'Uyk — The wooden poles that support the yurt, arranged to face the door' },
    { publicId: 'content/pages/destinations/Almaty_nearby/zenkov-cathedral/zenkov-cathedral-01', alt: 'Jabu Kiiz - Felt carpets', caption: 'Jabu Kiiz — Colorful felt carpets and wall decorations that insulate and beautify the yurt' },
    { publicId: 'content/pages/destinations/Almaty_nearby/zenkov-cathedral/zenkov-cathedral-02', alt: 'Esik - Yurt entrance', caption: 'Esik — The wooden door of the yurt, often carved with protective symbols' },
    // Kazakh Melodies (5)
    { publicId: 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01', alt: 'Dombra - Two-stringed lute', caption: 'Dombra — The soulful two-stringed lute that has accompanied Kazakh storytellers for centuries' },
    { publicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-01', alt: 'Kobyz - Bowed instrument', caption: 'Kobyz — An ancient bowed instrument whose haunting sounds connect listeners to the ancestors' },
    { publicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-02', alt: 'Kara Zhorga - Traditional dance', caption: 'Kara Zhorga — An energetic circle dance that celebrates community and joy' },
    { publicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01', alt: 'Alpamys - Epic hero', caption: 'Alpamys — A legendary hero from Kazakh epic poetry, embodying strength and honor' },
    { publicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-02', alt: 'Aitys - Poetic competition', caption: 'Aitys — A traditional poetic improvisation contest where singers compete with wit and verse' },
    // Arts & Crafts (5)
    { publicId: 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01', alt: 'Syrmak - Felt carpet', caption: 'Syrmak — A traditional felt carpet with bold geometric patterns, essential to nomadic life' },
    { publicId: 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01', alt: 'Kezde - Embroidery', caption: 'Kezde — Delicate embroidery featuring symbolic patterns of protection and prosperity' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-01', alt: 'Besik - Cradle', caption: 'Besik — A beautifully decorated cradle for infants, passed down through generations' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02', alt: 'Silver - Jewelry', caption: 'Traditional Kazakh silver jewelry — Handcrafted pieces featuring tribal symbols and semi-precious stones' },
    { publicId: 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01', alt: 'Berkutchi - Eagle hunting', caption: 'Berkutchi — The ancient tradition of hunting with golden eagles on the vast steppes' },
    // Traditions & Customs (5)
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-02', alt: 'Konakasy - Hospitality', caption: 'Konakasy — The sacred tradition of Kazakh hospitality where guests are treated as messengers of God' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-03', alt: 'Besikke - Cradle ceremony', caption: 'Besikke Salu — A ceremony celebrating a baby\'s first placement in the cradle' },
    { publicId: 'content/pages/destinations/Almaty_nearby/nomad-ethno-village/nomad-ethno-village-04', alt: 'Aksakal - Elders respect', caption: 'Aksakal — The deep respect for elders, the keepers of wisdom and tradition' },
    { publicId: 'content/pages/destinations/Almaty_nearby/zenkov-cathedral/zenkov-cathedral-01', alt: 'Wedding - Traditional ceremony', caption: 'Traditional Kazakh wedding — Rich in symbolism, color, and centuries-old customs' },
    // Mythology & Folklore (remaining)
    { publicId: 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01', alt: 'Tengri - Sky god', caption: 'Tengri — The supreme sky god in ancient Turkic belief, source of all life and cosmic order' },
    // Traditional Games (5)
    { publicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-01', alt: 'Kokpar - Buzkashi sport', caption: 'Kokpar — The ancient sport of horsemen competing for a goat carcass on the open steppe' },
    { publicId: 'content/pages/destinations/Almaty_nearby/altyn-emel-national-park/altyn-emel-national-park-02', alt: 'Audaryspak - Horse wrestling', caption: 'Audaryspak — A traditional horse wrestling competition testing strength and riding skills' },
    { publicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-01', alt: 'Kyz Kuu - Chase game', caption: 'Kyz Kuu — The thrilling chase game where horsemen pursue young women riders' },
    { publicId: 'content/pages/destinations/Almaty_nearby/panfilov-park/panfilov-park-02', alt: 'Kures - Wrestling', caption: 'Kures — Traditional wrestling where strength, technique, and honor determine the victor' },
    { publicId: 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01', alt: 'Altybakan - Swinging game', caption: 'Altybakan — The ancient swinging game that brings courage and joy to participants' }
  ]
};

const FALLBACK_FAQ = {
  title: 'Kazakh Culture FAQs',
  items: [
    {
      question: 'What is the traditional Kazakh greeting?',
      answer:
        'The traditional greeting is **"Salamatsyz ba?"** (Are you healthy/well?). Men traditionally shake hands, while women often place their right hand on their chest as a sign of respect. When greeting elders, younger people may bow slightly.',
      answerFormat: 'markdown'
    },
    {
      question: 'What does the yurt symbolize?',
      answer:
        'The yurt represents **Kazakh nomadic heritage, family unity, and cosmic harmony**. The circular shape symbolizes the sun and eternal life, while the **Shanyrak** (top opening) connects to the sky god Tengri. It embodies portability, community, and the balance between human life and nature.',
      answerFormat: 'markdown'
    },
    {
      question: 'What are the main traditional instruments?',
      answer:
        'The **dombra** (two-stringed lute) is the most important Kazakh instrument. Others include the **kobyz** (ancient bowed instrument), **syrnay** (flute), **dauylpaz** (drum), and **shankobyz** (jaw harp). These instruments accompany epic poetry, folk songs, and dances.',
      answerFormat: 'markdown'
    },
    {
      question: 'What is Konakasy?',
      answer:
        '**Konakasy** is the sacred tradition of hospitality. The saying "The guest is a messenger from God" reflects its importance. Hosts provide the best food, comfortable seating, and attentive care. Guests are treated as honored members of the family, and refusing hospitality is considered impossible.',
      answerFormat: 'markdown'
    },
    {
      question: 'What are common traditional patterns and their meanings?',
      answer:
        'Kazakh ornaments carry deep symbolism: **ram horns** represent strength and prosperity; **pomegranate** symbolizes fertility and family; **the sun** brings light and life; **tulips** represent beauty and the spring; **scorpions** offer protection against evil. These appear in embroidery, jewelry, and felt work.',
      answerFormat: 'markdown'
    }
  ]
};

export async function load() {
  if (!adminDB) {
    return {
      page: FALLBACK_PAGE,
      highlights: FALLBACK_HIGHLIGHTS,
      articles: FALLBACK_ARTICLES,
      photoGallery: FALLBACK_GALLERY,
      faq: FALLBACK_FAQ,
      relatedPosts: [],
      author: null,
      error: 'Server database connection failed.'
    };
  }

  try {
    const pageRef = adminDB.collection('pages').doc('culturePage');
    const [pageSnap, articlesSnap, highlightsSnap, faqSnap, photoGallerySnap, relatedPostsSnap] =
      await Promise.all([
        pageRef.get(),
        pageRef.collection('articles').orderBy('order', 'asc').get(),
        pageRef.collection('highlights').orderBy('order', 'asc').get(),
        pageRef.collection('faq').get(),
        pageRef.collection('photoGallery').get(),
        pageRef.collection('relatedPosts').orderBy('order', 'asc').get()
      ]);

    const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};

    const highlights = highlightsSnap.docs.length
      ? (() => {
          const items = highlightsSnap.docs.map((doc) => serializeDates({ id: doc.id, ...doc.data() }));
          // Deduplicate by id to prevent duplicate key errors in Svelte
          const seenIds = new Set();
          const deduplicated = items.filter(item => {
            const itemId = item.id || item.title;
            if (seenIds.has(itemId)) {
              console.warn('[culture] Duplicate highlight found, skipping:', itemId);
              return false;
            }
            seenIds.add(itemId);
            return true;
          });
          return deduplicated.length ? deduplicated : FALLBACK_HIGHLIGHTS;
        })()
      : FALLBACK_HIGHLIGHTS;

    const articles = articlesSnap.docs.length
      ? articlesSnap.docs
          .map((doc) =>
            serializeDates({
              id: doc.id,
              articleId: doc.data().articleId || doc.id,
              order: doc.data().order || 0,
              title: doc.data().title || '',
              contentMarkdown: doc.data().contentMarkdown || doc.data().content || '',
              contentHTML: doc.data().contentHTML || doc.data().content || '',
              contentFormat: doc.data().contentFormat || 'markdown'
            })
          )

          .filter(article => {
            const title = (article.title || '').trim().toLowerCase();
            // Filter out articles that have the specified titles
            return !['traditional clothing', 'yurt & nomadic life', 'kazakh melodies', 'arts & crafts', 'traditions & customs', 'mythology & folklore', 'traditional games'].includes(title);
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      : FALLBACK_ARTICLES;

    let faq = null;
    if (faqSnap.size > 0) {
      const faqDoc = faqSnap.docs[0].data();
      faq = {
        title: faqDoc.title || 'Kazakh Culture FAQs',
        items: faqDoc.items || []
      };
    }
    if (!faq) {
      faq = FALLBACK_FAQ;
    }

    let photoGallery = null;
    if (photoGallerySnap.size > 0) {
      const galleryDoc = photoGallerySnap.docs[0].data();
      const photos = (galleryDoc.photos || []).map((img: any) => ({
        publicId: img.publicId || img.public_id || '',
        alt: img.alt || img.altText || 'Kazakh culture image',
        caption: img.caption || img.captionName || ''
      }));
      if (photos.length > 0) {
        photoGallery = {
          title: galleryDoc.title || 'Kazakh Culture Gallery',
          photos
        };
      }
    }
    if (!photoGallery) {
      photoGallery = FALLBACK_GALLERY;
    }

    const relatedPosts = relatedPostsSnap.docs
      .filter((doc) => doc.id !== 'main')
      .map((doc) => serializeDates(doc.data()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      page: { ...FALLBACK_PAGE, ...page },
      highlights,
      articles,
      photoGallery,
      faq,
      relatedPosts,
      author: null
    };
  } catch (error) {
    console.error('[culture] load error', error);
    return {
      page: FALLBACK_PAGE,
      highlights: FALLBACK_HIGHLIGHTS,
      articles: FALLBACK_ARTICLES,
      photoGallery: FALLBACK_GALLERY,
      faq: FALLBACK_FAQ,
      relatedPosts: [],
      author: null,
      error: 'Failed to load culture data.'
    };
  }
}
