import { adminDB } from '$lib/server/firebaseAdmin';
import { error } from '@sveltejs/kit';
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
		title: 'Signature Dishes & Drinks | Food & Drinks | VeryNice',
		description: 'Explore the iconic dishes and traditional drinks of Kazakhstan.'
	},
	mainTitle: 'Signature Dishes & Traditional Drinks of Kazakhstan',
	headerDescription: 'Discover the flavors and beverages that define Kazakh cuisine.',
	heroKicker: 'Taste the Tradition',
	location: 'Kazakhstan',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	breadcrumbs: [
		{ label: 'Home', href: '/' },
		{ label: 'Food & Drinks', href: '/food-drink' },
		{ label: 'Signature Dishes' }
	],
	headerBackgroundPublicId: 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes'
};

const FALLBACK_CATEGORIES = [
	{
		id: 'main-meat',
		title: 'Main Meat Dishes',
		description: 'The heart of Kazakh cuisine — hearty meat dishes that have sustained nomads for centuries.',
		order: 1
	},
	{
		id: 'horse-meat',
		title: 'Horse Meat Specialties',
		description: 'Prized delicacies made from horse meat, central to Kazakh culinary tradition and celebrations.',
		order: 2
	},
	{
		id: 'soups-broths',
		title: 'Soups & Broths',
		description: 'Warming, nourishing soups that accompany every traditional meal.',
		order: 3
	},
	{
		id: 'offal-ritual',
		title: 'Offal & Ritual Dishes',
		description: 'Sacred dishes served during ceremonies, honoring guests and ancestors.',
		order: 4
	},
	{
		id: 'bread-dough',
		title: 'Bread & Dough Foods',
		description: 'From fried dough to flatbreads — essential accompaniments to every Kazakh meal.',
		order: 5
	},
	{
		id: 'dairy-fermented',
		title: 'Dairy Products & Fermented Foods',
		description: 'Traditional dairy that reflects the nomadic herding lifestyle.',
		order: 6
	},
	{
		id: 'grain-based',
		title: 'Grain-Based Dishes',
		description: 'Wholesome porridges and soups made from millet and wheat.',
		order: 7
	},
	{
		id: 'sweets-snacks',
		title: 'Sweets & Snacks',
		description: 'Traditional treats enjoyed with tea and during celebrations.',
		order: 8
	},
	{
		id: 'traditional-drinks',
		title: 'Traditional Drinks',
		description: 'Fermented dairy and grain-based beverages that define Kazakh hospitality.',
		order: 9
	}
];

const FALLBACK_DISHES = [
	// === MAIN MEAT DISHES ===
	{
		id: 'beshbarmak',
		title: 'Beshbarmak (Ет)',
		kazakh: 'Бешбармақ / Ет',
		category: 'main-meat',
		description: 'The national dish: hand-cut noodles, tender meat, and rich broth served family-style.',
		longDescription: 'Beshbarmak, meaning "five fingers" in Kazakh, is traditionally eaten with hands. The original and authentic Kazakh name for this dish is simply "Et" (meat), reflecting its essence as boiled meat served with flat noodles. This iconic dish features large flat noodles topped with boiled horse or lamb meat, served in a rich broth called sorpa. It is the centerpiece of celebrations and gatherings, symbolizing unity and hospitality.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/beshbarmak',
		tier: 1,
		region: 'Nationwide',
		order: 1
	},
	{
		id: 'kuyrdak',
		title: 'Kuyrdak',
		kazakh: 'Қуырдақ',
		category: 'main-meat',
		description: 'Fried offal and meat — a rich, flavorful dish served fresh.',
		longDescription: 'Kuyrdak is a traditional fried dish made from freshly slaughtered animal organs — liver, heart, kidneys, and lungs — along with meat and fat. It is typically the first dish prepared after an animal is slaughtered, served hot to honor guests.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kuyrdak',
		tier: 1,
		region: 'Nationwide',
		order: 2
	},
	{
		id: 'kazan-zhappa',
		title: 'Kazan-Zhappa',
		kazakh: 'Қазанжаппа',
		category: 'main-meat',
		description: 'Meat slow-cooked in a covered kazan (cauldron).',
		longDescription: 'Kazan-Zhappa is a method of cooking meat in a tightly sealed kazan (cast-iron cauldron). The meat steams in its own juices, becoming incredibly tender. This technique preserves all the nutrients and creates a rich, concentrated flavor.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kazan-zhappa',
		tier: 2,
		region: 'Nationwide',
		order: 3
	},
	{
		id: 'chyzhmyzh',
		title: 'Chyzhmyzh',
		kazakh: 'Шыжмыж',
		category: 'main-meat',
		description: 'Kazakh haggis — sheep organs stuffed in stomach.',
		longDescription: 'Chyzhmyzh is the Kazakh equivalent of Scottish haggis. It is made from sheep\'s organs (heart, liver, and lungs) minced and mixed with fat, onions, and spices, then stuffed into the animal\'s stomach and boiled or steamed. This ancient dish represents the nomadic tradition of using every part of the animal.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/zhyzhmyzh',
		tier: 2,
		region: 'Nationwide',
		order: 4
	},
	{
		id: 'karyn-burme',
		title: 'Karyn Burme',
		kazakh: 'Қарын бүрме',
		category: 'main-meat',
		description: 'Stuffed stomach rolled with meat and fat.',
		longDescription: 'Karyn Burme is a traditional dish where the cleaned stomach is stuffed with layers of meat, fat, and sometimes rice or grains, then rolled and tied before being boiled or steamed. The result is a flavorful, hearty dish with a unique texture.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/karynburme',
		tier: 2,
		region: 'Nationwide',
		order: 5
	},
	{
		id: 'bukpa',
		title: 'Steamed Meat (Бұқпа)',
		kazakh: 'Бұқпа',
		category: 'main-meat',
		description: 'Meat steamed to perfection, preserving all juices.',
		longDescription: 'Bukpa is steamed meat cooked in a special pot where the meat never touches water directly. This gentle cooking method preserves the natural juices and creates exceptionally tender meat with a pure, clean flavor.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/steamedmeat',
		tier: 2,
		region: 'Nationwide',
		order: 6
	},
	{
		id: 'sur-et',
		title: 'Dried/Cured Meat (Сүр ет)',
		kazakh: 'Сүр ет',
		category: 'main-meat',
		description: 'Air-dried and cured meat for long preservation.',
		longDescription: 'Sur et is meat that has been salted and air-dried, a preservation technique essential for nomadic life. The drying process concentrates the flavors and allows the meat to be stored for months without refrigeration.',
		publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/driedcuredmeat',
		tier: 2,
		region: 'Nationwide',
		order: 7
	},

	// === HORSE MEAT SPECIALTIES ===
	{
		id: 'kazy',
		title: 'Kazy',
		kazakh: 'Қазы',
		category: 'horse-meat',
		description: 'Horse rib sausage — the most prized delicacy.',
		longDescription: 'Kazy is a traditional sausage made from horse rib meat and fat, stuffed into natural casing and either smoked or air-dried. It is considered the most prestigious dish, served to honored guests. The rich, marbled meat has a distinctive flavor unlike any other.',
		publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/kazy',
		tier: 1,
		region: 'Nationwide',
		order: 8
	},
	{
		id: 'karta',
		title: 'Karta',
		kazakh: 'Қарта',
		category: 'horse-meat',
		description: 'Horse rectum delicacy — fatty and rich.',
		longDescription: 'Karta is made from the cleaned and prepared horse rectum, which is naturally fatty. It is boiled or smoked and served sliced. Despite its unusual origin, it is highly valued for its rich, buttery texture and is considered a ceremonial delicacy.',
		publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/karta',
		tier: 2,
		region: 'Nationwide',
		order: 9
	},
	{
		id: 'shuzhuk',
		title: 'Shuzhuk',
		kazakh: 'Шұжық',
		category: 'horse-meat',
		description: 'Horse meat sausage with a distinctive flavor.',
		longDescription: 'Shuzhuk is a horse meat sausage made from mixed cuts of meat and fat. It is prepared through smoking or drying and has a more intense flavor than kazy. Often served sliced as an appetizer or alongside beshbarmak.',
		publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/shuzhuk',
		tier: 1,
		region: 'Nationwide',
		order: 10
	},
	{
		id: 'zhaya',
		title: 'Zhaya',
		kazakh: 'Жая',
		category: 'horse-meat',
		description: 'Dried horse thigh — salted and air-cured.',
		longDescription: 'Zhaya is the salted and dried thigh meat of a horse. The large cut is cured with salt and spices, then hung to dry for several weeks. The result is a firm, flavorful meat that can be sliced thin and enjoyed year-round.',
		publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhaya',
		tier: 2,
		region: 'Nationwide',
		order: 11
	},
	{
		id: 'zhal',
		title: 'Zhal',
		kazakh: 'Жал',
		category: 'horse-meat',
		description: 'Horse neck fat — a ceremonial delicacy.',
		longDescription: 'Zhal is the subcutaneous fat from the horse\'s neck, considered one of the finest parts. It is soft, rich, and melts in the mouth. Traditionally served to the most honored guest at a feast, representing the highest form of respect.',
		publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhal',
		tier: 1,
		region: 'Nationwide',
		order: 12
	},

	// === SOUPS & BROTHS ===
	{
		id: 'sorpa',
		title: 'Sorpa',
		kazakh: 'Сорпа',
		category: 'soups-broths',
		description: 'Rich meat broth — the soul of Kazakh cooking.',
		longDescription: 'Sorpa is the rich broth produced from boiling meat for beshbarmak and other dishes. It is never wasted — served hot in bowls (kese) before or after the main dish. The clear, golden broth is believed to be highly nutritious and restorative.',
		publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/sorpa',
		tier: 1,
		region: 'Nationwide',
		order: 13
	},
	{
		id: 'kespe',
		title: 'Kespe',
		kazakh: 'Кеспе',
		category: 'soups-broths',
		description: 'Noodle soup with homemade noodles.',
		longDescription: 'Kespe refers to both the homemade noodles and the soup made with them. The noodles are hand-cut from rolled dough and cooked in meat broth. It is a lighter everyday dish compared to beshbarmak but equally comforting.',
		publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/kespe',
		tier: 2,
		region: 'Nationwide',
		order: 14
	},

	// === OFFAL & RITUAL DISHES ===
	{
		id: 'bas-tartu',
		title: 'Sheep Head Ritual (Бас тарту)',
		kazakh: 'Бас тарту / Бас табақ',
		category: 'offal-ritual',
		description: 'Ceremonial serving of the sheep\'s head to honored guests.',
		longDescription: 'Bas tartu is the ritual of presenting a boiled sheep\'s head to the most respected guest. The guest then distributes parts to others according to tradition: ears to young people (to listen well), eyes to those who should be observant, and so on. It is the highest honor in Kazakh hospitality.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/sheepheadritual',
		tier: 1,
		region: 'Nationwide',
		order: 18
	},
	{
		id: 'til',
		title: 'Tongue (Тіл)',
		kazakh: 'Тіл',
		category: 'offal-ritual',
		description: 'Boiled tongue — tender and flavorful.',
		longDescription: 'Til (tongue) is boiled until tender, then peeled and sliced. It has a uniquely smooth texture and rich flavor. In ceremonies, it may be given to young people or to someone whose speech is valued, symbolizing eloquence.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/tongue',
		tier: 2,
		region: 'Nationwide',
		order: 20
	},
	{
		id: 'bauyr',
		title: 'Liver (Бауыр)',
		kazakh: 'Бауыр',
		category: 'offal-ritual',
		description: 'Fried or boiled liver — rich in nutrients.',
		longDescription: 'Bauyr (liver) is typically fried fresh in kuyrdak or boiled and served sliced. It is highly valued for its nutritional content and is often the first part cooked after slaughter. The word also means "brother" in Kazakh, reflecting its importance.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/liver',
		tier: 2,
		region: 'Nationwide',
		order: 21
	},
	{
		id: 'zhurek',
		title: 'Heart (Жүрек)',
		kazakh: 'Жүрек',
		category: 'offal-ritual',
		description: 'The heart — a symbol of courage and sincerity.',
		longDescription: 'Zhurek (heart) is boiled or fried and served sliced. In ceremonial contexts, it may be given to a young person as a symbol of courage. The dense, lean meat has a distinctive flavor and firm texture.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/heart',
		tier: 2,
		region: 'Nationwide',
		order: 22
	},
	{
		id: 'okpe-bauyr',
		title: 'Lungs and Liver (Өкпе-бауыр)',
		kazakh: 'Өкпе-бауыр',
		category: 'offal-ritual',
		description: 'Combined dish of lungs and liver.',
		longDescription: 'Okpe-bauyr combines lungs and liver, often prepared together in kuyrdak. The contrasting textures — spongy lungs and dense liver — create an interesting dish. Both are highly nutritious and traditionally wasted nothing from the animal.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/lungsandliver',
		tier: 3,
		region: 'Nationwide',
		order: 23
	},
	{
		id: 'karyn',
		title: 'Stomach (Қарын)',
		kazakh: 'Қарын',
		category: 'offal-ritual',
		description: 'Cleaned and cooked stomach — chewy and hearty.',
		longDescription: 'Karyn (stomach/tripe) is thoroughly cleaned and boiled until tender. It has a distinctive chewy texture and is often served in soups or sliced as part of a meat platter. It requires careful preparation but is valued for its unique character.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/stomach',
		tier: 3,
		region: 'Nationwide',
		order: 24
	},
	{
		id: 'ultabar',
		title: 'Abomasum (Ұлтабар)',
		kazakh: 'Ұлтабар',
		category: 'offal-ritual',
		description: 'The fourth stomach chamber — a traditional delicacy.',
		longDescription: 'Ultabar is the abomasum (fourth stomach) of ruminant animals. After thorough cleaning, it is stuffed with meat and rice or simply boiled. It has a softer texture than regular tripe and is considered a special dish.',
		publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/abomasum',
		tier: 3,
		region: 'Nationwide',
		order: 25
	},

	// === BREAD & DOUGH FOODS ===
	{
		id: 'baursak',
		title: 'Baursak',
		kazakh: 'Бауырсақ',
		category: 'bread-dough',
		description: 'Golden fried dough balls — present at every gathering.',
		longDescription: 'Baursak are small pieces of dough deep-fried until golden. Light, airy, and slightly sweet, they accompany every meal and celebration. The name comes from "bauyr" (liver/kinship), symbolizing the close bonds formed when sharing food.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/baursak',
		tier: 1,
		region: 'Nationwide',
		order: 26
	},
	{
		id: 'shelpek',
		title: 'Shelpek',
		kazakh: 'Шелпек',
		category: 'bread-dough',
		description: 'Flat fried bread — made for remembrance.',
		longDescription: 'Shelpek are thin, round flatbreads fried in oil. They are traditionally prepared on Fridays and during memorial gatherings to honor the deceased. Seven shelpek are made to represent the seven layers of heaven.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/shelpek',
		tier: 1,
		region: 'Nationwide',
		order: 27
	},
	{
		id: 'taba-nan',
		title: 'Taba Nan',
		kazakh: 'Таба нан',
		category: 'bread-dough',
		description: 'Pan-fried bread cooked in a taba (pan).',
		longDescription: 'Taba nan is bread cooked in a special shallow pan called taba. The bread is fried on both sides until golden, creating a crispy exterior and soft interior. It is a quick, everyday bread made in homes across Kazakhstan.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/taba-nan',
		tier: 2,
		region: 'Nationwide',
		order: 28
	},
	{
		id: 'kattama',
		title: 'Kattama',
		kazakh: 'Қаттама',
		category: 'bread-dough',
		description: 'Layered flatbread with butter between layers.',
		longDescription: 'Kattama is a layered flatbread made by folding buttered dough multiple times before cooking. This creates flaky, rich layers similar to paratha. It is often served with tea or as an accompaniment to meat dishes.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/kattama',
		tier: 2,
		region: 'Nationwide',
		order: 29
	},
	{
		id: 'kulshe',
		title: 'Külshe',
		kazakh: 'Күлше',
		category: 'bread-dough',
		description: 'Oven-baked bread — traditional and hearty.',
		longDescription: 'Külshe is a traditional bread baked in a clay oven (tandyr) or modern oven. The thick, round loaves have a dense crumb and crispy crust. It keeps well and was ideal for nomadic travel.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/k-lshe',
		tier: 2,
		region: 'Nationwide',
		order: 30
	},
	{
		id: 'kuimak',
		title: 'Kuimak (Pancakes)',
		kazakh: 'Құймақ',
		category: 'bread-dough',
		description: 'Traditional thick pancakes served with cream.',
		longDescription: 'Kuimak are thick, yeasted pancakes poured into a hot pan with butter or oil. They are served stacked and topped with kaymak (sour cream) or butter. A beloved breakfast and tea-time treat.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/kuimak',
		tier: 2,
		region: 'Nationwide',
		order: 31
	},
	{
		id: 'kazan-nan',
		title: 'Kazan Nan',
		kazakh: 'Қазан нан',
		category: 'bread-dough',
		description: 'Bread baked inside a kazan (cauldron).',
		longDescription: 'Kazan nan is bread baked inside a covered kazan over a fire. The cast-iron pot creates an even heat, producing bread with a crispy crust and soft interior. This method was practical for cooking during travel.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/kazannan',
		tier: 3,
		region: 'Nationwide',
		order: 32
	},
	{
		id: 'talkan-nan',
		title: 'Talkan Nan',
		kazakh: 'Талқан нан',
		category: 'bread-dough',
		description: 'Bread made with roasted flour for nutty flavor.',
		longDescription: 'Talkan nan is made with talkan (roasted grain flour), giving it a distinctive nutty flavor and darker color. This ancient bread-making technique creates a more nutritious and flavorful bread.',
		publicId: 'content/pages/foodDrinks/signatureDishes/bread-and-dough-foods/talkannan',
		tier: 3,
		region: 'Nationwide',
		order: 33
	},

	// === DAIRY PRODUCTS & FERMENTED FOODS ===
	{
		id: 'kurt',
		title: 'Kurt',
		kazakh: 'Құрт',
		category: 'dairy-fermented',
		description: 'Dried curd balls — a portable, tangy snack.',
		longDescription: 'Kurt are small balls of dried, salted curd cheese. They can be stored for months without refrigeration, making them ideal for nomadic life. The flavor ranges from mildly tangy to intensely salty depending on aging. Often enjoyed as a snack with tea.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/kurt',
		tier: 1,
		region: 'Nationwide',
		order: 34
	},
	{
		id: 'suzbe',
		title: 'Süzbe',
		kazakh: 'Сүзбе',
		category: 'dairy-fermented',
		description: 'Fresh strained curd — soft and creamy.',
		longDescription: 'Süzbe is fresh curd made by straining fermented milk through cloth. It has a soft, spreadable texture similar to quark or cream cheese. It is eaten fresh with sugar or honey, or used as a base for other dairy products.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/s-zbe',
		tier: 2,
		region: 'Nationwide',
		order: 35
	},
	{
		id: 'irimshik',
		title: 'Irimshik',
		kazakh: 'Ірімшік',
		category: 'dairy-fermented',
		description: 'Fresh pressed cheese — mild and versatile.',
		longDescription: 'Irimshik is a fresh cheese made by heating milk with a souring agent, then pressing the curds. It can be eaten fresh and soft or dried for preservation. The mild flavor makes it versatile for both sweet and savory uses.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/irimshik',
		tier: 2,
		region: 'Nationwide',
		order: 36
	},
	{
		id: 'katyk',
		title: 'Katyk',
		kazakh: 'Қатық',
		category: 'dairy-fermented',
		description: 'Thick sour milk — a probiotic staple.',
		longDescription: 'Katyk is fermented milk similar to yogurt but with a tangier flavor. It is made by culturing milk with a specific starter. Served as a drink, with meals, or used in cooking. It is believed to aid digestion and promote health.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/katyk',
		tier: 2,
		region: 'Nationwide',
		order: 37
	},
	{
		id: 'kaymak',
		title: 'Kaymak',
		kazakh: 'Қаймақ',
		category: 'dairy-fermented',
		description: 'Rich sour cream — essential for many dishes.',
		longDescription: 'Kaymak is thick, rich sour cream skimmed from the top of fermented milk. It has a higher fat content than regular sour cream and a slightly tangy flavor. It accompanies kuimak, baursak, and many other dishes.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/kaymak',
		tier: 1,
		region: 'Nationwide',
		order: 38
	},
	{
		id: 'sary-mai',
		title: 'Sary Mai (Clarified Butter)',
		kazakh: 'Сары май',
		category: 'dairy-fermented',
		description: 'Golden clarified butter — pure and aromatic.',
		longDescription: 'Sary mai (yellow butter) is clarified butter made by slowly heating butter until the milk solids separate. The golden liquid is strained and can be stored for long periods. It has a rich, nutty flavor and high smoke point.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/sarymai',
		tier: 2,
		region: 'Nationwide',
		order: 39
	},
	{
		id: 'balkaymak',
		title: 'Balkaymak',
		kazakh: 'Балқаймақ',
		category: 'dairy-fermented',
		description: 'Sweet cream dessert with honey.',
		longDescription: 'Balkaymak is a sweet dish made by cooking kaymak (cream) with flour and honey or sugar. The result is a rich, caramelized cream dessert. It is a beloved comfort food often enjoyed with fresh bread.',
		publicId: 'content/pages/foodDrinks/signatureDishes/dairy-products-and-fermented-foods/balkaymak',
		tier: 2,
		region: 'Nationwide',
		order: 40
	},

	// === GRAIN-BASED DISHES ===
	{
		id: 'tary',
		title: 'Tary (Millet Porridge)',
		kazakh: 'Тары',
		category: 'grain-based',
		description: 'Simple millet porridge — nutritious and filling.',
		longDescription: 'Tary is cooked millet, one of the oldest grains used by Kazakh nomads. The porridge can be made with milk or water, sweetened or savory. It is easy to digest, nutritious, and was a staple during long journeys.',
		publicId: 'content/pages/foodDrinks/signatureDishes/grain-based-dishes/tary',
		tier: 2,
		region: 'Nationwide',
		order: 41
	},
	{
		id: 'tary-kozhe',
		title: 'Tary Kozhe',
		kazakh: 'Тары көже',
		category: 'grain-based',
		description: 'Millet soup — light and refreshing.',
		longDescription: 'Tary kozhe is a fermented millet soup, light and slightly sour. It is especially popular in summer as a refreshing, probiotic-rich drink. The fermentation process makes it easily digestible.',
		publicId: 'content/pages/foodDrinks/signatureDishes/grain-based-dishes/tarykozhe',
		tier: 3,
		region: 'Nationwide',
		order: 42
	},
	{
		id: 'bidai-kozhe',
		title: 'Bidai Kozhe',
		kazakh: 'Бидай көже',
		category: 'grain-based',
		description: 'Wheat soup — hearty and warming.',
		longDescription: 'Bidai kozhe is a soup made from wheat grains cooked until soft. It can be made with meat broth for a savory version or with milk for a milder taste. A simple but satisfying dish.',
		publicId: 'content/pages/foodDrinks/signatureDishes/grain-based-dishes/bidaikozhe',
		tier: 3,
		region: 'Nationwide',
		order: 43
	},
	{
		id: 'kara-kozhe',
		title: 'Kara Kozhe',
		kazakh: 'Қара көже',
		category: 'grain-based',
		description: '"Black soup" — made with roasted grains.',
		longDescription: 'Kara kozhe (black soup) gets its name from the dark color of roasted grains used in preparation. The roasting gives a distinctive smoky, nutty flavor. It is a traditional dish with ancient origins.',
		publicId: 'content/pages/foodDrinks/signatureDishes/grain-based-dishes/karakozhe',
		tier: 3,
		region: 'Nationwide',
		order: 44
	},
	{
		id: 'nauryz-kozhe',
		title: 'Nauryz Kozhe',
		kazakh: 'Наурыз көже',
		category: 'grain-based',
		description: 'Seven-ingredient soup for the spring festival.',
		longDescription: 'Nauryz kozhe is a ritual soup prepared for Nauryz (spring new year). It must contain seven ingredients representing seven elements: water, meat, salt, fat, flour, grain, and milk. Each symbolizes aspects of life: joy, growth, prosperity, health, wisdom, heaven\'s protection, and earth\'s richness.',
		publicId: 'content/pages/foodDrinks/signatureDishes/grain-based-dishes/nauryzkozhe',
		tier: 1,
		region: 'Nationwide',
		order: 45
	},

	// === SWEETS & SNACKS ===
	{
		id: 'zhent',
		title: 'Zhent',
		kazakh: 'Жент',
		category: 'sweets-snacks',
		description: 'Sweet made from millet and dried curd.',
		longDescription: 'Zhent is a traditional confection made by mixing talkan (roasted millet flour) with dried curd, sugar, and butter. It is shaped into balls or pressed into molds. The combination of nutty grain and tangy curd creates a unique flavor.',
		publicId: 'content/pages/foodDrinks/signatureDishes/sweets-and-snacks/zhent',
		tier: 1,
		region: 'Nationwide',
		order: 46
	},
	{
		id: 'talkan',
		title: 'Talkan',
		kazakh: 'Талқан',
		category: 'sweets-snacks',
		description: 'Roasted grain flour — nutritious and versatile.',
		longDescription: 'Talkan is flour made from roasted wheat, barley, or millet. It can be eaten as a snack mixed with sugar and butter, or used in drinks and other preparations. The roasting process brings out a pleasant nutty flavor.',
		publicId: 'content/pages/foodDrinks/signatureDishes/sweets-and-snacks/talkan',
		tier: 2,
		region: 'Nationwide',
		order: 47
	},
	{
		id: 'maisok',
		title: 'Maisök',
		kazakh: 'Майсөк',
		category: 'sweets-snacks',
		description: 'Buttered millet — a rich, sweet treat.',
		longDescription: 'Maisök is made by mixing cooked millet with generous amounts of butter and sugar. The result is a rich, indulgent treat with a porridge-like consistency. It is particularly popular among children.',
		publicId: 'content/pages/foodDrinks/signatureDishes/sweets-and-snacks/mais-k',
		tier: 3,
		region: 'Nationwide',
		order: 48
	},
	{
		id: 'kospa',
		title: 'Kospa',
		kazakh: 'Қоспа',
		category: 'sweets-snacks',
		description: 'Mixed curd dessert with various additions.',
		longDescription: 'Kospa is a mixed dessert combining fresh curd with various ingredients such as dried fruits, nuts, sugar, and cream. The name means "mixture," and recipes vary by family. It is a customizable treat enjoyed during celebrations.',
		publicId: 'content/pages/foodDrinks/signatureDishes/sweets-and-snacks/kospa',
		tier: 3,
		region: 'Nationwide',
		order: 49
	},

	// === TRADITIONAL DRINKS ===
	{
		id: 'kymyz',
		title: 'Kymyz',
		kazakh: 'Қымыз',
		category: 'traditional-drinks',
		description: 'Fermented mare’s milk — the signature drink of the steppe.',
		longDescription: 'Kymyz is fermented mare\'s milk, slightly sparkling with a sour, tangy flavor. It is rich in vitamins and has been a staple of nomadic life for thousands of years. It is believed to have healing properties.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/kymyz',
		tier: 1,
		region: 'Nationwide',
		order: 50
	},
	{
		id: 'shubat',
		title: 'Shubat',
		kazakh: 'Шұбат',
		category: 'traditional-drinks',
		description: 'Fermented camel’s milk — richer and creamier than kymyz.',
		longDescription: 'Shubat is fermented camel milk, known for its high fat content (up to 8%) and thick, creamy texture. It is particularly popular in western and southern Kazakhstan where camels are raised.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/shubat',
		tier: 1,
		region: 'West & South',
		order: 51
	},
	{
		id: 'airan',
		title: 'Airan',
		kazakh: 'Айран',
		category: 'traditional-drinks',
		description: 'Yogurt-based drink, often slightly salted.',
		longDescription: 'Airan is a cold yogurt drink diluted with water and often lightly salted. It is refreshing in summer and aids digestion. It is a daily staple in many Kazakh households.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/airan',
		tier: 2,
		region: 'Nationwide',
		order: 52
	},
	{
		id: 'talkan-su',
		title: 'Talkan Su',
		kazakh: 'Талқан су',
		category: 'traditional-drinks',
		description: 'Roasted grain flour mixed with water or milk.',
		longDescription: 'Talkan su is a simple, nutritious drink made by mixing talkan (roasted grain flour) with water, milk, or broth. It was a vital energy source for nomads on the move.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/talkan-su',
		tier: 3,
		region: 'Nationwide',
		order: 53
	},
	{
		id: 'zharma',
		title: 'Zharma',
		kazakh: 'Жарма',
		category: 'traditional-drinks',
		description: 'Grain drink or light porridge, sometimes fermented.',
		longDescription: 'Zharma is made from crushed wheat or barley, boiled and then mixed with airan or kefir. It can be served fresh or fermented for a tangy taste. It is filling and thirst-quenching.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/zharma',
		tier: 3,
		region: 'Nationwide',
		order: 54
	},
	{
		id: 'kara-shai',
		title: 'Kara Shai (Black Tea)',
		kazakh: 'Қара шай',
		category: 'traditional-drinks',
		description: 'Strong black tea, enjoyed pure.',
		longDescription: 'Kara shai is strong black tea served without milk. While milk tea is more common, kara shai is appreciated after heavy meat meals to aid digestion.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/kara-shai',
		tier: 2,
		region: 'Nationwide',
		order: 55
	},
	{
		id: 'sutty-shai',
		title: 'Sutty Shai (Milk Tea)',
		kazakh: 'Сүтті шай',
		category: 'traditional-drinks',
		description: 'Tea with milk — the symbol of Kazakh hospitality.',
		longDescription: 'Sutty shai is black tea served with milk (often rich cow or camel milk). It is the first thing offered to any guest. Salt or butter might be added in some regions, but plain milk tea is the national standard.',
		publicId: 'content/pages/foodDrinks/signatureDishes/traditional-drinks/sutty-shai',
		tier: 1,
		region: 'Nationwide',
		order: 56
	}
];

export const load: PageServerLoad = async () => {
	let page = FALLBACK_PAGE;
	let categories = FALLBACK_CATEGORIES;
	let dishes = FALLBACK_DISHES;

	if (adminDB) {
		try {
			// Data is stored inside pages/food-drink/
			const pageRef = adminDB.collection('pages').doc('food-drink');
			
			// Fetch page data only - categories and dishes use fallback until properly seeded
			const pageSnap = await pageRef.get();

			// Process page data (signature dishes metadata is stored as fields on food-drink)
			if (pageSnap.exists) {
				const pageData = serializeDates(pageSnap.data());
				page = {
					...FALLBACK_PAGE,
					mainTitle: pageData.signatureDishesTitle || FALLBACK_PAGE.mainTitle,
					headerDescription: pageData.signatureDishesDescription || FALLBACK_PAGE.headerDescription,
					heroKicker: pageData.signatureDishesHeroKicker || FALLBACK_PAGE.heroKicker,
					headerBackgroundPublicId: pageData.signatureDishesHeroPublicId || FALLBACK_PAGE.headerBackgroundPublicId,
					articleViews: pageData.articleViews || 0,
					articleLikes: pageData.articleLikes || 0,
					articleComments: pageData.articleComments || 0
				};
			}

			// Try to load categories - only use if they have the proper structure
			try {
				const categoriesSnap = await pageRef.collection('signatureDishesCategories').get();
				if (!categoriesSnap.empty) {
					const loadedCategories = categoriesSnap.docs.map((doc) => 
						serializeDates({ id: doc.id, ...doc.data() })
					);
					// Only use Firebase categories if they have proper structure (title and order fields)
					if (loadedCategories.length > 0 && loadedCategories[0].title && loadedCategories[0].order !== undefined) {
						categories = loadedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
						console.log(`[signature-dishes] Loaded ${categories.length} categories from Firebase`);
					}
				}
			} catch (catErr) {
				console.log('[signature-dishes] Categories not found in Firebase, using fallback');
			}

			// Try to load dishes - only use if they have the proper structure
			try {
				const dishesSnap = await pageRef.collection('signatureDishes').get();
				if (!dishesSnap.empty) {
					const loadedDishes = dishesSnap.docs.map((doc) => 
						serializeDates({ id: doc.id, ...doc.data() })
					);
					// Only use Firebase dishes if they have proper structure (category and order fields)
					if (loadedDishes.length > 0 && loadedDishes[0].category && loadedDishes[0].order !== undefined) {
						dishes = loadedDishes.sort((a, b) => (a.order || 0) - (b.order || 0));
						console.log(`[signature-dishes] Loaded ${dishes.length} dishes from Firebase`);
					} else {
						console.log('[signature-dishes] Firebase dishes missing category/order fields, using fallback');
					}
				}
			} catch (dishErr) {
				console.log('[signature-dishes] Dishes not found in Firebase, using fallback');
			}

		} catch (err) {
			console.error('[signature-dishes] Error loading from Firebase, using fallback:', err);
		}
	}

	console.log(`[signature-dishes] Returning: ${categories.length} categories, ${dishes.length} dishes`);

	return {
		page,
		categories,
		dishes
	};
};
