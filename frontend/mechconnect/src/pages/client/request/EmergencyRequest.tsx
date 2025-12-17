import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { geolocationAPI } from '../../../utils/api';
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
import './EmergencyRequest.css';

interface LocationData {
  houseNumber: string;
  street: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
}

const EmergencyRequest: React.FC = () => {
  const history = useHistory();
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Location states
  const [locationData, setLocationData] = useState<LocationData>({
    houseNumber: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: 'Region IX - Zamboanga Peninsula',
    latitude: null,
    longitude: null
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [availableBarangays, setAvailableBarangays] = useState<Array<{name: string}>>([]);
  const [allMunicipalities] = useState(getAllMunicipalities());
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  // Toast and loading states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client ID - TODO: Get from authentication context
  const [clientId] = useState<number>(1);

  // Fetch saved location on mount
  useEffect(() => {
    fetchSavedLocation();
  }, []);

  // Initialize Leaflet map when modal opens
  useEffect(() => {
    if (showMapModal && mapRef.current && !mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
          center: REGION_IX_CENTER,
          zoom: 9,
          maxBounds: REGION_IX_BOUNDS,
          maxBoundsViscosity: 1.0,
          minZoom: 8,
          maxZoom: 16
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add boundary rectangle to visualize Region IX
        L.rectangle(REGION_IX_BOUNDS, {
          color: '#3388ff',
          weight: 2,
          fillOpacity: 0.1
        }).addTo(map);

        mapInstanceRef.current = map;

        // Set marker if there's existing location
        if (locationData.latitude && locationData.longitude) {
          addMarker(locationData.latitude, locationData.longitude);
        }

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      }, 50);

      return () => {
        clearTimeout(timer);
      };
    }

    // Cleanup map when modal closes
    if (!showMapModal && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [showMapModal]);

  // Add or update marker on map
  const addMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #e74c3c; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add new marker
    markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);
  };

  // Handle municipality change - update barangays
  const handleMunicipalityChange = (municipality: string, province: string) => {
    const barangays = getBarangaysForMunicipality(municipality, province);
    setAvailableBarangays(barangays);
    
    setLocationData(prev => ({
      ...prev,
      cityMunicipality: municipality,
      province: province,
      barangay: '' // Reset barangay when municipality changes
    }));

    // Update map center to municipality
    const coords = getMunicipalityCoordinates(municipality, province);
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, 13);
      addMarker(coords[0], coords[1]);
      setLocationData(prev => ({
        ...prev,
        latitude: coords[0],
        longitude: coords[1]
      }));
    }
  };

  // Handle barangay selection
  const handleBarangayChange = (barangay: string) => {
    setLocationData(prev => ({
      ...prev,
      barangay: barangay
    }));
  };

  // Fetch saved client location from database
  const fetchSavedLocation = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/client/${clientId}/address/`);
      const data = await response.json();
      
      if (response.ok && data.address) {
        const addr = data.address;
        
        if (addr.city_municipality && addr.province) {
          setLocationData({
            houseNumber: addr.house_building_number || '',
            street: addr.street_name || '',
            barangay: addr.barangay || '',
            cityMunicipality: addr.city_municipality || '',
            province: addr.province || '',
            region: 'Region IX - Zamboanga Peninsula',
            latitude: null,
            longitude: null
          });

          // Load barangays for saved municipality
          if (addr.city_municipality) {
            const barangays = getBarangaysForMunicipality(addr.city_municipality, addr.province);
            setAvailableBarangays(barangays);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching saved location:', error);
    }
  };

  // Get current location using geolocation API (restricted to Region IX)
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    try {
      const position = await geolocationAPI.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Check if location is within Region IX bounds
      const [sw, ne] = REGION_IX_BOUNDS;
      const isInRegion9 = latitude >= sw[0] && latitude <= ne[0] && longitude >= sw[1] && longitude <= ne[1];
      
      if (!isInRegion9) {
        setToastMessage('You are outside Region IX - Zamboanga Peninsula. Please select your location from the form.');
        setToastColor('warning');
        setShowToast(true);
        setIsLocationLoading(false);
        return;
      }

      // Update map with current location
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 14);
        addMarker(latitude, longitude);
      }
      
      setLocationData(prev => ({
        ...prev,
        latitude,
        longitude
      }));
      
      setToastMessage('Location detected. Please select your municipality and barangay.');
      setToastColor('success');
      setShowToast(true);
    } catch (error: any) {
      console.error('Geolocation error:', error);
      let errorMessage = 'Could not get your location. ';
      
      if (error.code === 1) {
        errorMessage += 'Please allow location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location services unavailable.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += error.message || 'Please check permissions and try again.';
      }
      
      setToastMessage(errorMessage);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const goBack = () => {
    history.goBack();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image before converting to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw compressed image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.7 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setSelectedImage(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleRequest = async () => {
    // Validation
    if (!problemDescription.trim()) {
      setToastMessage('Please describe your emergency situation');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    // Validate location
    if (!locationData.barangay || !locationData.cityMunicipality || !locationData.province) {
      setToastMessage('Please complete all address fields (Municipality and Barangay are required)');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        client_id: clientId,
        description: problemDescription.trim(),
        concern_picture: selectedImage || '',
        // Location data
        house_building_number: locationData.houseNumber,
        street_name: locationData.street,
        subdivision_village: '',
        barangay: locationData.barangay,
        city_municipality: locationData.cityMunicipality,
        province: locationData.province,
        region: locationData.region,
        postal_code: ''
      };

      console.log('Submitting emergency request:', requestData);

      const response = await fetch('http://localhost:8000/api/requests/emergency/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response Status:', response.status);
      console.log('Response Data:', data);

      if (response.ok) {
        setToastMessage('Emergency request submitted! Help is on the way!');
        setToastColor('success');
        setShowToast(true);
        
        // Navigate to requests page after a delay
        setTimeout(() => {
          history.push('/client/request');
        }, 2000);
      } else {
        // Show detailed error message
        const errorMsg = data.error || data.details || 'Failed to submit emergency request';
        console.error('Backend error:', errorMsg);
        setToastMessage(errorMsg);
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error: any) {
      console.error('❌ Network Error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      const errorMsg = error.message || 'Network error occurred. Please try again.';
      setToastMessage(`Network Error: ${errorMsg}`);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
      console.log('=== Request Completed ===');
    }
  };

  return (
    <IonPage>
      <IonContent className="emergency-request-content">
        <div className="emergency-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="emergency-request-title">Emergency Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="emergency-badge">
            <span className="material-icons-round emergency-icon">emergency</span>
            <span className="emergency-text">Urgent Assistance Required</span>
          </div>

          <div className="request-card">
            <div className="form-section">
              <label className="form-label">Describe Emergency*</label>
              <textarea
                className="form-textarea"
                placeholder="Please describe your emergency situation in detail..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={8}
              />
              <p className="helper-text">
                <span className="material-icons-round" style={{fontSize: '14px', verticalAlign: 'middle'}}>info</span>
                {' '}Our team will respond immediately to your emergency request.
              </p>
            </div>

            <div className="divider"></div>

            <div className="form-section">
              <label className="form-label">Emergency Location*</label>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                Service area: Region IX - Zamboanga Peninsula only
              </p>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">House Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter house/building number"
                  value={locationData.houseNumber}
                  onChange={(e) => setLocationData(prev => ({...prev, houseNumber: e.target.value}))}
                />
              </div>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">Street (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter street name"
                  value={locationData.street}
                  onChange={(e) => setLocationData(prev => ({...prev, street: e.target.value}))}
                />
              </div>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">City / Municipality *</label>
                <select
                  className="form-input"
                  value={locationData.cityMunicipality ? `${locationData.cityMunicipality}|${locationData.province}` : ''}
                  onChange={(e) => {
                    const [muni, prov] = e.target.value.split('|');
                    if (muni && prov) {
                      handleMunicipalityChange(muni, prov);
                    }
                  }}
                  required
                >
                  <option value="">Select Municipality/City</option>
                  {REGION_IX_DATA.map(province => (
                    <optgroup key={province.name} label={province.name}>
                      {province.municipalities.map(muni => (
                        <option 
                          key={`${muni.name}-${province.name}`} 
                          value={`${muni.name}|${province.name}`}
                        >
                          {muni.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">Barangay *</label>
                <select
                  className="form-input"
                  value={locationData.barangay}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  disabled={availableBarangays.length === 0}
                  required
                >
                  <option value="">Select Barangay</option>
                  {availableBarangays.map(brgy => (
                    <option key={brgy.name} value={brgy.name}>
                      {brgy.name}
                    </option>
                  ))}
                </select>
                {availableBarangays.length === 0 && locationData.cityMunicipality === '' && (
                  <p style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
                    Please select a municipality first
                  </p>
                )}
              </div>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationData.province}
                  disabled
                  style={{backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>

              <div className="form-group" style={{marginBottom: '12px'}}>
                <label className="form-label-small">Region</label>
                <input
                  type="text"
                  className="form-input"
                  value={locationData.region}
                  disabled
                  style={{backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>

              <div className="form-group">
                <button 
                  className="btn-location" 
                  onClick={() => setShowMapModal(true)}
                  type="button"
                  style={{marginTop: '8px'}}
                >
                  <span className="material-icons-round">map</span>
                  View Map
                </button>
                <button 
                  className="btn-location" 
                  onClick={getCurrentLocation}
                  disabled={isLocationLoading}
                  type="button"
                  style={{marginTop: '8px', marginLeft: '8px'}}
                >
                  <span className="material-icons-round">my_location</span>
                  {isLocationLoading ? 'Detecting...' : 'Detect Location'}
                </button>
              </div>

              {locationData.latitude && locationData.longitude && (
                <div style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                  📍 Coordinates: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                </div>
              )}
            </div>

            <div className="divider"></div>

            <div className="form-section">
              <label className="form-label">Photo (Optional)</label>
              <div className="image-upload-section">
                {selectedImage ? (
                  <div className="image-preview">
                    <img src={selectedImage} alt="Concern" className="preview-image" />
                    <button className="btn-remove-image" onClick={removeImage}>
                      <span className="material-icons-round">close</span>
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="upload-placeholder">
                    <span className="material-icons-round upload-icon">add_photo_alternate</span>
                    <span className="upload-text">Add Photo of Emergency</span>
                  </label>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <button 
            className="btn-emergency-request" 
            onClick={handleRequest}
            disabled={isSubmitting}
          >
            <span className="material-icons-round icon-sm">emergency</span>
            {isSubmitting ? 'Submitting...' : 'Request Emergency Help'}
          </button>

          <div className="emergency-info">
            <p style={{fontSize: '13px', color: '#666', textAlign: 'center', margin: '16px 0'}}>
              <span className="material-icons-round" style={{fontSize: '16px', verticalAlign: 'middle'}}>warning</span>
              {' '}This will alert nearby mechanics immediately
            </p>
          </div>
        </div>

        {/* Map Modal */}
        {showMapModal && (
          <div className="map-modal-overlay" onClick={() => setShowMapModal(false)}>
            <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="map-modal-header">
                <h3>Select Location - Region IX</h3>
                <button 
                  className="map-modal-close"
                  onClick={() => setShowMapModal(false)}
                >
                  <span className="material-icons-round">close</span>
                </button>
              </div>
              <div className="map-modal-body">
                <div 
                  ref={mapRef} 
                  style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '8px'
                  }}
                />
                <div style={{marginTop: '12px', fontSize: '14px', color: '#666'}}>
                  <p><strong>Selected Municipality:</strong> {locationData.cityMunicipality || 'Not selected'}</p>
                  <p><strong>Selected Barangay:</strong> {locationData.barangay || 'Not selected'}</p>
                  {locationData.latitude && locationData.longitude && (
                    <p><strong>Coordinates:</strong> {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}</p>
                  )}
                </div>
              </div>
              <div className="map-modal-footer">
                <button 
                  className="btn-emergency"
                  onClick={() => setShowMapModal(false)}
                  style={{width: '100%'}}
                >
                  Done
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
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default EmergencyRequest;
