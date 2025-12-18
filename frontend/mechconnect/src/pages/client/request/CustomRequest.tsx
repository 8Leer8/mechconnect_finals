import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { requestsAPI, geolocationAPI } from '../../../utils/api';
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
import './CustomRequest.css';

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

const CustomRequest: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<'urgent' | 'freely'>('urgent');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Location state
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
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [availableBarangays, setAvailableBarangays] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [allMunicipalities] = useState(getAllMunicipalities());
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Client ID - In a real app, this would come from authentication context
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
          console.log('CustomRequest - Using client ID:', id);
        } else {
          console.error('No user ID found in localStorage');
          setToastMessage('User session not found. Please log in again.');
          setShowToast(true);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setToastMessage('Invalid user session. Please log in again.');
        setShowToast(true);
      }
    } else {
      console.error('No user data in localStorage');
      setToastMessage('Not authenticated. Please log in.');
      setShowToast(true);
    }
  }, []);
  
  // Provider ID - Get from URL parameters if coming from mechanic profile
  const [providerId, setProviderId] = useState<number | null>(null);

  useEffect(() => {
    // Parse URL parameters to get provider_id
    const urlParams = new URLSearchParams(location.search);
    const providerIdParam = urlParams.get('provider_id');
    if (providerIdParam) {
      setProviderId(parseInt(providerIdParam, 10));
    }
  }, [location.search]);

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

  // Add marker to map
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

  // Handle municipality selection
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

  // Handle barangay selection
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

  // Geolocation functions
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    
    try {
      const position = await geolocationAPI.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Check if location is within Region IX bounds
      const isWithinRegionIX = 
        latitude >= REGION_IX_BOUNDS[0][0] && 
        latitude <= REGION_IX_BOUNDS[1][0] &&
        longitude >= REGION_IX_BOUNDS[0][1] && 
        longitude <= REGION_IX_BOUNDS[1][1];

      if (!isWithinRegionIX) {
        setError('Your current location is outside Region IX (Zamboanga Peninsula). Please select a municipality and barangay from the dropdowns.');
        setShowToast(true);
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
      
      setSuccessMessage('GPS location detected in Region IX!');
      setShowToast(true);
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
      
      setError(errorMessage);
      setShowToast(true);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Save current location for future use
  const saveCurrentLocation = () => {
    if (locationData.street || locationData.cityMunicipality) {
      const locationToSave = {
        ...locationData,
        houseNumber: locationData.houseNumber || 'Current Location'
      };
      
      setSavedLocations(prev => {
        const updated = [locationToSave, ...prev.slice(0, 4)]; // Keep only 5 locations
        localStorage.setItem('savedLocations', JSON.stringify(updated));
        return updated;
      });
      
      setSuccessMessage('Location saved!');
      setShowToast(true);
    }
  };

  // Load saved locations on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!showMapModal || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(REGION_IX_CENTER, 9);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add Region IX boundary
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
          
          // Calculate new dimensions (max 400px width/height for smaller base64)
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
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
          
          // Convert to base64 with high compression (0.3 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.3);
          setSelectedImage(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRequestTypeChange = (type: 'urgent' | 'freely') => {
    setRequestType(type);
    if (type === 'urgent') {
      setSelectedDate(null);
      setSelectedTime('');
    }
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

  // API call to create custom request
  const createCustomRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!problemDescription.trim()) {
        throw new Error('Problem description is required');
      }

      if (requestType === 'freely' && (!selectedDate || !selectedTime)) {
        throw new Error('Date and time are required for scheduled requests');
      }

      // Validate location fields
      if (!locationData.cityMunicipality) {
        throw new Error('Municipality is required. Please select from the dropdown.');
      }

      if (!locationData.barangay) {
        throw new Error('Barangay is required. Please select from the dropdown.');
      }

      // Prepare the request data
      const requestData = {
        client_id: clientId,
        provider_id: providerId, // Include provider ID if available
        description: problemDescription.trim(),
        concern_picture: selectedImage || '',
        estimated_budget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        schedule_type: requestType,
        scheduled_date: requestType === 'freely' && selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        scheduled_time: requestType === 'freely' ? selectedTime : null,
        // Location data
        house_building_number: locationData.houseNumber || '',
        street_name: locationData.street || '',
        subdivision_village: '',
        barangay: locationData.barangay || '',
        city_municipality: locationData.cityMunicipality || '',
        province: locationData.province || '',
        region: locationData.region || '',
        postal_code: ''
      };

      console.log('Sending request data:', requestData);

      const response = await fetch('http://localhost:8000/api/requests/custom/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSuccessMessage('Custom request submitted successfully!');
        setShowToast(true);
        
        // Reset form after successful submission
        setProblemDescription('');
        setSelectedImage(null);
        setRequestType('urgent');
        setSelectedDate(null);
        setSelectedTime('');
        setEstimatedBudget('');
        setLocationData({
          houseNumber: '',
          street: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          region: 'Region IX - Zamboanga Peninsula',
          latitude: null,
          longitude: null
        });

        // Navigate back to requests page after a delay
        setTimeout(() => {
          history.push('/client/request');
        }, 2000);
        
      } else {
        // Show detailed validation errors from backend
        let errorMessage = data.error || 'Failed to submit request';
        
        // If there are validation details, format them nicely
        if (data.details) {
          const detailMessages = Object.entries(data.details)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = `${errorMessage}\n\n${detailMessages}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = () => {
    createCustomRequest();
  };

  // Handle location input changes
  const handleLocationChange = (field: keyof LocationData, value: string) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <IonPage>
      <IonContent className="custom-request-content">
        <div className="custom-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="custom-request-title">
            {providerId ? 'Request to Mechanic' : 'Custom Request'}
          </h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="form-section">
              <label className="form-label">Problem Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the problem with your vehicle..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Attach Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {selectedImage ? (
                <div className="image-preview-container">
                  <img src={selectedImage} alt="Preview" className="image-preview" />
                  <button className="remove-image-btn" onClick={handleRemoveImage}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ) : (
                <div className="image-upload-box" onClick={handleImageClick}>
                  <span className="material-icons-round upload-icon">add_photo_alternate</span>
                  <span className="upload-text">Click to upload image</span>
                </div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Location (Region IX - Zamboanga Peninsula)</label>
              
              <div className="location-buttons" style={{ marginBottom: '16px' }}>
                <button 
                  className="btn-location btn-detect"
                  onClick={getCurrentLocation}
                  disabled={isLocationLoading}
                >
                  <span className="material-icons-round">
                    {isLocationLoading ? 'hourglass_empty' : 'my_location'}
                  </span>
                  {isLocationLoading ? 'Detecting GPS...' : 'Detect GPS Location'}
                </button>
                <button 
                  className="btn-location btn-map"
                  onClick={() => setShowMapModal(true)}
                >
                  <span className="material-icons-round">map</span>
                  View Map
                </button>
              </div>

              <div className="location-grid">
                <div className="form-group">
                  <label className="form-label-small">House/Building No.</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g., 123"
                    value={locationData.houseNumber}
                    onChange={(e) => handleLocationChange('houseNumber', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Street</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="e.g., Main St"
                    value={locationData.street}
                    onChange={(e) => handleLocationChange('street', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Municipality <span style={{color: 'red'}}>*</span></label>
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

                <div className="form-group">
                  <label className="form-label-small">Barangay <span style={{color: 'red'}}>*</span></label>
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

                <div className="form-group">
                  <label className="form-label-small">Province</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={locationData.province}
                    readOnly
                    style={{ background: '#f0f0f0' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-small">Region</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={locationData.region}
                    readOnly
                    style={{ background: '#f0f0f0' }}
                  />
                </div>

                {locationData.latitude && locationData.longitude && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label-small">Coordinates</label>
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

            <div className="form-section">
              <label className="form-label">Estimated Budget</label>
              <input
                type="number"
                className="budget-input"
                placeholder="Enter your estimated budget (e.g., 5000)"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Schedule Type</label>
              <div className="schedule-type-buttons">
                <button
                  className={`schedule-btn ${requestType === 'urgent' ? 'active' : ''}`}
                  onClick={() => handleRequestTypeChange('urgent')}
                >
                  <span className="material-icons-round icon-sm">emergency</span>
                  Urgent
                </button>
                <button
                  className={`schedule-btn ${requestType === 'freely' ? 'active' : ''}`}
                  onClick={() => handleRequestTypeChange('freely')}
                >
                  <span className="material-icons-round icon-sm">schedule</span>
                  Freely
                </button>
              </div>
            </div>

            {requestType === 'freely' && (
              <>
                <div className="form-section">
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

                <div className="form-section">
                  <label className="form-label">Input Time</label>
                  <input
                    type="time"
                    className="time-input"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <button 
            className="btn-request" 
            onClick={handleRequest}
            disabled={isLoading}
          >
            <span className="material-icons-round icon-sm">
              {isLoading ? 'hourglass_empty' : 'send'}
            </span>
            {isLoading ? 'Submitting...' : 'Submit Request'}
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

        {/* Toast Notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error || successMessage || ''}
          duration={3000}
          color={error ? 'danger' : 'success'}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default CustomRequest;
