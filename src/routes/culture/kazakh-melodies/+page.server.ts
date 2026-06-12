import { adminDB } from '$lib/server/firebaseAdmin';
import type { PageServerLoad } from './$types';

function serializeDates(obj: any): any {
	if (!obj || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map((item) => serializeDates(item));
	const out: any = {};
	for (const k of Object.keys(obj)) {
		const v = obj[k];
		if (v && typeof v.toDate === 'function') {
			out[k] = v.toDate().toISOString();
		} else if (v && typeof v === 'object' && !Array.isArray(v)) {
			if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
				out[k] = { lat: v.latitude, lng: v.longitude };
			} else {
				out[k] = serializeDates(v);
			}
		} else {
			out[k] = v;
		}
	}
	return out;
}

const FALLBACK_PAGE = {
	seo: {
		title: 'Kazakh Melodies | Culture | VeryNice',
		description:
			'Explore Kazakh musical traditions, dombra melodies, throat singing, and traditional dances that unite generations.'
	},
	mainTitle: 'Kazakh Melodies',
	headerDescription:
		'Kazakh musical traditions echo the sounds of the steppe — the wind through grass, galloping horses, and the human voice expressing love, longing, and heroism.',
	heroKicker: 'Sounds of the Steppe',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Culture', href: '/culture' },
		{ label: 'Kazakh Melodies' }
	],
	headerBackgroundPublicId: 'content/pages/heritage/kazakhMelodies/mainKazakhMelodies'
};

const FALLBACK_SECTIONS = [
	{
		id: 'the-dombra',
		order: 1,
		title: 'The Dombra — Soul of Kazakh Music',
		description: 'The two-stringed lute that has accompanied nomads for centuries.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/dombra',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/dombra', caption: 'The Dombra' }
		],
		contentMarkdown: `The **dombra** is not merely an instrument — it is the soul of Kazakh music, the companion of poets, and the voice of the steppe. This two-stringed lute has accompanied nomads for centuries, filling yurts with melodies that speak of love, heroism, and the eternal connection to land and sky.

**Construction and Design** — The dombra consists of a long, narrow neck and an oval or pear-shaped body carved from a single piece of wood (typically apricot, mulberry, or pine). Two strings made from sheep intestine or nylon stretch from the tuning pegs at the top to the base, producing a bright, resonant sound that carries across open spaces.

**Playing Techniques** — Masters use complex fingerpicking and strumming techniques to create the dombra's distinctive sound. The instrument can imitate natural phenomena — galloping horses, flowing rivers, whistling wind — while also expressing profound human emotions. Advanced players use harmonics, slides, and percussive effects.

**Legendary Masters** —
- **Kurmangazy Sagyrbayev** (1823–1896): The most celebrated dombra composer, his works remain central to Kazakh music
- **Dina Nurpeisova** (1861–1955): A virtuoso who elevated dombra playing to high art
- **Nurgisa Tlendiyev**: Modern master who fused traditional and contemporary styles

**The Dombra in Society** — No celebration, gathering, or long evening was complete without dombra music. The instrument accompanied *Aytis* (poetic competitions), storytelling, and solo performances. A family's dombra was treasured, often passed down through generations.`
	},
	{
		id: 'traditional-instruments',
		order: 2,
		title: 'Traditional Instruments',
		description: 'The diverse soundscape of Kazakh musical culture.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/Kobyz',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/Kobyz', caption: 'The Kobyz' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Syrnay', caption: 'The Syrnay' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Dauylpaz', caption: 'The Dauylpaz' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Shankobyz', caption: 'The Shankobyz' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Zhetigen', caption: 'The Zhetigen' }
		],
		contentMarkdown: `Beyond the dombra, Kazakh musical culture encompasses a diverse array of instruments, each with unique sounds, histories, and ceremonial roles.

**The Kobyz** — An ancient bowed instrument with a sacred history. Its body is covered with camel or goat skin, producing a haunting, resonant tone. In ancient times, Kobyz players (**Kobyzshi**) served as shamans, using the instrument's eerie sounds to communicate with spirits and heal illnesses.

**The Syrnay** — A wooden flute with a breathy, melancholic voice. Pastoralists played Syrnay while watching flocks, its melodies reflecting the vastness of the steppe. Different lengths produce different registers, from high, bird-like calls to deep, wind-like tones.

**The Dauylpaz** — A large frame drum used in ceremonial contexts. Covered with goat skin and played with the hands, it provides the rhythmic foundation for dances and celebrations. Shamans used the Dauylpaz to induce trance states during rituals.

**The Shankobyz** — A metal jaw harp that produces buzzing, otherworldly tones. Small enough to fit in a pocket, it was popular among herders and travelers. By changing mouth shape and breathing, players create complex rhythmic patterns and melodies.

**The Zhetigen** — A seven-stringed instrument similar to a zither, played by plucking the strings open or stopping them with a small stick. It produces a gentle, harp-like sound suitable for intimate gatherings.`
	},
	{
		id: 'traditional-dances',
		order: 3,
		title: 'Traditional Dances',
		description: 'Movement traditions that unite communities and celebrate life.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/KaraZhorga',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/KaraZhorga', caption: 'Kara Zhorga Dance' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/qamazhai', caption: 'Kamazhai Dance' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/KyzKuu', caption: 'Kyz Kuu' }
		],
		contentMarkdown: `Kazakh dance traditions range from communal circle dances to competitive sporting displays, each expressing different aspects of nomadic life, relationships, and community bonds.

**Kara Zhorga (Black Earth)** — The most popular group dance, performed at celebrations and gatherings. Participants form circles or lines, performing synchronized steps that mimic horseback riding, herding, and daily activities. The dance builds in energy, with faster music inspiring more animated movements. Everyone is welcome to join, making it a powerful community-building tradition.

**Kamazhai** — A traditional women's dance that embodies grace, elegance, and the beauty of Kazakh culture. Performed by young women in traditional costumes, this dance features fluid arm movements, delicate footwork, and expressive gestures that tell stories of love, longing, and the beauty of the steppe. The dancers move with the grace of swans, their flowing dresses creating beautiful visual patterns as they spin. Kamazhai is often performed at weddings, celebrations, and cultural festivals, showcasing the refinement and artistry of Kazakh women's dance traditions.

`
	},
	{
		id: 'epic-poetry',
		order: 4,
		title: 'Epic Poetry (Zhyr)',
		description: 'The oral tradition that preserves history through performance.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/Alpamys',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/Alpamys', caption: 'Alpamys Epic' }
		],
		contentMarkdown: `Kazakh epic poetry (**Zhyr**) represents one of the world's great oral traditions. Bards called **Zhyraus** memorize thousands of lines of verse, recounting the deeds of heroes, the wisdom of ancestors, and the history of the Kazakh people.

**The Great Epics** —
- **Koblandy**: Adventures of a legendary batyr (warrior) who defended his people
- **Alpamys**: The story of a hero who survives betrayal and returns to reclaim his honor
- **Er-Targyn**: Tales of a warrior who protects his people from invaders

**The Art of the Zhyraus** — Becoming a Zhyraus requires years of apprenticeship. Masters teach students not only the words but also the musical performance, vocal techniques, and improvisational skills. A skilled Zhyraus can perform for days, adapting the epic to the occasion and audience.

**Musical Accompaniment** — Epics are performed with dombra or Kobyz accompaniment. The bard alternates between singing and speaking, with music intensifying during action scenes and becoming melancholic during emotional passages.

**Preservation and Revival** — Soviet-era documentation projects recorded hundreds of epic performers. Today, UNESCO recognizes Kazakh oral traditions as Intangible Cultural Heritage. Competitions, festivals, and university programs train new generations of Zhyraus, ensuring these ancient stories continue to echo across the steppe.`
	},
	{
		id: 'modern-music',
		order: 5,
		title: 'Modern Kazakh Music',
		description: 'Contemporary artists taking Kazakh music to the world stage.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/DimashKudaibergen',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/DimashKudaibergen', caption: 'Dimash Kudaibergen' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Imanbek', caption: 'Imanbek' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/Enlik', caption: 'Enlik' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/DosMukasan', caption: 'Dos Mukasan' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/BatyrkhanShukenov', caption: 'Batyrkhan Shukenov' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/RozaRymbayeva', caption: 'Roza Rymbayeva' }
		],
		contentMarkdown: `While rooted in ancient traditions, Kazakh music continues to evolve and captivate global audiences. Today's artists blend traditional sounds with contemporary styles, creating a unique musical identity that resonates worldwide.

**Dimash Kudaibergen** — With a vocal range spanning six octaves, Dimash has become Kazakhstan's most recognized international artist. His ability to seamlessly transition between operatic power and delicate folk sensitivity has earned him fans across Asia, Europe, and the Americas. He regularly incorporates dombra and traditional Kazakh melodies into his performances, introducing millions to his cultural heritage.

**Imanbek** — The DJ and producer who won a Grammy for his remix of "Roses" brought Kazakh electronic music to the global stage. His infectious beats and innovative production techniques have made him one of the most sought-after remix artists worldwide, proving that Kazakh creativity transcends genres.

**Enlik** — This rising star represents the new generation of Kazakh pop, blending traditional vocal techniques with contemporary R&B and pop sensibilities. Her music addresses modern themes while honoring the melodic traditions of her ancestors.

**Dos Mukasan** — Pioneers of Kazakh rock, this legendary band formed in the 1960s and became the voice of a generation. Their fusion of Western rock instrumentation with Kazakh folk themes created an entirely new genre that continues to influence musicians today. Songs like "Kara Suz" remain anthems of Kazakh identity.

**Batyrkhan Shukenov** — The legendary voice that defined Kazakh pop music for generations. As the founder and soul of A-Studio, Batyrkhan's velvet baritone and charismatic stage presence made him a cultural icon across the post-Soviet space. His solo career further cemented his status as one of Kazakhstan's greatest vocalists, with songs like "Dudarai" becoming eternal classics. His ability to infuse pop music with Kazakh soul created a timeless legacy that continues to influence artists today.

**Roza Rymbayeva** — Known as the "Queen of Kazakh Pop," Roza Rymbayeva has been a cultural icon since the 1970s. Her powerful voice and emotional delivery have made her songs timeless classics. She played a crucial role in popularizing Kazakh music throughout the Soviet Union and continues to inspire new generations of performers with her dedication to cultural authenticity.

**The New Wave** — Beyond individual stars, Kazakhstan's music scene is exploding with talent across all genres. From hip-hop artists rapping in Kazakh to indie bands experimenting with traditional throat singing over electronic beats, the country's youth are creating a musical renaissance that honors the past while boldly stepping into the future.`
	},
	{
		id: 'orchestras-ensembles',
		order: 6,
		title: 'Orchestras & Ensembles',
		description: 'World-class orchestras preserving and performing Kazakh musical heritage.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/KurmangazyKazakhStateOrchestra',
		galleryImages: [
			{ publicId: 'content/pages/heritage/kazakhMelodies/KurmangazyKazakhStateOrchestra', caption: 'Kurmangazy Orchestra' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/KazakhStateSymphonyOrchestra', caption: 'Kazakh State Symphony' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/OtyrarSazy', caption: 'Otyrar Sazy' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/ShabytNationalEnsemble', caption: 'Shabyt Ensemble' },
			{ publicId: 'content/pages/heritage/kazakhMelodies/AstanaOperaOrchestra', caption: 'Astana Opera Orchestra' }
		],
		contentMarkdown: `Kazakhstan's orchestras and ensembles represent the pinnacle of musical excellence, blending traditional folk instruments with classical training to create unique soundscapes that captivate audiences worldwide.

**Kurmangazy Kazakh State Orchestra of Folk Instruments** — Named after the legendary dombra composer, this world-renowned orchestra is the crown jewel of Kazakh traditional music. Founded in 1934, it brings together the nation's finest instrumentalists who perform on dombras, kobyzes, syrnays, and other traditional instruments. Their repertoire spans ancient melodies to contemporary compositions, and they have toured internationally, introducing global audiences to the rich tapestry of Kazakh instrumental music.

**Kazakh State Symphony Orchestra** — The nation's premier classical orchestra, established in 1935, performs both Western classical masterpieces and works by Kazakh composers. Their performances often feature pieces that incorporate traditional Kazakh themes and instruments, creating a unique fusion of East and West. The orchestra regularly performs at the Astana Opera and has collaborated with renowned conductors and soloists from around the world.

**Otyrar Sazy** — This legendary folk ensemble, founded in 1980, specializes in recreating and performing ancient Kazakh music. Their research into historical manuscripts and oral traditions has preserved countless melodies that might otherwise have been lost. Using authentic instruments and performance practices, Otyrar Sazy transports listeners back to the time of nomadic bards and epic storytellers.

**Shabyt National Ensemble** — Known for their innovative approach to folk music, Shabyt blends traditional Kazakh instruments with contemporary arrangements. Their performances often feature visual elements and choreography, creating immersive cultural experiences. They have represented Kazakhstan at international festivals and cultural events, winning numerous awards for their artistic excellence.

**Astana Opera Orchestra** — The resident orchestra of the magnificent Astana Opera house, this ensemble performs operas, ballets, and symphonic concerts at one of the world's most acoustically perfect venues. Their repertoire includes both European classics and Kazakh operatic works, such as those by composers like Yerkegali Rakhmadiyev and Mukhtar Kulzhanov.`
	},
	{
		id: 'kazakh-aitys',
		order: 7,
		title: 'Kazakh Aitys — The Art of Improvisation',
		description: 'The ancient tradition of competitive singing and poetic duels.',
		imagePublicId: 'content/pages/heritage/kazakhMelodies/aitys',
		galleryImages: [],
		contentMarkdown: `**Aitys** is one of Kazakhstan's most vibrant and entertaining musical traditions — a competitive art form where two performers, known as **aityskers**, engage in a spontaneous battle of wits, poetry, and song. Part debate, part concert, part comedy show, Aitys represents the pinnacle of Kazakh oral improvisation.

**The Duel of Minds** — Two aityskers face each other, accompanied by dombra players, and take turns delivering improvised verses. They must respond to each other's arguments, counter with sharp wit, and entertain the audience simultaneously. Topics range from philosophical questions about life and love to playful teasing and social commentary. The competitors must think, rhyme, and sing in real-time, creating a thrilling spectacle of mental agility.

**The Performers** — Aityskers are highly respected artists who spend years mastering their craft. They must have:
- ** encyclopedic knowledge** of traditional poetry, proverbs, and folklore
- **Musical virtuosity** to accompany themselves on the dombra while singing
- **Quick wit** to craft clever responses in seconds
- **Stage presence** to captivate and entertain thousands

**Famous Competitions** — Traditional Aitys competitions draw massive crowds, especially during Nauryz celebrations and other festivals. The national Aitys competitions feature the country's best performers competing for prestige and prizes. Audiences cheer for their favorites as the performers trade increasingly clever and entertaining verses.

**Modern Aitys** — While rooted in ancient tradition, Aitys continues to evolve. Contemporary aityskers incorporate modern themes, social issues, and even humor about daily life. Television and internet broadcasts have brought Aitys to new generations, ensuring this unique art form remains a living, breathing part of Kazakh culture.`
	}
];

export const load: PageServerLoad = async () => {
	if (!adminDB) {
		return {
			page: FALLBACK_PAGE,
			sections: FALLBACK_SECTIONS
		};
	}

	try {
		const pageRef = adminDB.collection('pages').doc('heritage').collection('articles').doc('kazakh-melodies');
		const [pageSnap, sectionsSnap] = await Promise.all([
			pageRef.get(),
			pageRef.collection('sections').orderBy('order', 'asc').get()
		]);

		const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};

		const sections = sectionsSnap.docs.length
			? sectionsSnap.docs.map((doc) =>
					serializeDates({
						id: doc.id,
						...doc.data()
					})
				)
			: FALLBACK_SECTIONS;

		return {
			page: { ...FALLBACK_PAGE, ...page },
			sections
		};
	} catch (error) {
		console.error('[culture/kazakh-melodies] load error', error);
		return {
			page: FALLBACK_PAGE,
			sections: FALLBACK_SECTIONS
		};
	}
};
