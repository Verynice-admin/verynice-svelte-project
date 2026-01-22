interface HomePageData {
  homepage: {
    title: string;
    metaDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImagePublicId: string;
    featuredVideoUrl: string;
  };
  sliders: {
    cities: unknown[];
    attractions: unknown[];
    landmarks: unknown[];
    nationalParks: unknown[];
    lakes: unknown[];
    mountains: unknown[];
    cuisine: unknown[];
    restaurants: unknown[];
    cafes: unknown[];
  };
}

export async function loadHomePage(): Promise<HomePageData> {
  return {
    homepage: {
      title: 'VERYNICE .kz',
      metaDescription: 'Discover Kazakhstan',
      heroTitle: 'Discover Kazakhstan',
      heroSubtitle: 'Guides, attractions, food and culture',
      heroImagePublicId: 'content/site/backgrounds/attractions-hero',
      featuredVideoUrl: ''
    },
    sliders: {
      cities: [],
      attractions: [],
      landmarks: [],
      nationalParks: [],
      lakes: [],
      mountains: [],
      cuisine: [],
      restaurants: [],
      cafes: []
    }
  };
}





























































