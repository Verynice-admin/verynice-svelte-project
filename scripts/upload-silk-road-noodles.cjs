/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

if (process.env.CLOUDINARY_URL) {
	cloudinary.config(process.env.CLOUDINARY_URL);
} else {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET
	});
}

const localDir =
	process.env.SILK_ROAD_NOODLES_LOCAL_DIR ||
	'C:/Users/conta/Desktop/Verynice_stock_photos/Silk_Road_Noodles';

const cloudinaryFolder = 'content/pages/foodDrinks/silkRoadNoodles';

const imageMap = {
	hero: 'hero',
	originsandkazakhstanidentity: 'originsAndKazakhstanIdentity',
	handpulledcraftandnoodletexture: 'handPulledCraftAndNoodleTexture',
	brothandsaucearchitecture: 'brothAndSauceArchitecture',
	coreingredientsandseasonalvariations: 'coreIngredientsAndSeasonalVariations',
	majorvariantstravelersshouldknow: 'majorVariantsTravelersShouldKnow',
	howtoeatlagmanlikelocal: 'howToEatLagmanLikeLocal',
	bestregionsandvenuesignals: 'bestRegionsAndVenueSignals',
	whytravelersloveit: 'whyTravelersLoveIt',
	mainimgaelagman: 'hero',
	suyru: 'handPulledCraftAndNoodleTexture',
	guyru: 'brothAndSauceArchitecture',
	qovurmalagman: 'coreIngredientsAndSeasonalVariations',
	bosolagman: 'majorVariantsTravelersShouldKnow',
	ganpanstylelagman: 'howToEatLagmanLikeLocal',
	vegetarianandmushroomlagman: 'bestRegionsAndVenueSignals'
};

function normalize(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function uploadOne(filePath) {
	const parsed = path.parse(filePath);
	const key = normalize(parsed.name);
	const publicName = imageMap[key];
	if (!publicName) {
		console.log(`Skipping (no mapping): ${parsed.base}`);
		return;
	}
	const publicId = `${cloudinaryFolder}/${publicName}`;
	await cloudinary.uploader.upload(filePath, {
		public_id: publicId,
		overwrite: true,
		invalidate: true,
		resource_type: 'image',
		asset_folder: cloudinaryFolder
	});
	console.log(`Uploaded: ${parsed.base} -> ${publicId}`);
}

async function main() {
	if (!fs.existsSync(localDir)) {
		throw new Error(`Local directory not found: ${localDir}`);
	}
	const files = fs
		.readdirSync(localDir)
		.map((f) => path.join(localDir, f))
		.filter((f) => fs.statSync(f).isFile())
		.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

	for (const file of files) {
		// eslint-disable-next-line no-await-in-loop
		await uploadOne(file);
	}
	console.log('Silk Road Noodles images uploaded.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
