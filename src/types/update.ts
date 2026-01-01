export type UpdateCategory = 'update' | 'news';

export interface ContentBlock {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'image' | 'code' | 'quote';
  content: string | string[];
  // For headings
  level?: 1 | 2 | 3;
}

export interface UpdateData {
  id?: string;
  title: string;
  subtitle?: string;
  category: UpdateCategory;
  version?: string;
  cover_image_url?: string;
  content: ContentBlock[];
  is_published: boolean;
  author_id?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultUpdateData: Omit<UpdateData, 'id'> = {
  title: '',
  subtitle: '',
  category: 'update',
  version: '',
  cover_image_url: '',
  content: [],
  is_published: false,
};
