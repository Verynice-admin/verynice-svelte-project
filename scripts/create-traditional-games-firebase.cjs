require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('.secrets/serviceAccountKey.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Cloudinary image base URL
const CLOUDINARY_BASE = 'https://res.cloudinary.com/verynice/image/upload/v1773142093';

// Map of Cloudinary public IDs to sections
const cloudinaryImages = {
    'content/pages/heritage/traditionalGames/altybakan': 'altybakan',
    'content/pages/heritage/traditionalGames/arqanTartys': 'arqanTartys',
    'content/pages/heritage/traditionalGames/assykAtu': 'assykAtu',
    'content/pages/heritage/traditionalGames/audaryspak': 'audaryspak',
    'content/pages/heritage/traditionalGames/baigeAlamanBaige': 'baigeAlamanBaige',
    'content/pages/heritage/traditionalGames/besTas': 'besTas',
    'content/pages/heritage/traditionalGames/bürkütSalu': 'bürkütSalu',
    'content/pages/heritage/traditionalGames/erEnish': 'erEnish',
    'content/pages/heritage/traditionalGames/kazakshaKures': 'kazakshaKures',
    'content/pages/heritage/traditionalGames/kokpar': 'kokpar',
    'content/pages/heritage/traditionalGames/kyzKuu': 'kyzKuu',
    'content/pages/heritage/traditionalGames/teńgeIluKumealu': 'teńgeIluKumealu',
    'content/pages/heritage/traditionalGames/togyzkumalak': 'togyzkumalak'
};

// Content data with proper Cloudinary image links
const pageData = {
    seo: {
        title: 'Traditional Games & Sports | Heritage | VeryNice',
        description: 'Discover Kokpar, Audaryspak, Kyz Kuu and other ancient Kazakh games that test strength, skill, and courage.'
    },
    mainTitle: 'Traditional Games & Sports',
    headerDescription: 'From the thrilling Kokpar to the playful Kyz Kuu — experience the ancient sports that forged the Kazakh warrior spirit and continue to captivate audiences today.',
    heroKicker: 'Warrior Traditions',
    location: 'Kazakhstan',
    articleViews: 0,
    articleLikes: 0,
    articleComments: 0,
    breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Heritage', href: '/culture' },
        { label: 'Traditional Games' }
    ],
    headerBackgroundPublicId: 'content/pages/heritage/traditionalGames/baigeAlamanBaige'
};

const sectionsData = [
    {
        id: 'kokpar',
        order: 1,
        title: 'Kokpar (Buzkashi) — The Sport of Warriors',
        description: 'The most thrilling Kazakh sport involving hundreds of riders competing for a goat carcass.',
        imagePublicId: 'content/pages/heritage/traditionalGames/kokpar',
        contentMarkdown: `**Kokpar** (also known as Buzkashi in other Central Asian countries) stands as the most intense and thrilling of all Kazakh traditional sports. This ancient game, dating back to the time of Genghis Khan, tests horsemanship, strength, and tactical thinking like no other.

**The Game** — Hundreds of riders (dzhigits) compete to carry a goat carcass (now typically a weighted dummy) into the opponent's goal. There are no teams — every rider for themselves — creating a chaotic spectacle of colliding horses, flying dust, and incredible athleticism.

**Skills Required** — Success in Kokpar demands:
- Exceptional horsemanship to control the mount amid chaos
- Immense upper body strength to wrestle the 30-40kg carcass from opponents
- Tactical awareness to anticipate moves and find openings
- Courage to ride into the melee where hundreds of horses collide

**Modern Kokpar** — While traditional Kokpar used a real goat carcass, modern versions often use a weighted dummy for animal welfare reasons. The sport remains central to celebrations like Nauryz and independence day, with tournaments attracting thousands of spectators.`
    },
    {
        id: 'audaryspak',
        order: 2,
        title: 'Audaryspak — Wrestling on Horseback',
        description: 'Two wrestlers on horseback attempt to pull each other from their mounts.',
        imagePublicId: 'content/pages/heritage/traditionalGames/audaryspak',
        contentMarkdown: `**Audaryspak** combines two ancient Kazakh skills — wrestling and horsemanship — into a spectacular test of strength and balance. Two riders face each other, each attempting to pull their opponent from their horse.

**Rules and Technique** — Wrestlers grip each other's shoulders, belts, or special jackets while their horses are held steady. On the signal, they attempt to use leverage, strength, and technique to unseat their opponent. Victory comes when one rider touches the ground with any body part.

**Training** — Successful Audaryspak competitors train both their wrestling skills and their ability to maintain balance on a moving, shifting platform. The horse's behavior adds an unpredictable element — experienced horses know to steady themselves when their rider is being pulled.`
    },
    {
        id: 'kyz-kuu',
        order: 3,
        title: 'Kyz Kuu — The Girl Chasing Game',
        description: 'A playful courtship game where a young man chases a young woman on horseback.',
        imagePublicId: 'content/pages/heritage/traditionalGames/kyzKuu',
        contentMarkdown: `**Kyz Kuu** (Girl Chasing) is perhaps the most beloved and photogenic of Kazakh traditional games. This playful sport combines romance, skill, and the beautiful backdrop of the open steppe.

**How It Works** — A young woman on horseback waits at the starting line, whip in hand. A young man on a faster horse begins some distance behind. On the signal, both gallop forward. The man must catch up and attempt to steal a kiss. If he succeeds, the roles reverse — she chases him back to the starting line, whipping him all the way.

**Cultural Significance** — Beyond entertainment, Kyz Kuu developed riding skills and provided a socially acceptable way for young people to interact. The game features prominently at weddings and festivals, often drawing laughter and cheers from crowds.`
    },
    {
        id: 'kazakh-kures',
        order: 4,
        title: 'Kazakh Kures — Traditional Wrestling',
        description: 'Traditional wrestling where opponents wear special jackets and attempt to throw each other.',
        imagePublicId: 'content/pages/heritage/traditionalGames/kazakshaKures',
        contentMarkdown: `**Kures** (Kazakh Wrestling) is one of the oldest sports in Central Asia, with origins dating back thousands of years. This traditional wrestling style is similar to judo and freestyle wrestling, but with unique Kazakh techniques and traditions.

**The Rules** — Competitors wear special thick jackets (zhaq) made of leather or strong fabric, which provide grip for throws. Unlike modern wrestling, opponents primarily attempt to throw each other onto their backs. Victory is achieved when a wrestler lands their opponent on their back with force.

**Techniques** — Kures involves various throws, trips, and holds:
- **Salamata** — Lifting and throwing the opponent
- **Otar** — Tripping from behind
- **Bürik** — Swinging the opponent
- **Küyren** — Pushing and shoving techniques

**Traditional Competitions** — Kures tournaments are held during Nauryz celebrations, wedding feasts, and national festivals. Champions earn great respect in their communities, with titles passed down through generations.`
    },
    {
        id: 'togyzkumalak',
        order: 5,
        title: 'Togyzkumalak — The Game of 41 Stones',
        description: 'A traditional board game testing strategy and mental calculation.',
        imagePublicId: 'content/pages/heritage/traditionalGames/togyzkumalak',
        contentMarkdown: `**Togyzkumalak** (Forty-One Stones) is the most popular traditional board game in Kazakhstan, played by two people. Like chess, it requires strategic thinking, but with unique mechanics that have fascinated Kazakhs for centuries.

**The Board** — The game is played on a board with two rows of 9 pits (kazan), plus two larger pits (kuy) at the ends. Each player controls their row and the kuy on their side. The game starts with 41 stones divided equally between players.

**Gameplay** — Players take turns moving their stones counterclockwise, sowing them into pits one by one. The goal is to collect stones in your kuy (larger pit). When a player's last stone lands in an empty pit on their side, they capture all stones in the opposite pit if that pit contains stones.

**Strategic Depth** — While seemingly simple, Togyzkumalak involves complex calculations. Players must anticipate several moves ahead, block opponents' captures, and create opportunities for their own. The game is passed down through families, with elders teaching children the intricacies of strategy.

**Cultural Significance** — Togyzkumalak is more than entertainment — it represents Kazakh values of wisdom, patience, and foresight. The game is often played during long winter nights and family gatherings.`
    },
    {
        id: 'assyk-atu',
        order: 6,
        title: 'Ashyk Aty — Bone Game of Champions',
        description: 'A traditional game where players throw bones to hit targets.',
        imagePublicId: 'content/pages/heritage/traditionalGames/assykAtu',
        contentMarkdown: `**Ashyk Aty** (also spelled Asyk Atu) is a traditional Kazakh game played with sheep ankle bones (ashyk). This game has been played for centuries and remains popular among both children and adults.

**The Equipment** — The game uses ashyk — sheep ankle bones that have been cleaned, polished, and sometimes decorated. Each bone has four sides: shee (heel), tömene (bottom), qyryq (narrow side), and qana (wide side).

**How to Play** — Players take turns throwing their ashyk at a target pile. The goal is to knock as many bones as possible out of the circle. Players score points based on which side of their ashyk lands facing up.

**Variations** — There are many regional variations of Ashyk Aty:
- **Ashyk Kuu** — Hitting the target bone directly
- **Ushqar** — Knocking bones out of a larger circle
- **Kyrgyz Ashygy** — Team competition

**Cultural Importance** — Ashyk making and playing is a recognized part of Kazakh cultural heritage. Master bone-carvers create beautiful ashyk sets, and annual tournaments are held throughout Kazakhstan.`
    },
    {
        id: 'er-enish',
        order: 7,
        title: 'Er Enish — Fight for the Sash',
        description: 'A test of strength where two contestants compete for a belt.',
        imagePublicId: 'content/pages/heritage/traditionalGames/erEnish',
        contentMarkdown: `**Er Enish** (Fight for the Sash) is a traditional test of strength that has been practiced in Kazakhstan for generations. The game involves two contestants competing to pull a sash or rope from their opponent's grip.

**How It Works** — Two contestants sit or kneel facing each other, each holding one end of a special sash (beldir). On the signal, they pull in opposite directions, attempting to force the other to release their grip or move from their position.

**Strength and Technique** — Success in Er Enish requires:
- Strong grip and arm muscles
- Core strength for stability
- Lower body positioning for leverage
- Mental endurance to outlast the opponent

**Traditional Context** — Er Enish was often held during festivals and celebrations as a way to determine the strongest young men in a community. Winners earned respect and sometimes favorable consideration for marriage.

**Modern Competitions** — Today, Er Enish is organized as a formal sport with weight categories, time limits, and standardized rules. It remains popular in rural areas where traditional games are celebrated.`
    },
    {
        id: 'altybakan',
        order: 8,
        title: 'Altybakan — The Six-Goal Game',
        description: 'A traditional team game similar to field hockey played with sticks and a ball.',
        imagePublicId: 'content/pages/heritage/traditionalGames/altybakan',
        contentMarkdown: `**Altybakan** (Six Goals) is a traditional Kazakh team sport that combines elements of field hockey and polo. The name translates to "six goals," referring to the scoring system in this fast-paced game.

**The Game** — Teams of players on horseback (traditionally) or on foot compete to score goals by hitting a ball into the opponent's goal using curved sticks (kalpak). The field typically has six goals — three on each side.

**Equipment** — Players use wooden sticks with curved heads, similar to field hockey sticks but adapted for horseback play. The ball was traditionally made of wood or leather, today often modern materials.

**Historical Context** — Altybakan developed among Kazakh nomads as a way to maintain riding skills during the winter months when herding activities decreased. It was particularly popular in the steppes of Central Kazakhstan.

**Modern Version** — Today, Altybakan is played primarily on foot with standardized rules. Tournaments are held at regional and national levels, keeping this traditional sport alive for new generations.`
    },
    {
        id: 'bese-tas',
        order: 9,
        title: 'Bese Tas — Five Stones',
        description: 'A dexterity game played with five small stones or pebbles.',
        imagePublicId: 'content/pages/heritage/traditionalGames/besTas',
        contentMarkdown: `**Bese Tas** (Five Stones) is a traditional dexterity game played primarily by women and children in Kazakhstan. This game develops hand-eye coordination and has been played for generations.

**The Stones** — Players use five small stones, traditionally sheep or goat bones or specially selected pebbles. The stones should be roughly uniform in size, easy to grip and toss.

**Gameplay** — The player tosses one stone into the air while grabbing others from the ground, then catches the falling stone. The game has multiple levels of increasing difficulty:

1. **Tosbash** — Pick up one stone while catching the thrown one
2. **Eki tosbash** — Pick up two stones at once
3. **Üsh tosbash** — Pick up three stones
4. **Tört tosbash** — Pick up four stones

**Cultural Significance** — Bese Tas was traditionally played by girls and young women, often during long winter evenings or while watching livestock. It developed dexterity and was considered preparation for needlework and other crafts.

**Modern Times** — While less common today, Bese Tas is still played in rural areas and has been preserved as part of Kazakhstan's intangible cultural heritage.`
    },
    {
        id: 'buerkuet-salu',
        order: 10,
        title: 'Bürküt Salu — Eagle Raising',
        description: 'The art of training and raising golden eagles for hunting.',
        imagePublicId: 'content/pages/heritage/traditionalGames/bürkütSalu',
        contentMarkdown: `**Bürküt Salu** (Eagle Raising) is an ancient tradition in Kazakhstan, particularly in the Altai and eastern regions. Kazakh eagle hunters (berkutchi) have maintained this tradition for centuries, training golden eagles to hunt alongside them.

**Selecting an Eagle** — Eagle hunters traditionally select young eagles from nests in the mountains. Female eagles are preferred as they are larger, stronger, and more aggressive than males.

**Training Process** — Training an eagle takes 3-4 years:
- **First Year** — The eagle bonds with its human keeper, becoming tame
- **Second Year** — The eagle learns to fly to the handler's glove on command
- **Third Year** — The eagle practices hunting with lure and dummy prey
- **Fourth Year** — The eagle hunts wild prey under supervision

**The Hunt** — Mounted on horses, berkutchi release their eagles to spot and pursue prey including foxes, hares, and marmots. The eagle's powerful talons kill quickly, and the hunter must arrive to claim the catch and reward the bird.

**Cultural Significance** — Eagle hunting embodies the Kazakh values of patience, partnership with nature, and respect for animals. The tradition continues today, with annual festivals celebrating Kazakhstan's unique heritage.`
    },
    {
        id: 'arqan-tartys',
        order: 11,
        title: 'Arqan Tartys — Tug-of-War',
        description: 'A test of team strength where two groups pull on a rope.',
        imagePublicId: 'content/pages/heritage/traditionalGames/arqanTartys',
        contentMarkdown: `**Arqan Tartys** (Tug-of-War) is one of the simplest yet most exciting traditional Kazakh games. Two teams compete in a test of pure strength, pulling on opposite ends of a rope to drag the opposing team across a marked line.

**The Rules** — Teams line up on opposite sides of a strong rope, often made of woven wool or leather. The rope may have a marker in the center. On the signal, both teams pull, attempting to drag the opposing team past the center line.

**Team Strategy** — Success requires:
- Maximum number of participants
- Strongest members positioned at the front and back
- Coordinated pulling technique
- Team morale and unity

**Traditional Context** — Arqan Tartys was held at community gatherings, weddings, and festivals. It built community spirit and allowed young men to demonstrate their strength.

**Modern Competitions** — Today, Arqan Tartys is organized as a formal sport with weight categories, standard ropes, and specific rules. It remains popular at national festivals and is included in traditional sports competitions.`
    },
    {
        id: 'baige',
        order: 12,
        title: 'Baige — Traditional Horse Racing',
        description: 'Long-distance horse races testing endurance across the open steppe.',
        imagePublicId: 'content/pages/heritage/traditionalGames/baigeAlamanBaige',
        contentMarkdown: `**Baige** (Horse Racing) is one of the most important traditional Kazakh sports, dating back centuries to the nomadic way of life. These long-distance races test the endurance of both horse and rider across the harsh Kazakh steppe.

**Race Distances** — Traditional Baige races cover extraordinary distances:
- **Junior races** — 10-15 kilometers for young horses (2-3 year olds)
- **Adult races** — 20-30 kilometers for experienced horses
- **Championship races** — Up to 50 kilometers for the toughest mounts

**The Riders** — Unlike Western racing where professional jockeys ride, Baige traditionally features young boy riders (jockeys) who ride bareback. These boys, often between 7-13 years old, must have excellent balance and riding skills.

**The Horses** — Kazakh horses are legendary for their endurance. Bred for centuries to survive the harsh steppe climate, they can travel great distances without rest. The best racing horses are prized possessions, with lineages carefully maintained.

**Cultural Significance** — Baige is central to Kazakh celebrations, particularly Nauryz and the Kazakh Derby. Winners receive substantial prizes, and a successful racehorse can bring great honor to its owner.`
    },
    {
        id: 'tenge-alu',
        order: 13,
        title: 'Tenge Alu — Picking Up Coins',
        description: 'A mounted skill game where riders pick up coins from the ground at full gallop.',
        imagePublicId: 'content/pages/heritage/traditionalGames/teńgeIluKumealu',
        contentMarkdown: `**Tenge Alu** (Picking Up Coins) is a spectacular traditional Kazakh game that tests the riding skills of horsemen at full gallop. Riders compete to collect coins or small objects from the ground without dismounting.

**The Challenge** — Coins or small metal objects are placed on the ground in a designated area. Riders gallop past at full speed, leaning down from their horses to scoop up the objects while maintaining control of their mount.

**Skills Required** — Mastery of Tenge Alu demands:
- Perfect balance in the saddle at high speeds
- Quick reflexes and hand-eye coordination
- Strong leg grip to stay mounted while leaning
- Trust between horse and rider

**Variations** — The game has several difficulty levels:
- **Simple** — Pick up coins from a slow walk
- **Intermediate** — Collect coins while trotting
- **Advanced** — Gather multiple coins at full gallop
- **Championship** — Pick up increasingly valuable objects

**Historical Context** — Tenge Alu developed from practical skills needed in nomadic life, such as retrieving dropped items or catching loose livestock. It became a popular competitive sport over time.

**Modern Competitions** — Today, Tenge Alu is featured in traditional sports festivals, with standardized rules ensuring safety while preserving the skill and excitement of this ancient game.`
    }
];

async function uploadToFirebase() {
    const output = [];
    output.push('=== Creating Traditional Games content in Firebase ===');

    const pageRef = db.collection('pages').doc('heritage').collection('articles').doc('traditionalGames');

    try {
        // Upload page data
        output.push('\n--- Creating page document ---');
        await pageRef.set(pageData);
        output.push('✓ Page document created successfully');
        output.push(`  Path: pages/heritage/articles/traditionalGames`);

        // Upload sections
        output.push('\n--- Creating section documents ---');
        
        // First, delete existing sections if any
        const existingSections = await pageRef.collection('sections').get();
        if (!existingSections.empty) {
            output.push('  Cleaning up existing sections...');
            const batch = db.batch();
            existingSections.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // Add new sections
        for (const section of sectionsData) {
            const sectionRef = pageRef.collection('sections').doc(section.id);
            await sectionRef.set(section);
            output.push(`✓ Created section: ${section.id} - ${section.title}`);
        }

        output.push('\n=== Summary ===');
        output.push(`Total sections created: ${sectionsData.length}`);
        output.push('Firebase path: pages/heritage/articles/traditionalGames');

        console.log(output.join('\n'));
        
        // Write log file
        fs.writeFileSync('traditional-games-firebase-log.txt', output.join('\n'));
        console.log('\nLog written to traditional-games-firebase-log.txt');
        
    } catch (error) {
        console.error('Error uploading to Firebase:', error);
    }
}

uploadToFirebase().catch(console.error);
