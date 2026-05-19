export interface UserProfileHttp {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email?: string;
}

export interface AddressHttp {
  id: string;
  userId: string;
  street: string;
  department: string;
  province: string;
  district: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  street: string;
  department: string;
  province: string;
  district: string;
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
