import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { userAPI } from '../api/user.api';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { useAddressesQuery } from '../hooks/useAddressesQuery';
import {
  useDepartmentsQuery,
  useProvincesQuery,
  useDistrictsQuery,
} from '@/features/locations/hooks/useLocationsQueries';

const EMPTY_ARRAY = [];

function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [addressForm, setAddressForm] = useState({
    street: '',
    department: '',
    province: '',
    district: '',
  });
  const [editingAddressId, setEditingAddressId] = useState(null);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery();

  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useAddressesQuery();

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
  } = useDepartmentsQuery();

  const {
    data: provincesData,
    isLoading: provincesLoading,
  } = useProvincesQuery(addressForm.department);

  const {
    data: districtsData,
    isLoading: districtsLoading,
  } = useDistrictsQuery(addressForm.department, addressForm.province);

  const addresses = addressesData ?? EMPTY_ARRAY;
  const departments = departmentsData ?? EMPTY_ARRAY;
  const provinces = provincesData ?? EMPTY_ARRAY;
  const districts = districtsData ?? EMPTY_ARRAY;

  useEffect(() => {
    const authError = profileError || addressesError;
    if (authError && (authError.message?.includes('401') || authError.message?.includes('Unauthorized'))) {
      router.push('/login');
    }
  }, [profileError, addressesError, router]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (editingAddressId && addresses.length > 0) {
      const address = addresses.find((addr) => addr.id === editingAddressId);
      if (address) {
        setAddressForm({
          street: address.street || '',
          department: address.department || '',
          province: address.province || '',
          district: address.district || '',
        });
      }
    } else if (!editingAddressId) {
      setAddressForm({
        street: '',
        department: '',
        province: '',
        district: '',
      });
    }
  }, [editingAddressId, addresses]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
      });
      setSuccess('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setIsEditingProfile(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingAddressId) {
        await userAPI.updateAddress(editingAddressId, addressForm);
        setSuccess('Address updated successfully');
      } else {
        await userAPI.createAddress(addressForm);
        setSuccess('Address created successfully');
      }

      await refetchAddresses();
      setEditingAddressId(null);
      setAddressForm({
        street: '',
        department: '',
        province: '',
        district: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await userAPI.deleteAddress(addressId);
      setSuccess('Address deleted successfully');
      await refetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error deleting address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setActiveTab('addresses');
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setAddressForm({
      street: '',
      department: '',
      province: '',
      district: '',
    });
  };

  const isLoading = profileLoading || addressesLoading || departmentsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1 w-full pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300 mb-2">
              Mi Perfil
            </h1>
            <p className="text-gray-400">
              Gestiona tu información personal, direcciones y configuraciones de la cuenta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProfileSidebar
              activeTab={activeTab}
              onSelectProfile={() => {
                setActiveTab('profile');
                handleCancelEdit();
              }}
              onSelectAddresses={() => {
                setActiveTab('addresses');
                handleCancelEdit();
              }}
            />

            <div className="md:col-span-3">
              <ProfileMessages error={error} success={success} />

              {activeTab === 'profile' && (
                <ProfileInfoCard
                  isLoading={isLoading}
                  isEditing={isEditingProfile}
                  profile={profile}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  onStartEdit={() => setIsEditingProfile(true)}
                  onCancelEdit={() => {
                    setIsEditingProfile(false);
                    setError('');
                    setSuccess('');
                    if (profile) {
                      setProfileForm({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                      });
                    }
                  }}
                  onSubmit={handleProfileSubmit}
                  loading={loading}
                />
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <AddressFormCard
                    addressForm={addressForm}
                    setAddressForm={setAddressForm}
                    editingAddressId={editingAddressId}
                    departments={departments}
                    provinces={provinces}
                    districts={districts}
                    departmentsLoading={departmentsLoading}
                    provincesLoading={provincesLoading}
                    districtsLoading={districtsLoading}
                    onSubmit={handleAddressSubmit}
                    onCancelEdit={handleCancelEdit}
                    loading={loading}
                  />

                  <AddressesListCard
                    addresses={addresses}
                    addressesLoading={addressesLoading}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileSidebar({ activeTab, onSelectProfile, onSelectAddresses }) {
  return (
    <div className="md:col-span-1 space-y-2">
      <button
        onClick={onSelectProfile}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${activeTab === 'profile'
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Información Personal
      </button>
      <button
        onClick={onSelectAddresses}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${activeTab === 'addresses'
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Direcciones
      </button>
    </div>
  );
}

function ProfileMessages({ error, success }) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-sm">{success}</p>
        </div>
      )}
    </>
  );
}

function ProfileInfoCard({
  isLoading,
  isEditing,
  profile,
  profileForm,
  setProfileForm,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  loading,
}) {
  if (isLoading) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-0">Información Personal</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="px-4 py-2 text-sm font-medium text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/10 transition-colors"
          >
            Editar Perfil
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nombre</p>
            <p className="text-base font-medium text-white">
              {profileForm.firstName || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Apellido</p>
            <p className="text-base font-medium text-white">
              {profileForm.lastName || 'Not specified'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-base font-medium text-white">
              {profileForm.email || 'Not available'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Telefono</p>
            <p className="text-base font-medium text-white">
              {profileForm.phone || 'Not specified'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm text-gray-400">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm text-gray-400">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your last name"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="email" className="text-sm text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                placeholder="youremail@example.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="phone" className="text-sm text-gray-400">
                Telefono
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                value={profileForm.phone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setProfileForm({ ...profileForm, phone: digits });
                }}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="987654321"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}

function AddressFormCard({
  addressForm,
  setAddressForm,
  editingAddressId,
  departments,
  provinces,
  districts,
  departmentsLoading,
  provincesLoading,
  districtsLoading,
  onSubmit,
  onCancelEdit,
  loading,
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-6">
        {editingAddressId ? 'Edita dirección' : 'Añade una nueva dirección'}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="street" className="text-sm text-gray-400">
              Dirección
            </label>
            <input
              id="street"
              type="text"
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              required
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Nombre y número de la calle"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm text-gray-400">
              Departamento
            </label>
            <select
              id="department"
              value={addressForm.department}
              onChange={(e) => {
                setAddressForm({
                  ...addressForm,
                  department: e.target.value,
                  province: '',
                  district: '',
                });
              }}
              required
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              disabled={departmentsLoading}
            >
              <option value="">Seleccione</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="province" className="text-sm text-gray-400">
              Provincia
            </label>
            <select
              id="province"
              value={addressForm.province}
              onChange={(e) => {
                setAddressForm({
                  ...addressForm,
                  province: e.target.value,
                  district: '',
                });
              }}
              required
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              disabled={!addressForm.department || provincesLoading}
            >
              <option value="">Seleccione</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="district" className="text-sm text-gray-400">
              Distrito
            </label>
            <select
              id="district"
              value={addressForm.district}
              onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
              required
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              disabled={!addressForm.province || districtsLoading}
            >
              <option value="">Seleccione</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingAddressId ? 'Update Address' : 'Create Address'}
          </button>
          {editingAddressId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function AddressesListCard({
  addresses,
  addressesLoading,
  onEditAddress,
  onDeleteAddress,
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Direcciones guardadas</h2>
      {addressesLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No has guardado ninguna dirección.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="font-semibold text-white">{address.street}</p>
                </div>
                <p className="text-sm text-gray-400 pl-7">
                  {address.district}, {address.province}, {address.department}
                </p>
              </div>
              <div className="flex gap-3 pl-7 sm:pl-0">
                <button
                  onClick={() => onEditAddress(address)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDeleteAddress(address.id)}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

