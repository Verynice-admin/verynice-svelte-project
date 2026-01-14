const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function checkAccount() {
    console.log('💳 Checking Account Usage/Info...');
    try {
        const usage = await cloudinary.api.usage();
        console.log('Account Name/Cloud:', usage.cloud_name || 'Not provided');

        // Check current folders again, but with more detail
        const folders = await cloudinary.api.root_folders();
        console.log('Folders at root:', folders.folders.map(f => f.path));

        // Let's try to lookup a folder named 'pages' directly
        try {
            const pagesSub = await cloudinary.api.sub_folders('pages');
            console.log('✅ Folder "pages" exists!');
        } catch (e) {
            console.log('❌ Folder "pages" does not exist at root.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

checkAccount();
