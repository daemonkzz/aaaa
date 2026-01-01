export interface Rule {
  id: string;
  title: string;
  description: string;
  lastUpdate?: string;
}

export interface SubCategory {
  id: string;
  title: string;
  description?: string;
  rules: Rule[];
}

export interface MainCategory {
  id: string;
  title: string;
  subCategories: SubCategory[];
}

export interface RulesData {
  id?: string;
  data: MainCategory[];
  updated_at?: string;
  updated_by?: string;
}
