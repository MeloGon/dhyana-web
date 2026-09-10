export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
}

export interface FaqInput {
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface AdminFaq extends FaqInput {
  id: string;
}
