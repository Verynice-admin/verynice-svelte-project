/**
 * Add Mythology & Folklore page sections to Firebase
 * Target: pages/heritage/articles/mythology-folklore/sections
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(cwd, '.secrets/serviceAccountKey.json'), 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const sections = [
  {
    id: 'tengri',
    order: 1,
    title: 'Tengri and the Sky God',
    description: 'The ancient religion centered on the eternal blue sky.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/tengrism',
    contentMarkdown: `The ancient Kazakh religion centered on **Tengri** — the eternal blue sky, source of all life, and supreme deity. This belief system, known as **Tengrianism**, shaped nomadic spirituality for millennia before the arrival of Islam.

**The Sky God (Kök Tengri)** — Tengri is not a god in the anthropomorphic sense but rather the infinite sky itself — ever-present, all-seeing, and eternal. The sky's color, its vastness, and its changeable nature reflected Tengri's moods and messages. Clear blue skies indicated divine favor, while storms expressed displeasure.

**The Shaman (Baqsy/Qam)** — The shaman served as mediator between humans and the spiritual realm. Through drumming, chanting, and trance, the Baqsy:
- **Healed illnesses** — By identifying and removing spiritual causes
- **Predicted the future** — Reading signs in nature and communicating with spirits
- **Led ceremonies** — Ensuring proper relations with the divine
- **Traveled between worlds** — Journeying to the upper and lower realms in trance

**Sacred Sites (Jer-Subı)** — The landscape itself was alive with sacred power:
- **Mountains** — Homes of powerful spirits, requiring offerings before crossing
- **Springs and rivers** — Sources of life and purification
- **Lone trees** — Often sacred, tied with ribbons and cloth offerings
- **Rock formations** — Believed to be petrified giants or spirit dwellings

**Rituals and Offerings** —
- **Sprinkling kumis** — To the sky and earth before drinking
- **Tying ribbons** — On sacred trees as prayers
- **Stone piles (Obo)** — Built and circled for blessings at mountain passes
- **Animal sacrifices** — For major ceremonies and healing rituals

**Syncretism with Islam** — Many Tengrian beliefs merged with Islamic practice. The sky remained sacred, saints replaced local spirits, and shamanic healing continued alongside Islamic medicine. This blend created the unique Kazakh spiritual worldview.`
  },
  {
    id: 'epic-heroes',
    order: 2,
    title: 'Epic Heroes',
    description: 'The superhuman warriors who protect their people in tales thousands of verses long.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/samruk',
    contentMarkdown: `Kazakh epic poetry preserves the deeds of legendary heroes (**Batırlar**) who embody the virtues of strength, courage, loyalty, and wisdom. These epics, some stretching over 200,000 lines, are performed by bards (**Zhyraus**) who memorize and transmit these sacred histories.

**Manas** — The greatest of all Turkic epics, shared between Kazakhs and Kyrgyz, tells of Manas the Magnificent and his descendants who united warring tribes against invaders. The epic blends history with myth, featuring:
- **Manas's birth** — Foretold by dreams and marked by miracles
- **His campaigns** — Uniting 40 tribes into the Kyrgyz-Kazakh nation
- **His death** — By treachery, followed by his son Semetey's revenge
- **His legacy** — The continuation through 47 generations in the full epic cycle

**Koblandy** — A Kazakh national hero whose epic recounts:
- **His miraculous conception** — Born to parents who prayed for a son
- **His impossible tasks** — Overcoming challenges to win his bride
- **His battles** — Defeating giants, monsters, and enemy armies
- **His tragic death** — Killed by betrayal, mourned by the nation

**Alpamys** — This hero's story features:
- **Early strength** — Performing superhuman feats as a child
- **Exile and return** — Betrayed by his brothers, returning to reclaim his honor
- **Seven trials** — Overcoming supernatural challenges
- **Reconciliation** — Forgiving his brothers and restoring family unity

**Common Themes** — All epics share:
- **The hero's exceptional birth** — Marked by prophecy and miracles
- **A magical horse** — The Tulpar, winged and able to speak
- **Faithful companions** — Warriors who follow the hero to death
- **The evil sorcerer** — An antagonist using dark magic
- **The restoration of order** — The hero bringing peace and justice`
  },
  {
    id: 'tulpar',
    order: 3,
    title: 'The Tulpar — Winged Horse of Legend',
    description: 'The mythical steed embodying speed, beauty, and the connection between earth and sky.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/samruk',
    contentMarkdown: `The **Tulpar** is the winged horse of Kazakh mythology — a creature of impossible beauty, supernatural speed, and profound spiritual significance. More than a mere mount, the Tulpar represents the ideal partnership between human and nature, earth and sky.

**Physical Description** — The Tulpar is described in poetry and epic song:
- **Golden coat** — Shining like the sun, with mane and tail of silver
- **Wings** — Feathered like an eagle's, folded along the flanks when not in flight
- **Eyes** — Seeing for leagues, piercing through deception and darkness
- **Speed** — Faster than the wind, able to cross the steppe in a single day
- **Intelligence** — Able to speak, advise its rider, and make moral choices

**Symbolism** — The Tulpar embodies multiple layers of meaning:
- **The soul's journey** — Carrying the hero between worlds
- **National identity** — The nomadic spirit that cannot be contained
- **Divine blessing** — Only the worthy receive a Tulpar as companion
- **Freedom** — The ability to transcend earthly limitations
- **Loyalty** — Standing by the hero even unto death

**In Epic Poetry** — Every major hero has a Tulpar steed:
- **Manas's Akkulak** — The Gray White horse that carried him to victory
- **Koblandy's Karasher** — The Black Lion, fierce and loyal
- **Alpamys's Bayshobar** — The Wonder Horse who spoke wisdom

**Modern Presence** — The Tulpar remains a powerful symbol:
- **National emblem** — Appearing on the presidential seal
- **Monuments** — Giant Tulpar statues in cities across Kazakhstan
- **Art and jewelry** — The winged horse adorns everything from paintings to pendants
- **Sports teams** — Named after this legendary creature
- **Space program** — The first Kazakh satellite was named Tulpar`
  },
  {
    id: 'spirits-nature',
    order: 4,
    title: 'Spirits of Nature',
    description: 'The supernatural beings that inhabit the wild places of the steppe.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/zher-su',
    contentMarkdown: `The Kazakh worldview is populated by spirits (**Jin**) and supernatural beings that inhabit the landscape. Understanding these entities and maintaining proper relations with them was essential for safety and prosperity.

**Jinn and Peri** —
- **Jinn** — Spirits of wild places, neither inherently good nor evil. They could help or harm humans depending on how they were treated. Respectful behavior toward nature kept Jinn placated.
- **Peri** — Beautiful fairy-like spirits associated with water, flowers, and pure places. They could bestow blessings on humans but also punish those who desecrated their domains.

**Ubur (Ancestor Spirits)** — The spirits of deceased family members continued to influence the living:
- **Protection** — Watching over descendants and warning of danger
- **Judgment** — Displeasure shown through misfortune or illness
- **Communication** — Contacted through dreams and rituals
- **Demands** — Expecting proper funeral rites and ongoing remembrance

**Yer-Su (Spirits of Place)** — Every significant location had a spirit:
- **Mountain spirits** — Powerful, requiring offerings before crossing
- **Water spirits** — Giving life but dangerous if disrespected
- **Forest spirits** — Guardians of the trees and animals
- **Steppe spirits** — The vast open spaces held their own entities

**Zhaqsy and Zhaman (Good and Evil Forces)** — The universe contains constant interaction between opposing forces:
- **Zhaqsy** — Beneficent powers supporting life and prosperity
- **Zhaman** — Destructive forces causing illness and misfortune
- **Balance** — Maintained through proper rituals and moral behavior
- **Protection** — Amulets, prayers, and good deeds ward off evil

**Protective Practices** —
- **Blue beads** — Against evil eye
- **Prayers before journeys** — Asking permission from Yer-Su
- **Respectful behavior in wild places** — Not polluting or desecrating
- **Honoring ancestors** — Keeping their memory alive`
  },
  {
    id: 'folk-medicine',
    order: 5,
    title: 'Folk Medicine and Healing',
    description: 'Traditional healing combining herbs, bonesetting, and spiritual practices.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/shamanism',
    contentMarkdown: `Kazakh folk medicine represents a sophisticated system developed over centuries of nomadic life. Combining herbal knowledge, manipulative therapy, and spiritual practices, traditional healers addressed both physical and supernatural causes of illness.

**The Darvish** — Wandering holy persons who brought blessings and healing:
- **Spiritual healing** — Through prayers and laying on of hands
- **Herbal knowledge** — Collecting and prescribing medicinal plants
- **Divination** — Identifying spiritual causes of illness
- **Protection** — Creating amulets and talismans

**Tawba (Ritual Prayers)** — Specific prayers for protection and healing:
- **Against evil eye** — When someone has looked with envy
- **For safe journey** — Before traveling
- **For recovery** — During illness
- **For prosperity** — During hardship

**Herbal Medicine** — Kazakh healers knew hundreds of medicinal plants:
- **St. John's Wort** — For depression and wounds
- **Yarrow** — To stop bleeding and reduce fever
- **Chamomile** — For digestive issues and calming
- **Sage** — For throat and respiratory conditions
- **Thyme** — As an antiseptic and cough remedy
- **Wild rose** — For vitamin C and immune support

**Bonesetting (Sınıqsha)** — Specialists in treating fractures and dislocations:
- **Manipulation** — Realigning bones through skilled touch
- **Splinting** — Using wood and leather for support
- **Massage** — Treating muscle injuries and chronic pain
- **Preventive care** — Advice on posture and movement

**Spiritual Healing** — When illness was believed to have supernatural causes:
- **Shamanic journey** — The Baqsy traveling to find lost soul parts
- **Extraction** — Removing spiritual intrusions causing illness
- **Restoration** — Returning balance between patient and spirit world
- **Protection rituals** — Preventing recurrence

**Modern Integration** — Many Kazakhs combine traditional and modern medicine, visiting doctors for serious conditions while using folk remedies for minor ailments and spiritual healing when conventional medicine fails.`
  }
];

const pageData = {
  seo: { 
    title: 'Mythology, Folklore & Beliefs | Culture | VeryNice', 
    description: 'Explore Kazakh epic heroes, the winged Tulpar horse, spirits of the steppe, and ancient shamanic traditions.' 
  },
  mainTitle: 'Mythology, Folklore & Beliefs',
  headerDescription: 'Kazakh spiritual life blends ancient Turkic shamanism, Islam, and folk beliefs, creating a rich tapestry of stories, spirits, and cosmic understanding.',
  heroKicker: 'Ancient Tales',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [
    { label: 'Home', href: '/' }, 
    { label: 'Culture', href: '/culture' }, 
    { label: 'Mythology & Folklore' }
  ],
  headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero'
};

async function addPageToFirebase() {
  console.log('Adding Mythology & Folklore page to Firebase...');
  console.log('');
  
  const pageRef = db.collection('pages').doc('heritage').collection('articles').doc('mythology-folklore');
  
  // Add page metadata
  await pageRef.set(pageData);
  console.log('✅ Added page metadata');
  
  // Add sections
  const sectionsRef = pageRef.collection('sections');
  for (const section of sections) {
    await sectionsRef.doc(section.id).set(section);
    console.log(`✅ Added section: ${section.id}`);
  }
  
  console.log('');
  console.log('============================================================');
  console.log('Successfully added Mythology & Folklore page to Firebase!');
  console.log('Path: pages/heritage/articles/mythology-folklore');
  console.log('============================================================');
}

addPageToFirebase().catch(console.error);
