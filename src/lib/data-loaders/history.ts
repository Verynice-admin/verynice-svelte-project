import { markdownToHTML } from '$lib/utils/markdown';

interface HistorySectionImage {
  publicId: string;
  alt: string;
  captionName?: string;
  captionSource?: string;
}

interface HistoryArticle {
  id: string;
  articleId: string;
  title: string;
  year: string; // New field for timeline
  order: number;
  contentMarkdown: string;
  contentHTML: string;
  contentFormat: 'markdown' | 'html';
  images: HistorySectionImage[];
}

interface HistoryAuthor {
  name: string;
  title?: string;
  bio: string;
  avatarUrl?: string;
  profilePicturePublicId?: string;
  authorImagePublicId?: string;
  ariaLabelForImage?: string;
}

interface HistoryFaqItem {
  question: string;
  answerMarkdown: string;
  answerFormat?: 'markdown' | 'html';
}

interface HistoryPageContent {
  seo: {
    title: string;
    description: string;
    keywords?: string;
  };
  mainTitle: string;
  headerDescription: string;
  location: string;
  period?: string;
  readTimeMinutes?: number;
  articleViews: number;
  articleComments: number;
  articleLikes: number;
  breadcrumbs: Array<{ label: string; href?: string }>;
  keyFacts?: Array<{ label: string; value: string }>;
  tags?: string[];
  headerBackgroundPublicId?: string;
  headerBackgroundImageAriaLabel?: string;
  heroImageCaption?: string;
  heroImageSource?: string;
  videoTitle?: string;
  videoUrl?: string;
  mapCoordinates?: { lat: number; lng: number } | null;
  faqTitle?: string;
  faqSection?: HistoryFaqItem[];
  publishedDate?: string;
  updatedDate?: string;
  labels?: Record<string, string>;
  nextUpPreview?: {
    title: string;
    text: string;
    href?: string;
  };
}

interface HistoryPage {
  page: HistoryPageContent;
  articles: HistoryArticle[];
  author: HistoryAuthor;
}

const HERO_IMAGE_ID = 'content/pages/history/mainimage';

const ARTICLE_SOURCE: Array<Omit<HistoryArticle, 'contentHTML'>> = [
  {
    id: 'ancient-empires',
    articleId: 'ancient-empires',
    title: 'Masters of the Wind',
    year: '800 BCE',
    order: 1,
    contentFormat: 'markdown',
    contentMarkdown: `**The Dawn of the Steppe**

Long before Rome, the **Saka** (Scythians) ruled the Eurasian steppe. They were the original centaurs—masters of the horse who revolutionized warfare.

*   **The Golden Man**: A warrior prince buried in 4,000 gold plates (Issyk Kurgan), symbolizing the immense wealth and artistry of the Saka.
*   **Queen Tomyris**: The legendary ruler of the Massagetae who defeated Persian Emperor Cyrus the Great in 530 BCE.
*   **Innovation**: They invented the **compound bow** and the **yurt**, technologies that defined steppe life for millennia.

\`\`\`mermaid
timeline
    title Rise of the Steppe Empires
    800 BCE : Domestication of the Horse (Botai Culture)
    700 BCE : Rise of the Saka (Scythians)
    530 BCE : Queen Tomyris defeats Cyrus the Great
    400 BCE : The Golden Man buried
    200 BCE : Rise of the Huns (Xiongnu)
\`\`\``,
    images: []
  },
  {
    id: 'silk-road-golden-horde',
    articleId: 'silk-road-golden-horde',
    title: 'The Silk Road Hub',
    year: '1200 CE',
    order: 2,
    contentFormat: 'markdown',
    contentMarkdown: `**Crossroads of the World**

Kazakhstan was the beating heart of the Silk Road. Cities like **Otrar** and **Turkistan** were cosmopolitan hubs where East met West, trading not just goods but ideas.

*   **Pax Mongolica**: Genghis Khan's conquest created a safe trade superhighway connecting Europe to Asia.
*   **The Golden Horde**: A powerful state that blended nomadic military might with Islamic culture and urban trade.
*   **Key Goods**: Silk, porcelain, spices, and scientific knowledge flowed through these steppe cities.

\`\`\`mermaid
graph LR
    A[Europe & Middle East] <-->|Spices, Glass| B(Trade Hub: Kazakhstan)
    B <-->|Silk, Porcelain| C[China]
    B <-->|Culture & Religion| D[India]
    subgraph Cities
    E[Otrar]
    F[Turkistan]
    end
    B --- E
    B --- F
\`\`\``,
    images: []
  },
  {
    id: 'kazakh-khanate-birth',
    articleId: 'kazakh-khanate-birth',
    title: 'Birth of the Free Spirit',
    year: '1465',
    order: 3,
    contentFormat: 'markdown',
    contentMarkdown: `**The First Kazakh State**

In 1465, Sultans **Kerey** and **Janibek** led a daring exodus to found the **Kazakh Khanate**. The very word "Kazakh" came to mean "free spirit" or "adventurer."

*   **Kasym Khan**: Under his rule (1511-1521), the Khanate reached its zenith, uniting over a million subjects.
*   **Three Zhuzes**: A unique geopolitical union of the Senior, Middle, and Junior hordes designed to defend the vast steppe.
*   **Identity**: This era marked the crystallization of the Kazakh nation and culture.

\`\`\`mermaid
graph TD
    A[Golden Horde Collapse] --> B[White Horde]
    B --> C[Abulkhair Khanate]
    C -->|Rebellion| D[Kerey & Janibek]
    D --> E[Kazakh Khanate (1465)]
    E --> F[Kasym Khan (Golden Age)]
    E --> G[Haqnazar Khan]
    E --> H[Tauke Khan (Laws: Jeti Jargy)]
\`\`\``,
    images: []
  },
  {
    id: 'great-calamity',
    articleId: 'great-calamity',
    title: 'The Great Calamity',
    year: '1723',
    order: 4,
    contentFormat: 'markdown',
    contentMarkdown: `**Aktaban Shubyryndy**

The **Dzungar Invasion** brought the nation to the brink of extinction. Known as the "Years of the Great Faint," nearly 40% of the population perished.

*   **Ablai Khan**: The great unifier who rallied the three Zhuzes to fight back.
*   **Victory**: Decisive battles at **Bulanty** (1726) and **Anrakay** (1729) broke the Dzungar advance.
*   **Resilience**: This era is a testament to the unyielding spirit of the Kazakh people in the face of annihilation.

\`\`\`mermaid
timeline
    title The Dzungar Wars
    1723 : The Invasion Begins (Great Calamity)
    1726 : Unity Achieved at Bulanty
    1729 : Decisive Victory at Anrakay
    1771 : Ablai Khan unites all three Zhuzes
\`\`\``,
    images: []
  },
  {
    id: 'russian-colonization',
    articleId: 'russian-colonization',
    title: 'The Imperial Shadow',
    year: '1847',
    order: 5,
    contentFormat: 'markdown',
    contentMarkdown: `**Colonization & Resistance**

The Russian Empire advanced steadily, building a "noose" of fortresses to strangle nomadic freedom and control trade routes.

*   **Fortress Lines**: The Orenburg and Siberian lines cut off vital seasonal migration routes.
*   **Kenesary Khan**: The "Last Khan" (1802-1847) who led a fierce 10-year rebellion to restore independence.
*   **Transformation**: The traditional nomadic state structure was dismantled, forever changing the steppe.

\`\`\`mermaid
graph TD
    A[Russian Expansion] --> B[Fortress Lines Built]
    B --> C[Loss of Pasture Lands]
    C --> D[Uprisings]
    D --> E[Kenesary Khan's Rebellion (1837-1847)]
    E --> F[Defeat & Full Annexation]
\`\`\``,
    images: []
  },
  {
    id: 'soviet-crucible',
    articleId: 'soviet-crucible',
    title: 'The Soviet Crucible',
    year: '1930s',
    order: 6,
    contentFormat: 'markdown',
    contentMarkdown: `**Tragedy & Transformation**

The 20th century was a forge of blood and iron. The Soviet era brought both catastrophic loss and rapid modernization.

*   **Asharshylyk (The Great Famine)**: Forced collectivization in the 1930s destroyed the nomadic economy, claiming nearly 40% of the population.
*   **Industrialization**: During WWII, Kazakhstan became the industrial engine of the USSR, producing bullets and machinery.
*   **The Space Age**: Humanity took its first steps into the cosmos from the **Baikonur Cosmodrome** in the Kazakh steppe.

\`\`\`mermaid
graph TD
    A[Soviet Era Paradox]
    A -->|The Cost| B(Tragedy)
    A -->|The Gain| C(Modernization)
    B --> D[Asharshylyk: Famine]
    B --> E[Political Repression]
    C --> F[Industrialization]
    C --> G[Baikonur: Space Age]
    C --> H[Mass Education]
\`\`\``,
    images: []
  },
  {
    id: 'independence-modern',
    articleId: 'independence-modern',
    title: 'Return of the Snow Leopard',
    year: '1991',
    order: 7,
    contentFormat: 'markdown',
    contentMarkdown: `**A New Horizon**

On **December 16, 1991**, the sun rose on a free Kazakhstan. The nation emerged from the ashes of the USSR to chart its own destiny.

*   **Nuclear Disarmament**: Kazakhstan voluntarily dismantled the world's 4th largest nuclear arsenal, a historic act of peace.
*   **Astana**: The capital was moved to the heart of the steppe, building a futuristic city that symbolizes the new nation.
*   **Global Player**: Today, Kazakhstan stands as a bridge between East and West, rooted in its nomadic heritage but looking to the future.

\`\`\`mermaid
timeline
    title The Path to Independence
    1986 : Jeltoqsan Protests
    1991 : Independence Declared (Dec 16)
    1993 : National Currency (Tenge) Introduced
    1997 : Capital moves to Astana
    2017 : EXPO 2017 Future Energy
\`\`\``,
    images: []
  }
];

const FAQ_SECTION: HistoryFaqItem[] = [
  {
    question: 'What made the Aktaban Shubyryndy so devastating?',
    answerMarkdown:
      'The Dzungar invasion simultaneously destroyed pastureland, severed trade arteries, and triggered mass migrations. Oral chronicles recount that up to half the Kazakh population perished between 1723 and 1727, making it the single most traumatic demographic shock in Kazakh history.',
    answerFormat: 'markdown'
  },
  {
    question: 'How did Russian fortress lines alter nomadic life?',
    answerMarkdown:
      'Fortress chains such as the Orenburg Line imposed borders on routes that had been fluid for centuries. Herds could no longer follow seasonal grass, which forced Kazakh clans to accept Russian-issued grazing permits, pay new taxes, or abandon pastoralism altogether.',
    answerFormat: 'markdown'
  },
  {
    question: 'Why is Kenesary Kasymov regarded as the last khan?',
    answerMarkdown:
      'Kenesary reconstituted the khanate model between 1837 and 1847, briefly uniting the Senior, Middle, and Junior zhuzes. His execution ended any realistic chance of restoring a khan-led state, which is why historians treat him as the final khan of the Kazakhs.',
    answerFormat: 'markdown'
  }
];

const HISTORY_AUTHOR: HistoryAuthor = {
  name: 'Aliya Askar',
  title: 'Lead Travel Writer',
  bio: 'Aliya is a passionate explorer of Kazakhstan\'s hidden gems, from bustling cityscapes to serene steppes',
  avatarUrl: '/logo.svg',
  profilePicturePublicId: '',
  ariaLabelForImage: 'Portrait placeholder for Aliya Askar'
};

export async function loadHistoryPage(): Promise<HistoryPage> {
  const articles: HistoryArticle[] = ARTICLE_SOURCE.map((article) => ({
    ...article,
    contentHTML: markdownToHTML(article.contentMarkdown)
  }));

  return {
    page: {
      seo: {
        title: 'The Great Calamity & Russian Encroachment | VeryNice History',
        description:
          'Explore how the Kazakh nation survived the Dzungar invasions and navigated the tightening grip of the Russian Empire between 1723 and the 1860s.',
        keywords: 'Dzungar invasion, Ablai Khan, Kenesary Kasymov, Russian empire, Kazakh history'
      },
      mainTitle: 'The Great Calamity and Russian Encroachment',
      headerDescription: 'The Crucible of the Kazakh Nation (1723 – 1860s)',
      location: 'The Great Steppe (Desht-i-Kipchak)',
      period: 'Early 18th Century – Mid-19th Century',
      readTimeMinutes: 6,
      articleViews: 48210,
      articleComments: 38,
      articleLikes: 1241,
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'History', href: '/history' },
        { label: 'Great Calamity', href: '/history#great-calamity-intro' }
      ],
      keyFacts: [
        { label: 'Period', value: '1723 – 1860s' },
        { label: 'Primary threats', value: 'Dzungar Khanate & Russian Empire' },
        { label: 'Population loss', value: '≈50% during Aktaban Shubyryndy' },
        { label: 'Unifying leaders', value: 'Ablai Khan & Kenesary Kasymov' },
        { label: 'Imperial tactic', value: 'Fortress chains + abolition of khanates' },
        { label: 'Read time', value: '6 minutes' }
      ],
      tags: ['Dzungar', 'Russia', 'Ablai Khan', 'Kenesary Kasymov', 'Colonialism'],
      headerBackgroundPublicId: HERO_IMAGE_ID,
      headerBackgroundImageAriaLabel: 'Map showing the Dzungar invasion routes and Russian fortress chains.',
      heroImageCaption: 'Projected routes of the Dzungar advance and the Russian Orenburg Line.',
      heroImageSource: 'VeryNice Historical Atlas, c. 2024 reconstruction',
      videoTitle: 'Journey Through Kazakhstan',
      videoUrl: 'https://youtu.be/fesLbWZcR4Q',
      mapCoordinates: { lat: 48.5, lng: 68.5 },
      faqTitle: 'Frequently Asked Questions',
      faqSection: FAQ_SECTION,
      publishedDate: '2024-10-01T00:00:00.000Z',
      updatedDate: '2024-12-01T00:00:00.000Z',
      labels: {
        authorSectionTitle: 'About the historian'
      },
      nextUpPreview: {
        title: 'Next Episode',
        text: 'Modern Identity and the Soviet Crucible—Kazakhstan’s cultural fight for survival under famine and totalitarian rule.'
      }
    },
    articles,
    author: HISTORY_AUTHOR
  };
}

























