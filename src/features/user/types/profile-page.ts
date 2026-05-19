import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { AddressHttp, AddressInput } from "@/types/user";

export type ProfileTab = "profile" | "addresses";

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export type AddressFormState = AddressInput;

export interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onSelectProfile: () => void;
  onSelectAddresses: () => void;
}

export interface ProfileMessagesProps {
  error: string;
  success: string;
}

export interface ProfileInfoCardProps {
  isLoading: boolean;
  isEditing: boolean;
  profileForm: ProfileFormState;
  setProfileForm: Dispatch<SetStateAction<ProfileFormState>>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export interface AddressFormCardProps {
  addressForm: AddressFormState;
  setAddressForm: Dispatch<SetStateAction<AddressFormState>>;
  editingAddressId: string | null;
  departments: string[];
  provinces: string[];
  districts: string[];
  departmentsLoading: boolean;
  provincesLoading: boolean;
  districtsLoading: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancelEdit: () => void;
  loading: boolean;
}

export interface AddressesListCardProps {
  addresses: AddressHttp[];
  addressesLoading: boolean;
  onEditAddress: (address: AddressHttp) => void;
  onDeleteAddress: (addressId: string) => void;
}
