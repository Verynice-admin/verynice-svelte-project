#!/usr/bin/env node
/**
 * Check all sections and fix any remaining Mermaid errors
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

// Fixed Mermaid diagrams
const fixedDiagrams = {
  'ancient-empires': `\`\`\`mermaid
graph TD
    A[800 BCE: Botai Culture] --> B[700 BCE: Rise of Saka]
    B --> C[530 BCE: Queen Tomyris defeats Cyrus]
    C --> D[400 BCE: Golden Man buried]
    D --> E[200 BCE: Rise of Huns]
\`\`\``,
  'independence-modern': `\`\`\`mermaid
graph TD
    A[1986: Zheltoksan Protests] --> B[1991: Independence Dec 16]
    B --> C[1993: National Currency Tenge]
    C --> D[1997: Capital moves to Astana]
    D --> E[2017: EXPO 2017 Future Energy]
\`\`\``
};

async function checkAndFix() {
  try {
    log('\n🔍 Checking all sections...', 'cyan');
    
    const sectionsRef = db.collection('pages').doc('historyPage').collection('sections');
    const sectionsSnapshot = await sectionsRef.orderBy('order', 'asc').get();
    
    log(`\n📋 Found ${sectionsSnapshot.size} sections:\n`, 'cyan');
    
    sectionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      log(`  ${doc.id}:`, 'blue');
      log(`    Title: ${data.title}`, 'yellow');
      log(`    SectionId: ${data.sectionId}`, 'yellow');
      log(`    Order: ${data.order}`, 'yellow');
    });
    
    // Fix remaining sections
    log('\n🔧 Fixing remaining Mermaid errors...', 'cyan');
    
    for (const doc of sectionsSnapshot.docs) {
      const data = doc.data();
      const sectionId = (data.sectionId || '').toLowerCase();
      const content = data.contentMarkdown || '';
      
      // Check if this section needs a Mermaid fix
      if (fixedDiagrams[sectionId] || fixedDiagrams[data.id]) {
        const diagramKey = fixedDiagrams[sectionId] || fixedDiagrams[data.id];
        const mermaidPattern = /```mermaid[\s\S]*?```/g;
        
        if (mermaidPattern.test(content)) {
          const updatedContent = content.replace(mermaidPattern, diagramKey);
          await doc.ref.update({
            contentMarkdown: updatedContent,
            updatedAt: Timestamp.now()
          });
          log(`   ✅ Fixed: ${doc.id}`, 'green');
        }
      }
      
      // Remove any broken Mermaid diagrams that cause syntax errors
      // Look for common error patterns
      if (content.includes('Syntax error') || content.includes('mermaid version')) {
        // Remove the problematic mermaid block
        const cleanedContent = content.replace(/```mermaid[\s\S]*?```/g, '');
        await doc.ref.update({
          contentMarkdown: cleanedContent,
          updatedAt: Timestamp.now()
        });
        log(`   ✅ Removed broken Mermaid from: ${doc.id}`, 'green');
      }
    }
    
    log('\n✅ All sections checked and fixed!', 'green');
    
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

checkAndFix();















