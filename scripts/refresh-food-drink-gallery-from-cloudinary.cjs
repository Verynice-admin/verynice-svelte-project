/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const TARGET_FOLDERS = [
	'content/pages/foodDrinks/signatureDishes',
	'foodDrinks/signatureDishes'
];
const MIN_IMAGES = 20;

function configureCloudinary() {
	if (process.env.CLOUDINARY_URL) {
		cloudinary.config(process.env.CLOUDINARY_URL);
	} else {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET
		});
	}

	const cfg = cloudinary.config();
	if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
		throw new Error(
			'Missing Cloudinary credentials. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.'
		);
	}
	return cfg;
}

function readServiceAccount() {
	if (process.env.FIREBASE_SERVICE_ACCOUNT) {
		try {
			return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		} catch (error) {
			throw new Error(`FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${error.message}`);
		}
	}

	const candidates = [
		path.resolve('.secrets/serviceAccountKey.json'),
		path.resolve('verynice-admin-firebase-adminsdk-45c1a-7b3af2138e.json')
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			return JSON.parse(fs.readFileSync(candidate, 'utf8'));
		}
	}

	return null;
}

function initFirestore() {
	if (!admin.apps.length) {
		const serviceAccount = readServiceAccount();
		if (serviceAccount) {
			admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
		} else {
			admin.initializeApp();
		}
	}
	return admin.firestore();
}

function buildAlt(publicId) {
	const base = publicId.split('/').pop() || 'Signature dish';
	return base
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/^\w/, (char) => char.toUpperCase());
}

async function fetchFolderPublicIds() {
	const collected = new Set();

	for (const folder of TARGET_FOLDERS) {
		let cursor = null;
		do {
			// eslint-disable-next-line no-await-in-loop
			const result = await cloudinary.api.resources({
				type: 'upload',
				resource_type: 'image',
				prefix: `${folder}/`,
				max_results: 500,
				next_cursor: cursor
			});

			if (Array.isArray(result?.resources)) {
				for (const resource of result.resources) {
					if (resource?.public_id) collected.add(resource.public_id);
				}
			}

			cursor = result?.next_cursor || null;
		} while (cursor);
	}

	if (collected.size > 0) {
		return Array.from(collected);
	}

	const fallbackExpressions = TARGET_FOLDERS.flatMap((folder) => [
		`resource_type:image AND folder:${folder}`,
		`resource_type:image AND public_id:${folder}/*`
	]);

	for (const expr of fallbackExpressions) {
		let cursor = null;
		do {
			const query = cloudinary.search
				.expression(expr)
				.sort_by('public_id', 'asc')
				.max_results(500);
			if (cursor) query.next_cursor(cursor);
			// eslint-disable-next-line no-await-in-loop
			const result = await query.execute();
			if (Array.isArray(result?.resources)) {
				for (const resource of result.resources) {
					if (resource?.public_id) collected.add(resource.public_id);
				}
			}
			cursor = result?.next_cursor || null;
		} while (cursor);
	}

	return Array.from(collected);
}

async function main() {
	configureCloudinary();
	console.log(`Fetching Cloudinary assets in ${TARGET_FOLDERS.join(' | ')}...`);

	const publicIds = await fetchFolderPublicIds();
	if (!publicIds.length) {
		throw new Error(`No images found under ${TARGET_FOLDER}.`);
	}

	console.log(`Found ${publicIds.length} images.`);
	const selected = publicIds.slice(0, Math.max(MIN_IMAGES, publicIds.length));

	const photos = selected.map((publicId) => ({
		publicId,
		alt: buildAlt(publicId)
	}));

	const db = initFirestore();
	const now = admin.firestore.FieldValue.serverTimestamp();
  await db.doc('pages/restaurantsPage/photoGallery/main').set(
    {
      title: 'A Taste of Kazakhstan',
      photos,
      updatedAt: now
    },
    { merge: true }
  );

  console.log(`Updated Firestore gallery with ${photos.length} images.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
