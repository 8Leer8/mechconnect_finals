import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BackJobsForm.css';
import { bookingsAPI, geolocationAPI } from '../../../utils/api';
import {
  REGION_IX_DATA,
  getAllMunicipalities,
  getBarangaysForMunicipality,
  getMunicipalityCoordinates,
  REGION_IX_BOUNDS,
  REGION_IX_CENTER
} from '../../../data/region9-addresses';

interface BookingDetails {
  booking_id: number;
  provider_name: string;
  service_name: string;
  provider_type: string;
}

const BackJobsForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceTime, setServiceTime] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Location fields
  const [locationData, setLocationData] = useState({
    houseNumber: '',
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
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

  // Get booking_id from URL
  const getBookingIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('booking_id');
  };

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const bookingId = getBookingIdFromUrl();
      console.log('BackJobsForm - booking_id from URL:', bookingId);
      
      if (!bookingId) {
        console.error('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching booking details for ID:', bookingId);
        const response = await bookingsAPI.getCompletedBooking(parseInt(bookingId));
        console.log('API Response:', response);
        
        if (response.error) {
          console.error('API Error:', response.error);
          setBookingDetails(null);
          setLoading(false);
          return;
        }
        
        if (response.data) {
          console.log('Booking details fetched successfully:', response.data);
          
          // The API returns nested data under booking_details
          const bookingData = response.data.booking_details || response.data;
          
          setBookingDetails({
            booking_id: bookingData.booking_id,
            provider_name: bookingData.provider_name,
            service_name: bookingData.service_name || 'Service',
            provider_type: bookingData.provider_type
          });
        } else {
          console.error('No data in response');
          setBookingDetails(null);
        }
      } catch (error) {
        console.error('Exception fetching booking details:', error);
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [location]);

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
    setLocationData(prev => ({
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
      setLocationData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng
      }));
    }
  };

  const handleBarangayChange = (barangay: string) => {
    setLocationData(prev => ({ ...prev, barangay }));

    const selectedBarangay = availableBarangays.find(b => b.name === barangay);
    if (selectedBarangay) {
      addMarker(selectedBarangay.lat, selectedBarangay.lng);
      setLocationData(prev => ({
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

      setLocationData(prev => ({
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
      alert('Could not get your location. Please select from the dropdowns instead.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const goBack = () => history.goBack();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Compress image before converting to base64
      const reader = new FileReader();
      reader.onload = (e) => {
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
          setIssueImage(compressedBase64);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!bookingDetails) {
      alert('Booking details not loaded');
      return;
    }

    if (!issueDescription.trim()) {
      alert('Please describe the issue');
      return;
    }

    try {
      console.log('Submitting back job request...');
      
      // Get client ID from localStorage
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const clientId = userData?.acc_id || userData?.account_id;
      
      if (!clientId) {
        alert('User session not found. Please log in again.');
        return;
      }
      
      console.log('BackJobsForm - Submitting with client ID:', clientId);
      
      const response = await bookingsAPI.createBackJobRequest(
        bookingDetails.booking_id,
        clientId,
        issueDescription
      );

      if (response.error) {
        alert(`Error: ${response.error}`);
        return;
      }

      console.log('Back job request created:', response.data);
      alert('Back job request submitted successfully!');
      history.push('/client/booking');
    } catch (error) {
      console.error('Error submitting back job request:', error);
      alert('Failed to submit back job request. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonContent className="back-jobs-form-content">
        {/* Header */}
        <div className="back-jobs-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Request Back Job</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          {loading ? (
            <div className="loading-message">Loading booking details...</div>
          ) : !bookingDetails ? (
            <div className="error-message">
              <p>Booking not found. Please try again.</p>
              <button className="btn-back-home" onClick={goBack}>Go Back</button>
            </div>
          ) : (
            <div className="form-card">
              {/* Booking ID */}
              <div className="booking-id-section">
                <span className="booking-id-label">Original Booking ID:</span>
                <span className="booking-id-value">#BK-{bookingDetails.booking_id}</span>
              </div>

              <div className="form-divider"></div>

              {/* Provider Info */}
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">{bookingDetails.provider_name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Provider Type:</span>
                <span className="detail-value">{bookingDetails.provider_type === 'shop' ? 'Shop' : 'Mechanic'}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Original Service:</span>
                <span className="detail-value">{bookingDetails.service_name}</span>
              </div>

              <div className="form-divider"></div>

              {/* Issue Description */}
              <div className="form-section">
                <label className="form-label">Describe the Issue</label>
                <textarea
                  className="form-textarea"
                  placeholder="Please describe the problem with the completed service..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="form-divider"></div>

              {/* Issue Picture */}
              <div className="form-section">
                <h3 className="section-title">Issue Picture</h3>
              
                <div className="image-upload-container">
                  {issueImage ? (
                    <div className="uploaded-image-wrapper">
                      <img src={issueImage} alt="Issue" className="uploaded-image" />
                      <button 
                        className="remove-image-button"
                        onClick={() => setIssueImage(null)}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                      />
                      <div className="upload-placeholder">
                        <span className="material-icons-round upload-icon">add_photo_alternate</span>
                        <span className="upload-text">Upload issue picture</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-divider"></div>

              {/* Service Time */}
              <div className="form-section">
                <h3 className="section-title">Preferred Service Time</h3>
                
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-divider"></div>

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">Service Location (Region IX - Zamboanga Peninsula)</h3>
                
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
                    {isLocationLoading ? 'Detecting...' : 'Detect GPS'}
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
                
                <div className="location-grid">
                  <div className="input-group">
                    <label className="input-label">House/Building No</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 123"
                      value={locationData.houseNumber}
                      onChange={(e) => setLocationData(prev => ({ ...prev, houseNumber: e.target.value }))}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Street</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Main St"
                      value={locationData.street}
                      onChange={(e) => setLocationData(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Municipality <span style={{color: 'red'}}>*</span></label>
                    <select
                      className="form-input"
                      value={locationData.cityMunicipality}
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

                  <div className="input-group">
                    <label className="input-label">Barangay <span style={{color: 'red'}}>*</span></label>
                    <select
                      className="form-input"
                      value={locationData.barangay}
                      onChange={(e) => handleBarangayChange(e.target.value)}
                      disabled={!locationData.cityMunicipality}
                    >
                      <option value="">Select Barangay</option>
                      {availableBarangays.map(barangay => (
                        <option key={barangay.name} value={barangay.name}>
                          {barangay.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Province</label>
                    <input
                      type="text"
                      className="form-input"
                      value={locationData.province}
                      readOnly
                      style={{ background: '#f0f0f0' }}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={locationData.region}
                      readOnly
                      style={{ background: '#f0f0f0' }}
                    />
                  </div>

                  {locationData.latitude && locationData.longitude && (
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label">Coordinates</label>
                      <input
                        type="text"
                        className="form-input"
                        value={`${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`}
                        readOnly
                        style={{ background: '#f0f0f0' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button className="btn-submit-backjob" onClick={handleSubmit}>
                <span className="material-icons-round icon-sm">send</span>
                Submit Back Job Request
              </button>
            </div>
          )}
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

export default BackJobsForm;
