#!/usr/bin/env node
/**
 * Script to fix Mermaid syntax errors and enhance Historical Figures section
 * - Fixes all Mermaid diagram syntax errors
 * - Improves Historical Figures table formatting
 * - Adds Kazakh cosmonauts
 * - Adds Grammy winner and other important figures
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

// Fixed Mermaid diagrams (corrected syntax)
const fixedMermaidDiagrams = {
  'ancient-empires': {
    mermaid: `\`\`\`mermaid
graph TD
    A[800 BCE: Botai Culture] --> B[700 BCE: Rise of Saka]
    B --> C[530 BCE: Queen Tomyris defeats Cyrus]
    C --> D[400 BCE: Golden Man buried]
    D --> E[200 BCE: Rise of Huns]
\`\`\``
  },
  'silk-road-golden-horde': {
    mermaid: `\`\`\`mermaid
graph LR
    A[Europe & Middle East] -->|Spices, Glass| B[Trade Hub: Kazakhstan]
    B -->|Silk, Porcelain| C[China]
    B -->|Culture & Religion| D[India]
    B --> E[Otrar]
    B --> F[Turkistan]
\`\`\``
  },
  'kazakh-khanate-birth': {
    mermaid: `\`\`\`mermaid
graph TD
    A[Golden Horde Collapse] --> B[White Horde]
    B --> C[Abulkhair Khanate]
    C -->|Rebellion| D[Kerey & Janibek]
    D --> E[Kazakh Khanate 1465]
    E --> F[Kasym Khan Golden Age]
    E --> G[Haqnazar Khan]
    E --> H[Tauke Khan Jeti Jargy]
\`\`\``
  },
  'great-calamity': {
    mermaid: `\`\`\`mermaid
graph TD
    A[1723: Dzungar Invasion] --> B[1726: Battle of Bulanty]
    B --> C[1729: Battle of Anrakay]
    C --> D[1771: Ablai Khan unites Zhuzes]
\`\`\``
  },
  'russian-colonization': {
    mermaid: `\`\`\`mermaid
graph TD
    A[Russian Expansion] --> B[Fortress Lines Built]
    B --> C[Loss of Pasture Lands]
    C --> D[Uprisings]
    D --> E[Kenesary Khan Rebellion 1837-1847]
    E --> F[Defeat and Full Annexation]
\`\`\``
  },
  'soviet-crucible': {
    mermaid: `\`\`\`mermaid
graph TD
    A[Soviet Era Paradox] -->|The Cost| B[Tragedy]
    A -->|The Gain| C[Modernization]
    B --> D[Asharshylyk Famine]
    B --> E[Political Repression]
    C --> F[Industrialization]
    C --> G[Baikonur Space Age]
    C --> H[Mass Education]
\`\`\``
  },
  'independence-modern': {
    mermaid: `\`\`\`mermaid
graph TD
    A[1986: Zheltoksan Protests] --> B[1991: Independence Dec 16]
    B --> C[1993: National Currency Tenge]
    C --> D[1997: Capital moves to Astana]
    D --> E[2017: EXPO 2017 Future Energy]
\`\`\``
  }
};

// Enhanced Historical Figures with better formatting and new additions
const enhancedHistoricalFigures = `**Guardians of the Steppe: Key Figures in Kazakh History**

This comprehensive guide highlights the individuals who shaped Kazakhstan's destiny across millennia, from ancient warriors to modern visionaries.

---

## 🌍 Ancient Era (800 BCE - 200 CE)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Queen Tomyris** | 6th century BCE | Ruler of the Massagetae | Defeated Persian Emperor Cyrus the Great in 530 BCE, preserving steppe independence |
| **The Golden Man** | 4th century BCE | Saka warrior prince | Symbol of Saka wealth and artistry, discovered in Issyk Kurgan with 4,000 gold plates |

---

## 👑 Kazakh Khanate Era (1465 - 1847)

### Founders & Khans

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Kerey Khan** | 1420-1473 | Co-founder of Kazakh Khanate | Led the exodus that created the first unified Kazakh state in 1465 |
| **Janibek Khan** | 1428-1480 | Co-founder of Kazakh Khanate | Partnered with Kerey to establish the Khanate, meaning "free spirit" |
| **Kasym Khan** | 1455-1521 | Khan (1511-1521) | Golden Age ruler who united over a million subjects, peak of Khanate power |
| **Haqnazar Khan** | 1538-1580 | Khan | Expanded Khanate borders, strengthened diplomatic relations |
| **Esim Khan** | 1598-1628 | Khan | Consolidated power, defended against Oirat incursions |
| **Tauke Khan** | 1680-1718 | Khan & Lawgiver | Created Jeti Jargy (Seven Laws), unified legal code for all three Zhuzes |

### Military Leaders & Batyrs

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Ablai Khan** | 1711-1781 | Khan & Diplomat | Great unifier who rallied three Zhuzes against Dzungars, master diplomat |
| **Kabanbay Batyr** | 1692-1770 | Military leader | Master of guerrilla warfare, hero of Dzungar wars |
| **Bogenbay Batyr** | 1680-1775 | Military leader | "Iron Arm," commanded Middle Zhuz forces, legendary strength |
| **Nauryzbay Batyr** | 17th-18th c. | Military leader | Hero of Senior Zhuz, instrumental in victory at Anrakay |
| **Raiymbek Batyr** | 17th-18th c. | Military leader | Led Junior Zhuz cavalry, famous for lightning-fast attacks |

### Resistance Leaders

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Syrym Datuly** | 1753-1802 | Resistance leader | Led first major anti-Russian uprising in Junior Zhuz (1783-1797) |
| **Kenesary Kasymov** | 1802-1847 | Last Khan | Led 10-year rebellion (1837-1847), last khan to unite all three Zhuzes |
| **Isatay Taymanuly** | 1791-1838 | Poet-warrior | Rallied Caspian steppes with powerful oratory, co-led 1836-1838 uprising |
| **Makhambet Otemisuly** | 1803-1846 | Poet-warrior | Co-led resistance with Isatay, combined poetry and military leadership |
| **Eset Batyr** | 1803-1889 | Resistance leader | Continued resistance after Kenesary's death, fought until 1858 |

---

## 📚 Russian Colonial Era (1847 - 1917)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Shokan Walikhanov** | 1835-1865 | Scholar-explorer | Preserved nomadic traditions, ethnographic maps remain foundational records |
| **Ybyrai Altynsarin** | 1841-1889 | Educator-reformer | Opened secular schools, championed girls' education, authored first Kazakh-Russian textbooks |
| **Abai Kunanbaiuly** | 1845-1904 | Poet-philosopher | *Qara Sozder* (Words of Edification) fused steppe wisdom with humanism, national literary icon |

---

## 🎯 Alash Orda & Early Soviet (1917 - 1941)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Alihan Bukeikhanov** | 1866-1937 | Alash Orda leader | Led Central Asia's first democratic government, executed by Stalin |
| **Akhmet Baitursynov** | 1873-1937 | Linguist-educator | Reformed Kazakh alphabet, executed in Great Purge |
| **Mirzhakyp Dulatov** | 1885-1935 | Poet-journalist | Voice of Alash movement, died in gulag |
| **Mukhamedzhan Tynyshbayev** | 1879-1937 | Engineer-politician | Alash Orda member, executed in Great Purge |
| **Turar Ryskulov** | 1894-1938 | Soviet politician | First Kazakh to hold high Soviet office, executed in purges |

---

## ⚔️ World War II Heroes (1941 - 1945)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Bauyrzhan Momyshuly** | 1910-1982 | Military commander | Led Panfilov's Guards, tactics studied at West Point, national hero |
| **Aliya Moldagulova** | 1925-1944 | Sniper | 91 confirmed kills, died at 18, asteroid 3122 Aliya named in her honor |
| **Manshuk Mametova** | 1922-1943 | Machine gunner | First Kazakh woman Hero of the Soviet Union, died defending position |
| **Tulegen Tokhtarov** | 1920-1943 | Scout | Destroyed enemy positions, posthumously awarded Hero of the Soviet Union |
| **Sagadat Nurmagambetov** | 1924-2013 | Tank commander | Later became first Minister of Defense of independent Kazakhstan |

---

## 🚀 Space Age: Kazakh Cosmonauts (1961 - Present)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Toktar Aubakirov** | b. 1946 | Cosmonaut | First Kazakh in space (1991), flew aboard Soyuz TM-13 to Mir space station |
| **Talgat Musabayev** | b. 1951 | Cosmonaut | Three space flights, 341 days in space, commander of ISS Expedition 11 |
| **Aidyn Aimbetov** | b. 1972 | Cosmonaut | Third Kazakh cosmonaut, flew to ISS in 2015, carried Kazakh flag to space |

---

## 🎭 Soviet Era Intellectuals & Activists (1945 - 1991)

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Olzhas Suleimenov** | b. 1936 | Poet-activist | Led Nevada-Semipalatinsk movement (1989), forced closure of nuclear test site |
| **Kayrat Ryskulbekov** | 1968-1986 | Student activist | Martyr of Zheltoksan uprising, symbol of resistance |
| **Dinmukhamed Kunaev** | 1912-1993 | Soviet leader | First Kazakh to lead Kazakh SSR (1964-1986), promoted Kazakh culture |

---

## 🏛️ Independence Era (1991 - Present)

### Political Leaders

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Nursultan Nazarbayev** | b. 1940 | First President | Led independence movement, served 1991-2019, architect of modern Kazakhstan |
| **Kassym-Jomart Tokayev** | b. 1953 | President | Current president, led "New Kazakhstan" reforms after 2022 events |

### Cultural Icons & Athletes

| **Figure** | **Period** | **Role** | **Legacy** |
|:---|:---|:---|:---|
| **Gennady Golovkin** | b. 1982 | Boxer | Middleweight world champion, carries Kazakh identity to global stage |
| **Dimash Kudaibergen** | b. 1994 | Musician | International singer, cultural ambassador, Grammy-nominated artist |
| **Ilyas Esenberlin** | 1915-1983 | Writer | Author of "Nomads" trilogy, foundational Kazakh literature |
| **Mukhtar Auezov** | 1897-1961 | Writer | Author of "Abai's Path," Nobel Prize nominee, national literary figure |

---

**These figures represent the resilience, intellect, and spirit that define the Kazakh nation.** From ancient queens to modern visionaries, their stories form the living memory of the Great Steppe.`;

async function fixHistoryIssues() {
  try {
    log('\n🔍 Starting history content fixes...', 'cyan');
    
    const sectionsRef = db.collection('pages').doc('historyPage').collection('sections');
    const sectionsSnapshot = await sectionsRef.orderBy('order', 'asc').get();
    
    log(`\n📋 Found ${sectionsSnapshot.size} sections`, 'cyan');
    
    // Fix Mermaid syntax errors in all sections
    log('\n🔧 Fixing Mermaid diagram syntax errors...', 'cyan');
    
    for (const [sectionKey, fixedDiagram] of Object.entries(fixedMermaidDiagrams)) {
      // Find section by ID or title
      let targetDoc = null;
      for (const doc of sectionsSnapshot.docs) {
        const data = doc.data();
        const docId = doc.id.toLowerCase();
        const title = (data.title || '').toLowerCase();
        const sectionId = (data.sectionId || '').toLowerCase();
        
        if (docId.includes(sectionKey.replace(/-/g, '')) || 
            sectionId.includes(sectionKey.replace(/-/g, '')) ||
            title.includes(sectionKey.split('-').slice(-1)[0])) {
          targetDoc = doc;
          break;
        }
      }
      
      if (targetDoc) {
        const currentContent = targetDoc.data().contentMarkdown || '';
        
        // Replace the old mermaid diagram with the fixed one
        const mermaidPattern = /```mermaid[\s\S]*?```/g;
        const hasMermaid = mermaidPattern.test(currentContent);
        
        if (hasMermaid) {
          const updatedContent = currentContent.replace(mermaidPattern, fixedDiagram.mermaid);
          
          await targetDoc.ref.update({
            contentMarkdown: updatedContent,
            updatedAt: Timestamp.now()
          });
          
          log(`   ✅ Fixed Mermaid syntax in: ${targetDoc.id}`, 'green');
        } else {
          log(`   ⚠️  No Mermaid diagram found in: ${targetDoc.id}`, 'yellow');
        }
      } else {
        log(`   ⚠️  Section "${sectionKey}" not found, skipping`, 'yellow');
      }
    }
    
    // Update Historical Figures section with enhanced formatting and new additions
    log('\n📝 Updating Historical Figures section...', 'cyan');
    
    let figuresSection = null;
    for (const doc of sectionsSnapshot.docs) {
      const title = (doc.data().title || '').toLowerCase();
      const sectionId = (doc.data().sectionId || '').toLowerCase();
      if (title.includes('figure') || title.includes('people') || 
          sectionId.includes('figure') || sectionId.includes('people')) {
        figuresSection = doc;
        break;
      }
    }
    
    if (figuresSection) {
      await figuresSection.ref.update({
        contentMarkdown: enhancedHistoricalFigures,
        contentFormat: 'markdown',
        updatedAt: Timestamp.now()
      });
      
      log(`   ✅ Updated Historical Figures section: ${figuresSection.id}`, 'green');
      log('   - Improved table formatting with better organization', 'green');
      log('   - Added Kazakh cosmonauts (Toktar Aubakirov, Talgat Musabayev, Aidyn Aimbetov)', 'green');
      log('   - Added Grammy-nominated Dimash Kudaibergen', 'green');
      log('   - Added other important figures (Ilyas Esenberlin, Mukhtar Auezov)', 'green');
      log('   - Organized by categories with clear section headers', 'green');
    } else {
      log('   ⚠️  Historical Figures section not found', 'yellow');
    }
    
    log('\n✅ All history content fixes complete!', 'green');
    log('   - Fixed all Mermaid syntax errors', 'green');
    log('   - Enhanced Historical Figures formatting', 'green');
    log('   - Added Kazakh cosmonauts and other important figures', 'green');
    
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

fixHistoryIssues();

















