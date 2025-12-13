import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ActiveBooking.css';

interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  service_time: string;
  client_name: string;
  provider_name: string;
  provider_contact: string;
  request_summary: string;
  request_type: string;
  service_details: {
    service_name: string;
    includes?: string;
    addons?: string;
  };
  location: {
    house_number?: string;
    street_name?: string;
    subdivision?: string;
    barangay?: string;
    city?: string;
    province?: string;
    region?: string;
    postal_code?: string;
  };
}

const ActiveBooking: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    history.push('/client/cancel-booking-form');
  };

  const handleReschedule = () => {
    history.push('/client/reschedule-booking-form');
  };

  const handleComplete = () => {
    history.push('/client/client-payment');
  };

  const handleAdvancePayment = () => {
    history.push('/client/advance-payment');
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  // Fetch booking details from API
  const fetchBookingDetails = async () => {
    if (!id) {
      setError('Booking ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/bookings/active/${id}/`);
      const data = await response.json();

      if (response.ok) {
        setBookingData(data);
      } else {
        setError(data.error || 'Failed to load booking details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="active-booking-content">
          <div className="loading-container">
            <div className="loading-message">Loading booking details...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Show error state
  if (error || !bookingData) {
    return (
      <IonPage>
        <IonContent className="active-booking-content">
          <div className="error-container">
            <div className="error-message">{error || 'Booking not found'}</div>
            <button className="retry-button" onClick={fetchBookingDetails}>
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="active-booking-content" style={{ paddingBottom: '20px' }}>
        <div className="active-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="active-booking-title">Active Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge">
              <span className="booking-id">#BK-{bookingData.booking_id}</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">{bookingData.provider_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact number:</span>
                <span className="detail-value">{bookingData.provider_contact || 'Not available'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">{bookingData.service_details?.service_name || bookingData.request_summary}</span>
              </div>
              {bookingData.service_details?.includes && (
                <div className="detail-row">
                  <span className="detail-label">Includes:</span>
                  <span className="detail-value">{bookingData.service_details.includes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">{bookingData.service_details?.addons || 'None'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">{formatDate(bookingData.booked_at)}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="accordion-header" onClick={toggleLocation}>
                <span className="accordion-title">Service Location</span>
                <span className={`material-icons-round accordion-icon ${isLocationOpen ? 'open' : ''}`}>
                  expand_more
                </span>
              </div>
              {isLocationOpen && (
                <div className="accordion-content">
                  <div className="location-grid">
                    {bookingData.location?.house_number && (
                      <div className="location-item">
                        <span className="location-label">House/Building No:</span>
                        <span className="location-value">{bookingData.location.house_number}</span>
                      </div>
                    )}
                    {bookingData.location?.street_name && (
                      <div className="location-item">
                        <span className="location-label">Street Name:</span>
                        <span className="location-value">{bookingData.location.street_name}</span>
                      </div>
                    )}
                    {bookingData.location?.subdivision && (
                      <div className="location-item">
                        <span className="location-label">Subdivision/Village:</span>
                        <span className="location-value">{bookingData.location.subdivision}</span>
                      </div>
                    )}
                    {bookingData.location?.barangay && (
                      <div className="location-item">
                        <span className="location-label">Barangay:</span>
                        <span className="location-value">{bookingData.location.barangay}</span>
                      </div>
                    )}
                    {bookingData.location?.city && (
                      <div className="location-item">
                        <span className="location-label">City/Municipality:</span>
                        <span className="location-value">{bookingData.location.city}</span>
                      </div>
                    )}
                    {bookingData.location?.province && (
                      <div className="location-item">
                        <span className="location-label">Province:</span>
                        <span className="location-value">{bookingData.location.province}</span>
                      </div>
                    )}
                    {bookingData.location?.region && (
                      <div className="location-item">
                        <span className="location-label">Region:</span>
                        <span className="location-value">{bookingData.location.region}</span>
                      </div>
                    )}
                    {bookingData.location?.postal_code && (
                      <div className="location-item">
                        <span className="location-label">Postal Code:</span>
                        <span className="location-value">{bookingData.location.postal_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Service time:</span>
                <span className="detail-value">{bookingData.service_time ? formatDate(bookingData.service_time) : 'To be scheduled'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱{bookingData.amount_fee.toFixed(2)}</span>
            </div>
          </div>

          <button className="btn-advance-payment" onClick={handleAdvancePayment}>
            <span className="material-icons-round icon-sm">payment</span>
            Advance Payment
          </button>

          <div className="action-buttons">
            <button className="btn-cancel" onClick={handleCancel}>
              <span className="material-icons-round icon-sm">close</span>
              Cancel
            </button>
            <button className="btn-reschedule" onClick={handleReschedule}>
              <span className="material-icons-round icon-sm">event</span>
              Reschedule
            </button>
            <button className="btn-complete" onClick={handleComplete}>
              <span className="material-icons-round icon-sm">check_circle</span>
              Complete
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ActiveBooking;
