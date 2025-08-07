import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * Fetches header configuration from Firestore and populates the header menu and logo.
 * This function now returns a Promise that resolves when it's finished.
 */
export async function loadHeaderContent() {
    const headerLogoImg = document.getElementById('header-logo-img');
    const topMenuUl = document.getElementById('menu-topmenu');

    if (!topMenuUl || !headerLogoImg) {
        console.warn("Header elements ('header-logo-img' or 'menu-topmenu') not found. Aborting header load.");
        return; // Resolve the promise even if elements aren't found
    }

    try {
        const db = getFirestore();
        const docRef = doc(db, "siteConfig", "headerConfig");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Successfully fetched header data:", data);

            // 1. Populate the Header Logo
            if (data.logoUrlWhite && data.logoAltText) {
                headerLogoImg.src = data.logoUrlWhite;
                headerLogoImg.alt = data.logoAltText;
            }

            // 2. Populate the Main Navigation Menu
            if (data.menuLinks && Array.isArray(data.menuLinks)) {
                topMenuUl.innerHTML = ''; // Clear placeholders

                const currentPagePath = window.location.pathname;

                data.menuLinks.forEach(link => {
                    const li = document.createElement('li');
                    li.setAttribute('itemprop', 'name');

                    // [IMPROVED] Logic to find the active menu item
                    let isActive = false;
                    if (link.url === '/' && currentPagePath === '/') {
                        // Special case for exact match on homepage
                        isActive = true;
                    } else if (link.url !== '/' && currentPagePath.startsWith(link.url)) {
                        // Active if the current path starts with the link's URL
                        isActive = true;
                    }

                    if (isActive) {
                        li.className = 'current-menu-item';
                    }

                    li.innerHTML = `<a itemprop="url" href="${link.url}">${link.text}</a>`;
                    topMenuUl.appendChild(li);
                });
            }

        } else {
            console.error("Error: The 'headerConfig' document does not exist in 'siteConfig'.");
            topMenuUl.innerHTML = '<li><a href="#">Menu Error</a></li>';
        }
    } catch (error) {
        console.error("Error fetching header content from Firestore:", error);
        if(topMenuUl) topMenuUl.innerHTML = '<li><a href="#">Network Error</a></li>';
    }
}