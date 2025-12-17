import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RescheduleBookingForm.css';
import { geolocationAPI } from '../../../utils/api';
import {
  REGION_IX_DATA,
  getAllMunicipalities,
  getBarangaysForMunicipality,
  getMunicipalityCoordinates,
  REGION_IX_BOUNDS,
  REGION_IX_CENTER
} from '../../../data/region9-addresses';

const RescheduleBookingForm: React.FC = () => {
  const history = useHistory();
  const [reason, setReason] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceTime, setServiceTime] = useState<string>('');
  
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

  const goBack = () => history.goBack();

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

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
      alert('Please provide a reason for rescheduling');
      return;
    }
    
    if (!serviceDate || !serviceTime) {
      alert('Please select new date and time');
      return;
    }
    
    try {
      const bookingId = (history.location.state as any)?.bookingId;
      
      // Get client ID from user object
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const clientId = userData?.acc_id || userData?.account_id;
      
      if (!bookingId) {
        alert('Booking information not found');
        return;
      }
      
      if (!clientId) {
        alert('User session not found. Please log in again.');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/bookings/reschedule/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          reason: reason,
          requested_by_id: clientId,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Reschedule request submitted successfully!');
        // Redirect to the rescheduled booking detail page
        history.push(`/client/rescheduled-booking/${bookingId}`);
      } else {
        alert(data.error || 'Failed to submit reschedule request');
      }
    } catch (error) {
      console.error('Reschedule submission error:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonContent className="reschedule-form-content">
        {/* Header */}
        <div className="reschedule-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Reschedule Booking</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <div className="form-card">
            {/* Booking ID */}
            <div className="booking-id-section">
              <span className="booking-id-label">Booking ID:</span>
              <span className="booking-id-value">#BK-2847</span>
            </div>

            <div className="form-divider"></div>

            {/* Reason for Reschedule */}
            <div className="form-section">
              <label className="form-label">Reason for Reschedule</label>
              <textarea
                className="form-textarea"
                placeholder="Please provide a reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-divider"></div>

            {/* New Service Time */}
            <div className="form-section">
              <h3 className="section-title">New Service Time</h3>
              
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

            {/* New Location */}
            <div className="form-section">
              <h3 className="section-title">New Service Location (Region IX - Zamboanga Peninsula)</h3>
              
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
          </div>

          {/* Submit Button */}
          <button className="btn-submit-reschedule" onClick={handleSubmit}>
            <span className="material-icons-round icon-sm">event</span>
            Submit Reschedule Request
          </button>
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

export default RescheduleBookingForm;
