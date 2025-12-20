# KeyFacts Migration to Subcollection

## Overview

The KeyFacts data has been migrated from a field in the `historyPage` document to a dedicated `keyFacts` subcollection under `pages/historyPage/keyFacts`. This provides better scalability and easier management.

## What Changed

### 1. Server-Side (`src/routes/history/+page.server.ts`)
- ✅ Now loads `keyFacts` from subcollection: `pages/historyPage/keyFacts`
- ✅ Falls back to legacy field if subcollection is empty (backward compatible)
- ✅ Returns normalized array format: `[{id, label, value, order}]`

### 2. Client-Side (`src/routes/history/+page.svelte`)
- ✅ Updated to handle subcollection data format
- ✅ Simplified normalization logic
- ✅ Still shows fallback facts if no data exists

### 3. Scripts Created

#### `scripts/migrate-keyfacts-to-subcollection.js`
**Purpose**: Migrates existing `keyFacts` array from document field to subcollection

**Usage**:
```bash
node scripts/migrate-keyfacts-to-subcollection.js
```

**What it does**:
- Reads `keyFacts` array from `pages/historyPage` document
- Creates documents in `pages/historyPage/keyFacts` subcollection
- Preserves order using `order` field
- Does NOT delete the old field (you can do that manually in Firebase Console)

#### `scripts/seed-keyfacts.js`
**Purpose**: Populates the `keyFacts` subcollection with default data

**Usage**:
```bash
node scripts/seed-keyfacts.js
```

**What it does**:
- Creates/updates 10 default key facts in the subcollection
- Uses sanitized labels as document IDs
- Sets proper order for each fact

## Firebase Structure

### Before (Legacy)
```
pages/
  historyPage/
    keyFacts: [
      { label: "Timeline", value: "3500 BCE - Present" },
      ...
    ]
```

### After (New)
```
pages/
  historyPage/
    keyFacts/ (subcollection)
      timeline/
        label: "Timeline"
        value: "3500 BCE - Present"
        order: 0
      key-empires/
        label: "Key Empires"
        value: "Saka, Huns, Golden Horde"
        order: 1
      ...
```

## Default Key Facts

The seed script includes:
1. Timeline: 3500 BCE - Present
2. Key Empires: Saka, Huns, Golden Horde
3. Nation Founded: 1465 (Kazakh Khanate)
4. Independence: 1991
5. Legacy: Domestication of the Horse
6. Capital: Astana
7. Official language: Kazakh
8. Spaceport: Baikonur Cosmodrome (world's first)
9. First human spaceflight: Yuri Gagarin (1961) from Baikonur
10. Land Area: 9th largest country in the world

## How to Use

### Option 1: Migrate Existing Data
If you already have `keyFacts` in the `historyPage` document:
```bash
node scripts/migrate-keyfacts-to-subcollection.js
```

### Option 2: Seed Fresh Data
To populate with default key facts:
```bash
node scripts/seed-keyfacts.js
```

### Option 3: Manual in Firebase Console
1. Go to Firebase Console → Firestore
2. Navigate to `pages > historyPage`
3. Click "Start collection" → Name it `keyFacts`
4. Add documents with fields:
   - `label` (string)
   - `value` (string)
   - `order` (number)

## Benefits of Subcollection Approach

1. **Scalability**: No document size limits
2. **Ordering**: Easy to reorder facts using `order` field
3. **Individual Updates**: Update one fact without touching others
4. **Querying**: Can query/filter facts if needed
5. **Consistency**: Matches the pattern used for `sections` subcollection

## Backward Compatibility

The code maintains backward compatibility:
- If subcollection exists → uses subcollection data
- If subcollection is empty but document field exists → uses document field
- If neither exists → shows fallback facts

This ensures the page works during migration and after.













