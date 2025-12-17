import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
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
import './DirectRequest.css';

interface AddOn {
  service_add_on_id: number;
  name: string;
  description?: string;
  price: number;
  checked: boolean;
}

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

interface RouteState {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  providerId: number;
  providerName: string;
  providerType: string;
}

const DirectRequest: React.FC = () => {
  const history = useHistory();
  const location = useLocation<RouteState>();
  
  // Service data from navigation state
  const serviceData = location.state;
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client ID from authentication
  const [clientId, setClientId] = useState<number | null>(null);

  // Get client ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.acc_id || userData.account_id;
        if (id) {
          setClientId(id);
          console.log('DirectRequest - Using client ID:', id);
        } else {
          console.error('No user ID found in localStorage');
          alert('User session not found. Please log in again.');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        alert('Invalid user session. Please log in again.');
      }
    } else {
      console.error('No user data in localStorage');
      alert('Not authenticated. Please log in.');
    }
  }, []);

  // Fetch service addons from database
  const fetchServiceAddons = async () => {
    if (!serviceData?.serviceId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/services/${serviceData.serviceId}/addons/`);
      const data = await response.json();
      
      if (response.ok && data.addons) {
        setAddOns(data.addons.map((addon: any) => ({
          service_add_on_id: addon.service_add_on_id,
          name: addon.name,
          description: addon.description,
          price: parseFloat(addon.price),
          checked: false
        })));
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
  };

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

  // Fetch service addons and saved location on mount
  useEffect(() => {
    const init = async () => {
      if (!serviceData) {
        setToastMessage('No service data provided. Please select a service first.');
        setToastColor('danger');
        setShowToast(true);
        setLoading(false);
        return;
      }
      
      try {
        await Promise.all([
          fetchServiceAddons(),
          fetchSavedLocation()
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [serviceData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen && dateInputRef.current) {
      const rect = dateInputRef.current.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 4;
      const left = rect.left + window.scrollX;
      setCalendarPosition({ top, left });
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const goBack = () => {
    history.goBack();
  };

  const handleAddOnToggle = (id: number) => {
    setAddOns(addOns.map(addon => 
      addon.service_add_on_id === id ? { ...addon, checked: !addon.checked } : addon
    ));
  };

  const calculateTotal = () => {
    const addOnsTotal = addOns
      .filter(addon => addon.checked)
      .reduce((sum, addon) => sum + addon.price, 0);
    return (serviceData?.servicePrice || 0) + addOnsTotal;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const today = new Date();

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(
        <button key={`prev-${i}`} className="day other-month" disabled>
          {prevMonthLastDay - i}
        </button>
      );
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const isToday = year === today.getFullYear() && 
                      month === today.getMonth() && 
                      i === today.getDate();
      const isSelected = selectedDate &&
                         year === selectedDate.getFullYear() &&
                         month === selectedDate.getMonth() &&
                         i === selectedDate.getDate();

      days.push(
        <button
          key={i}
          className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(i)}
        >
          {i}
        </button>
      );
    }

    // Next month days
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <button key={`next-${i}`} className="day other-month" disabled>
          {i}
        </button>
      );
    }

    return days;
  };

  const handleRequest = async () => {
    // Validation
    if (!selectedDate || !selectedTime) {
      setToastMessage('Please select date and time for the service');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    if (!locationData.barangay || !locationData.cityMunicipality || !locationData.province) {
      setToastMessage('Please complete all address fields (Municipality and Barangay are required)');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate location data
      if (!locationData.barangay || !locationData.cityMunicipality || !locationData.province) {
        setToastMessage('Please complete all address fields (Municipality and Barangay are required)');
        setToastColor('warning');
        setShowToast(true);
        return;
      }

      const requestData = {
        client_id: clientId,
        provider_id: serviceData.providerId,
        service_id: serviceData.serviceId,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedTime,
        selected_addon_ids: addOns.filter(a => a.checked).map(a => a.service_add_on_id),
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

      console.log('Submitting direct request:', requestData);

      const response = await fetch('http://localhost:8000/api/requests/direct/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        setToastMessage('Direct request submitted successfully!');
        setToastColor('success');
        setShowToast(true);
        
        // Navigate to requests page after a delay
        setTimeout(() => {
          history.push('/client/request');
        }, 1500);
      } else {
        setToastMessage(data.error || 'Failed to submit request');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setToastMessage('Network error occurred');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="direct-request-content">
          <div className="loading-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <div className="loading-spinner"></div>
            <p>Loading service details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!serviceData) {
    return (
      <IonPage>
        <IonContent className="direct-request-content">
          <div className="error-container" style={{padding: '20px', textAlign: 'center'}}>
            <h3>No Service Selected</h3>
            <p>Please select a service from the shop or mechanic page</p>
            <button className="btn-request" onClick={() => history.push('/client/discover')}>
              Browse Services
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="direct-request-content">
        <div className="direct-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="direct-request-title">Direct Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="service-section">
              <div className="service-header">
                <h2 className="section-title">Service</h2>
              </div>
              <div className="service-detail">
                <div className="service-info">
                  <span className="service-name">{serviceData.serviceName}</span>
                  <span className="service-price">₱{serviceData.servicePrice?.toLocaleString()}</span>
                </div>
                <div className="provider-info" style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
                  {serviceData.providerName} • {serviceData.providerType}
                </div>
              </div>
            </div>

            {addOns.length > 0 && (
              <>
                <div className="divider"></div>
                <div className="addons-section">
                  <h2 className="section-title">Add-ons</h2>
                  <div className="addons-list">
                    {addOns.map((addon) => (
                      <div key={addon.service_add_on_id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`addon-${addon.service_add_on_id}`}
                          className="checkbox-input"
                          checked={addon.checked}
                          onChange={() => handleAddOnToggle(addon.service_add_on_id)}
                        />
                        <label htmlFor={`addon-${addon.service_add_on_id}`} className="checkbox-custom">
                          <span className="checkbox-check">check</span>
                        </label>
                        <label htmlFor={`addon-${addon.service_add_on_id}`} className="checkbox-label">
                          <span className="addon-name">{addon.name}</span>
                          <span className="addon-price">₱{addon.price?.toLocaleString()}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="divider"></div>

            <div className="schedule-section">
              <h2 className="section-title">Service Location</h2>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>
                Service area: Region IX - Zamboanga Peninsula only
              </p>

              <div className="form-group">
                <label className="form-label">House Number</label>
                <input
                  type="text"
                  className="time-input"
                  placeholder="Enter house/building number"
                  value={locationData.houseNumber}
                  onChange={(e) => setLocationData(prev => ({...prev, houseNumber: e.target.value}))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street (Optional)</label>
                <input
                  type="text"
                  className="time-input"
                  placeholder="Enter street name"
                  value={locationData.street}
                  onChange={(e) => setLocationData(prev => ({...prev, street: e.target.value}))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Municipality *</label>
                <select
                  className="time-input"
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

              <div className="form-group">
                <label className="form-label">Barangay *</label>
                <select
                  className="time-input"
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

              <div className="form-group">
                <label className="form-label">Province</label>
                <input
                  type="text"
                  className="time-input"
                  value={locationData.province}
                  disabled
                  style={{backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Region</label>
                <input
                  type="text"
                  className="time-input"
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

            <div className="schedule-section">
              <h2 className="section-title">Schedule Service</h2>
              
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <div className="datepicker-container">
                  <input
                    ref={dateInputRef}
                    type="text"
                    className="datepicker-input"
                    placeholder="Choose a date"
                    value={selectedDate ? selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : ''}
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    readOnly
                  />
                  <span className="datepicker-icon material-icons-round">calendar_today</span>

                  {isCalendarOpen && (
                    <div 
                      className="calendar active" 
                      ref={calendarRef}
                      style={{
                        top: `${calendarPosition.top}px`,
                        left: `${calendarPosition.left}px`
                      }}
                    >
                      <div className="calendar-header">
                        <span className="calendar-month">
                          {currentMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <div className="calendar-nav">
                          <button className="nav-btn" onClick={() => changeMonth(-1)}>
                            <span className="material-icons-round">chevron_left</span>
                          </button>
                          <button className="nav-btn" onClick={() => changeMonth(1)}>
                            <span className="material-icons-round">chevron_right</span>
                          </button>
                        </div>
                      </div>

                      <div className="calendar-weekdays">
                        <div className="weekday">Sun</div>
                        <div className="weekday">Mon</div>
                        <div className="weekday">Tue</div>
                        <div className="weekday">Wed</div>
                        <div className="weekday">Thu</div>
                        <div className="weekday">Fri</div>
                        <div className="weekday">Sat</div>
                      </div>

                      <div className="calendar-days">{renderCalendar()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Input Time</label>
                <input
                  type="time"
                  className="time-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="divider"></div>

            <div className="total-section">
              <span className="total-label">Total Price</span>
              <span className="total-amount">₱{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <button 
            className="btn-request" 
            onClick={handleRequest}
            disabled={isSubmitting}
          >
            <span className="material-icons-round icon-sm">send</span>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
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
                  className="btn-request"
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

export default DirectRequest;
