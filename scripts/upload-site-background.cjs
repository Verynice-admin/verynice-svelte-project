/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const SOURCE_FILE =
	process.env.SITE_BG_SOURCE_FILE ||
	'C:/Users/conta/Desktop/Verynice_stock_photos/General/background.webp';
const TARGET_PUBLIC_ID = process.env.SITE_BG_PUBLIC_ID || 'general/background';
const TARGET_FOLDER = 'general';

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

async function uploadBackground() {
	if (!fs.existsSync(SOURCE_FILE)) {
		throw new Error(`Background file not found: ${SOURCE_FILE}`);
	}

	const result = await cloudinary.uploader.upload(SOURCE_FILE, {
		public_id: TARGET_PUBLIC_ID,
		overwrite: true,
		invalidate: true,
		resource_type: 'image',
		asset_folder: TARGET_FOLDER
	});

	const { cloud_name: cloudName } = cloudinary.config();
	const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${result.public_id}`;

	return {
		publicId: result.public_id,
		secureUrl: result.secure_url,
		optimizedUrl,
		version: result.version
	};
}

async function updateFirebaseDocs(db, upload) {
	const now = admin.firestore.FieldValue.serverTimestamp();
	const payload = {
		siteBackground: {
			publicId: upload.publicId,
			secureUrl: upload.secureUrl,
			optimizedUrl: upload.optimizedUrl,
			folder: TARGET_FOLDER,
			fileName: path.basename(SOURCE_FILE),
			source: 'cloudinary',
			updatedAt: now
		},
		siteBackgroundPublicId: upload.publicId,
		siteBackgroundUrl: upload.optimizedUrl,
		siteBackgroundVersion: upload.version,
		updatedAt: now
	};

	const targets = ['siteConfig/layout', 'pages/homepage'];
	for (const target of targets) {
		// eslint-disable-next-line no-await-in-loop
		await db.doc(target).set(payload, { merge: true });
		console.log(`Updated Firestore: ${target}`);
	}
}

async function main() {
	const cloudinaryCfg = configureCloudinary();
	console.log(`Using Cloudinary cloud: ${cloudinaryCfg.cloud_name}`);
	console.log(`Uploading: ${SOURCE_FILE}`);

	const upload = await uploadBackground();
	console.log(`Uploaded Cloudinary public_id: ${upload.publicId}`);
	console.log(`Optimized URL: ${upload.optimizedUrl}`);

	const db = initFirestore();
	await updateFirebaseDocs(db, upload);

	console.log('Site background upload + Firebase update complete.');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
