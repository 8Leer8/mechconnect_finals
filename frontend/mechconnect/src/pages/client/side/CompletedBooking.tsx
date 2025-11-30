import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './CompletedBooking.css';

const CompletedBooking: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleSeePaymentDetail = () => {
    history.push('/client/payment-detail');
  };

  const handleRequestBackJob = () => {
    history.push('/client/back-jobs-form');
  };

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
