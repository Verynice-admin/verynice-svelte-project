#!/usr/bin/env node
/**
 * Script to update the "Soviet Crucible" section in Firebase
 * Replaces the pie chart with meaningful content
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
      throw new Error('Firebase service account not found. Please place serviceAccountKey.json in .secrets/ or root directory.');
    }
    initializeApp({
      credential: cert(sa),
      projectId: sa.project_id
    });
  }
  return getFirestore();
}

// Initialize Firebase
let db;
try {
  db = initFirebase();
  log('✅ Firebase Admin initialized', 'green');
} catch (error) {
  log(`❌ Error initializing Firebase: ${error.message}`, 'red');
  process.exit(1);
}

// Updated content without the pie chart
const updatedContent = `**Tragedy & Transformation**

The 20th century was a forge of blood and iron. The Soviet era brought both catastrophic loss and rapid modernization—a paradox that shaped modern Kazakhstan.

### The Great Famine: Asharshylyk (1930–1933)

The forced collectivization campaign was not merely an economic policy; it was a systematic dismantling of nomadic civilization. Soviet authorities slaughtered **90% of livestock**—the nomad's lifeblood—transforming the steppe into a graveyard.

**The Human Cost:**
- **1.5 million dead**—nearly 40% of the ethnic Kazakh population perished
- Entire clans vanished, their oral histories lost forever
- Survivors were forced into collective farms, breaking millennia of nomadic tradition

### War and Industrial Resurrection

When Hitler's armies advanced, Kazakhstan became the industrial backbone of the Soviet Union. Factories evacuated from western Russia found new life in the steppe, producing bullets, machinery, and war matériel. The nation sent **1.2 million soldiers** to the front; half never returned.

**Heroes of the Great Patriotic War:**
- **Bauyrzhan Momyshuly**: Led Panfilov's Guards with guerrilla tactics now studied at West Point
- **Aliya Moldagulova**: Sniper with 91 confirmed kills, died at 18 storming a German position. Asteroid **3122 Aliya** bears her name.

### The Space Age Dawns

From the **Baikonur Cosmodrome** in the Kazakh steppe, humanity took its first steps into the cosmos. On April 12, 1961, Yuri Gagarin launched from this very ground, becoming the first human in space. Yet this achievement came at a cost: toxic rocket fuel polluted the Syr Darya, leaving environmental scars that persist today.

### The Nuclear Shadow

The **Semipalatinsk Polygon** became the site of 456 nuclear tests, poisoning 1.5 million people and causing generational birth defects. The poet **Olzhas Suleimenov's** *Nevada–Semipalatinsk* movement (1989) finally forced the testing site's closure, a testament to Kazakh resilience.

### The Price of Modernization

The Soviet era left Kazakhstan with a complex legacy: mass education and industrialization alongside environmental devastation and demographic trauma. The nation that emerged in 1991 carried both the scars of repression and the tools of progress—a duality that defines modern Kazakh identity.`;

async function updateSovietCrucibleSection() {
  try {
    log('\n🔍 Searching for "The Soviet Crucible" section...', 'cyan');
    
    // Try different possible document IDs
    const possibleIds = ['section-soviet-crucible', 'soviet-crucible', 'section-6'];
    let sectionRef = null;
    let sectionDoc = null;
    let foundId = null;

    for (const id of possibleIds) {
      sectionRef = db.collection('pages').doc('historyPage').collection('sections').doc(id);
      sectionDoc = await sectionRef.get();
      if (sectionDoc.exists) {
        foundId = id;
        break;
      }
    }

    if (!sectionDoc || !sectionDoc.exists) {
      log('❌ Section not found with common IDs. Listing all sections...', 'yellow');
      const sectionsSnapshot = await db.collection('pages').doc('historyPage').collection('sections').get();
      
      if (sectionsSnapshot.empty) {
        log('   No sections found in Firebase!', 'red');
        process.exit(1);
      }

      log('\n📋 Available sections:', 'cyan');
      sectionsSnapshot.forEach(doc => {
        const data = doc.data();
        const title = data.title || data.name || 'Untitled';
        log(`   - ${doc.id} (${title})`, 'blue');
      });
      
      // Try to find by title
      log('\n🔍 Searching by title "The Soviet Crucible"...', 'cyan');
      for (const doc of sectionsSnapshot.docs) {
        const data = doc.data();
        const title = (data.title || data.name || '').toLowerCase();
        if (title.includes('soviet') || title.includes('crucible')) {
          foundId = doc.id;
          sectionRef = doc.ref;
          sectionDoc = doc;
          log(`   ✅ Found section: ${doc.id}`, 'green');
          break;
        }
      }

      if (!foundId) {
        log('\n❌ Could not find "The Soviet Crucible" section.', 'red');
        log('   Please check the section ID in Firebase and update the script.', 'yellow');
        process.exit(1);
      }
    }

    log(`\n📝 Updating section: ${foundId}`, 'cyan');
    
    // Update the content
    await sectionRef.update({
      contentMarkdown: updatedContent,
      contentFormat: 'markdown',
      updatedAt: Timestamp.now()
    });

    log('\n✅ Successfully updated "The Soviet Crucible" section!', 'green');
    log('   - Removed the pie chart diagram', 'green');
    log('   - Added meaningful content about:', 'green');
    log('     • The Great Famine (Asharshylyk)', 'green');
    log('     • WWII heroes (Bauyrzhan Momyshuly, Aliya Moldagulova)', 'green');
    log('     • Baikonur Cosmodrome and space age', 'green');
    log('     • Semipalatinsk nuclear testing', 'green');
    log('     • The complex legacy of modernization', 'green');
    
  } catch (error) {
    log(`\n❌ Error updating section: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the update
updateSovietCrucibleSection();

