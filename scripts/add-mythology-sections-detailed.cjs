/**
 * Add detailed Mythology & Folklore sections to Firebase
 * Adding 15+ new sections with rich storytelling content
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(cwd, '.secrets/serviceAccountKey.json'), 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const newSections = [
  {
    id: 'umai',
    order: 6,
    title: 'Umai — The Sacred Mother',
    description: 'The earth mother goddess who protects fertility, childbirth, and the nurturing forces of life.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/umai',
    contentMarkdown: `In the vast Kazakh steppe, where winds sweep across endless grass and sky meets earth in every horizon, the Kazakhs honoring **Umai** — the earth mother goddess who embodies the nurturing essence of the world itself. She is the sacred feminine force that brings life, protects the vulnerable, and sustains all living things.

**The Life-Giver** — Umai represents the fertile earth that nourishes everything beneath the nomadic's feet. She is invoked during:
- **Childbirth** — Mothers pray to Umai for safe delivery and healthy children
- **Pregnancy** — Expectant women seek her blessing for protection
- **Healing** — Those suffering from infertility appeal to her compassion
- **Growth** — Farmers and herders ask for her blessing on crops and livestock

**The Protector of Women** — In Kazakh society, Umai holds special significance for women:
- She guards brides on their wedding day
- She protects mothers during the dangerous time of childbirth
- She watches over young girls as they grow
- She comforts women in times of grief and loss

**The Nurturing Force** — Umai is not merely a distant deity but an ever-present force in daily life:
- Her name is invoked when children are born
- Offerings are made at sacred sites associated with her
- Her symbol appears in jewelry and amulets worn by women
- Songs and poems praise her endless compassion

**The Return to Umai** — Today, as Kazakhstan rediscovers its pre-Islamic heritage, Umai's worship is experiencing a renaissance. Young Kazakh women, drawn to their ancestral roots, increasingly incorporate Umai's symbols and blessings into weddings, childbirth rituals, and daily life. She represents a connection to something ancient, something feminine, something eternally nurturing.`
  },
  {
    id: 'three-worlds',
    order: 7,
    title: 'The Three Worlds — Cosmic Architecture',
    description: 'The ancient Kazakh understanding of the universe divided into heaven, earth, and the underworld.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/totemic-belief',
    contentMarkdown: `Long before maps of the cosmos were drawn in observatory domes, Kazakh ancestors looked to the sky, felt the earth beneath their horses' hooves, and dug deep into their understanding of existence. They saw the universe not as a chaotic void but as a magnificent three-story dwelling — **the Three Worlds** where every soul, spirit, and force had its proper place.

**The Upper World — Tengri's Realm** — High above the steppe, beyond the clouds that scud across the endless blue, lies the realm of pure spirit:
- **Tengri** — The Eternal Blue Sky, supreme ruler of all that exists
- **Good spirits** — Light beings that guide souls toward righteousness
- **Ancestors** — The honored dead who have proven worthy of heavenly rest
- **Kut** — The divine energy that flows from above, blessing the worthy
- **The Sun and Moon** — Celestial eyes that witness all human deeds

**The Middle World — Human Realm** — This is our world, the vast Kazakh steppe where humans, animals, and nature coexist:
- **Humans** — Born with kut (soul-energy), tasked with living justly
- **Animals** — Created to serve but also to be respected as fellow beings
- **Plants** — Given by Umai to sustain all life
- **Spirits of Place** — Jin and Peri who inhabit every mountain, river, and tree
- **The Balance** — Maintaining harmony between all elements of the middle world

**The Lower World — The Realm Below** — Beneath the earth, where roots dig deep and underground waters flow, lies the darker realm:
- **Evil spirits** — Dark forces that seek to harm the living
- **The hungry dead** — Unhonored souls trapped in eternal hunger
- **Azhdarha** — The serpent-dragons who embody chaos and destruction
- **The cold** — Representing absence of Tengri's warmth and light
- **Judgment** — Where souls are weighed after death

**Living Between Worlds** — Understanding this cosmic architecture shaped every aspect of Kazakh life:
- **Shamans** — Travel between worlds to heal, guide, and protect
- **Rituals** — Maintain balance and proper communication between realms
- **Burials** — Ensure ancestors reach the correct realm
- **Offerings** — Feed spirits in both upper and lower worlds
- **Dreams** — Messages from beings in other realms`
  },
  {
    id: 'ancestor-worship',
    order: 8,
    title: 'Ancestors Among Us',
    description: 'The spirits of deceased ancestors who continue to guide, protect, and judge their living descendants.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/zher-su',
    contentMarkdown: `In Kazakh tradition, death is not an ending but a transformation. The ancestors do not simply vanish into the darkness — they become present, powerful beings who watch over their descendants, judge their actions, and intervene in the affairs of the living. To honor one's ancestors is to ensure their continued blessing; to neglect them brings terrible consequences.

**The Continuing Presence** — Ancestor spirits (**Ubur**) maintain deep connections with their living families:
- **Watching** — Every deed, word, and thought is observed by the ancestors
- **Protecting** — Good ancestors guard their descendants from harm and evil
- **Judging** — Displeased ancestors show their anger through misfortune
- **Communicating** — Dreams, signs, and sensations carry messages from the dead
- **Inheriting** — Traits, luck, and even fates pass from ancestors to descendants

**The Duties of Descendants** — Living Kazakhs have serious obligations to their dead:
- **Proper burial** — Every soul deserves funeral rites performed correctly
- **Memory Keepers** — Reciting names and stories keeps ancestors alive
- **Offerings** — Food, drink, and prayers feed and honor the spirits
- **Building** — Adding to family structures honors those who built before
- **Naming** — Children often receive ancestors' names to continue their legacy

**Signs of Ancestral Presence** — The Kazakhs learned to read the signs:
- **Dreams** — Visits from deceased relatives carry important messages
- **Fortune** — Good luck signals ancestral approval; misfortune signals displeasure
- **Illness** — Sometimes ancestors demand attention through disease
- **Animals** — Certain birds and animals carry ancestor spirits
- **Places** — Ancestors return to significant family locations

**The Judgment** — After death, every person faces judgment:
- **The Bridge** — Souls must cross a razor-thin bridge judged by their deeds
- **The Weighing** — Good and bad deeds are weighed against each other
- **The Three Days** — The soul remains near family before departing
- **The Underground River** — Souls must cross flowing water to reach the afterworld`
  },
  {
    id: 'nature-spirits',
    order: 9,
    title: 'Spirits in Every Stone',
    description: 'The animistic belief that mountains, rivers, forests, and animals possess souls and consciousness.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/zher-su',
    contentMarkdown: `Walk across the Kazakh steppe and you walk through a world alive with invisible presences. Every mountain peak shelters a powerful spirit. Every river sings with its own consciousness. Every forest holds beings that watch your every move. This is **animism** — the belief that the natural world breathes with soul and intention, and that humans must live in proper relationship with these intelligent forces.

**Mountains — The Great Spirits** — The imposing peaks that rise from the steppe are not mere rock but powerful beings:
- **Altai Mountains** — The sacred homeland where Tengri first created humans
- **Khan Tengri** — The King of Heaven's mountain, where the sky touches earth
- **Spirit Mountains** — Places where the barrier between worlds grows thin
- **Offerings** — Passing travelers leave small gifts for mountain spirits
- **Respect** — Speaking softly and behaving reverently on high ground

**Rivers and Lakes — The Living Waters** — Water is life, and water has memory:
- **Irtysh** — The great mother river that gives life to the eastern steppe
- **Issyk Lake** — The sacred hot lake where spirits dwell
- **Kaindy Lake** — The sunken forest, frozen in time by the gods
- **Springs** — Pure water sources guarded by Peri (fairy) spirits
- **Respect** — Never pollute flowing water; always offer thanks when drinking

**Forests — The Ancient Ones** — Trees remember what humans forget:
- **Sacred Groves** — Never cut trees in certain areas
- **The Talking Tree** — Folk tales describe trees that could speak
- **Forest Spirits** — Guardians who protect animals and punish poachers
- **Spirits of Place** — Each significant tree has its own entity

**Animals — Our Brothers** — Kazakhs see animals as conscious relatives:
- **The Horse** — Noble companion, vehicle to the sky world
- **The Wolf** — Ancestor spirit, symbol of strength and family
- **The Eagle** — Messenger between worlds, hunter for shamans
- **The Snow Leopard** — Ghost of the mountains, impossibly beautiful
- **Respect** — Hunt only what you need; thank every animal killed`
  },
  {
    id: 'totemic-beliefs',
    order: 10,
    title: 'Sacred Animals — Totems of the Steppe',
    description: 'The symbolic and spiritual significance of animals in Kazakh culture, from wolves to horses.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/totemic-belief',
    contentMarkdown: `Before Kazakhstan became a modern nation, before Islam arrived with its holy book, before even Tengri became just one god among many, the Kazakhs lived in a world where animals were not merely creatures to be used but sacred beings to be understood, honored, and emulated. This is the world of **totemism** — where every significant animal carried spiritual meaning and every family traced its lineage to a sacred creature.

**The Wolf — Ancestor and Protector** — The **Böri** holds the highest place in Kazakh totemism:
- **Origin Myth** — Legend says Kazakhs descended from a she-wolf who nursed the first human twins
- **Family Clans** — Different tribes traced lineage to different wolves
- **Strength** — The wolf represents the survival instinct, the pack bond, the hunt
- **Leadership** — A good leader is praised as "wolf-like" in wisdom and fierceness
- **Protection** — Wolf teeth and claws ward off evil; wolf amulets protect children
- **The Howl** — When wolves howl at the full moon, they speak to ancestors

**The Horse — Winged Companion** — The **Kolor** is the most beloved of all animals:
- **Tulpar** — The mythical winged horse that carries heroes between worlds
- **Upper World** — Horses are associated with the sky, with Tengri's favor
- **Wisdom** — Horses know things humans don't; they sense spirits, predict weather
- **Freedom** — A horse that refuses to be bridled is blessed, not cursed
- **Honoring** — Horses are the first to be offered food at feasts; their health reflects family fortune

**The Eagle — Sky Messenger** — The **Khanğı** connects humans to the divine:
- **Shaman's Helper** — Eagles hunt for shamans traveling between worlds
- **Royal Symbol** — The golden eagle appears on the presidential seal
- **Hunting** — Eagle hunting (беркутшілік) is an ancient tradition
- **Vision** — Eagles see what others miss; they represent clarity and far-sightedness
- **The Sun** — Eagles fly toward the sun, embodying the celestial fire

**The Argali (Mountain Sheep) — Mountain King** — The **Аргали** represents perseverance:
- **Climbing** — These animals climb impossible cliffs, teaching persistence
- **Horns** — Their massive horns symbolize strength and dignity
- **Wisdom** — Old argali are said to understand human speech
- **Rare** — Seeing one brings extraordinary luck

**The Snow Leopard — Ghost of Mountains** — The **Илбирс** embodies mystery:
- **Invisibility** — These cats are rarely seen, like ghosts
- **Power** — They can kill prey three times their size
- **Solitude** — They represent independence and self-reliance
- **Beauty** — Their spotted fur is impossibly beautiful
- **Endangered** — Protecting them is protecting Kazakhstan's soul`
  },
  {
    id: 'samruk',
    order: 11,
    title: 'Samruk — The Phoenix of the Steppe',
    description: 'The giant mythical bird that symbolizes rebirth, cosmic power, and control over the elements.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/samruk',
    contentMarkdown: `High above the Kazakh steppe, beyond the reach of any eagle, lives the greatest of all creatures — **Samruk**, the giant mythical bird whose wings span the horizon and whose cry echoes across mountains. Unlike the phoenix of Greek myth, Samruk is not merely a bird that is reborn from its own ashes. It is a cosmic force, a keeper of cosmic order, and a symbol of Kazakhstan's deepest spiritual heritage.

**The Cosmic Bird** — Samruk exists on a scale beyond ordinary creatures:
- **Size** — Its wings can cover an entire valley; its nest is made of gold
- **Age** — Samruk has lived since the beginning of time
- **Fire** — Its feathers burn with eternal flame; its breath creates wind
- **Water** — It controls the rains; a flap of its wings brings storms
- **Sun** — Some say Samruk is the bird that carries the sun across the sky

**Rebirth and Renewal** — Like the phoenix, Samruk embodies transformation:
- **Fires of Change** — When old ages end, Samruk appears to bring renewal
- **Egg of Life** — Samruk's eggs contain the seeds of new creation
- **Ash to Gold** — What Samruk burns, it transforms into something better
- **Kazakh Identity** — Samruk represents the resilience of Kazakh spirit through invasions, Soviet rule, and independence

**Samruk in Epic Poetry** — The great heroes of Kazakh legend interact with Samruk:
- **The Golden Egg** — Heroes quest for Samruk's eggs to gain supernatural power
- **Nesting Sites** — Sacred places where Samruk is said to roost
- **Molt** — When Samruk molts, feathers fall to earth as magical objects

**Modern Samruk** — Today, Samruk appears throughout Kazakh culture:
- **Banks** — The Samruk-Kazyna sovereign wealth fund bears its name
- **Monuments** — Giant Samruk statues stand in major cities
- **Art** — Contemporary artists draw inspiration from this ancient creature
- **Pride** — Kazakhs speak of Samruk with the same pride they feel for their nation

**The Samruk Principle** — What can this ancient bird teach modern Kazakhs?
- **Transformation** — Embrace change; what burns away makes room for new growth
- **Cosmic Scale** — Think beyond personal concerns to the greater good
- **Rebirth** — Every ending contains the seed of a new beginning
- **Power with Purpose** — Great strength exists to protect and nurture, not destroy`
  },
  {
    id: 'azhdarha',
    order: 12,
    title: 'Azhdarha — The Dragon Serpent',
    description: 'The ancient enemy of light, embodying chaos, darkness, and the forces of destruction.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/totemic-belief',
    contentMarkdown: `In every mythology, there exists a counterpart to the forces of light — a shadow that must be continually pushed back, an enemy that must be constantly resisted. In Kazakh tradition, this role falls to **Azhdarha** (Аждаһа), the great serpent-dragon that embodies everything threatening to cosmic and social order.

**The Serpent of Chaos** — Azhdarha represents forces that existed before creation:
- **Primordial** — Azhdarha predates the ordered world, a remnant of chaos
- **Serpent Form** — Its body is that of a massive snake, kilometers long
- **Dragon Features** — It has legs, scales, and a head like a monster
- **Multi-Headed** — Some descriptions say it has seven or nine heads
- **Fires of Destruction** — Azhdarha breathes not fire but annihilation

**The Eternal Battle** — The cosmos itself is engaged in struggle:
- **Against Tengri** — Azhdarha constantly attacks the ordered sky
- **Against the Sun** — It tries to swallow the sun, causing eclipses
- **Against Humanity** — It seeks to destroy civilization and return all to darkness
- **The Hero's Task** — Every great hero must defeat an Azhdarha
- **The Outcome** — Azhdarha is never truly killed, only driven back

**Azhdarha in Nature** — This mythical creature has real-world echoes:
- **Snakes** — Real serpents are seen as Azhdarha's lesser servants
- **Earthquakes** — When Azhdarha moves underground, the earth shakes
- **Drought** — Azhdarha blocks the rains when it coils around mountains
- **Lakes** — Some lakes are said to be homes of water-dwelling Azhdarha

**The Lessons of Azhdarha** — What does this monster teach?
- **Evil Exists** — Not all forces can be reasoned with; some must be opposed
- **Eternal Vigilance** — The battle against chaos never ends
- **Heroes Are Needed** — Every generation must produce those who fight
- **Order Is Fragile** — What we call civilization requires constant protection

**Modern Interpretation** — Azhdarha in contemporary Kazakhstan:
- **Environmental Warning** — Some see Azhdarha in pollution and ecological destruction
- **Symbol of Resistance** — The dragon represents the Kazakh spirit of resistance against invaders
- **Folklore Preservation** — Teaching children about Azhdarha keeps ancient stories alive`
  },
  {
    id: 'albasti',
    order: 13,
    title: 'Albastı — The Demon of the Dark',
    description: 'The malevolent female spirit that haunts the darkness, preying on the vulnerable.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/albasti',
    contentMarkdown: `Not all spirits seek to help humanity. Some exist purely to harm, to terrorize, to destroy. The most feared of these is **Albastı** (Албасты) — the demon woman who stalks the night, appearing sometimes as terrifying hag, sometimes as beautiful seductress, always with death in her heart.

**The Demon Woman** — Albastı takes many forms:
- **The Hag** — An old woman with wild hair, rotting teeth, and claws like knives
- **The Beauty** — A young woman of impossible allure who lures victims to their doom
- **The Animal** — Sometimes appears as a black or yellow dog, cat, or mare
- **The Shadow** — Some say she has no true form, only a darkness that moves
- **The Mother** — Appears as a grieving mother looking for lost children

**The Yellow and Black** — Albastı comes in two terrible varieties:
- **Yellow Albastı** — The more dangerous, associated with death and plague
- **Black Albastı** — Associated with madness and destruction of mind
- **Together** — When both appear, no one in the area will survive

**Victims and Attacks** — Albastı targets the most vulnerable:
- **Newborns** — She steals or poisons babies left unwatched
- **Pregnant Women** — She causes miscarriages and difficult births
- **Travelers** — Those walking alone at night are easy prey
- **The Weak** — The sick, the grieving, the desperate

**Protection Against Albastı** — Kazakh wisdom developed powerful defenses:
- **Iron** — Horseshoes, knives, and nails ward off her approach
- **Fire** — Burning lights keep her at bay; never sleep in complete darkness
- **Sound** — Bells, whistles, and shouts drive her away
- **Names** — Speaking names aloud traps her attention
- **Amulets** — Specially blessed objects protect the wearer

**The Dark Feminine** — Albastı represents the shadow side of Umai:
- **Opposites** — Where Umai gives life, Albastı destroys it
- **The Jealous** — Some say Albastı was once a woman scorned
- **Balance** — Even the nurturing mother has a dark aspect
- **Caution** — This story teaches respect for the power of women`
  },
  {
    id: 'zhalmauyz-kempir',
    order: 14,
    title: 'Zhalmauyz Kempir — The Witch of the Mountains',
    description: 'The evil cannibal witch who shape-shifts and devours those who wander too far from safety.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/zhalmauyz-kempir',
    contentMarkdown: `In the high mountains where the air grows thin and the wind howls like starving wolves, there lives a creature more terrifying than any beast — **Zhalmauyz Kempir** (Жалмауыз Кемпір), the cannibal witch. She is the villain of a hundred bedtime stories, the warning given to children who wander too far, the nightmare that makes children afraid to sleep alone.

**The Ugly Hag** — Zhalmauyz Kempir is the essence of frightening appearance:
- **Enormous Size** — She stands as tall as a house, her shadow covering valleys
- **Horrific Features** — Her face is wrinkled, her teeth are enormous, her eyes glow red
- **Iron Teeth** — Her mouth is filled with iron teeth that crush bone like twigs
- **Endless Hunger** — She is ALWAYS hungry; her appetite can never be satisfied
- **Immortal** — She cannot die; she can only be tricked or escaped

**The Shape-Shifter** — Zhalmauyz Kempir can become anything:
- **Grandmother** — She tricks children by appearing as a kindly old woman
- **Animals** — She becomes horses, goats, or dogs to approach victims
- **Objects** — She hides in millstones, pots, or other household items
- **Voice** — She can mimic anyone, calling victims by name
- **Invisible** — Sometimes she's simply there, appearing from nowhere

**The Hunt** — Zhalmauyz Kempir is always hunting:
- **Target** — She especially loves children and lone travelers
- **Method** — She stalks, cornering victims before the feast
- **Preparation** — She sharpens her iron teeth, making terrible sounds
- **The Wait** — She enjoys fear, letting victims绝望 (lose hope) before eating
- **Gluttony** — She eats everything, not just the choicest parts

**Escaping the Witch** — How heroes survive encounters with Zhalmauyz Kempir:
- **Quick Thinking** — Intelligence always defeats brute strength
- **Tricks** — Heroes escape through cleverness, not combat
- **Objects** — Certain items (flour, mirrors, iron) can trap or slow her
- **Running** — The only wise choice is usually to flee
- **Helping Hands** — Those who help others find help in return

**The Moral** — What does Zhalmauyz Kempir teach?
- **Danger Exists** — Not everyone is trustworthy; some seek to harm
- **Stay Close** — There's safety in family and community
- **Think First** — Violence is rarely the answer; cleverness saves
- **Listen to Warnings** — Parents and elders know the dangers`
  },
  {
    id: 'peri-jinn',
    order: 15,
    title: 'Peri and Jinn — The Supernatural Folk',
    description: 'The supernatural beings that inhabit the world between human and spirit, capable of both great good and terrible harm.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/shamanism',
    contentMarkdown: `Between the world of humans and the world of pure spirits exists a vast middle realm — the domain of **Peri** (пери) and **Jinn** (жын). These supernatural beings walk among us, invisible but present, powerful but bound by rules, capable of both magnificent kindness and terrifying cruelty. Understanding them is essential to understanding the Kazakh view of reality.

**Peri — The Fairies** — These beautiful beings embody grace and magic:
- **Appearance** — Radiantly beautiful, with ethereal features and luminous skin
- **Abilities** — They can fly, become invisible, and perform magic
- **Associations** — Peri are linked to pure water, flowers, and sacred places
- **Music** — They are said to dance in moonlit glades, their music enchanting
- **Relationships** — Some folk tales describe marriages between Peri and humans

**Jinn — The Wild Spirits** — These powerful entities are neither good nor evil:
- **Nature** — Jinn exist in many forms: fire, air, earth, and smoke
- **Intelligence** — They have their own societies, kingdoms, and rulers
- **Power** — They can perform great feats beyond human capability
- **Freedom** — Unlike humans, they can move through solid objects
- **Capriciousness** — Their moods shift; they help or harm without clear reason

**Diu and Tajal** — Other supernatural beings populate Kazakh folklore:
- **Diu (Діу)** — Powerful spirits, often malevolent
- **Tajal (Тажал)** — Death spirits that come for dying people
- **Al** — Spirits that cause madness and possession
- **Sui** — Water spirits that can drown the unwary

**Interactions** — How humans relate to these beings:
- **Offerings** — Small gifts can gain Jinn favor; neglecting them brings trouble
- **Respect** — Never urinate on fire or soil where Jinn might dwell
- **Contracts** — Some stories describe humans making deals with Jinn
- **Shamans** — Only shamans can reliably communicate with these beings

**Islamic Integration** — When Islam arrived, these beliefs transformed:
- **Recognition** — Islam acknowledged the existence of Jinn as real beings
- **Conversion** — Some Jinn converted to Islam; some remain non-believers
- **Boundaries** — Islamic teaching defined proper and improper relations
- **Balance** — Pre-Islamic and Islamic views merged into modern practice`
  },
  {
    id: 'magical-horses',
    order: 16,
    title: 'Magical Horses — Wings of the Heroes',
    description: 'The sacred horses that serve as wise advisors, protectors, and vehicles between worlds.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/samruk',
    contentMarkdown: `No creature is more beloved in Kazakh culture than the horse. But beyond the horses that graze the steppe, beyond the mounts that carry families across vast distances, there exists another kind of horse — the magical steed of legend. These are not mere animals but wise beings, loyal companions, and essential helpers to every epic hero.

**The Tulpar — Standard Bearer** — The winged horse appears in every major epic:
- **Wings** — They can fly, carrying heroes between the mortal and divine realms
- **Speech** — Tulpar can talk, offering advice and warnings to their riders
- **Wisdom** — They know things humans don't; their counsel is invaluable
- **Choice** — Only the worthy are chosen by a Tulpar; the wicked are rejected
- **Loyalty** — A Tulpar remains with its hero until death, then grieves

**Baichubar — The Wonder Horse** — The most famous magical horse in Kazakh legend:
- **Origin** — Born from magical waters, emerged fully grown from a spring
- **Speed** — He can run faster than any horse, faster than thought itself
- **Intelligence** — He understands human speech and answers wisely
- **Heroism** — He carries Alpamys through all his adventures
- **The Race** — His famous race determines the fate of the kingdom

**Taiburyl — The Shape-Shifter** — The most unusual of magical horses:
- **Transformation** — He can change into any animal or object
- **Deception** — He helps heroes escape by becoming boats, bridges, or birds
- **Wisdom** — He offers philosophical counsel to those who listen
- **Trickster** — He outwits enemies through cleverness, not force

**Ordinary Magic** — Even regular horses in Kazakh culture have special qualities:
- **Sensing Spirits** — Horses know when supernatural beings are near
- **Weather Sense** — They predict storms before clouds appear
- **Family Fortune** — A horse's health reflects family prosperity
- **Soul Connection** — Horses and riders develop deep spiritual bonds

**Modern Implications** — What do magical horses mean to modern Kazakhs?
- **Partnership** — The human-horse bond represents ideal cooperation
- **Trust** — Magical horses trust their riders; trust must be mutual
- **Guidance** — Wisdom comes from unexpected sources
- **Freedom** — The horse represents freedom across the open steppe`
  },
  {
    id: 'korkyt-ata',
    order: 17,
    title: 'Korkyt Ata — The Eternal Musician',
    description: 'The legendary shaman-musician whose kobyz music can heal the sick and summon spirits.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/shamanism',
    contentMarkdown: `Long ago, when the world was younger and magic flowed as freely as the rivers across the steppe, there lived a man who transcended the boundary between human and divine. His name was **Korkyt Ata** (Қорқыт Ата) — the Father of Korkyt — and his music still echoes across the Kazakh steppe, heard in the trembling strings of the kobyz, felt in the mournful songs that fill the night air.

**The Legendary Life** — Korkyt Ata's story mixes history and myth:
- **Origins** — Born to a mother who prayed for a child for years
- **Immortality** — He was given the gift of living through ages
- **The Quest** — He searched for the Water of Life, the spring of eternal youth
- **The Discovery** — He found the water but could not drink it (accounts vary)
- **The Teaching** — He passed his knowledge to generations of musicians

**The Kobyz** — Korkyt invented the sacred instrument:
- **Two Strings** — Made from horsehair, representing the dualities of existence
- **The Bow** — The horsehair bow that makes the instrument sing
- **The Sound** — Its voice is said to resemble human weeping
- **The Power** — The kobyz can heal the sick, calm storms, summon spirits
- **The Tradition** — Kobyz players today continue his legacy

**The Music of Healing** — Korkyt's music operates on multiple levels:
- **Physical Healing** — Music can cure diseases of the body
- **Spiritual Healing** — It can restore balance to disturbed spirits
- **Emotional Healing** — It soothes grief, fear, and despair
- **Cosmic Healing** — The right music can restore harmony to the universe
- **The Shaman's Tool** — Kobyz is essential for shamanic ceremonies

**The Legend's Depth** — Different accounts emphasize different aspects:
- **600 Years** — Some say he lived for six centuries
- **The Cave** — His final resting place is a sacred cave in the mountains
- **The Descendants** — Master kobyz players claim descent from his school
- **The Songs** — Specific melodies are attributed to his compositions

**The Modern Legacy** — Korkyt Ata in contemporary Kazakhstan:
- **Cultural Hero** — He's celebrated as a founder of Kazakh music
- **Instruments** — The kobyz remains a sacred instrument
- **Masters** — Living kobyz players keep his tradition alive
- **Healing** — Some claim his music's power continues to heal`
  },
  {
    id: 'creation-myths',
    order: 18,
    title: 'In the Beginning — Creation Stories',
    description: 'How the universe, earth, and humanity came into existence according to Kazakh mythology.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/tengrism',
    contentMarkdown: `Every culture has its story of how everything began — how the void first crackled with energy, how the first light broke through darkness, how the first humans opened their eyes to see sky and earth. Kazakh mythology offers several beautiful creation narratives, each revealing something about the Kazakh understanding of existence, purpose, and the relationship between humanity and the divine.

**Tengri Creates the Universe** — The primary creation account:
- **From Nothing** — Before creation, there was only the endless sky (Tengri)
- **The Will** — Tengri thought, and thought became action
- **The First Act** — The sky expanded, creating space for existence
- **The Elements** — Fire (above), water (below), and earth (middle) formed
- **The Sacred Order** — Tengri established laws that govern all things

**The First Humans** — The story of humanity's origin:
- **From the Earth** — The first humans were formed from soil
- **From Sky** — Some accounts say Tengri breathed life from above
- **The Three Sons** — All Kazakhs descend from three legendary brothers
- **The Zhuzes** — The Senior, Middle, and Junior Hordes
- **The Confirmation** — The first humans were tested and approved by Tengri

**The Creation of Animals** — Why creatures- **Service exist:
 to Humans** — Animals were created to help humanity
- **The Test** — Each animal was given a purpose; those who failed became prey
- **The Gift** — Animals give their flesh, milk, and labor to the worthy
- **The Balance** — Predator and prey maintain cosmic equilibrium

**The Plant World** — How vegetation came to be:
- **From Umai** — The earth mother created all plants
- **The First Seeds** — Seeds were given to humans to cultivate
- **Sacred Flora** — Certain plants are especially blessed
- **The Seasons** — The cycle of growth and death mirrors cosmic cycles

**The Purpose of Creation** — Why anything exists at all:
- **To Know** — Existence allows beings to gain knowledge
- **To Worship** — Creation exists to recognize and honor its creators
- **To Evolve** — Each generation should improve on the last
- **To Return** — The purpose of life is to return to the source, elevated`
  },
  {
    id: 'superstitions',
    order: 19,
    title: 'Wisdom of Protection',
    description: 'The superstitions, amulets, and protective practices that guard against evil spirits and misfortune.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/albasti',
    contentMarkdown: `In the invisible war between good and evil, between the forces of light that protect and the darkness that seeks to destroy, the Kazakhs developed an arsenal of spiritual weapons. These are not mere superstitions — though outsiders might dismiss them as such — but accumulated wisdom about maintaining balance, warding off malevolent forces, and navigating a world where spirits are as real as any neighbor.

**The Evil Eye — The Most Feared Curse** — The gaze that brings harm:
- **The Mechanism** — Envy, when focused intensely, can damage the object
- **The Victims** — Beautiful children, successful people, and pregnant women are vulnerable
- **The Detection** — Certain signs indicate someone has been cursed
- **The Cure** — Specific prayers and rituals remove the curse

**Amulets and Talismans** — Objects that protect:
- **Blue Beads (Көк)** — The most famous Kazakh protection; the color of Tengri's sky
- **Iron** — Horseshoes, nails, and knives ward off evil
- **Amulet Boxes (Төлем)** — Containing Quranic verses or protective symbols
- **Animal Parts** — Wolf teeth, eagle talons, and horse hooves protect
- **Plants** — Certain herbs hung in homes drive away spirits

**Protective Practices** — Things you do:
- **Spitting** — A small spit wards off evil eye when praising children
- **Pointing** — Never point at the moon, stars, or sacred places
- **Names** — Never say a newborn's name before the fortieth day
- **Threshold** — Never step on a threshold; it's a spirit's dwelling
- **Fire** — Never extinguish fire with water; it offends the fire spirit

**Rituals of Cleansing** — Removing negativity:
- **Smudging** — Burning certain herbs purifies spaces
- **Sulfur** — The smell drives away malevolent spirits
- **Salt** — Thrown into fire or scattered at doorways
- **Running Water** — Cross moving water to leave behind curses
- **Sweeping** — Cleaning removes accumulated negativity

**Hospitality as Protection** — The sacred obligation:
- **Guest Rights** — A guest under your roof cannot be harmed
- **Feast Sharing** — Food shared with others multiplies blessings
- **The Visitor's Duty** — Guests must bring good fortune to share
- **The Host's Duty** — Refusing a guest brings bad luck`
  },
  {
    id: 'folk-tales',
    order: 20,
    title: 'Stories That Teach — Folk Tale Themes',
    description: 'The timeless themes and moral lessons embedded in Kazakh folk tales passed through generations.',
    imagePublicId: 'content/pages/heritage/mythologyFolklore/samruk',
    contentMarkdown: `In the long winter nights, when the wind howls outside the yurt and the fire crackles within, Kazakh families gather to tell stories. These are not mere entertainment — they are the library of Kazakh wisdom, the schoolroom of moral education, the mirror in which children see themselves and understand what they should become. Every folk tale carries a lesson, every hero embodies a virtue, every villain represents a danger.

**Good Against Evil** — The fundamental struggle:
- **The Setup** — Every tale has heroes and villains, clearly defined
- **The Test** — Heroes are tested; their virtue determines their fate
- **The Victory** — Good always triumphs, though not without cost
- **The Lesson** — Evil cannot ultimately succeed; virtue is its own reward

**Wit Over Brute Force** — Intelligence triumphs:
- **Clever Heroes** — The smartest character always wins
- **Outsmarting Enemies** — Intelligence defeats strength
- **Tricks and Plans** — Cleverness is praised, not condemned
- **Wisdom of Age** — Grandparents often give the crucial advice

**Harmony with Nature** — Humans and environment:
- **Respect Animals** — Those who respect animals are rewarded
- **Nature Spirits** — Those who insult nature face consequences
- **The Golden Mean** — Taking too much brings punishment
- **Stewardship** — Humans are caretakers, not masters

**Hospitality and Kinship** — Social bonds:
- **Guest Obligations** — The guest-right is sacred and binding
- **Family Loyalty** — Betraying family is the worst sin
- **Strangers** — Help strangers; they may be spirits testing you
- **Community** — Individual success comes through group support

**Resilience and Perseverance** — The Kazakh spirit:
- **Endurance** — Heroes survive impossible hardships
- **Patience** — Waiting and watching often succeed where force fails
- **Adaptation** — Heroes change with circumstances
- **Hope** — Even in darkness, dawn will come

**Moral Complexity** — Tales aren't always simple:
- **Flawed Heroes** — Even good characters make mistakes
- **Villain Motivation** — Enemies often have understandable reasons
- **Gray Areas** — Some situations have no clear right answer
- **Learning** — Character growth is as important as success`
  }
];

async function addNewSections() {
  console.log('Adding detailed Mythology & Folklore sections to Firebase...');
  console.log('');
  
  const sectionsRef = db.collection('pages').doc('heritage').collection('articles').doc('mythology-folklore').collection('sections');
  
  for (const section of newSections) {
    await sectionsRef.doc(section.id).set(section);
    console.log(`✅ Added section: ${section.id} - ${section.title}`);
  }
  
  console.log('');
  console.log('============================================================');
  console.log(`Successfully added ${newSections.length} new sections!`);
  console.log('============================================================');
}

addNewSections().catch(console.error);
