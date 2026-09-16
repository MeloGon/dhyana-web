import type { WorkshopCategory } from '@/lib/types/catalog';

export interface WorkshopInput {
  title: string;
  summary: string;
  category: WorkshopCategory;
  isPublished: boolean;
}

export interface GroupInput {
  scheduleDescription: string;
  priceCents: number;
  regularPriceCents?: number;
  discountCents?: number;
  capacity: number;
  isPublished: boolean;
}

export interface AdminGroup extends GroupInput {
  id: string;
  workshopId: string;
  regularPriceCents: number;
  discountCents: number;
}

export interface AdminWorkshop extends WorkshopInput {
  id: string;
  slug: string;
  groups: AdminGroup[];
}

export interface WorkshopSaveInput extends WorkshopInput {
  groups: (GroupInput & { id?: string })[];
}

export interface GroupDraft {
  key: string;
  id?: string;
  scheduleDescription: string;
  regularPrice: string;
  discount: string;
  capacity: string;
  isPublished: boolean;
}
