import type { LayoutServerLoad } from './$types';
import { loadSiteConfig } from '$lib/server/siteConfig';

export const load: LayoutServerLoad = async () => {
  const cfg = await loadSiteConfig();
  return {
    headerConfig: cfg.headerConfig,
    footerContent: cfg.footerConfig
  };
};