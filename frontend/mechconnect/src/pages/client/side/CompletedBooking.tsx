import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CompletedBooking.css';

interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  completed_at: string;
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
}

const CompletedBooking: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    history.goBack();
  };

  const handleSeePaymentDetail = () => {
    history.push('/client/payment-detail');
  };

  const handleRequestBackJob = () => {
    history.push('/client/back-jobs-form');
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
      const response = await fetch(`http://localhost:8000/api/bookings/completed/${id}/`);
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
        <IonContent className="completed-booking-content">
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
        <IonContent className="completed-booking-content">
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
      <IonContent className="completed-booking-content">
        <div className="completed-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="completed-booking-title">Completed Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge completed">
              <span className="booking-id">#BK-2843</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">Auto Expert Garage</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">Brake Pad Replacement</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Includes:</span>
                <span className="detail-value">Front and rear brake pads</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">None</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">Nov 23, 2025 - 9:00 AM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="completed-section">
              <div className="completed-info">
                <span className="material-icons-round icon-sm check-icon">check_circle</span>
                <div className="completed-details">
                  <span className="completed-label">Completed at:</span>
                  <span className="completed-time">Nov 23, 2025 - 11:30 AM</span>
                </div>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Before Picture Attached</h3>
              <div className="photo-container">
                <div className="photo-placeholder">
                  <span className="material-icons-round photo-icon">image</span>
                  <span className="photo-text">Before service photo</span>
                </div>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">After Picture Attached</h3>
              <div className="photo-container">
                <div className="photo-placeholder">
                  <span className="material-icons-round photo-icon">image</span>
                  <span className="photo-text">After service photo</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-see-payment" onClick={handleSeePaymentDetail}>
            <span className="material-icons-round icon-sm">receipt</span>
            See Payment Detail
          </button>

          <button className="btn-request-backjob" onClick={handleRequestBackJob}>
            <span className="material-icons-round icon-sm">build_circle</span>
            Request Back Job
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CompletedBooking;
