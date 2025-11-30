import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './AcceptedRequest.css';

const AcceptedRequest: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleSeeBookingDetail = () => {
    history.push('/client/booking-detail');
  };

  return (
    <IonPage>
      <IonContent className="accepted-request-content">
        <div className="accepted-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="accepted-request-title">Accepted Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="request-id-badge accepted">
              <span className="request-id">#REQ-1849</span>
            </div>

            <div className="request-section">
              <div className="detail-row">
                <span className="detail-label">Send to:</span>
                <span className="detail-value provider-name">David Rodriguez</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Independent Mechanic</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Requested at:</span>
                <span className="detail-value">Nov 25, 2025 - 9:30 AM</span>
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="request-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">Brake Pad Replacement</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">None</span>
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱3,200.00</span>
            </div>

            <div className="request-divider"></div>

            <div className="accepted-section">
              <div className="accepted-info">
                <span className="material-icons-round icon-sm check-icon">check_circle</span>
                <div className="accepted-details">
                  <span className="accepted-label">Accepted at:</span>
                  <span className="accepted-time">Nov 25, 2025 - 9:45 AM</span>
                </div>
              </div>
              <div className="response-info">
                <span className="response-label">Response:</span>
                <span className="response-from">Independent Mechanic</span>
              </div>
            </div>
          </div>

          <button className="btn-see-booking" onClick={handleSeeBookingDetail}>
            <span className="material-icons-round icon-sm">event_note</span>
            See Booking Detail
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AcceptedRequest;
