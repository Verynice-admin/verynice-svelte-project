#!/usr/bin/env node
/**
 * Script to enhance history content with more facts and people
 * Adds a new "Historical Figures" section organized by period
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadServiceAccount() {
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json'),
    resolve('serviceAccountKey.json'),
    resolve('service-account.json')
  ];

  for (const path of secretsPaths) {
    try {
      if (existsSync(path)) {
        const sa = JSON.parse(readFileSync(path, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue
    }
  }
  return null;
}

function initFirebase() {
  if (getApps().length === 0) {
    const sa = loadServiceAccount();
    if (!sa) {
      throw new Error('Firebase service account not found.');
    }
    initializeApp({
      credential: cert(sa),
      projectId: sa.project_id
    });
  }
  return getFirestore();
}

const db = initFirebase();
log('✅ Firebase Admin initialized', 'green');

// Enhanced content for existing sections
const enhancedSections = {
  'kazakh-khanate-birth': {
    contentMarkdown: `**The First Kazakh State**

In 1465, Sultans **Kerey** and **Janibek** led a daring exodus to found the **Kazakh Khanate**. The very word "Kazakh" came to mean "free spirit" or "adventurer."

### The Golden Age: Kasym Khan (1511-1521)

Under **Kasym Khan**, the Khanate reached its zenith, uniting over a million subjects and controlling trade routes from the Volga to the Syr Darya. His reign marked the peak of Kazakh military and economic power.

### The Lawgiver: Tauke Khan (1680-1718)

**Tauke Khan** created the **Jeti Jargy** (Seven Laws), a legal code that unified the three Zhuzes and established principles of justice, property rights, and military organization. This code remained the foundation of Kazakh law for centuries.

### The Three Zhuzes

A unique geopolitical union of the Senior (Uly Zhuz), Middle (Orta Zhuz), and Junior (Kishi Zhuz) hordes designed to defend the vast steppe. Each Zhuz had its own territory and leadership, but united in times of external threat.

*   **Senior Zhuz**: Eastern territories, centered around Semirechye
*   **Middle Zhuz**: Central steppe, the largest and most powerful
*   **Junior Zhuz**: Western regions, closest to Russian influence

### Other Notable Khans

*   **Haqnazar Khan (1538-1580)**: Expanded the Khanate's borders and strengthened diplomatic relations
*   **Esim Khan (1598-1628)**: Consolidated power and defended against Oirat incursions
*   **Jangir Khan (1628-1652)**: Known for his military campaigns and administrative reforms

\`\`\`mermaid
graph TD
    A[Golden Horde Collapse] --> B[White Horde]
    B --> C[Abulkhair Khanate]
    C -->|Rebellion| D[Kerey & Janibek]
    D --> E[Kazakh Khanate (1465)]
    E --> F[Kasym Khan (Golden Age)]
    E --> G[Haqnazar Khan]
    E --> H[Tauke Khan (Laws: Jeti Jargy)]
\`\`\``
  },
  'great-calamity': {
    contentMarkdown: `**Aktaban Shubyryndy: The Years of the Great Faint**

The **Dzungar Invasion** brought the nation to the brink of extinction. Known as the "Years of the Great Faint," nearly 40% of the population perished between 1723 and 1727.

### The Great Unifier: Ablai Khan (1711-1781)

**Ablai Khan** was the warrior-diplomat who rallied the three Zhuzes to fight back. His strategic genius and diplomatic skill allowed him to play Russia and China against each other while defending Kazakh independence.

### The Batyrs: Warriors of Legend

*   **Kabanbay Batyr (1692-1770)**: Master of guerrilla warfare, led devastating raids against Dzungar supply lines
*   **Bogenbay Batyr (1680-1775)**: Known as "Iron Arm" for his legendary strength, commanded the Middle Zhuz forces
*   **Nauryzbay Batyr**: Hero of the Senior Zhuz, instrumental in the victory at Anrakay
*   **Raiymbek Batyr**: Led the Junior Zhuz cavalry, famous for his lightning-fast attacks

### Decisive Victories

*   **Battle of Bulanty (1726)**: Kazakh forces ambushed the Dzungars in mountain passes, proving the horde could bleed
*   **Battle of Anrakay (1729)**: A three-day epic near Lake Alakol where **70,000 unified Kazakh warriors** broke the Dzungar advance, ending the immediate threat

### The Aftermath

The victory at Anrakay secured Kazakh survival but left the nation weakened. This vulnerability would later be exploited by the Russian Empire, which began its systematic colonization in the 1730s.

\`\`\`mermaid
timeline
    title The Dzungar Wars
    1723 : The Invasion Begins (Great Calamity)
    1726 : Unity Achieved at Bulanty
    1729 : Decisive Victory at Anrakay
    1771 : Ablai Khan unites all three Zhuzes
\`\`\``
  },
  'russian-colonization': {
    contentMarkdown: `**Colonization & Resistance**

The Russian Empire advanced steadily, building a "noose" of fortresses to strangle nomadic freedom and control trade routes.

### The Fortress Strategy

*   **Orenburg Line**: Built in the 1730s, cutting off western migration routes
*   **Siberian Line**: Constructed along the Irtysh River, blocking northern pastures
*   **Impact**: These lines cut off vital seasonal migration routes, forcing Kazakhs to abandon traditional pastoralism

### The Last Khan: Kenesary Kasymov (1802-1847)

**Kenesary Khan**, grandson of Ablai Khan, was the "Last Khan" who led a fierce 10-year rebellion (1837-1847) to restore independence. He briefly reunited all three Zhuzes and established a functioning khanate government. His execution in 1847 marked the end of the khanate system.

### Other Resistance Leaders

*   **Syrym Datuly (1753-1802)**: Led the first major anti-Russian uprising in the Junior Zhuz (1783-1797)
*   **Isatay Taymanuly (1791-1838)**: Poet-warrior who rallied the Caspian steppes with powerful oratory
*   **Makhambet Otemisuly (1803-1846)**: Poet and military leader, co-led the 1836-1838 uprising with Isatay
*   **Eset Batyr (1803-1889)**: Continued resistance after Kenesary's death, fighting until 1858

### The Transformation

The traditional nomadic state structure was dismantled forever. Russian administrators replaced khans, and the steppe was divided into provinces. This era marked the end of Kazakh political independence until 1991.

\`\`\`mermaid
graph TD
    A[Russian Expansion] --> B[Fortress Lines Built]
    B --> C[Loss of Pasture Lands]
    C --> D[Uprisings]
    D --> E[Syrym Datuly (1783-1797)]
    D --> F[Isatay & Makhambet (1836-1838)]
    D --> G[Kenesary Khan's Rebellion (1837-1847)]
    G --> H[Defeat & Full Annexation]
\`\`\``
  },
  'soviet-crucible': {
    contentMarkdown: `**Tragedy & Transformation**

The 20th century was a forge of blood and iron. The Soviet era brought both catastrophic loss and rapid modernization—a paradox that shaped modern Kazakhstan.

### The Great Famine: Asharshylyk (1930–1933)

The forced collectivization campaign was not merely an economic policy; it was a systematic dismantling of nomadic civilization. Soviet authorities slaughtered **90% of livestock**—the nomad's lifeblood—transforming the steppe into a graveyard.

**The Human Cost:**
- **1.5 million dead**—nearly 40% of the ethnic Kazakh population perished
- Entire clans vanished, their oral histories lost forever
- Survivors were forced into collective farms, breaking millennia of nomadic tradition

### The Enlightenment Vanguard

Before the Soviet era, Kazakh intellectuals laid the foundation for modern identity:

*   **Shokan Walikhanov (1835–1865)**: Scholar-explorer who preserved nomadic traditions. His ethnographic maps remain foundational records of Central Asia.
*   **Ybyrai Altynsarin (1841–1889)**: Reformer who opened secular schools and championed girls' education. Authored the first Kazakh-Russian textbooks.
*   **Abai Kunanbaiuly (1845–1904)**: Poet-philosopher whose *Qara Sozder* (Words of Edification) fused steppe wisdom with Russian humanism. His verses became clandestine manifestos for national renewal.

### Revolution and Betrayal: The Alash Dream

The 1916 Conscription Crisis sparked rebellion, but from that ember rose **Alash Orda (1917–1920)**, Central Asia's first democratic government:

*   **Alihan Bukeikhanov (1866-1937)**: Leader of Alash Orda, executed by Stalin
*   **Akhmet Baitursynov (1873-1937)**: Linguist and educator, reformed Kazakh alphabet
*   **Mirzhakyp Dulatov (1885-1935)**: Poet and journalist, voice of the Alash movement
*   **Mukhamedzhan Tynyshbayev (1879-1937)**: Engineer and politician, executed in the Great Purge

Their dream of autonomy was crushed by the Bolsheviks; most leaders died in gulags or firing squads.

### War and Industrial Resurrection

When Hitler's armies advanced, Kazakhstan became the industrial backbone of the Soviet Union. Factories evacuated from western Russia found new life in the steppe, producing bullets, machinery, and war matériel. The nation sent **1.2 million soldiers** to the front; half never returned.

**Heroes of the Great Patriotic War:**
- **Bauyrzhan Momyshuly (1910-1982)**: Led Panfilov's Guards with guerrilla tactics now studied at West Point. His memoirs became national manuals on strategy and courage.
- **Aliya Moldagulova (1925-1944)**: Sniper with 91 confirmed kills, died at 18 storming a German position. Asteroid **3122 Aliya** bears her name.
- **Manshuk Mametova (1922-1943)**: Machine gunner who died defending her position, first Kazakh woman awarded Hero of the Soviet Union
- **Tulegen Tokhtarov (1920-1943)**: Scout who destroyed enemy positions, posthumously awarded Hero of the Soviet Union
- **Sagadat Nurmagambetov (1924-2013)**: Tank commander, later became first Minister of Defense of independent Kazakhstan

### The Space Age Dawns

From the **Baikonur Cosmodrome** in the Kazakh steppe, humanity took its first steps into the cosmos. On April 12, 1961, Yuri Gagarin launched from this very ground, becoming the first human in space. Yet this achievement came at a cost: toxic rocket fuel polluted the Syr Darya, leaving environmental scars that persist today.

### The Nuclear Shadow

The **Semipalatinsk Polygon** became the site of 456 nuclear tests, poisoning 1.5 million people and causing generational birth defects. The poet **Olzhas Suleimenov's** *Nevada–Semipalatinsk* movement (1989) finally forced the testing site's closure, a testament to Kazakh resilience.

### The Final Roar: Zheltoksan (December 1986)

The Soviet yoke did not fall with a whimper but with the roar of students. When Moscow installed a Russian outsider to lead Kazakhstan, **5,000 youths** flooded Brezhnev Square chanting "Kazakhstan for Kazakhs!"

> **Operation Snowstorm**  
> The uprising was crushed by OMON troops wielding batons and shovels. Martyrs like **Kayrat Ryskulbekov** became symbols of defiance. The seed of sovereignty was planted here, culminating in the 1991 independence declaration.

### The Price of Modernization

The Soviet era left Kazakhstan with a complex legacy: mass education and industrialization alongside environmental devastation and demographic trauma. The nation that emerged in 1991 carried both the scars of repression and the tools of progress—a duality that defines modern Kazakh identity.`
  }
};

// New Historical Figures section content
const historicalFiguresContent = `**Guardians of the Steppe: Key Figures in Kazakh History**

This comprehensive guide highlights the individuals who shaped Kazakhstan's destiny across millennia, from ancient warriors to modern visionaries.

### Ancient Era (800 BCE - 200 CE)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Queen Tomyris** | 6th century BCE | Ruler of the Massagetae | Defeated Persian Emperor Cyrus the Great in 530 BCE, preserving steppe independence |
| **The Golden Man** | 4th century BCE | Saka warrior prince | Symbol of Saka wealth and artistry, discovered in Issyk Kurgan with 4,000 gold plates |

### Kazakh Khanate Era (1465 - 1847)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Kerey Khan** | 1420-1473 | Co-founder of Kazakh Khanate | Led the exodus that created the first unified Kazakh state in 1465 |
| **Janibek Khan** | 1428-1480 | Co-founder of Kazakh Khanate | Partnered with Kerey to establish the Khanate, meaning "free spirit" |
| **Kasym Khan** | 1455-1521 | Khan (1511-1521) | Golden Age ruler who united over a million subjects, peak of Khanate power |
| **Haqnazar Khan** | 1538-1580 | Khan | Expanded Khanate borders, strengthened diplomatic relations |
| **Esim Khan** | 1598-1628 | Khan | Consolidated power, defended against Oirat incursions |
| **Tauke Khan** | 1680-1718 | Khan | Created Jeti Jargy (Seven Laws), unified legal code for all three Zhuzes |
| **Ablai Khan** | 1711-1781 | Khan | Great unifier who rallied three Zhuzes against Dzungars, master diplomat |
| **Kabanbay Batyr** | 1692-1770 | Military leader | Master of guerrilla warfare, hero of Dzungar wars |
| **Bogenbay Batyr** | 1680-1775 | Military leader | "Iron Arm," commanded Middle Zhuz forces, legendary strength |
| **Nauryzbay Batyr** | 17th-18th c. | Military leader | Hero of Senior Zhuz, instrumental in victory at Anrakay |
| **Raiymbek Batyr** | 17th-18th c. | Military leader | Led Junior Zhuz cavalry, famous for lightning-fast attacks |
| **Syrym Datuly** | 1753-1802 | Resistance leader | Led first major anti-Russian uprising in Junior Zhuz (1783-1797) |
| **Kenesary Kasymov** | 1802-1847 | Last Khan | Led 10-year rebellion (1837-1847), last khan to unite all three Zhuzes |
| **Isatay Taymanuly** | 1791-1838 | Poet-warrior | Rallied Caspian steppes with powerful oratory, co-led 1836-1838 uprising |
| **Makhambet Otemisuly** | 1803-1846 | Poet-warrior | Co-led resistance with Isatay, combined poetry and military leadership |
| **Eset Batyr** | 1803-1889 | Resistance leader | Continued resistance after Kenesary's death, fought until 1858 |

### Russian Colonial Era (1847 - 1917)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Shokan Walikhanov** | 1835-1865 | Scholar-explorer | Preserved nomadic traditions, ethnographic maps remain foundational records |
| **Ybyrai Altynsarin** | 1841-1889 | Educator-reformer | Opened secular schools, championed girls' education, authored first Kazakh-Russian textbooks |
| **Abai Kunanbaiuly** | 1845-1904 | Poet-philosopher | *Qara Sozder* (Words of Edification) fused steppe wisdom with humanism, national literary icon |

### Alash Orda & Early Soviet (1917 - 1941)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Alihan Bukeikhanov** | 1866-1937 | Alash Orda leader | Led Central Asia's first democratic government, executed by Stalin |
| **Akhmet Baitursynov** | 1873-1937 | Linguist-educator | Reformed Kazakh alphabet, executed in Great Purge |
| **Mirzhakyp Dulatov** | 1885-1935 | Poet-journalist | Voice of Alash movement, died in gulag |
| **Mukhamedzhan Tynyshbayev** | 1879-1937 | Engineer-politician | Alash Orda member, executed in Great Purge |
| **Turar Ryskulov** | 1894-1938 | Soviet politician | First Kazakh to hold high Soviet office, executed in purges |

### World War II Heroes (1941 - 1945)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Bauyrzhan Momyshuly** | 1910-1982 | Military commander | Led Panfilov's Guards, tactics studied at West Point, national hero |
| **Aliya Moldagulova** | 1925-1944 | Sniper | 91 confirmed kills, died at 18, asteroid 3122 Aliya named in her honor |
| **Manshuk Mametova** | 1922-1943 | Machine gunner | First Kazakh woman Hero of the Soviet Union, died defending position |
| **Tulegen Tokhtarov** | 1920-1943 | Scout | Destroyed enemy positions, posthumously awarded Hero of the Soviet Union |
| **Sagadat Nurmagambetov** | 1924-2013 | Tank commander | Later became first Minister of Defense of independent Kazakhstan |

### Soviet Era Intellectuals & Activists (1945 - 1991)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Olzhas Suleimenov** | b. 1936 | Poet-activist | Led Nevada-Semipalatinsk movement (1989), forced closure of nuclear test site |
| **Kayrat Ryskulbekov** | 1968-1986 | Student activist | Martyr of Zheltoksan uprising, symbol of resistance |
| **Dinmukhamed Kunaev** | 1912-1993 | Soviet leader | First Kazakh to lead Kazakh SSR (1964-1986), promoted Kazakh culture |

### Independence Era (1991 - Present)

| Figure | Period | Role | Legacy |
| --- | --- | --- | --- |
| **Nursultan Nazarbayev** | b. 1940 | First President | Led independence movement, served 1991-2019, architect of modern Kazakhstan |
| **Kassym-Jomart Tokayev** | b. 1953 | President | Current president, led "New Kazakhstan" reforms after 2022 events |
| **Gennady Golovkin** | b. 1982 | Athlete | Boxing world champion, carries Kazakh identity to global stage |
| **Dimash Kudaibergen** | b. 1994 | Musician | International singer, cultural ambassador for Kazakhstan |

---

**These figures represent the resilience, intellect, and spirit that define the Kazakh nation.** From ancient queens to modern visionaries, their stories form the living memory of the Great Steppe.`;

async function enhanceHistoryContent() {
  try {
    log('\n🔍 Starting history content enhancement...', 'cyan');
    
    const sectionsRef = db.collection('pages').doc('historyPage').collection('sections');
    const sectionsSnapshot = await sectionsRef.orderBy('order', 'asc').get();
    
    log(`\n📋 Found ${sectionsSnapshot.size} sections`, 'cyan');
    
    // Update existing sections
    for (const [sectionId, enhancedContent] of Object.entries(enhancedSections)) {
      // Find section by ID or title
      let targetDoc = null;
      for (const doc of sectionsSnapshot.docs) {
        const data = doc.data();
        const docId = doc.id.toLowerCase();
        const title = (data.title || '').toLowerCase();
        
        if (docId.includes(sectionId.replace(/-/g, '')) || 
            title.includes(sectionId.split('-').slice(-1)[0])) {
          targetDoc = doc;
          break;
        }
      }
      
      if (targetDoc) {
        log(`\n📝 Updating section: ${targetDoc.id}`, 'cyan');
        await targetDoc.ref.update({
          contentMarkdown: enhancedContent.contentMarkdown,
          contentFormat: 'markdown',
          updatedAt: Timestamp.now()
        });
        log(`   ✅ Enhanced content added`, 'green');
      } else {
        log(`   ⚠️  Section "${sectionId}" not found, skipping`, 'yellow');
      }
    }
    
    // Add new Historical Figures section
    log('\n📝 Creating "Historical Figures" section...', 'cyan');
    
    // Check if it already exists
    let figuresSectionExists = false;
    for (const doc of sectionsSnapshot.docs) {
      const title = (doc.data().title || '').toLowerCase();
      if (title.includes('figure') || title.includes('people') || title.includes('person')) {
        figuresSectionExists = true;
        log(`   ℹ️  Similar section found: ${doc.id}`, 'yellow');
        break;
      }
    }
    
    if (!figuresSectionExists) {
      // Find the highest order number
      let maxOrder = 0;
      sectionsSnapshot.forEach(doc => {
        const order = doc.data().order || 0;
        if (order > maxOrder) maxOrder = order;
      });
      
      const newSectionRef = sectionsRef.doc('section-historical-figures');
      await newSectionRef.set({
        id: 'historical-figures',
        sectionId: 'historical-figures',
        title: 'Historical Figures',
        year: 'All Periods',
        order: maxOrder + 1,
        contentFormat: 'markdown',
        contentMarkdown: historicalFiguresContent,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      log(`   ✅ Created new "Historical Figures" section (order: ${maxOrder + 1})`, 'green');
    } else {
      log(`   ⚠️  Historical figures section may already exist, skipping creation`, 'yellow');
    }
    
    log('\n✅ History content enhancement complete!', 'green');
    log('   - Enhanced existing sections with more facts and people', 'green');
    log('   - Added comprehensive "Historical Figures" section', 'green');
    log('   - Organized figures by historical period', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

enhanceHistoryContent();

















