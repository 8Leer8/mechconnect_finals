import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './PendingRequest.css';

const PendingRequest: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    history.push('/client/cancel-booking-form');
  };

  return (
    <IonPage>
      <IonContent className="pending-request-content">
        <div className="pending-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="pending-request-title">Pending Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="request-id-badge">
              <span className="request-id">#REQ-1847</span>
            </div>

            <div className="request-section">
              <div className="detail-row">
                <span className="detail-label">Send to:</span>
                <span className="detail-value provider-name">Mike Johnson</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Independent Mechanic</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Requested at:</span>
                <span className="detail-value">Nov 25, 2025 - 2:30 PM</span>
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="request-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">Engine Oil Change</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">None</span>
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱2,500.00</span>
            </div>
          </div>

          <button className="btn-cancel" onClick={handleCancel}>
            <span className="material-icons-round icon-sm">close</span>
            Cancel Request
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PendingRequest;
