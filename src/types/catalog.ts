export interface CategoryHttp {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
}

export interface BrandHttp {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
}
