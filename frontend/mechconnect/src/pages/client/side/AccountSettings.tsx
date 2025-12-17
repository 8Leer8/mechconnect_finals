import { useState, useEffect, useRef } from 'react';
import { IonContent, IonPage } from '@ionic/react';
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
import { geolocationAPI } from '../../../utils/api';
import './AccountSettings.css';

const AccountSettings: React.FC = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+63 912 345 6789',
    houseNumber: '123',
    street: 'Main Street',
    barangay: 'Tetuan',
    cityMunicipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    region: 'Region IX - Zamboanga Peninsula',
    latitude: null as number | null,
    longitude: null as number | null
  });

  const [availableBarangays, setAvailableBarangays] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [allMunicipalities] = useState(getAllMunicipalities());
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const goBack = () => {
    history.goBack();
  };

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
      addMarker(coords.lat, coords.lng);
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng
      }));
    }
  };

  const handleBarangayChange = (barangay: string) => {
    setFormData(prev => ({ ...prev, barangay }));

    const selectedBarangay = availableBarangays.find(b => b.name === barangay);
    if (selectedBarangay) {
      addMarker(selectedBarangay.lat, selectedBarangay.lng);
      setFormData(prev => ({
        ...prev,
        latitude: selectedBarangay.lat,
        longitude: selectedBarangay.lng
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
    console.log('Edit profile picture');
  };

  const handleSaveChanges = () => {
    console.log('Save changes:', formData);
  };

  const handleChangePassword = () => {
    console.log('Change password');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account');
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

        <div className="account-settings-container">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-wrapper">
              <div className="profile-picture">JD</div>
              <button className="edit-picture-button" onClick={handleEditProfile}>
                <span className="material-icons-round">edit</span>
              </button>
            </div>
            <div className="profile-username">johndoe</div>
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
                  <optgroup key={province.province} label={province.province}>
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

            <button className="btn btn-primary" onClick={handleSaveChanges}>
              <span className="material-icons-round">save</span>
              Save Changes
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
      </IonContent>
    </IonPage>
  );
};

export default AccountSettings;
