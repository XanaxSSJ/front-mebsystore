import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PageLayout from '@/shared/components/PageLayout';
import { useAuthRedirect } from '@/shared/hooks/useAuthRedirect';
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

  useAuthRedirect(profileError, addressesError);

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
      setSuccess('Perfil actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      setIsEditingProfile(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
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
        setSuccess('Dirección actualizada correctamente');
      } else {
        await userAPI.createAddress(addressForm);
        setSuccess('Dirección creada correctamente');
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
      setError(err.message || 'Error al guardar dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await userAPI.deleteAddress(addressId);
      setSuccess('Dirección eliminada correctamente');
      await refetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar dirección');
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
    <PageLayout className="w-full pt-12 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface mb-2">
            Mi Perfil
          </h1>
          <p className="text-surface/60">
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
    </PageLayout>
  );
}

function ProfileSidebar({ activeTab, onSelectProfile, onSelectAddresses }) {
  return (
    <div className="md:col-span-1 space-y-2">
      <button
        onClick={onSelectProfile}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${activeTab === 'profile'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-surface/60 hover:text-surface hover:bg-surface/5'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        Información Personal
      </button>
      <button
        onClick={onSelectAddresses}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${activeTab === 'addresses'
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-surface/60 hover:text-surface hover:bg-surface/5'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]">location_on</span>
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
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
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
      <div className="bg-white border border-surface/10 rounded-2xl p-6 lg:p-8">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center justify-between pb-4 border-b border-surface/10">
        <h2 className="text-xl font-bold text-surface mb-0">Información Personal</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Editar Perfil
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-sm font-medium text-surface/60 border border-surface/10 rounded-lg hover:text-surface hover:bg-surface/5 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm text-surface/40 mb-1">Nombre</p>
            <p className="text-base font-medium text-surface">
              {profileForm.firstName || 'No especificado'}
            </p>
          </div>
          <div>
            <p className="text-sm text-surface/40 mb-1">Apellido</p>
            <p className="text-base font-medium text-surface">
              {profileForm.lastName || 'No especificado'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-surface/40 mb-1">Email</p>
            <p className="text-base font-medium text-surface">
              {profileForm.email || 'No disponible'}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-surface/40 mb-1">Telefono</p>
            <p className="text-base font-medium text-surface">
              {profileForm.phone || 'No especificado'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm text-surface/60">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm text-surface/60">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="Ingresa tu apellido"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="email" className="text-sm text-surface/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profileForm.email}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-surface/5 border border-surface/10 rounded-xl text-surface/40 cursor-not-allowed"
                placeholder="youremail@example.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="phone" className="text-sm text-surface/60">
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
                className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="987654321"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
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
    <div className="bg-white border border-surface/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-surface mb-6">
        {editingAddressId ? 'Edita dirección' : 'Añade una nueva dirección'}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="street" className="text-sm text-surface/60">
              Dirección
            </label>
            <input
              id="street"
              type="text"
              value={addressForm.street}
              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
              required
              className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Nombre y número de la calle"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm text-surface/60">
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
              className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors appearance-none"
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
            <label htmlFor="province" className="text-sm text-surface/60">
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
              className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors appearance-none"
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
            <label htmlFor="district" className="text-sm text-surface/60">
              Distrito
            </label>
            <select
              id="district"
              value={addressForm.district}
              onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
              required
              className="w-full px-4 py-3 bg-background-light/50 border border-surface/10 rounded-xl text-surface focus:outline-none focus:border-primary transition-colors appearance-none"
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
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : editingAddressId ? 'Actualizar dirección' : 'Crear dirección'}
          </button>
          {editingAddressId && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 text-surface/60 hover:text-surface font-medium transition-colors"
            >
              Cancelar
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
    <div className="bg-white border border-surface/10 rounded-2xl p-6 lg:p-8">
      <h2 className="text-xl font-bold text-surface mb-6">Direcciones guardadas</h2>
      {addressesLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-surface/40">No has guardado ninguna dirección.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-background-light border border-surface/5 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
                  <p className="font-semibold text-surface">{address.street}</p>
                </div>
                <p className="text-sm text-surface/60 pl-7">
                  {address.district}, {address.province}, {address.department}
                </p>
              </div>
              <div className="flex gap-3 pl-7 sm:pl-0">
                <button
                  onClick={() => onEditAddress(address)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
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
