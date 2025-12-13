import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './DisputedBooking.css';

interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  dispute_reason: string;
  dispute_date: string;
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

const DisputedBooking: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    history.goBack();
  };

  const handleSeeRefundedBooking = () => {
    history.push('/client/refunded-booking');
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
      const response = await fetch(`http://localhost:8000/api/bookings/disputed/${id}/`);
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
        <IonContent className="disputed-booking-content">
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
        <IonContent className="disputed-booking-content">
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
      <IonContent className="disputed-booking-content">
        <div className="disputed-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="disputed-booking-title">Disputed Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge disputed">
              <span className="booking-id">#BK-2840</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider name:</span>
                <span className="detail-value provider-name">Precision Service</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Shop</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">Nov 22, 2025 - 1:00 PM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">AC Repair & Recharge</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Dispute Details</h3>
              <div className="dispute-box">
                <div className="dispute-info">
                  <span className="dispute-label">Reason:</span>
                  <p className="dispute-reason">
                    The service was not completed properly. AC is still not cooling after the supposed repair. 
                    Paid full amount but issue persists.
                  </p>
                </div>
                
                <div className="photo-section">
                  <span className="photo-label">Photo attached:</span>
                  <div className="photo-placeholder">
                    <span className="material-icons-round">image</span>
                    <span>evidence_photo.jpg</span>
                  </div>
                </div>

                <div className="dispute-footer">
                  <span className="dispute-from">From: Client</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn-see-refunded" onClick={handleSeeRefundedBooking}>
            <span className="material-icons-round icon-sm">receipt_long</span>
            See Refunded Booking
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DisputedBooking;
