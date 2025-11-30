import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './DisputedBooking.css';

const DisputedBooking: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleSeeRefundedBooking = () => {
    history.push('/client/refunded-booking');
  };

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
