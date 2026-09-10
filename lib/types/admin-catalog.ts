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
  capacity: number;
  isPublished: boolean;
}

export interface AdminGroup extends GroupInput {
  id: string;
  workshopId: string;
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
  price: string;
  capacity: string;
  isPublished: boolean;
}
