import type { SITE_TEXT_FIELDS, SITE_VISIBILITY_FIELDS, DEFAULT_SECTION_ORDER } from '@/lib/data/site-fields';

export type SiteTextKey = keyof typeof SITE_TEXT_FIELDS;
export type SiteVisibilityKey = keyof typeof SITE_VISIBILITY_FIELDS;
export type SiteSectionKey = (typeof DEFAULT_SECTION_ORDER)[number];
export type FloatingSocialDesign = 'fab' | 'pill' | 'dock';

export interface FloatingSocialSettings {
  isEnabled: boolean;
  design: FloatingSocialDesign;
  facebookEnabled: boolean;
  facebookUrl: string;
  instagramEnabled: boolean;
  instagramUrl: string;
  youtubeEnabled: boolean;
  youtubeUrl: string;
}

export interface SiteSettings {
  texts: Record<SiteTextKey, string>;
  visibility: Record<SiteVisibilityKey, boolean>;
  sectionOrder: SiteSectionKey[];
  logoPath: string;
  videoPath: string;
  floatingSocial: FloatingSocialSettings;
}
export interface SiteService {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  duration: string;
  modality: string;
  badge: string;
  icon: 'user' | 'users' | 'wind' | 'compass';
  isPublished: boolean;
}
export interface SiteContent {
  settings: SiteSettings;
  services: SiteService[];
  logoUrl: string;
  videoUrl: string;
}
export interface UploadedSiteAsset { path: string; url: string }
