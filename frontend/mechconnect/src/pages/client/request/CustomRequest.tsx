import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './CustomRequest.css';

interface LocationData {
  houseBuildingNumber: string;
  streetName: string;
  subdivisionVillage: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
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
    houseBuildingNumber: '',
    streetName: '',
    subdivisionVillage: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: '',
    postalCode: ''
  });
  
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<'simple' | 'detailed'>('simple');
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Client ID - In a real app, this would come from authentication context
  const [clientId, setClientId] = useState<number>(1); // Default to 1 for testing
  
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

  // Geolocation functions
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setShowToast(true);
      return;
    }

    setIsLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates using reverse geocoding
          const address = await reverseGeocode(latitude, longitude);
          
          setLocationData(prev => ({
            ...prev,
            latitude,
            longitude,
            formattedAddress: address,
            // Try to parse address into components if possible
            streetName: address.split(',')[0] || '',
            cityMunicipality: address.split(',')[1]?.trim() || '',
            province: address.split(',')[2]?.trim() || ''
          }));
          
          setSuccessMessage('Location set successfully!');
          setShowToast(true);
        } catch (error) {
          console.error('Error getting address:', error);
          setError('Could not get address from location');
          setShowToast(true);
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Could not get your location. Please check permissions.');
        setShowToast(true);
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Simple reverse geocoding using a free service
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service (you might want to use Google Maps API with your own key)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || `${data.locality}, ${data.city}, ${data.principalSubdivision}`;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback to coordinates if geocoding fails
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Save current location for future use
  const saveCurrentLocation = () => {
    if (locationData.formattedAddress || locationData.streetName) {
      const locationToSave = {
        ...locationData,
        houseBuildingNumber: locationData.houseBuildingNumber || 'Current Location'
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

  const goBack = () => {
    history.goBack();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
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

      // Prepare the request data
      const requestData = {
        client_id: clientId,
        provider_id: providerId, // Include provider ID if available
        description: problemDescription.trim(),
        concern_picture: selectedImage || '',
        estimated_budget: estimatedBudget ? parseFloat(estimatedBudget.replace(/[₱,]/g, '')) : null,
        schedule_type: requestType,
        scheduled_date: requestType === 'freely' && selectedDate ? selectedDate.toISOString().split('T')[0] : null,
        scheduled_time: requestType === 'freely' ? selectedTime : null,
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
          houseBuildingNumber: '',
          streetName: '',
          subdivisionVillage: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          region: '',
          postalCode: ''
        });

        // Navigate back to requests page after a delay
        setTimeout(() => {
          history.push('/client/request');
        }, 2000);
        
      } else {
        throw new Error(data.error || 'Failed to submit request');
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
              <div className="location-header">
                <label className="form-label">Set Location</label>
                <div className="location-mode-toggle">
                  <button 
                    className={`toggle-btn ${locationMode === 'simple' ? 'active' : ''}`}
                    onClick={() => setLocationMode('simple')}
                  >
                    Simple
                  </button>
                  <button 
                    className={`toggle-btn ${locationMode === 'detailed' ? 'active' : ''}`}
                    onClick={() => setLocationMode('detailed')}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              {locationMode === 'simple' ? (
                <div className="simple-location">
                  <div className="location-buttons">
                    <button 
                      className="location-btn primary"
                      onClick={getCurrentLocation}
                      disabled={isLocationLoading}
                    >
                      <span className="material-icons-round icon-sm">
                        {isLocationLoading ? 'hourglass_empty' : 'my_location'}
                      </span>
                      {isLocationLoading ? 'Getting Location...' : 'Set My Location'}
                    </button>
                    
                    {(locationData.formattedAddress || locationData.streetName) && (
                      <button 
                        className="location-btn secondary"
                        onClick={saveCurrentLocation}
                      >
                        <span className="material-icons-round icon-sm">bookmark_add</span>
                        Save Location
                      </button>
                    )}
                  </div>

                  {locationData.formattedAddress && (
                    <div className="current-location">
                      <div className="location-display">
                        <span className="material-icons-round location-icon">place</span>
                        <div className="location-text">
                          <div className="address-main">{locationData.formattedAddress}</div>
                          {locationData.latitude && locationData.longitude && (
                            <div className="coordinates">
                              {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <input 
                        type="text" 
                        className="location-input house-number" 
                        placeholder="House/Building No (Optional)" 
                        value={locationData.houseBuildingNumber}
                        onChange={(e) => handleLocationChange('houseBuildingNumber', e.target.value)}
                      />
                    </div>
                  )}

                  {savedLocations.length > 0 && (
                    <div className="saved-locations">
                      <h4>Saved Locations</h4>
                      <div className="saved-location-list">
                        {savedLocations.map((location, index) => (
                          <button 
                            key={index}
                            className="saved-location-item"
                            onClick={() => setLocationData(location)}
                          >
                            <span className="material-icons-round">place</span>
                            <div className="saved-location-text">
                              <div className="saved-location-name">
                                {location.houseBuildingNumber || 'Saved Location'}
                              </div>
                              <div className="saved-location-address">
                                {location.formattedAddress || `${location.streetName}, ${location.cityMunicipality}`}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="location-grid">
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="House/Building No" 
                    value={locationData.houseBuildingNumber}
                    onChange={(e) => handleLocationChange('houseBuildingNumber', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Street Name" 
                    value={locationData.streetName}
                    onChange={(e) => handleLocationChange('streetName', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Subdivision/Village" 
                    value={locationData.subdivisionVillage}
                    onChange={(e) => handleLocationChange('subdivisionVillage', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Barangay" 
                    value={locationData.barangay}
                    onChange={(e) => handleLocationChange('barangay', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="City/Municipality" 
                    value={locationData.cityMunicipality}
                    onChange={(e) => handleLocationChange('cityMunicipality', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Province" 
                    value={locationData.province}
                    onChange={(e) => handleLocationChange('province', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Region" 
                    value={locationData.region}
                    onChange={(e) => handleLocationChange('region', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="location-input" 
                    placeholder="Postal Code" 
                    value={locationData.postalCode}
                    onChange={(e) => handleLocationChange('postalCode', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Estimated Budget</label>
              <input
                type="text"
                className="budget-input"
                placeholder="Enter your estimated budget (e.g., ₱5,000)"
                value={estimatedBudget}
                onChange={(e) => setEstimatedBudget(e.target.value)}
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
