require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(require('fs').readFileSync('./.secrets/serviceAccountKey.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const newGeneralTips = [
  {
    id: 'best-time-to-visit',
    title: 'Best Time to Visit Kazakhstan',
    contentMarkdown: `Kazakhstan has extreme continental weather: scorching summers and freezing winters.

## Ideal Periods: Spring & Autumn
- **Spring (April–May/June)** or **Autumn (September–October)**
- Mild temperatures (10–25°C)
- Blooming landscapes in spring, fall colors in autumn
- Fewer crowds, easier access to mountains/parks

## Summer (June–August)
- Great for hiking, lakes, and festivals
- Hot temperatures (up to 30–40°C in lowlands/steppes)
- Peak season for tourism

## Winter (December–February)
- Snowy and cold (down to -20°C or lower in Astana)
- Perfect for skiing in Shymbulak (near Almaty)
- Ice festivals available
- Many remote areas are inaccessible

**Tip:** Avoid extreme seasons if you're not prepared—weather can change fast.`,
    excerpt: 'Kazakhstan has extreme continental weather: scorching summers and freezing winters.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 1
  },
  {
    id: 'visa-entry-requirements',
    title: 'Visa & Entry Requirements',
    contentMarkdown: `Most travelers enjoy visa-free entry to Kazakhstan.

## Visa-Free Access
- Citizens of many countries (US, EU, UK, Australia, Canada) can stay **visa-free for up to 30 days** (some up to 90 days in a 180-day period)

## Electronic Travel Authorization (ETA)
- **QazETA app** is recommended
- Currently in pilot phase (2026); may become mandatory later
- Apply at least **72 hours before arrival** if your country qualifies

## Entry Requirements
- Passport must be valid for at least **3-6 months** beyond your stay
- Register automatically on arrival at major airports
- Check official Kazakh MFA sources for extensions`,
    excerpt: 'Most travelers enjoy visa-free entry. Check requirements for your country.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 2
  },
  {
    id: 'safety-general-precautions',
    title: 'Safety & General Precautions',
    contentMarkdown: `Kazakhstan is generally safe — **Level 1 "Exercise Normal Precautions"** from major governments.

## Petty Crime
- Pickpocketing happens in crowded markets and tourist areas
- Keep valuables secure, avoid flashing cash or jewelry

## Health & Roads
- Drink bottled water; tap is okay in cities
- Roads can be poor—avoid night driving, use seatbelts

## Emergency Numbers
- Police: 102
- Ambulance: 103
- Fire: 101`,
    excerpt: 'Kazakhstan is generally safe with Level 1 travel advisory.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 3
  },
  {
    id: 'getting-there-around',
    title: 'Getting There & Around',
    contentMarkdown: `## Flights
- **Fly into Almaty (ALA)** or **Astana (NQZ)**
- Almaty is more international and scenic

## Domestic Travel
- **Trains (KTZ)**: Almaty–Astana ~12-20 hours overnight, book via tickets.kz
- **Flights**: Air Astana, FlyArystan — cheap and fast (1.5 hours Almaty-Astana)
- **Buses/Marshrutkas**: Affordable but slower

## In Cities
- **Almaty**: Metro, buses, Yandex Go or inDriver for taxis
- **Astana**: Extensive buses, ride-hailing dominant

## Essential Apps
- **Yandex Go** — ride-hailing
- **2GIS** — maps + transport
- **Kaspi.kz** — local payments`,
    excerpt: 'Fly into Almaty or Astana. Use Yandex Go for taxis.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 4
  },
  {
    id: 'airport-taxi-guide',
    title: 'How to Order a Taxi from Almaty Airport',
    contentMarkdown: `Ignore unofficial drivers to avoid scams—use apps for fixed prices.

## Real Fares
- To city center: **2,000–4,000 KZT** (~$4–8 USD)
- Apps show exact estimates upfront

## Best Apps

### Yandex Go (Recommended)
- Fixed prices, multiple car classes
- Cash or card payment
- English interface

### inDrive (Alternative)
- Lets you negotiate fare
- Cash preferred

## Pro Tips
1. **Buy local SIM** at airport (~1,000–3,000 KZT)
2. Download apps before arrival
3. Order while inside arrivals to avoid hassle`,
    excerpt: 'Use Yandex Go or inDriver for safe airport transfers.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 5
  },
  {
    id: 'money-costs-tips',
    title: 'Money, Costs & Practical Tips',
    contentMarkdown: `## Currency
- **Kazakhstani Tenge (KZT)**
- Exchange at banks/airports, ATMs everywhere

## Budget
- Meals: 1,000–5,000 KZT
- Hostels: 5,000–30,000 KZT/night
- Domestic flights: 15,000–40,000 KZT

## SIM Cards
- Providers: Beeline, Tele2, Activ
- ~1,000–3,000 KZT for data plans

## Language & Tipping
- Russian dominant; English limited outside tourist spots
- Tipping 5-10% appreciated in restaurants

## Cultural Tips
- Try beshbarmak, horse meat (if adventurous)
- Respect mosques—cover shoulders/knees
- Remove shoes when entering homes`,
    excerpt: 'Kazakhstan is affordable. Budget 2,000-5,000 KZT for meals.',
    imagePublicId: '',
    region: 'General',
    tier: 1,
    order: 6
  }
];

async function addGeneralTips() {
  const tipsRef = db.collection('travelTips');
  
  console.log('Adding new general travel tips to travelTips collection...');
  
  for (const tip of newGeneralTips) {
    const docRef = tipsRef.doc(tip.id);
    await docRef.set(tip);
    console.log(`Added: ${tip.title} (region: ${tip.region})`);
  }
  
  console.log(`\nDone! Added ${newGeneralTips.length} general travel tips.`);
}

addGeneralTips()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
