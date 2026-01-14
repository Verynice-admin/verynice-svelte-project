import { adminDB } from '$lib/server/firebaseAdmin';
import { validateImage, generateQualityReport } from '$lib/utils/sanitize';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';

// Serialize Firestore Timestamps to ISO strings for client-side
function serializeDates(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => serializeDates(item));
    }
    const out: any = {};
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (v && typeof v.toDate === 'function') {
            // Firestore Timestamp
            out[k] = v.toDate().toISOString();
        } else if (v && typeof v === 'object' && !Array.isArray(v)) {
            // Check if it's a Firestore GeoPoint (has latitude and longitude)
            if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
                // Convert GeoPoint to standard format
                out[k] = { lat: v.latitude, lng: v.longitude };
            } else {
                // Recursively serialize nested objects
                out[k] = serializeDates(v);
            }
        } else {
            out[k] = v;
        }
    }
    return out;
}

export const load: PageServerLoad = async ({ params }) => {
    if (!adminDB) {
        console.error("Firebase Admin has not been initialized.");
        throw error(500, "Server database connection failed.");
    }

    const { slug } = params;

    // 1. Defined HARDCODED paths for known destinations to bypass "Missing Index" errors
    // unique to this nested structure.
    const KNOWN_DESTINATION_PATHS: Record<string, string> = {
        'almaty': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-city',
        'almaty-city': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-city',
        'astana': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/astana-city',
        'astana-city': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/astana-city',
        'altyn-emel-national-park': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/altyn-emel-national-park',
        'big-almaty-lake': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/big-almaty-lake',
        'charyn-canyon': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/charyn-canyon',
        'kaindy-lake': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kaindy-lake',
        'kolsai-lakes': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kolsai-lakes',
        'medeu': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/medeu',
        'shymbulak-ski-resort': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/shymbulak-ski-resort',
        'zenkov-cathedral': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/zenkov-cathedral',
        'green-bazaar': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/green-bazaar',
        'issyk-lake': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/issyk-lake',
        'central-state-museum': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/central-state-museum',
        'singing-dune': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/singing-dune',
        'ile-alatau-national-park': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/ile-alatau-national-park',
        'assy-plateau': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/assy-plateau',
        'panfilov-park': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/panfilov-park',
        'zharkent-mosque': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/zharkent-mosque',
        'turgen-gorge': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/turgen-gorge',
        'ak-bulak-ski-resort': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/ak-bulak-ski-resort',
        'botanical-garden': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/botanical-garden',
        'arbat-almaty': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/arbat-almaty',
        'almaty-metro': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-metro',
        'kok-tobe-hill': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kok-tobe-hill',
        'park-of-the-first-president': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/park-first-president',
        'almaty-zoo': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-zoo',
        'aktau-mountains': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/aktau-mountains',
        'tamgaly-tas': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/tamgaly-tas',
        'chundzha-hot-springs': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/chundzha-hot-springs',
        'bartogai-reservoir': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/bartogai-reservoir',
        'kapchagay-reservoir': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kapchagay-reservoir',
        'butakov-waterfall': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/butakov-waterfall',
        'nomad-ethno-village': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/nomad-ethno-village',
        'kok-zhailau': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kok-zhailau',
        'furmanov-peak': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/furmanov-peak',
        'esentai-tower': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/esentai-tower',
        'dostyk-park': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/dostyk-park',
        'almaty-river-promenade': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-river-promenade',
        'khan-tengri-peak': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/khan-tengri-peak',
        'lesnaya-skazka-oy-karagay': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/lesnaya-skazka-oy-karagay',
        'nursultan-peak': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/nursultan-peak',
        'pobeda-peak': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/pobeda-peak',
        'rakhat-candy-factory-tours': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/rakhat-candy-factory',
        'respublika-alany': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/respublika-alany',
        'sairan-lake': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/sairan-lake',
        'sunkar-falcon-center': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/sunkar-falcon-center',
        'tabagan-ski-resort': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/tabagan-ski-resort',
        'talgar-pass': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/talgar-pass',
        'talgar-settlement': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/talgar-settlement',
        'tian-shan-mountains': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/tian-shan-mountains',
        'zailiysky-alatau': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/zailiysky-alatau',
        'dzungarian-alatau': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/dzungarian-alatau',
        'katutau-mountains': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/katutau-mountains',
        'kazakhstan-museum-of-arts': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/kazakhstan-museum-of-arts',
        'besshatyr-scythian-mounds': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/besshatyr-scythian-mounds',
        'atakent-exhibition-center': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/atakent-exhibition-center',
        'almaty-central-park': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-central-park',
        'almaty-opera-house': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-opera-house',
        'dzungarian-alatau-mountains': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/dzungarian-alatau-mountains',
        'almaty-botanical-garden': 'pages/destinationsPage/articles/section-almaty-and-nearby/attractions/almaty-botanical-garden',
        'atameken-map-kazakhstan': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/atameken-map-kazakhstan',
        'baiterek-tower': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/baiterek-tower',
        'burabay-national-park': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/burabay-national-park',
        'central-mosque': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/central-mosque',
        'hazrat-sultan-mosque': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/hazrat-sultan-mosque',
        'ishim-river-promenade': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/ishim-river-promenade',
        'khan-shatyr': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/khan-shatyr',
        'korgalzhyn-nature-reserve': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/korgalzhyn-nature-reserve',
        'lovers-park': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/lovers-park',
        'museum-armed-forces': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/museum-armed-forces',
        'national-museum-kazakhstan': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/national-museum-kazakhstan',
        'nur-alem-sphere': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/nur-alem-sphere',
        'nur-astana-mosque': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/nur-astana-mosque',
        'nurzhol-boulevard': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/nurzhol-boulevard',
        'palace-of-peace-and-reconciliation': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/palace-of-peace-and-reconciliation',
        'palace-schoolchildren': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/palace-schoolchildren',
        'presidential-park-astana': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/presidential-park-astana',
        'triumphal-arch-mangilik-el': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/triumphal-arch-mangilik-el',
        'ailand-entertainment-complex': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/ailand-entertainment-complex',
        'ak-orda-presidential-palace': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/ak-orda-presidential-palace',
        'alzhir-memorial': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/alzhir-memorial',
        'assumption-russian-orthodox-cathedral': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/assumption-russian-orthodox-cathedral',
        'astana-botanical-garden': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/astana-botanical-garden',
        'astana-grand-mosque': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/astana-grand-mosque',
        'astana-opera': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/astana-opera',
        'burabay-lake': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/burabay-lake',
        'okzhetpes-rock': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/okzhetpes-rock',
        'zerenda-lake': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/zerenda-lake',
        'buiratau-nature-park-north': 'pages/destinationsPage/articles/section-astana-and-nearby/attractions/buiratau-nature-park-north',
        'baikonur-cosmodrome': 'pages/destinationsPage/articles/section-other-attractions/attractions/baikonur-cosmodrome',
        'baikonur-cosmodrome-museum': 'pages/destinationsPage/articles/section-other-attractions/attractions/baikonur-cosmodrome-museum',
        'bayanaul-national-park': 'pages/destinationsPage/articles/section-other-attractions/attractions/bayanaul-national-park',
        'botai-settlement': 'pages/destinationsPage/articles/section-other-attractions/attractions/botai-settlement',
        'sarayshyq-ancient-settlement': 'pages/destinationsPage/articles/section-other-attractions/attractions/sarayshyq-ancient-settlement',

        // Turkistan & Shymkent
        'abay-park-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/abay-park-shymkent',
        'abu-nasyr-al-farabi-mosque': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/abu-nasyr-al-farabi-mosque',
        'abu-nasyr-al-farabi-mosque-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/abu-nasyr-al-farabi-mosque-shymkent',
        'aisha-bibi-mausoleum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/aisha-bibi-mausoleum',
        'aksu-canyon': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/aksu-canyon',
        'aksu-zhabagly-reserve': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/aksu-zhabagly-reserve',
        'akyrtas-archaeological-site': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/akyrtas-archaeological-site',
        'alley-of-glory-war-memorial': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/alley-of-glory-war-memorial',
        'arbat-walking-street': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/arbat-walking-street',
        'arystan-bab-mausoleum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/arystan-bab-mausoleum',
        'aulie-holy-caves': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/aulie-holy-caves',
        'azret-sultan-complex': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/azret-sultan-complex',
        'bechenka-river-canyon': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/bechenka-river-canyon',
        'caravanserai-turkistan': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/caravanserai-turkistan',
        'central-park-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/central-park-shymkent',
        'citadel-of-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/citadel-of-shymkent',
        'domalaq-ana-mausoleum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/domalaq-ana-mausoleum',
        'fergana-valley': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/fergana-valley',
        'friday-mosque-turkistan': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/friday-mosque-turkistan',
        'hilvet-underground-mosque': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/hilvet-underground-mosque',
        'imangali-mosque': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/imangali-mosque',
        'independence-park-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/independence-park-shymkent',
        'karavan-saray-center': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/karavan-saray-center',
        'ken-baba-park': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/ken-baba-park',
        'khakim-abay-museum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/khakim-abay-museum',
        'khoja-ahmed-yasawi-mausoleum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/khoja-ahmed-yasawi-mausoleum',
        'koshkar-ata-river': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/koshkar-ata-river',
        'koshkar-ata-riverwalk': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/koshkar-ata-riverwalk',
        'kumkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/kumkent',
        'museum-of-fine-arts-shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/museum-of-fine-arts-shymkent',
        'museum-victims-political-repressions': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/museum-victims-political-repressions',
        'otrar-archaeological-site': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/otrar-archaeological-site',
        'qyrgy-bazar': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/qyrgy-bazar',
        'rabia-sultan-begum-mausoleum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/rabia-sultan-begum-mausoleum',
        'retro-garage': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/retro-garage',
        'sairam-su-lake': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/sairam-su-lake',
        'sairam-ugam-national-park': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/sairam-ugam-national-park',
        'sauran-ancient-city': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/sauran-ancient-city',
        'sayram-ancient-city': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/sayram-ancient-city',
        'sayram-historical-sites': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/sayram-historical-sites',
        'shymkent': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/shymkent',
        'shymkent-arbat': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/shymkent-arbat',
        'shymkent-old-town': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/shymkent-old-town',
        'shymkent-zoo': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/shymkent-zoo',
        'south-kazakhstan': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/south-kazakhstan',
        'south-kazakhstan-regional-museum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/south-kazakhstan-regional-museum',
        'turkistan-historical-museum': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/turkistan-historical-museum',
        'ulugh-beg-observatory': 'pages/destinationsPage/articles/section-turkistan-and-shymkent/attractions/ulugh-beg-observatory',

        // Mangystau Region
        'airakti-castle-valley': 'pages/destinationsPage/articles/section-mangystau-region/attractions/airakti-castle-valley',
        'aktau': 'pages/destinationsPage/articles/section-mangystau-region/attractions/aktau',
        'aktau-botanical-garden': 'pages/destinationsPage/articles/section-mangystau-region/attractions/aktau-botanical-garden',
        'aktau-city-beach': 'pages/destinationsPage/articles/section-mangystau-region/attractions/aktau-city-beach',
        'aktau-embankment': 'pages/destinationsPage/articles/section-mangystau-region/attractions/aktau-embankment',
        'aktau-seaside-promenade': 'pages/destinationsPage/articles/section-mangystau-region/attractions/aktau-seaside-promenade',
        'beket-ata-underground-mosque': 'pages/destinationsPage/articles/section-mangystau-region/attractions/beket-ata-underground-mosque',
        'boszhira-tract': 'pages/destinationsPage/articles/section-mangystau-region/attractions/boszhira-tract',
        'caspian-sea-beaches': 'pages/destinationsPage/articles/section-mangystau-region/attractions/caspian-sea-beaches',
        'dostyk-park-aktau': 'pages/destinationsPage/articles/section-mangystau-region/attractions/dostyk-park-aktau',
        'i-love-aktau-sign': 'pages/destinationsPage/articles/section-mangystau-region/attractions/i-love-aktau-sign',
        'kapamsay-canyon': 'pages/destinationsPage/articles/section-mangystau-region/attractions/kapamsay-canyon',
        'karagiye-depression': 'pages/destinationsPage/articles/section-mangystau-region/attractions/karagiye-depression',
        'kenderli-beach-resort': 'pages/destinationsPage/articles/section-mangystau-region/attractions/kenderli-beach-resort',
        'mangyshlak-peninsula': 'pages/destinationsPage/articles/section-mangystau-region/attractions/mangyshlak-peninsula',
        'mangystau': 'pages/destinationsPage/articles/section-mangystau-region/attractions/mangystau',
        'mangystau-regional-museum': 'pages/destinationsPage/articles/section-mangystau-region/attractions/mangystau-regional-museum',
        'mig-fighter-monument': 'pages/destinationsPage/articles/section-mangystau-region/attractions/mig-fighter-monument',
        'rocky-path-underground-mosques': 'pages/destinationsPage/articles/section-mangystau-region/attractions/rocky-path-underground-mosques',
        'shakpak-ata-underground-mosque': 'pages/destinationsPage/articles/section-mangystau-region/attractions/shakpak-ata-underground-mosque',
        'sherkala-mountain': 'pages/destinationsPage/articles/section-mangystau-region/attractions/sherkala-mountain',
        'torysh-valley-of-balls': 'pages/destinationsPage/articles/section-mangystau-region/attractions/torysh-valley-of-balls',
        'tupkaragan-peninsula': 'pages/destinationsPage/articles/section-mangystau-region/attractions/tupkaragan-peninsula',
        'tuzbair-salt-flats': 'pages/destinationsPage/articles/section-mangystau-region/attractions/tuzbair-salt-flats',
        'ustyurt-plateau': 'pages/destinationsPage/articles/section-mangystau-region/attractions/ustyurt-plateau',
        'warm-beach-hot-springs': 'pages/destinationsPage/articles/section-mangystau-region/attractions/warm-beach-hot-springs',
        'zhygylgan-fault': 'pages/destinationsPage/articles/section-mangystau-region/attractions/zhygylgan-fault',

        // East Kazakhstan
        'abai-museum-oskemen': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/abai-museum-oskemen',
        'abai-museum-semey': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/abai-museum-semey',
        'altai-botanical-garden': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/altai-botanical-garden',
        'altai-mountains': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/altai-mountains',
        'berel-museum-reserve': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/berel-museum-reserve',
        'bukhtarma-reservoir': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/bukhtarma-reservoir',
        'church-of-the-presentation-semey': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/church-of-the-presentation-semey',
        'dostoevsky-museum-semey': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/dostoevsky-museum-semey',
        'east-kazakhstan': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/east-kazakhstan',
        'east-kazakhstan-museum-reserve': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/east-kazakhstan-museum-reserve',
        'ethnographic-museum-oskemen': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/ethnographic-museum-oskemen',
        'irtysh-river-embankment': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/irtysh-river-embankment',
        'katon-karagay-national-park': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/katon-karagay-national-park',
        'kiin-kerish': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/kiin-kerish',
        'kokkol-waterfall': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/kokkol-waterfall',
        'levoberezhny-park': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/levoberezhny-park',
        'markakol-lake': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/markakol-lake',
        'metallurgists-park': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/metallurgists-park',
        'mount-belukha': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/mount-belukha',
        'oskemen-irtysh-embankment': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/oskemen-irtysh-embankment',
        'rakhmanov-springs': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/rakhmanov-springs',
        'ridder': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/ridder',
        'semey-irtysh-embankment': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/semey-irtysh-embankment',
        'semipalatinsk-polygon': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/semipalatinsk-polygon',
        'ust-kamenogorsk-city-mosque': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/ust-kamenogorsk-city-mosque',
        'yazevoe-lake': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/yazevoe-lake',
        'zhambyl-park-oskemen': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/zhambyl-park-oskemen',
        'zhastar-park': 'pages/destinationsPage/articles/section-east-kazakhstan/attractions/zhastar-park',
    };

    const docId = `destination-${slug}`;
    let pageDocRef: DocumentReference | null = null;
    let pageSnap: DocumentSnapshot | null = null;

    try {
        // Strategy A: Check Hardcoded Known Paths (Fastest & Safe)
        if (KNOWN_DESTINATION_PATHS[slug]) {
            console.log(`[Destination] '${slug}' is a known path. fetching direct...`);
            pageDocRef = adminDB.doc(KNOWN_DESTINATION_PATHS[slug]);
            pageSnap = await pageDocRef.get();
        }

        // Strategy B: Check Standard Pages Collection
        if (!pageSnap || !pageSnap.exists) {
            pageDocRef = adminDB.collection('pages').doc(docId);
            pageSnap = await pageDocRef.get();
        }

        // Strategy C: Check Pages Collection with direct slug
        if (!pageSnap.exists) {
            pageDocRef = adminDB.collection('pages').doc(slug);
            pageSnap = await pageDocRef.get();
        }

        // Strategy D: Collection Group Search (Fallback for dynamic/unknown items)
        // Wrapped in try/catch to handle "Requires Index" errors gracefully
        if (!pageSnap.exists) {
            try {
                console.log(`[Destination] ${slug} not found in 'pages'. Searching 'attractions' collection group...`);
                // Note: This query requires a Composite Index in Firestore.
                // If it fails, we catch the error to avoid a 500 crash.
                const attractionQuery = await adminDB.collectionGroup('attractions').where('id', '==', slug).limit(1).get();

                if (!attractionQuery.empty) {
                    pageDocRef = attractionQuery.docs[0].ref;
                    pageSnap = await pageDocRef.get();
                    console.log(`[Destination] Found ${slug} as nested attraction at: ${pageDocRef.path}`);
                } else {
                    // Try one last heuristic: 'almaty' -> 'almaty-city'
                    const slugWithCity = `${slug}-city`;
                    const attractionQuery2 = await adminDB.collectionGroup('attractions').where('id', '==', slugWithCity).limit(1).get();
                    if (!attractionQuery2.empty) {
                        pageDocRef = attractionQuery2.docs[0].ref;
                        pageSnap = await pageDocRef.get();
                        console.log(`[Destination] Found ${slug} (via ${slugWithCity}) as nested attraction at: ${pageDocRef.path}`);
                    }
                }
            } catch (queryErr) {
                console.warn(`[Destination] Collection Group Query failed (likely missing index). logic skipped for: ${slug}`, queryErr);
            }
        }

        // If still not found, throw 404
        if (!pageSnap || !pageSnap.exists) {
            console.error(`Destination '${slug}' not found in pages or attractions.`);
            throw error(404, `Destination '${slug}' not found.`);
        }

        // Proceed with fetching subcollections using the resolved pageDocRef
        const articlesColRef = pageDocRef.collection('articles');
        const keyFactsColRef = pageDocRef.collection('keyFacts');
        const videoColRef = pageDocRef.collection('video');
        const mapColRef = pageDocRef.collection('map');
        const faqColRef = pageDocRef.collection('faq');
        const photoGalleryColRef = pageDocRef.collection('photoGallery');
        const relatedPostsColRef = pageDocRef.collection('relatedPosts');
        const userQuestionsColRef = pageDocRef.collection('user_questions');

        const [articlesSnap, keyFactsSnap, videoSnap, mapSnap, faqSnap, photoGallerySnap, relatedPostsSnap, userQuestionsSnap] = await Promise.all([
            articlesColRef.orderBy('order', 'asc').get(),
            keyFactsColRef.orderBy('order', 'asc').get(),
            videoColRef.get(),
            mapColRef.get(),
            faqColRef.get(),
            photoGalleryColRef.get(),
            relatedPostsColRef.orderBy('order', 'asc').get(),
            userQuestionsColRef.orderBy('createdAt', 'asc').get()
        ]);

        const page = serializeDates(pageSnap.data());

        // Fetch Attractions (if linked) - Logic:
        // If this destination page corresponds to a Region (e.g. Almaty), we might want to fetch relevant attractions.
        // However, the prompt says "Replicate section/collection logic from historyPage", which primarily uses 'articles'.
        // BUT, we also have specific attractions data now.
        // For now, let's stick to the History Page structure (Articles based), as the 14 sections requested (Origins, History, etc) are Articles.
        // We can add a "Attractions" ARTICLE in the timeline that might have a special component, OR just content.
        // The prompt says "Adapt sections... ensure modularity".
        // We will assume the 14 text sections are stored in 'articles' subcollection.

        const articles = articlesSnap.docs.map((doc: any) => {
            const data = doc.data();
            return serializeDates({
                ...data,
                id: doc.id,
                articleId: data.articleId || doc.id,
                title: data.title || data.heading || '',
                order: data.order || 0,
                contentMarkdown: data.contentMarkdown || '',
                contentHTML: data.contentHTML || data.content || '',
                contentFormat: data.contentFormat || 'auto',
                year: data.year || '',
                images: data.images || []
            });
        }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        // Resolve Author
        let author = null;
        if (page.authorId) {
            const authorSnap = await adminDB.collection('authors').doc(page.authorId).get();
            if (authorSnap.exists) author = serializeDates(authorSnap.data());
        }

        // Load subcollections
        const keyFacts = keyFactsSnap.docs.map((doc: any) => ({ id: doc.id, ...serializeDates(doc.data()) })).sort((a: any, b: any) => a.order - b.order);

        let video = null;
        if (!videoSnap.empty) video = serializeDates(videoSnap.docs[0].data());

        let map = null;
        console.log(`[Destination] Checking map data... Snap empty? ${mapSnap.empty}`);
        if (!mapSnap.empty) {
            map = serializeDates(mapSnap.docs[0].data());
            console.log(`[Destination] Map data found:`, JSON.stringify(map));
        } else {
            console.log(`[Destination] No map data found in ${mapColRef.path}`);
        }

        let faq = null;
        let faqItems = [];
        if (!faqSnap.empty) {
            faq = serializeDates(faqSnap.docs[0].data());
            faqItems = faq.items || [];
        }
        // Merge user questions if needed (omitted for brevity, matching history logic simplistically)

        let photoGallery = null;
        if (!photoGallerySnap.empty) {
            photoGallery = serializeDates(photoGallerySnap.docs[0].data());
        }

        // --- FALLBACK: Use 'photos' field from main document if subcollection is missing OR empty ---
        const subGalleryHasPhotos = photoGallery && Array.isArray(photoGallery.photos) && photoGallery.photos.length > 0;

        if (!subGalleryHasPhotos && page.photos && Array.isArray(page.photos) && page.photos.length > 0) {
            photoGallery = {
                title: 'Photo Gallery',
                photos: page.photos.map((p: any) => {
                    if (typeof p === 'string') return p;
                    return p.publicId || p.url || p;
                })
            };
        }

        const relatedPostsSnapData = relatedPostsSnap.docs.filter((d: any) => d.id !== 'main').map((d: any) => serializeDates(d.data()));
        let relatedPosts = relatedPostsSnapData;

        // Universal "More to Explore" Logic: Fetch ~10 Random Attractions
        try {
            // Fetch all attractions from the database
            const allAttractionsSnap = await adminDB.collectionGroup('attractions').get();

            let allAttractions = allAttractionsSnap.docs
                .map((doc: any) => {
                    const data = doc.data();
                    return { id: doc.id, ...data };
                })
                .filter((item: any) => {
                    // Exclude current page
                    if (item.id === slug) return false;
                    if (item.url && item.url.includes(slug)) return false;
                    return true;
                });

            // Fallback: If collectionGroup provided nothing (e.g. indexes missing), try fetching from destinationsPage articles
            if (allAttractions.length === 0) {
                const destPageRef = adminDB.collection('pages').doc('destinationsPage');
                const destArticlesSnap = await destPageRef.collection('articles').get();
                // This is just a backup to get *something*
                // We simply treat regions as "attractions" for the explore section in worst case
                allAttractions = destArticlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            }

            // Shuffle Array (Fisher-Yates)
            for (let i = allAttractions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allAttractions[i], allAttractions[j]] = [allAttractions[j], allAttractions[i]];
            }

            // Select top 10
            const randomSelection = allAttractions.slice(0, 10);

            // Map to RelatedPostCard format
            relatedPosts = randomSelection.map(attraction => {
                // Resolve Image
                let imagePublicId = null;
                if (attraction.mainImage) {
                    imagePublicId = attraction.mainImage;
                } else if (attraction.image) {
                    if (typeof attraction.image === 'string') imagePublicId = attraction.image;
                    else if (typeof attraction.image === 'object') imagePublicId = attraction.image.publicId;
                } else if (attraction.photos && attraction.photos.length > 0) {
                    imagePublicId = attraction.photos[0];
                } else if (attraction.images && attraction.images.length > 0) {
                    // Fallback to images array if main image missing
                    const first = attraction.images[0];
                    imagePublicId = typeof first === 'string' ? first : first.publicId;
                } else if (attraction.heroImage) {
                    imagePublicId = attraction.heroImage;
                }

                // Resolve URL
                // If it has a direct URL, use it. Otherwise construct destination link.
                // We corrected routing in +page.svelte, now we construct it here for the card.
                let url = attraction.url;
                if (!url) {
                    if (attraction.id && !attraction.id.startsWith('item-')) {
                        url = `/destinations/${attraction.id}`;
                    } else {
                        url = '#';
                    }
                }

                // Special overrides for known slugs to ensure perfect linking
                if (/altyn[-\s]?emel/i.test(attraction.title)) url = '/destinations/altyn-emel-national-park';
                if (/big[-\s]?almaty[-\s]?lake/i.test(attraction.title)) url = '/destinations/big-almaty-lake';
                if (/almaty/i.test(attraction.title) && /city/i.test(attraction.title)) url = '/destinations/almaty-city';

                return serializeDates({
                    id: attraction.id,
                    title: attraction.title || attraction.name || 'Discover',
                    category: attraction.category || attraction.region || 'Destinations',
                    imagePublicId: imagePublicId, // Mapped correctly for Card
                    url: url,
                    mainTitle: attraction.mainTitle // Pass mainTitle if available
                });
            });

        } catch (err) {
            console.warn('[Destinations] Failed to generate random related posts:', err);
            // Fallback to seeded data if random generation fails
            const relatedPostsSnapData = relatedPostsSnap.docs.filter((d: any) => d.id !== 'main').map((d: any) => serializeDates(d.data()));
            if (!relatedPosts || relatedPosts.length === 0) relatedPosts = relatedPostsSnapData;
        }

        return {
            page: {
                ...page,
                keyFacts,
                video,
                map,
                faq: { ...(faq || {}), items: faqItems },
                photoGallery,
                relatedPosts
            },
            articles,
            author,
            slug, // Pass slug to frontend if needed
            dbPath: pageDocRef?.path ? pageDocRef.path.replace(/^pages\//, '') : ''
        };

    } catch (e: unknown) {
        if (e && typeof e === 'object' && 'status' in e && (e as any).status === 404) throw e;
        console.error("Failed to load destination page:", e);
        throw error(500, "Failed to load destination data.");
    }
}
