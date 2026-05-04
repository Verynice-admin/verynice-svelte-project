require('dotenv').config();
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const cwd = process.cwd();

function loadServiceAccount() {
  const c = [path.resolve(cwd, '.secrets/serviceAccountKey.json'), path.resolve(cwd, '.secrets/service-account.json')];
  for (const x of c) {
    try {
      if (fs.existsSync(x)) {
        const d = JSON.parse(fs.readFileSync(x, 'utf8'));
        if (typeof d.private_key === 'string' && d.private_key.includes('\\n')) d.private_key = d.private_key.replace(/\\n/g, '\n');
        return d;
      }
    } catch (e) {}
  }
  return null;
}

const sa = loadServiceAccount();
if (!getApps().length) initializeApp({ credential: cert(sa), projectId: 'verynice-kz' });
const db = getFirestore();

const newSections = [
  {
    id: 'zheti-ata',
    order: 6,
    title: 'Zheti Ata — Seven Generations',
    description: 'Honoring and knowing seven generations of paternal ancestors — a cornerstone of Kazakh identity.',
    imagePublicId: 'home/content/pages/heritage/traditionsCustoms/ZhetiAta',
    contentMarkdown: `**Zheti Ata** (Жеті ата — "seven ancestors") is one of the most important traditions in Kazakh culture. This practice involves knowing and honoring seven generations of paternal ancestors, tracing lineage back through the family tree.

**Why Seven Generations?**

In Kazakh tradition, knowing your **Zheti Ata** is essential for:
- **Identity** — Your ancestors define who you are
- **Marriage rules** — You cannot marry someone from your seven generations
- **Respect** — Honor those who came before you
- **Blessings** — Elders' blessings carry weight based on ancestral connection

**The Practice**

Kazakhs memorize their ancestry through:
1. **Reciting names** — Fathers, grandfathers, great-grandfathers, and beyond
2. **Family stories** — Tales of notable ancestors
3. **Memorials** — Visiting burial sites of ancestors
4. **Name-giving** — Children often named after deceased ancestors

**Modern Significance**

While genealogical records may be lost, the tradition continues. Many Kazakhs can still recite their seven generations, and this knowledge is passed to children. The concept reinforces community bonds and provides a sense of historical continuity.`
  },
  {
    id: 'shashu',
    order: 7,
    title: 'Shashu — Sweet Rain Celebration',
    description: 'The joyful tradition of showering guests with sweets and treats for good fortune.',
    imagePublicId: 'home/content/pages/heritage/traditionsCustoms/shashu',
    contentMarkdown: `**Shashu** (Шашу) is a delightful Kazakh tradition where guests are showered with sweets, candies, coins, or small treats during celebrations. This custom brings joy and symbolizes good luck, prosperity, and blessings for the recipient.

**When to Perform Shashu**

Shashu is performed at:
- **Weddings** — Thrown over the couple for marital happiness
- **Birth celebrations** — For the newborn's future prosperity
- **Birthdays** — Especially for children
- **Coming-of-age ceremonies** — For adult life blessings
- **Home celebrations** — For honored guests

**The Ceremony**

1. **Preparation** — The host prepares sweets, candies, and sometimes coins
2. **The throwing** — The guest or celebrant stands while others throw treats over them
3. **Catching** — Guests try to catch the treats in their scarves or hands
4. **Eating** — The treats are shared, especially with children

**Symbolism**

- **Sweetness** — A sweet life ahead
- **Abundance** — Material prosperity
- **Joy** — Happiness and celebration
- **Sharing** — Community and togetherness

**Modern Practice**

Shashu remains popular at Kazakh celebrations, often accompanied by music and dancing. Children especially love this tradition, as they collect and eat the sweets!`
  },
  {
    id: 'nauryz',
    order: 8,
    title: 'Nauryz — Spring New Year',
    description: 'The ancient celebration of spring equinox marking renewal, nature awakening, and new beginnings.',
    imagePublicId: 'home/content/pages/heritage/traditionsCustoms/NauryzSpringNewYear',
    contentMarkdown: `**Nauryz** (Наурыз), meaning "new day," is one of the oldest and most beloved holidays in Kazakhstan. Celebrated on or around March 21st (the spring equinox), it marks the beginning of spring and the New Year in the Kazakh calendar.

**Historical Significance**

Nauryz predates Islam and Christianity, rooted in ancient Turkic and Zoroastrian traditions celebrating nature's renewal. Despite centuries of religious change, this tradition has endured.

**Traditional Celebrations**

**Nauryz Kunan** (Наурыз күні) — The day itself:
- **Nauryz Koje** — Visiting elders first to receive blessings
- **Nauryz Sole** — Family gatherings with special foods
- **National games** — Traditional sports competitions

**Nauryz Customs**

- **Cleaning** — Thorough house cleaning before the holiday
- **New clothes** — Wearing new outfits for the new year
- **Forgiveness** — Asking for forgiveness for past wrongs
- **Feasting** — Preparing traditional dishes

**Traditional Foods**

- **Nauryz Koje** — Seven dishes representing abundance
- **Sumalak** — Sprouted wheat pudding (especially for women)
- **Beshbarmak** — Traditional meat dish
- **Baursak** — Fried dough balls

**Modern Nauryz**

Today, Nauryz is a national holiday with:
- Street celebrations
- Cultural performances
- Traditional games and sports
- Family feasts

This celebration connects modern Kazakhs to their ancient roots while embracing new beginnings.`
  },
  {
    id: 'national-games',
    order: 9,
    title: 'National Games — Kokpar & Audaryspak',
    description: 'Traditional horse games and athletic competitions that test courage, skill, and heritage.',
    imagePublicId: 'home/content/pages/heritage/traditionsCustoms/NationalGames',
    contentMarkdown: `Kazakh national games reflect the nomadic heritage and remain vibrant traditions celebrated at festivals and competitions throughout Kazakhstan.

**Kokpar (Көкпар)**

The most iconic Kazakh sport — a fierce horseback game where two teams compete for possession of a headless goat carcass.

**The Game:**
- Teams of 5-15 riders
- Goal: Carry the goat to the opponent's goal
- No rules limiting physical contact
- Requires exceptional horsemanship

**Origins:**
- Developed from hunting skills
- Symbolizes struggle for resources
- Celebrates bravery and riding prowess

**Audaryspak (Аударыспақ)**

Wrestling on horseback — two riders attempt to unseat each other.

**The Rules:**
- Both riders hold each other
- Winner throws opponent to ground
- Requires strength and balance

**Other Traditional Games**

- **Koksu (Kok buru)** — Horse archery
- **Tyiyn emgiw** — Picking up coins from the ground while riding
- **Sanda** — Traditional wrestling
- **Grebnev** — Arm wrestling

**Festivals**

National games are featured at:
- **Nauryz** celebrations
- **Kazakhstan Day** festivities
- Regional cultural festivals
- Rural celebrations

These games preserve Kazakh identity and nomadic heritage, passing traditional skills to new generations.`
  },
  {
    id: 'greeting-etiquette',
    order: 10,
    title: 'Greeting Etiquette — Respect in Motion',
    description: 'The formal customs of greeting that reflect Kazakh values of respect and hospitality.',
    imagePublicId: 'home/content/pages/heritage/traditionsCustoms/GreetingEtiquette',
    contentMarkdown: `Kazakh greetings carry deep cultural significance, reflecting values of respect, age hierarchy, and hospitality.

**Formal Greetings**

**Handshakes:**
- **Between men** — Firm handshake, often with both hands
- **Elders** — Younger person greets first, often with slight bow
- **Women and men** — Often no handshake; a nod or slight curtsy
- **Close friends** — May embrace with hugs

**The "Sadek" Greeting**

The most respectful greeting involves:
1. Right hand over heart
2. Slight bow
3. Verbal greeting in Kazakh

**Age Hierarchy**

Kazakh greetings always consider age:
- **Elders first** — They are greeted and served first
- **Titles respected** — Use "Aka" (older brother), "Apa" (older sister), "Aksakal" (white-bearded elder)
- **Position acknowledged** — Social status influences greeting formality

**Hospitality Greetings**

**"Kosh keldiñiz!"** — "Welcome!" — Used when guests arrive
- Host rises to greet
- Guest offered best seat
- Tea served immediately

**Regional Variations**

Different regions may have unique greeting customs, but the core values remain: respect for age, hospitality, and community.

**Modern Practice**

While younger generations may use more casual greetings, the traditional forms are still used with elders and in formal settings.`
  }
];

(async () => {
  for (const section of newSections) {
    await db.doc(`pages/heritage/articles/traditions-customs/sections/${section.id}`).set(section);
    console.log('Added section:', section.id, '-', section.title);
  }
  console.log(`Done adding ${newSections.length} new sections!`);
  process.exit(0);
})();
