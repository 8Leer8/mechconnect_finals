import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CancelBookingForm.css';

interface LocationState {
  bookingId: number;
  bookingData?: any;
}

const CancelBookingForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { bookingId, bookingData } = location.state || {};
  
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('Booking information not found');
    }
  }, [bookingId]);

  const goBack = () => {
    history.goBack();
  };

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    if (!bookingId) {
      alert('Booking information not found');
      return;
    }
    
    setLoading(true);
    
    try {
      const clientId = localStorage.getItem('userId');
      
      const response = await fetch('http://localhost:8000/api/bookings/cancel/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          reason: reason,
          cancelled_by_id: clientId ? parseInt(clientId) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Booking cancelled successfully!');
        history.push(`/client/canceled-booking/${bookingId}`);
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="cancel-booking-form-content">
        <div className="cancel-booking-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="cancel-booking-form-title">Cancel Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="cancel-booking-form-container">
          <div className="cancel-booking-card">
            <div className="booking-info-section">
              <div className="info-row">
                <span className="info-label">Booking ID:</span>
                <span className="info-value">#BK-2847</span>
              </div>
              <div className="info-row">
                <span className="info-label">Service:</span>
                <span className="info-value">Oil Change</span>
              </div>
              <div className="info-row">
                <span className="info-label">Mechanic:</span>
                <span className="info-value">Juan Dela Cruz</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date & Time:</span>
                <span className="info-value">Dec 01, 2024 • 10:00 AM</span>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="reason-section">
              <label className="reason-label">Reason for Cancellation</label>
              <textarea
                className="reason-textarea"
                placeholder="Please provide a reason for canceling this booking..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
              />
            </div>

            <div className="warning-section">
              <div className="warning-card">
                <span className="material-icons-round warning-icon">warning</span>
                <p className="warning-text">
                  Canceling this booking may result in a cancellation fee depending on the timing. 
                  Please review the cancellation policy before proceeding.
                </p>
              </div>
            </div>

            <button className="btn-submit-cancel" onClick={handleSubmit}>
              Confirm Cancellation
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CancelBookingForm;
