import { useState, useEffect, useRef } from 'react';
import { IonContent, IonPage, IonToast, IonSpinner } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  REGION_IX_DATA,
  getAllMunicipalities,
  getBarangaysForMunicipality,
  getMunicipalityCoordinates,
  REGION_IX_BOUNDS,
  REGION_IX_CENTER
} from '../../../data/region9-addresses';
import { geolocationAPI, accountAPI, getInitials } from '../../../utils/api';
import { getUserId, getUserData, setUserData } from '../../../utils/auth';
import './AccountSettings.css';

const AccountSettings: React.FC = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    username: '',
    email: '',
    contactNumber: '',
    houseNumber: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: 'Region IX - Zamboanga Peninsula',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [availableBarangays, setAvailableBarangays] = useState<Array<{ name: string; coordinates?: [number, number] }>>([]);
  const [allMunicipalities] = useState(getAllMunicipalities());
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const goBack = () => {
    history.goBack();
  };

  // Get user ID from localStorage and fetch profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const id = getUserId();
      const userData = getUserData();
      
      if (!id || !userData) {
        setToastMessage('User not logged in. Please log in.');
        setToastColor('danger');
        setShowToast(true);
        setIsLoading(false);
        history.push('/auth/login');
        return;
      }

      try {
        setUserId(id);

        // Fetch profile from backend
        const result = await accountAPI.getProfile(id);
        
        if (result.error) {
          setToastMessage(result.error);
          setToastColor('danger');
          setShowToast(true);
        } else if (result.data) {
          const user = result.data.user;
          setFormData({
            firstName: user.firstname || '',
            lastName: user.lastname || '',
            middleName: user.middlename || '',
            username: user.username || '',
            email: user.email || '',
            contactNumber: user.client_profile?.contact_number || '',
            houseNumber: user.address?.house_building_number || '',
            street: user.address?.street_name || '',
            barangay: user.address?.barangay || '',
            cityMunicipality: user.address?.city_municipality || '',
            province: user.address?.province || '',
            region: user.address?.region || 'Region IX - Zamboanga Peninsula',
            latitude: null,
            longitude: null
          });

          // Load barangays if municipality is set
          if (user.address?.city_municipality) {
            const barangays = getBarangaysForMunicipality(user.address.city_municipality);
            setAvailableBarangays(barangays);
          }
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
        setToastMessage('Failed to load profile data');
        setToastColor('danger');
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Map initialization
  useEffect(() => {
    if (!showMapModal || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(REGION_IX_CENTER, 9);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.rectangle(REGION_IX_BOUNDS, {
      color: '#0066cc',
      weight: 2,
      fillOpacity: 0.1
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMapModal]);

  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background: red; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([lat, lng], 13);
  };

  const handleMunicipalityChange = (municipality: string, province: string) => {
    setFormData(prev => ({
      ...prev,
      cityMunicipality: municipality,
      province: province,
      barangay: ''
    }));

    const barangays = getBarangaysForMunicipality(municipality);
    setAvailableBarangays(barangays);

    const coords = getMunicipalityCoordinates(municipality);
    if (coords && mapInstanceRef.current) {
      addMarker(coords[0], coords[1]);
      setFormData(prev => ({
        ...prev,
        latitude: coords[0],
        longitude: coords[1]
      }));
    }
  };

  const handleBarangayChange = (barangay: string) => {
    setFormData(prev => ({ ...prev, barangay }));

    const selectedBarangay = availableBarangays.find(b => b.name === barangay);
    if (selectedBarangay && selectedBarangay.coordinates) {
      addMarker(selectedBarangay.coordinates[0], selectedBarangay.coordinates[1]);
      setFormData(prev => ({
        ...prev,
        latitude: selectedBarangay.coordinates![0],
        longitude: selectedBarangay.coordinates![1]
      }));
    }
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    try {
      const position = await geolocationAPI.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const isWithinRegionIX = 
        latitude >= REGION_IX_BOUNDS[0][0] && 
        latitude <= REGION_IX_BOUNDS[1][0] &&
        longitude >= REGION_IX_BOUNDS[0][1] && 
        longitude <= REGION_IX_BOUNDS[1][1];

      if (!isWithinRegionIX) {
        alert('Your current location is outside Region IX (Zamboanga Peninsula). Please select from the dropdowns.');
        setIsLocationLoading(false);
        return;
      }

      setFormData(prev => ({
        ...prev,
        latitude,
        longitude
      }));

      if (mapInstanceRef.current) {
        addMarker(latitude, longitude);
      }
      
      alert('GPS location detected in Region IX!');
    } catch (error: any) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Could not get your location. ';
      
      if (error.code === 1) {
        errorMessage += 'Please allow location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location services unavailable. Please select from the dropdowns instead.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please select from the dropdowns instead.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleEditProfile = () => {
    setToastMessage('Profile picture upload coming soon');
    setToastColor('warning');
    setShowToast(true);
  };

  const handleSaveChanges = async () => {
    if (!userId) {
      setToastMessage('User ID not found');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setToastMessage('First name, last name, and email are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!formData.cityMunicipality || !formData.barangay) {
      setToastMessage('Municipality and barangay are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsSaving(true);

    try {
      const result = await accountAPI.updateProfile({
        user_id: userId,
        firstname: formData.firstName,
        lastname: formData.lastName,
        middlename: formData.middleName,
        username: formData.username,
        email: formData.email,
        contact_number: formData.contactNumber,
        house_building_number: formData.houseNumber,
        street_name: formData.street,
        barangay: formData.barangay,
        city_municipality: formData.cityMunicipality,
        province: formData.province,
        region: formData.region
      });

      if (result.error) {
        setToastMessage(result.error);
        setToastColor('danger');
      } else {
        setToastMessage('Profile updated successfully!');
        setToastColor('success');
        
        // Update localStorage with new data
        if (result.data) {
          setUserData(result.data.user);
        }
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setToastMessage('Failed to save profile changes');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!userId) return;

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setToastMessage('All password fields are required');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToastMessage('New passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToastMessage('New password must be at least 8 characters long');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const result = await accountAPI.changePassword({
        user_id: userId,
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });

      if (result.error) {
        setToastMessage(result.error);
        setToastColor('danger');
      } else {
        setToastMessage('Password changed successfully!');
        setToastColor('success');
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error changing password:', error);
      setToastMessage('Failed to change password');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setToastMessage('Account deletion coming soon');
      setToastColor('warning');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="account-settings-content">
        <div className="account-settings-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="account-settings-title">Account Settings</h1>
          <div className="header-spacer"></div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="account-settings-container">
            {/* Profile Picture Section */}
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                <div className="profile-picture">
                  {getInitials(`${formData.firstName} ${formData.lastName}`)}
                </div>
                <button className="edit-picture-button" onClick={handleEditProfile}>
                  <span className="material-icons-round">edit</span>
                </button>
              </div>
              <div className="profile-username">{formData.username}</div>
            </div>

          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">Personal Information</div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <div className="section-header">Address Information (Region IX - Zamboanga Peninsula)</div>
            
            <div className="location-buttons" style={{ marginBottom: '16px' }}>
              <button 
                className="btn-location btn-detect"
                onClick={getCurrentLocation}
                disabled={isLocationLoading}
                type="button"
              >
                <span className="material-icons-round">
                  {isLocationLoading ? 'hourglass_empty' : 'my_location'}
                </span>
                {isLocationLoading ? 'Detecting GPS...' : 'Detect GPS Location'}
              </button>
              <button 
                className="btn-location btn-map"
                onClick={() => setShowMapModal(true)}
                type="button"
              >
                <span className="material-icons-round">map</span>
                View Map
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">House/Building Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 123"
                  value={formData.houseNumber}
                  onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Street</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Main St"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Municipality <span style={{color: 'red'}}>*</span></label>
              <select
                className="form-input"
                value={formData.cityMunicipality}
                onChange={(e) => {
                  const selected = e.target.value;
                  const municipality = allMunicipalities.find(m => m.municipality === selected);
                  if (municipality) {
                    handleMunicipalityChange(municipality.municipality, municipality.province);
                  }
                }}
              >
                <option value="">Select Municipality</option>
                {REGION_IX_DATA.map(province => (
                  <optgroup key={province.name} label={province.name}>
                    {province.municipalities.map(municipality => (
                      <option key={municipality.name} value={municipality.name}>
                        {municipality.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Barangay <span style={{color: 'red'}}>*</span></label>
              <select
                className="form-input"
                value={formData.barangay}
                onChange={(e) => handleBarangayChange(e.target.value)}
                disabled={!formData.cityMunicipality}
              >
                <option value="">Select Barangay</option>
                {availableBarangays.map(barangay => (
                  <option key={barangay.name} value={barangay.name}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.province}
                  readOnly
                  style={{ background: '#f0f0f0' }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Region</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.region}
                  readOnly
                  style={{ background: '#f0f0f0' }}
                />
              </div>
            </div>

            {formData.latitude && formData.longitude && (
              <div className="form-group">
                <label className="form-label">Coordinates</label>
                <input
                  type="text"
                  className="form-input"
                  value={`${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`}
                  readOnly
                  style={{ background: '#f0f0f0' }}
                />
              </div>
            )}

            <button 
              className="btn btn-primary" 
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <span className="material-icons-round">
                {isSaving ? 'hourglass_empty' : 'save'}
              </span>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Security Actions */}
          <div className="list-section">
            <div className="section-title">Security</div>
            
            <button className="list-item" onClick={handleChangePassword}>
              <div className="item-icon icon-primary">
                <span className="material-icons-round">lock</span>
              </div>
              <div className="item-content">
                <div className="item-label">Change Password</div>
                <div className="item-description">Update your password to keep your account secure</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="list-section danger-section">
            <div className="section-title">Danger Zone</div>
            
            <button className="list-item" onClick={handleDeleteAccount}>
              <div className="item-icon icon-danger">
                <span className="material-icons-round">delete</span>
              </div>
              <div className="item-content">
                <div className="item-label">Delete Account</div>
                <div className="item-description">Permanently delete your account and all data</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>
        </div>
        )}

        {/* Map Modal */}
        {showMapModal && (
          <div className="map-modal-overlay" onClick={() => setShowMapModal(false)}>
            <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="map-modal-header">
                <h3>Region IX - Zamboanga Peninsula</h3>
                <button className="close-btn" onClick={() => setShowMapModal(false)}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="map-modal-body">
                <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
              </div>
              <div className="map-modal-footer">
                <p>Select a municipality and barangay from the dropdowns to see the location on the map.</p>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="map-modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="map-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="map-modal-header">
                <h3>Change Password</h3>
                <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="map-modal-body" style={{ padding: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handlePasswordSubmit}
                  style={{ marginTop: '10px' }}
                >
                  <span className="material-icons-round">lock</span>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default AccountSettings;
