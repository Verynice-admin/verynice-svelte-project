const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function checkRoot() {
    console.log('🌳 Checking Root folders...');
    try {
        const rootFolders = await cloudinary.api.root_folders();
        console.log('Root Folders:', rootFolders.folders.map(f => f.name));

        // Check if there is a destinations folder AND a pages folder at root
        const pagesFolder = rootFolders.folders.find(f => f.name === 'pages');
        if (pagesFolder) {
            console.log('\n📄 Found "pages" folder at root. Checking its contents...');
            const pagesSub = await cloudinary.api.sub_folders('pages');
            console.log('   Subfolders of pages:', pagesSub.folders.map(f => f.name));

            const destSub = pagesSub.folders.find(f => f.name === 'destinations');
            if (destSub) {
                const almatySub = await cloudinary.api.sub_folders('pages/destinations');
                console.log('   Subfolders of pages/destinations:', almatySub.folders.map(f => f.name));
            }
        }

        const destFolder = rootFolders.folders.find(f => f.name === 'destinations');
        if (destFolder) {
            console.log('\n📍 Found "destinations" folder at root (This is where I uploaded!).');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkRoot();
