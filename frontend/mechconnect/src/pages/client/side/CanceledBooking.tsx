import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './CanceledBooking.css';

const CanceledBooking: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleRequestAgain = () => {
    console.log('Request again');
    history.push('/client/request');
  };

  return (
    <IonPage>
      <IonContent className="canceled-booking-content">
        <div className="canceled-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="canceled-booking-title">Canceled Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge canceled">
              <span className="booking-id">#BK-2844</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider name:</span>
                <span className="detail-value provider-name">David Rodriguez</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Independent Mechanic</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Canceled at:</span>
                <span className="detail-value">Nov 24, 2025 - 3:45 PM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Cancellation Details</h3>
              <div className="cancellation-box">
                <div className="cancellation-info">
                  <span className="cancellation-label">Reason:</span>
                  <p className="cancellation-reason">
                    Changed my mind about the service. Will reschedule at a later time.
                  </p>
                </div>
                <div className="cancellation-footer">
                  <span className="cancellation-from">From: Client</span>
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
