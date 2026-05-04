require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(require('fs').readFileSync('./.secrets/serviceAccountKey.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const newTips = [
  {
    id: 'best-time-to-visit',
    title: 'Best Time to Visit Kazakhstan',
    order: 1,
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

**Tip:** Avoid extreme seasons if you're not prepared—weather can change fast. Always check forecasts before heading to mountains or remote areas.`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Kazakhstan has extreme continental weather: scorching summers and freezing winters.',
    imagePublicId: '',
    icon: 'calendar'
  },
  {
    id: 'visa-entry-requirements',
    title: 'Visa & Entry Requirements',
    order: 2,
    contentMarkdown: `Most travelers enjoy visa-free entry to Kazakhstan.

## Visa-Free Access
- Citizens of many countries (US, EU, UK, Australia, Canada, and more) can stay **visa-free for up to 30 days** (some up to 90 days in a 180-day period)
- Check your country's specific requirements before traveling

## Electronic Travel Authorization (ETA)
- A new **ETA via the QazETA app** is recommended
- Currently in pilot phase (2026); may become mandatory later
- Apply at least **72 hours before arrival** if your country qualifies

## Entry Requirements
- Passport must be valid for at least **3-6 months** beyond your stay
- No yellow fever vaccine required unless coming from a risk country
- Register automatically on arrival at major airports
- For longer stays or certain entries, register migration details
- New rules from July 2026 may apply—check official sites

## Extensions & Other Visas
- For extensions or other visa types, use official Kazakh MFA sources

**Official Resources:**
- Ministry of Foreign Affairs Kazakhstan
- QazETA application portal`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Most travelers enjoy visa-free entry. Check requirements for your country.',
    imagePublicId: '',
    icon: 'passport'
  },
  {
    id: 'safety-general-precautions',
    title: 'Safety & General Precautions',
    order: 3,
    contentMarkdown: `Kazakhstan is generally safe — **Level 1 "Exercise Normal Precautions"** from major governments (US, UK, Canada, Australia).

## Petty Crime
- Pickpocketing and bag snatching happens in crowded spots
- Markets, public transport, tourist areas in Almaty/Astana are common targets
- **Keep valuables secure**, avoid flashing cash or jewelry

## Violent Crime
- Rare but can occur at night in bars/clubs or expat areas
- Stick to well-lit streets
- Use ride-hailing apps (Yandex Go, inDriver)

## Other Precautions
- **Terrorism risk** is low but exists regionally—stay aware
- **Roads can be poor**—potholes, bad signage, aggressive driving
- Avoid night driving; always use seatbelts
- Drink **bottled water**; tap is usually okay in cities but boil/filter in rural areas

## Health
- Standard vaccinations (MMR, etc.) recommended
- No major outbreaks reported recently
- Enroll in programs like **STEP** (for US citizens) for safety alerts

## Emergency Numbers
- Police: 102
- Ambulance: 103
- Fire: 101`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Kazakhstan is generally safe with Level 1 travel advisory. Exercise normal precautions.',
    imagePublicId: '',
    icon: 'shield'
  },
  {
    id: 'getting-there-around',
    title: 'Getting There & Around',
    order: 4,
    contentMarkdown: `## Flights
- **Fly into Almaty (ALA)** or **Astana (NQZ)**
- Almaty is more international and scenic
- Major airlines: Air Astana, FlyArystan, SCAT, Qatar Airways, Turkish Airlines

## Domestic Travel

### Trains (Kazakhstan Temir Zholy / KTZ)
- Comfortable for long distances
- Almaty–Astana: ~12–20 hours overnight
- Book via [tickets.kz](https://tickets.kz)

### Domestic Flights
- Cheap and fast
- Air Astana, FlyArystan
- Almaty–Astana: ~1.5 hours
- Almaty–Shymkent: ~1 hour

### Buses & Marshrutkas
- Affordable but slower and crowded
- Good for shorter routes

## In Cities

### Almaty
- Walkable center + metro (clean, efficient)
- Buses/trolleybuses: Use **ONAY card** or app for payment
- **Yandex Go** or **inDriver** for taxis (cheaper/safer than street taxis)

### Astana
- Extensive bus network
- Ride-hailing dominant (Yandex Go, inDriver)

## Essential Apps
- **Yandex Go** — ride-hailing
- **2GIS** — maps + transport
- **Kaspi.kz** — local payments/banking
- **inDriver** — cheaper alternative taxi

## Renting a Car
- Possible but challenging
- International driving permit recommended
- Note: Some areas have right-hand drive vehicles
- Rural roads can be poor—avoid if unfamiliar`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Fly into Almaty or Astana. Domestic trains, flights, and ride-hailing apps available.',
    imagePublicId: '',
    icon: 'plane'
  },
  {
    id: 'airport-taxi-guide',
    title: 'How to Order a Taxi from Kazakhstan Airports',
    order: 5,
    contentMarkdown: `Airport arrivals are full of **unofficial drivers** approaching you aggressively inside/outside the terminal—**ignore them completely** to avoid scams.

## Why Use Apps?
- They quote low initially then demand much more
- Some will stop midway and demand more money
- **Apps provide fixed prices, tracking, and safety**

## Real Fares
- To city center from major airports: **2,000–5,000 KZT** (~$4–10 USD)
- Rates similar across Almaty, Astana, and Shymkent airports
- Apps show exact estimates upfront

## Popular Apps (Download Before Arrival)

### Yandex Go (Most Recommended)
- #1 ride-hailing app in Kazakhstan
- Fixed prices, multiple car classes (Economy, Comfort, etc.)
- Cash or card payment
- English interface available
- Works great for airport pickups

**How to use:**
1. Download before landing (may need to change App Store/Google Play region to Kazakhstan)
2. Open app → Set pickup as "Almaty Airport" or "Astana Airport" (or your arrival airport)
3. Enter destination → Choose ride → Pay cash/card
4. Wait inside arrivals until driver arrives

### inDrive (Great Alternative)
- Second most popular
- Lets you **suggest/negotiate fare**
- Cash preferred
- Good for intercity rides too

### Other Options
- **Uber KZ** — exists but less common
- **Blue Sky Taxi** — electric/eco option (less widespread)
- **Official airport taxi counters** — pricier than apps (use as last resort)

## Pro Tips for Airport Arrival

1. **Buy a local SIM** (Beeline, Tele2, Activ) at airport kiosks
   - Cheap data: ~1,000–3,000 KZT
   - Essential for apps if international roaming is spotty

2. **Use airport free Wi-Fi** to download/order if needed

3. **Order while still inside** arrivals to avoid hassle outside

4. **Late-night arrivals:** Apps are 24/7 and safer than street taxis

These apps make arrivals smooth and budget-friendly—thousands of travelers swear by them over street taxis!`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Ignore unofficial drivers. Use Yandex Go or inDriver for safe, fixed-price airport transfers.',
    imagePublicId: '',
    icon: 'taxi'
  },
  {
    id: 'money-costs-tips',
    title: 'Money, Costs & Practical Tips',
    order: 6,
    contentMarkdown: `## Currency
- **Kazakhstani Tenge (KZT)**
- Exchange at banks or airports (avoid street changers)
- ATMs everywhere in cities

## Cards
- **Visa and Mastercard** widely accepted in cities
- Cash still needed for rural spots and markets

## Budget Estimates

| Category | Budget | Mid-Range |
|----------|--------|-----------|
| Meal | 1,000–2,000 KZT | 2,000–5,000 KZT |
| Hostel | 5,000–10,000 KZT | 10,000–30,000 KZT |
| Hotel | 15,000–30,000 KZT | 30,000–80,000 KZT |
| Domestic flight | 15,000–25,000 KZT | 20,000–40,000 KZT |
| Taxi (city) | 500–1,500 KZT | 1,500–3,000 KZT |

## SIM Cards
- Buy at airport or convenience stores
- Providers: **Beeline, Tele2, Activ**
- Cheap data: ~1,000–3,000 KZT for good plans

## Language
- **Russian** dominant in cities
- **Kazakh** is official language
- **English** limited outside tourist spots
- Download **Google Translate** with offline Russian packs

## Tipping
- Not mandatory but appreciated
- 5–10% in restaurants
- Round up for taxi drivers

## Cultural Tips
- **Hospitable people**—try beshbarmak, horse meat (if adventurous), or plov
- **Respect mosques**—cover shoulders and knees
- **Remove shoes** when entering homes

## Sustainability
- Use reusable water bottles
- Support eco-tours for lakes and canyons
- Don't leave trash in nature areas`,
    contentHTML: '',
    contentFormat: 'markdown',
    excerpt: 'Kazakhstan is affordable. Budget 2,000-5,000 KZT for meals, 10,000-30,000 KZT for hotels.',
    imagePublicId: '',
    icon: 'wallet'
  }
];

async function addTravelTips() {
  const tipsRef = db.collection('pages').doc('travelTipsPage').collection('tips');
  
  console.log('Adding new travel tips...');
  
  // First, clear existing tips
  const existingSnap = await tipsRef.get();
  console.log(`Found ${existingSnap.size} existing tips`);
  
  const batch = db.batch();
  for (const doc of existingSnap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
  console.log('Cleared existing tips');
  
  // Add new tips
  for (const tip of newTips) {
    const docRef = tipsRef.doc(tip.id);
    await docRef.set(tip);
    console.log(`Added: ${tip.title}`);
  }
  
  console.log(`\nDone! Added ${newTips.length} travel tips.`);
}

addTravelTips()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
