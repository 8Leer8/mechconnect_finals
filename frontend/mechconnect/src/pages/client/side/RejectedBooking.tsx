import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './RejectedBooking.css';

const RejectedBooking: React.FC = () => {
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
      <IonContent className="rejected-booking-content">
        <div className="rejected-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="rejected-booking-title">Rejected Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge rejected">
              <span className="booking-id">#BK-2845</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider name:</span>
                <span className="detail-value provider-name">Auto Expert Garage</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Shop</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Requested at:</span>
                <span className="detail-value">Nov 24, 2025 - 10:15 AM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Rejection Details</h3>
              <div className="rejection-box">
                <div className="rejection-info">
                  <span className="rejection-label">Reason:</span>
                  <p className="rejection-reason">
                    We are currently fully booked for the next two weeks. 
                    Please consider booking with us at a later date or try another service provider.
                  </p>
                </div>
                <div className="rejection-footer">
                  <span className="rejection-from">From: Shop</span>
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

export default RejectedBooking;
