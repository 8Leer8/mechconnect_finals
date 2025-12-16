import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { geolocationAPI } from '../../../utils/api';
import './DirectRequest.css';

interface AddOn {
  service_add_on_id: number;
  name: string;
  description?: string;
  price: number;
  checked: boolean;
}

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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Client ID - TODO: Get from authentication context
  const [clientId] = useState<number>(1);

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

    if (!locationData.cityMunicipality && !locationData.formattedAddress) {
      setToastMessage('Please set your location');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        client_id: clientId,
        provider_id: serviceData.providerId,
        service_id: serviceData.serviceId,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedTime,
        selected_addon_ids: addOns.filter(a => a.checked).map(a => a.service_add_on_id),
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
              <h2 className="section-title">Location</h2>
              <div className="form-group">
                <label className="form-label">Service Address</label>
                <div className="location-display">
                  {locationData.formattedAddress ? (
                    <div className="location-text">{locationData.formattedAddress}</div>
                  ) : (
                    <div className="location-text" style={{color: '#999'}}>No location set</div>
                  )}
                  <button 
                    className="btn-location" 
                    onClick={getCurrentLocation}
                    disabled={isLocationLoading}
                  >
                    <span className="material-icons-round">my_location</span>
                    {isLocationLoading ? 'Getting Location...' : 'Set My Location'}
                  </button>
                </div>
              </div>
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
