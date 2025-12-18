import { IonContent, IonPage, IonToast, IonLoading, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ShopOwnerSignup.css';

/**
 * ShopOwnerSignup - Role Extension Flow
 * Allows an existing CLIENT to register as a SHOP OWNER.
 * Uses client's existing account data from localStorage.
 */

interface Document {
  id: number;
  name: string;
  type: string;
  file: string | null;
  dateIssued: string;
  dateExpiry: string;
}

interface ClientData {
  acc_id: number;
  firstname: string;
  lastname: string;
  email: string;
  is_verified: boolean;
  address: {
    house_building_number: string;
    street_name: string;
    subdivision_village: string;
    barangay: string;
    city_municipality: string;
    province: string;
    region: string;
    postal_code: string;
  } | null;
}

interface PSGCItem {
  code: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000/api';
const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

const ShopOwnerSignup: React.FC = () => {
  const history = useHistory();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  // Client data from existing account
  const [clientData, setClientData] = useState<ClientData | null>(null);

  // Address Mode: 'existing' or 'new'
  const [addressMode, setAddressMode] = useState<'existing' | 'new'>('existing');

  // Address Information
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // PSGC Location Data
  const [regionsList, setRegionsList] = useState<PSGCItem[]>([]);
  const [provincesList, setProvincesList] = useState<PSGCItem[]>([]);
  const [citiesList, setCitiesList] = useState<PSGCItem[]>([]);
  const [barangaysList, setBarangaysList] = useState<PSGCItem[]>([]);
  
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Shop Information
  const [shopName, setShopName] = useState('');
  const [shopContactNumber, setShopContactNumber] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopWebsite, setShopWebsite] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [serviceBanner, setServiceBanner] = useState<string | null>(null);

  // Profile Information
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  // Shop Owner Documents
  const [ownerDocuments, setOwnerDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'business_permit', file: null, dateIssued: '', dateExpiry: '' }
  ]);

  // Shop Documents
  const [shopDocuments, setShopDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'business_permit', file: null, dateIssued: '', dateExpiry: '' }
  ]);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/regions/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setRegionsList(sorted);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setRegionsList([]);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!selectedRegionCode) {
      setProvincesList([]);
      return;
    }
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/regions/${selectedRegionCode}/provinces/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setProvincesList(sorted);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setProvincesList([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [selectedRegionCode]);

  // Fetch cities when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/provinces/${selectedProvinceCode}/cities-municipalities/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setCitiesList(sorted);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCitiesList([]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedProvinceCode]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (!selectedCityCode) {
      setBarangaysList([]);
      return;
    }
    const fetchBarangays = async () => {
      setLoadingBarangays(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/cities-municipalities/${selectedCityCode}/barangays/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setBarangaysList(sorted);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
        setBarangaysList([]);
      } finally {
        setLoadingBarangays(false);
      }
    };
    fetchBarangays();
  }, [selectedCityCode]);

  // Load client data on mount
  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          showToastMessage('Please login first', 'danger');
          history.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        setClientData({
          acc_id: user.acc_id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          is_verified: user.is_verified,
          address: user.address || null
        });

        // Pre-fill address if exists
        if (user.address) {
          setHouseNumber(user.address.house_building_number || '');
          setStreet(user.address.street_name || '');
          setSubdivision(user.address.subdivision_village || '');
          setBarangay(user.address.barangay || '');
          setCity(user.address.city_municipality || '');
          setProvince(user.address.province || '');
          setRegion(user.address.region || '');
          setPostalCode(user.address.postal_code || '');
          setAddressMode('existing');
        } else {
          setAddressMode('new');
        }
      } catch (error) {
        console.error('Error loading client data:', error);
        showToastMessage('Failed to load account data', 'danger');
      } finally {
        setLoading(false);
      }
    };
    loadClientData();
  }, [history]);

  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleRegionChange = (regionCode: string) => {
    const selectedRegion = regionsList.find(r => r.code === regionCode);
    setSelectedRegionCode(regionCode);
    setRegion(selectedRegion?.name || '');
    setSelectedProvinceCode('');
    setProvince('');
    setSelectedCityCode('');
    setCity('');
    setBarangay('');
    setProvincesList([]);
    setCitiesList([]);
    setBarangaysList([]);
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProv = provincesList.find(p => p.code === provinceCode);
    setSelectedProvinceCode(provinceCode);
    setProvince(selectedProv?.name || '');
    setSelectedCityCode('');
    setCity('');
    setBarangay('');
    setCitiesList([]);
    setBarangaysList([]);
  };

  const handleCityChange = (cityCode: string) => {
    const selectedCity = citiesList.find(c => c.code === cityCode);
    setSelectedCityCode(cityCode);
    setCity(selectedCity?.name || '');
    setBarangay('');
    setBarangaysList([]);
  };

  const handleBarangayChange = (barangayCode: string) => {
    const selectedBrgy = barangaysList.find(b => b.code === barangayCode);
    setBarangay(selectedBrgy?.name || '');
  };

  const handleAddressModeChange = (mode: 'existing' | 'new') => {
    setAddressMode(mode);
    if (mode === 'existing' && clientData?.address) {
      setHouseNumber(clientData.address.house_building_number || '');
      setStreet(clientData.address.street_name || '');
      setSubdivision(clientData.address.subdivision_village || '');
      setBarangay(clientData.address.barangay || '');
      setCity(clientData.address.city_municipality || '');
      setProvince(clientData.address.province || '');
      setRegion(clientData.address.region || '');
      setPostalCode(clientData.address.postal_code || '');
    } else if (mode === 'new') {
      setHouseNumber('');
      setStreet('');
      setSubdivision('');
      setBarangay('');
      setCity('');
      setProvince('');
      setRegion('');
      setPostalCode('');
      setSelectedRegionCode('');
      setSelectedProvinceCode('');
      setSelectedCityCode('');
    }
  };

  const goBack = () => history.goBack();

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
  };

  const handleServiceBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveServiceBanner = () => {
    setServiceBanner(null);
  };

  // Owner Documents Handlers
  const handleAddOwnerDocument = () => {
    const newDocument: Document = {
      id: ownerDocuments.length + 1,
      name: '',
      type: 'business_permit',
      file: null,
      dateIssued: '',
      dateExpiry: ''
    };
    setOwnerDocuments([...ownerDocuments, newDocument]);
  };

  const handleRemoveOwnerDocument = (id: number) => {
    setOwnerDocuments(ownerDocuments.filter(doc => doc.id !== id));
  };

  const handleOwnerDocumentChange = (id: number, field: keyof Document, value: string) => {
    setOwnerDocuments(ownerDocuments.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleOwnerDocumentFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOwnerDocuments(ownerDocuments.map(doc => 
          doc.id === id ? { ...doc, file: reader.result as string } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Shop Documents Handlers
  const handleAddShopDocument = () => {
    const newDocument: Document = {
      id: shopDocuments.length + 1,
      name: '',
      type: 'business_permit',
      file: null,
      dateIssued: '',
      dateExpiry: ''
    };
    setShopDocuments([...shopDocuments, newDocument]);
  };

  const handleRemoveShopDocument = (id: number) => {
    setShopDocuments(shopDocuments.filter(doc => doc.id !== id));
  };

  const handleShopDocumentChange = (id: number, field: keyof Document, value: string) => {
    setShopDocuments(shopDocuments.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleShopDocumentFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopDocuments(shopDocuments.map(doc => 
          doc.id === id ? { ...doc, file: reader.result as string } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log('Shop owner application submitted');
    // Show success message
    showToastMessage('Application submitted successfully! Pending verification.', 'success');
    // Redirect to switch account page after a brief delay
    setTimeout(() => {
      history.push('/auth/switch-account');
    }, 2000);
  };

  return (
    <IonPage>
      <IonContent className="shop-owner-signup-content">
        <div className="shop-owner-signup-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Apply for Shop Owner</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="signup-container">
          {/* Account Information */}
          {!loading && clientData && (
            <div className="form-card">
              <h2 className="section-title">Account Information</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                Your shop owner profile will be linked to your existing account.
              </p>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1f2937' }}>
                  {clientData.firstname} {clientData.lastname}
                </p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  {clientData.email}
                  {clientData.is_verified && (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle' }}>verified</span>
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Address Information with PSGC Selection */}
          <div className="form-card">
            <h2 className="section-title">Shop Location</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Where is your shop located?
            </p>

            {/* Address Mode Toggle */}
            <div className="address-mode-toggle" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                className={`mode-button ${addressMode === 'existing' ? 'active' : ''}`}
                onClick={() => {
                  if (clientData?.address) {
                    handleAddressModeChange('existing');
                  } else {
                    showToastMessage('No existing address found. Please enter a new address.', 'danger');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: addressMode === 'existing' ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: addressMode === 'existing' ? '#fff7ed' : 'white',
                  color: addressMode === 'existing' ? '#ea580c' : clientData?.address ? '#64748b' : '#cbd5e1',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: clientData?.address ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px' }}>home</span>
                Use Current Address
                {!clientData?.address && <span style={{ display: 'block', fontSize: '10px', marginTop: '4px', fontWeight: '400' }}>(No address saved)</span>}
              </button>
              <button
                type="button"
                className={`mode-button ${addressMode === 'new' ? 'active' : ''}`}
                onClick={() => handleAddressModeChange('new')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: addressMode === 'new' ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: addressMode === 'new' ? '#fff7ed' : 'white',
                  color: addressMode === 'new' ? '#ea580c' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px' }}>add_location</span>
                New Address
              </button>
            </div>

            {/* Address Fields */}
            <div className="location-grid">
              <div className="input-group">
                <label className="input-label">House/Building No.</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter house/building no."
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Street Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter street name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Subdivision/Village</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter subdivision/village"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              {/* Region - Dropdown for new address */}
              <div className="input-group">
                <label className="input-label">Region *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={region}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedRegionCode}
                      onIonChange={(e) => handleRegionChange(e.detail.value)}
                      placeholder={loadingRegions ? 'Loading regions...' : 'Select Region'}
                      className="form-input psgc-select"
                      interface="alert"
                      disabled={loadingRegions}
                    >
                      {regionsList.map((r) => (
                        <IonSelectOption key={r.code} value={r.code}>{r.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingRegions && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* Province - Dropdown for new address */}
              <div className="input-group">
                <label className="input-label">Province *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={province}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedProvinceCode}
                      onIonChange={(e) => handleProvinceChange(e.detail.value)}
                      placeholder={loadingProvinces ? 'Loading provinces...' : 'Select Province'}
                      className="form-input psgc-select"
                      interface="alert"
                      disabled={loadingProvinces || !selectedRegionCode}
                    >
                      {provincesList.map((p) => (
                        <IonSelectOption key={p.code} value={p.code}>{p.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingProvinces && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* City - Dropdown for new address */}
              <div className="input-group">
                <label className="input-label">City/Municipality *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedCityCode}
                      onIonChange={(e) => handleCityChange(e.detail.value)}
                      placeholder={loadingCities ? 'Loading cities...' : 'Select City/Municipality'}
                      className="form-input psgc-select"
                      interface="alert"
                      disabled={loadingCities || !selectedProvinceCode}
                    >
                      {citiesList.map((c) => (
                        <IonSelectOption key={c.code} value={c.code}>{c.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingCities && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* Barangay - Dropdown for new address */}
              <div className="input-group">
                <label className="input-label">Barangay *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={barangay}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={barangay}
                      onIonChange={(e) => handleBarangayChange(e.detail.value)}
                      placeholder={loadingBarangays ? 'Loading barangays...' : 'Select Barangay'}
                      className="form-input psgc-select"
                      interface="alert"
                      disabled={loadingBarangays || !selectedCityCode}
                    >
                      {barangaysList.map((b) => (
                        <IonSelectOption key={b.code} value={b.code}>{b.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingBarangays && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="form-card">
            <h2 className="section-title">Shop Information</h2>
            
            <div className="input-group">
              <label className="input-label">Shop Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Contact Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter shop contact number"
                value={shopContactNumber}
                onChange={(e) => setShopContactNumber(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter shop email address"
                value={shopEmail}
                onChange={(e) => setShopEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Website</label>
              <input
                type="url"
                className="form-input"
                placeholder="Enter website URL (optional)"
                value={shopWebsite}
                onChange={(e) => setShopWebsite(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your shop and services..."
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Service Banner</label>
              {serviceBanner ? (
                <div className="image-preview-container banner">
                  <img src={serviceBanner} alt="Service Banner" className="image-preview" />
                  <button className="btn-remove-image" onClick={handleRemoveServiceBanner}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ) : (
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleServiceBannerChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span className="material-icons-round">add_photo_alternate</span>
                    <span>Upload Service Banner</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Shop Owner Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Shop Owner Documents</h2>
              <button className="btn-add-document" onClick={handleAddOwnerDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>

            {ownerDocuments.map((doc, index) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <span className="document-number">Document #{index + 1}</span>
                  {ownerDocuments.length > 1 && (
                    <button 
                      className="btn-remove-doc" 
                      onClick={() => handleRemoveOwnerDocument(doc.id)}
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Document Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Business Permit, Mayor's Permit"
                    value={doc.name}
                    onChange={(e) => handleOwnerDocumentChange(doc.id, 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Document Type *</label>
                  <select
                    className="form-input"
                    value={doc.type}
                    onChange={(e) => handleOwnerDocumentChange(doc.id, 'type', e.target.value)}
                  >
                    <option value="business_permit">Business Permit</option>
                    <option value="mayor_permit">Mayor Permit</option>
                    <option value="BIR_registration">BIR Registration</option>
                    <option value="ID">ID</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Document File *</label>
                  {doc.file ? (
                    <div className="file-preview-container">
                      <div className="file-info">
                        <span className="material-icons-round">description</span>
                        <span className="file-name">{doc.name || 'Document'}</span>
                      </div>
                      <button 
                        className="btn-remove-file" 
                        onClick={() => handleOwnerDocumentChange(doc.id, 'file', '')}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleOwnerDocumentFileChange(doc.id, e)}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="material-icons-round">upload_file</span>
                        <span>Upload Document</span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="date-row">
                  <div className="input-group">
                    <label className="input-label">Date Issued</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateIssued}
                      onChange={(e) => handleOwnerDocumentChange(doc.id, 'dateIssued', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Expiry</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateExpiry}
                      onChange={(e) => handleOwnerDocumentChange(doc.id, 'dateExpiry', e.target.value)}
                    />
                  </div>
                </div>

                {index < ownerDocuments.length - 1 && <div className="document-divider"></div>}
              </div>
            ))}
          </div>

          {/* Shop Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Shop Documents</h2>
              <button className="btn-add-document" onClick={handleAddShopDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>

            {shopDocuments.map((doc, index) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <span className="document-number">Document #{index + 1}</span>
                  {shopDocuments.length > 1 && (
                    <button 
                      className="btn-remove-doc" 
                      onClick={() => handleRemoveShopDocument(doc.id)}
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Document Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Business Permit, Occupancy Permit"
                    value={doc.name}
                    onChange={(e) => handleShopDocumentChange(doc.id, 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Document Type *</label>
                  <select
                    className="form-input"
                    value={doc.type}
                    onChange={(e) => handleShopDocumentChange(doc.id, 'type', e.target.value)}
                  >
                    <option value="business_permit">Business Permit</option>
                    <option value="mayor_permit">Mayor Permit</option>
                    <option value="BIR_registration">BIR Registration</option>
                    <option value="occupancy_permit">Occupancy Permit</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Document File *</label>
                  {doc.file ? (
                    <div className="file-preview-container">
                      <div className="file-info">
                        <span className="material-icons-round">description</span>
                        <span className="file-name">{doc.name || 'Document'}</span>
                      </div>
                      <button 
                        className="btn-remove-file" 
                        onClick={() => handleShopDocumentChange(doc.id, 'file', '')}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleShopDocumentFileChange(doc.id, e)}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="material-icons-round">upload_file</span>
                        <span>Upload Document</span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="date-row">
                  <div className="input-group">
                    <label className="input-label">Date Issued</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateIssued}
                      onChange={(e) => handleShopDocumentChange(doc.id, 'dateIssued', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Expiry</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateExpiry}
                      onChange={(e) => handleShopDocumentChange(doc.id, 'dateExpiry', e.target.value)}
                    />
                  </div>
                </div>

                {index < shopDocuments.length - 1 && <div className="document-divider"></div>}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button className="btn-submit" onClick={handleSubmit}>
            Submit Application
          </button>
        </div>
      </IonContent>

      <IonLoading isOpen={loading} message="Loading account data..." />
      <IonLoading isOpen={submitting} message="Submitting application..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="top"
      />
    </IonPage>
  );
};

export default ShopOwnerSignup;
