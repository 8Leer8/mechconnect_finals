import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './RejectedRequest.css';

const RejectedRequest: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="rejected-request-content">
        <div className="rejected-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="rejected-request-title">Rejected Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="request-id-badge rejected">
              <span className="request-id">#REQ-1845</span>
            </div>

            <div className="request-section">
              <div className="detail-row">
                <span className="detail-label">Send to:</span>
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

            <div className="request-divider"></div>

            <div className="request-section">
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RejectedRequest;
