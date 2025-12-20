#!/usr/bin/env node
/**
 * Final fixes for history content
 * - Fix independence-modern Mermaid
 * - Ensure all syntax errors are removed
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

async function finalFix() {
  try {
    log('\n🔍 Final fixes for history content...', 'cyan');
    
    const sectionsRef = db.collection('pages').doc('historyPage').collection('sections');
    
    // Fix independence-modern section
    const independenceDoc = await sectionsRef.doc('independence-modern').get();
    if (independenceDoc.exists) {
      const content = independenceDoc.data().contentMarkdown || '';
      const fixedMermaid = `\`\`\`mermaid
graph TD
    A[1986: Zheltoksan Protests] --> B[1991: Independence Dec 16]
    B --> C[1993: National Currency Tenge]
    C --> D[1997: Capital moves to Astana]
    D --> E[2017: EXPO 2017 Future Energy]
\`\`\``;
      
      const mermaidPattern = /```mermaid[\s\S]*?```/g;
      if (mermaidPattern.test(content)) {
        const updatedContent = content.replace(mermaidPattern, fixedMermaid);
        await independenceDoc.ref.update({
          contentMarkdown: updatedContent,
          updatedAt: Timestamp.now()
        });
        log('   ✅ Fixed independence-modern Mermaid diagram', 'green');
      }
    }
    
    // Remove any content blocks with syntax errors
    const allSections = await sectionsRef.get();
    for (const doc of allSections.docs) {
      const content = doc.data().contentMarkdown || '';
      
      // Remove any error messages or broken mermaid blocks
      if (content.includes('Syntax error') || 
          content.includes('mermaid version') ||
          content.includes('Error rendering')) {
        
        // Remove the entire problematic block
        let cleaned = content
          .replace(/```mermaid[\s\S]*?```/g, '')
          .replace(/Syntax error in text[\s\S]*?mermaid version[\s\S]*?\n/g, '')
          .replace(/Error rendering[\s\S]*?\n/g, '');
        
        await doc.ref.update({
          contentMarkdown: cleaned.trim(),
          updatedAt: Timestamp.now()
        });
        
        log(`   ✅ Cleaned syntax errors from: ${doc.id}`, 'green');
      }
    }
    
    log('\n✅ All final fixes complete!', 'green');
    
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

finalFix();















