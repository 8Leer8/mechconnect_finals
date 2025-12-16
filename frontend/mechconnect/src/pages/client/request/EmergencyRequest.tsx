import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { geolocationAPI } from '../../../utils/api';
import './EmergencyRequest.css';

interface LocationData {
  houseBuildingNumber: string;
  streetName: string;
  subdivisionVillage: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string;
}

const EmergencyRequest: React.FC = () => {
  const history = useHistory();
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Location states
  const [locationData, setLocationData] = useState<LocationData>({
    houseBuildingNumber: '',
    streetName: '',
    subdivisionVillage: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    formattedAddress: ''
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
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

  // Fetch saved client location from database
  const fetchSavedLocation = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/client/${clientId}/address/`);
      const data = await response.json();
      
      if (response.ok && data.address) {
        const addr = data.address;
        
        // Build formatted address from available fields
        const addressParts = [
          addr.house_building_number,
          addr.street_name,
          addr.subdivision_village,
          addr.barangay,
          addr.city_municipality,
          addr.province
        ].filter(part => part && part.trim() !== '');
        
        // Only set location data if there's actual address information
        if (addressParts.length > 0) {
          setLocationData({
            houseBuildingNumber: addr.house_building_number || '',
            streetName: addr.street_name || '',
            subdivisionVillage: addr.subdivision_village || '',
            barangay: addr.barangay || '',
            cityMunicipality: addr.city_municipality || '',
            province: addr.province || '',
            region: addr.region || '',
            postalCode: addr.postal_code || '',
            latitude: null,
            longitude: null,
            formattedAddress: addressParts.join(', ')
          });
        } else {
          // Keep empty state if no valid address data
          console.log('No saved address found, keeping empty state');
        }
      }
    } catch (error) {
      console.error('Error fetching saved location:', error);
      // Keep empty state on error
    }
  };

  // Get current location using geolocation API
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    try {
      const position = await geolocationAPI.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const address = await geolocationAPI.reverseGeocode(latitude, longitude);
      
      setLocationData(prev => ({
        ...prev,
        latitude,
        longitude,
        formattedAddress: address,
        streetName: address.split(',')[0] || '',
        cityMunicipality: address.split(',')[1]?.trim() || '',
        province: address.split(',')[2]?.trim() || ''
      }));
      
      setToastMessage('Location set successfully!');
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
      // Convert to base64 or handle file upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
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

    // Location is optional but recommended
    if (!locationData.cityMunicipality && !locationData.formattedAddress) {
      console.warn('No location provided - continuing anyway for emergency');
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        client_id: clientId,
        description: problemDescription.trim(),
        concern_picture: selectedImage || '',
        // Location data
        house_building_number: locationData.houseBuildingNumber,
        street_name: locationData.streetName,
        subdivision_village: locationData.subdivisionVillage,
        barangay: locationData.barangay,
        city_municipality: locationData.cityMunicipality,
        province: locationData.province,
        region: locationData.region,
        postal_code: locationData.postalCode
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
              <label className="form-label">Current Location*</label>
              <div className="location-display">
                {locationData.formattedAddress ? (
                  <div className="location-text">
                    <span className="material-icons-round" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>
                      location_on
                    </span>
                    {locationData.formattedAddress}
                  </div>
                ) : (
                  <div className="location-text" style={{color: '#999'}}>
                    <span className="material-icons-round" style={{fontSize: '18px', verticalAlign: 'middle', marginRight: '8px'}}>
                      location_off
                    </span>
                    No location set
                  </div>
                )}
                <button 
                  className="btn-location" 
                  onClick={getCurrentLocation}
                  disabled={isLocationLoading}
                  style={{marginTop: '12px'}}
                >
                  <span className="material-icons-round">my_location</span>
                  {isLocationLoading ? 'Getting Location...' : 'Set My Location'}
                </button>
              </div>
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
