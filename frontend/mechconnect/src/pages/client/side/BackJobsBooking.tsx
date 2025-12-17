import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './BackJobsBooking.css';

interface BookingData {
  back_jobs_booking_id: number;
  booking: number;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  booking_details: {
    booking_id: number;
    status: string;
    amount_fee: string;
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
  };
  requested_by_name: string;
}

const BackJobsBooking: React.FC = () => {
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
    if (bookingData) {
      // The API returns nested structure with booking_details
      const actualBookingId = (bookingData as any).booking_details?.booking_id || (bookingData as any).booking || bookingData.booking_id;
      const actualBookingData = (bookingData as any).booking_details || bookingData;
      
      history.push({
        pathname: '/client/cancel-booking-form',
        state: {
          bookingId: actualBookingId,
          bookingData: actualBookingData
        }
      });
    } else {
      alert('Booking data not available');
    }
  };

  const handleComplete = async () => {
    if (!bookingData || !id) {
      alert('Booking data not available');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to mark this booking as completed?');
    if (!confirmed) return;

    try {
      // The API returns nested structure with booking_details
      const actualBookingId = (bookingData as any).booking_details?.booking_id || (bookingData as any).booking || bookingData.booking_id;
      
      const response = await fetch('http://localhost:8000/api/bookings/complete/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: actualBookingId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Booking marked as completed successfully!');
        // Redirect to completed booking detail page
        history.push(`/client/completed-booking/${actualBookingId}`);
      } else {
        alert(data.error || 'Failed to mark booking as completed');
      }
    } catch (error) {
      console.error('Complete booking error:', error);
      alert('Network error occurred. Please try again.');
    }
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
      const response = await fetch(`http://localhost:8000/api/bookings/back-jobs/${id}/`);
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
        <IonContent className="backjobs-booking-content">
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
        <IonContent className="backjobs-booking-content">
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
      <IonContent className="backjobs-booking-content">
        <div className="backjobs-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="backjobs-booking-title">Back Jobs Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge backjobs">
              <span className="booking-id">#BK-{bookingData.booking_details.booking_id}</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">{bookingData.booking_details.provider_name}</span>
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
            </div>

            <div className="booking-divider"></div>

            <div className="backjob-section">
              <div className="backjob-badge">
                <span className="material-icons-round icon-sm">history</span>
                <span>Back Job</span>
              </div>
              <p className="backjob-note">{bookingData.reason}</p>
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
                    <div className="location-item">
                      <span className="location-label">House/Building No:</span>
                      <span className="location-value">{bookingData.booking_details.location.house_number || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Street Name:</span>
                      <span className="location-value">{bookingData.booking_details.location.street_name || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Subdivision/Village:</span>
                      <span className="location-value">{bookingData.booking_details.location.subdivision || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Barangay:</span>
                      <span className="location-value">{bookingData.booking_details.location.barangay || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">City/Municipality:</span>
                      <span className="location-value">{bookingData.booking_details.location.city || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Province:</span>
                      <span className="location-value">{bookingData.booking_details.location.province || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Region:</span>
                      <span className="location-value">{bookingData.booking_details.location.region || 'N/A'}</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Postal Code:</span>
                      <span className="location-value">{bookingData.booking_details.location.postal_code || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Service time:</span>
                <span className="detail-value">{bookingData.booking_details.service_time}</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-cancel" onClick={handleCancel}>
              <span className="material-icons-round icon-sm">close</span>
              Cancel
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

export default BackJobsBooking;
