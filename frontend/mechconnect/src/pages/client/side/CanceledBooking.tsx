import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CanceledBooking.css';

interface BookingData {
  cancelled_booking_id: number;
  booking: number;
  reason: string;
  cancelled_by: number;
  cancelled_by_role: string;
  status: string;
  cancelled_at: string;
  updated_at: string;
  cancelled_by_name: string;
  booking_details: {
    booking_id: number;
    status: string;
    amount_fee: string;
    booked_at: string;
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
  };
}

const CanceledBooking: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    history.goBack();
  };

  const handleRequestAgain = () => {
    console.log('Request again');
    history.push('/client/request');
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
      const response = await fetch(`http://localhost:8000/api/bookings/cancelled/${id}/`);
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
        <IonContent className="canceled-booking-content">
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
        <IonContent className="canceled-booking-content">
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
      <IonContent className="canceled-booking-content">
        <div className="canceled-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="canceled-booking-title">Cancelled Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge canceled">
              <span className="booking-id">#BK-{bookingData.booking_details.booking_id}</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider name:</span>
                <span className="detail-value provider-name">{bookingData.booking_details.provider_name || 'No Provider Assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact number:</span>
                <span className="detail-value">{bookingData.booking_details.provider_contact || 'Not available'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">{bookingData.booking_details.service_details?.service_name || bookingData.booking_details.request_summary}</span>
              </div>
              {bookingData.booking_details.service_details?.includes && (
                <div className="detail-row">
                  <span className="detail-label">Includes:</span>
                  <span className="detail-value">{bookingData.booking_details.service_details.includes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">{bookingData.booking_details.service_details?.addons || 'None'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">{formatDate(bookingData.booking_details.booked_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cancelled at:</span>
                <span className="detail-value">{formatDate(bookingData.cancelled_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cancelled by:</span>
                <span className="detail-value">{bookingData.cancelled_by_name} ({bookingData.cancelled_by_role})</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Cancellation Details</h3>
              <div className="cancellation-box">
                <div className="cancellation-info">
                  <span className="cancellation-label">Reason:</span>
                  <p className="cancellation-reason">
                    {bookingData.reason || 'No reason provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-request-again" onClick={handleRequestAgain}>
            <span className="material-icons-round icon-sm">refresh</span>
            Request Again
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CanceledBooking;
