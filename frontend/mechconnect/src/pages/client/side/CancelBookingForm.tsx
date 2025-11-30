import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './CancelBookingForm.css';

const CancelBookingForm: React.FC = () => {
  const history = useHistory();
  const [reason, setReason] = useState('');

  const goBack = () => {
    history.goBack();
  };

  const handleSubmit = () => {
    console.log('Cancel booking with reason:', reason);
    // Handle cancel booking submission
    history.goBack();
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
