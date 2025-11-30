import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './EmergencyRequest.css';

const EmergencyRequest: React.FC = () => {
  const history = useHistory();
  const [problemDescription, setProblemDescription] = useState('');

  const goBack = () => {
    history.goBack();
  };

  const handleRequest = () => {
    console.log({
      problemDescription,
      requestType: 'emergency'
    });
    // Handle emergency request submission
  };

  return (
    <IonPage>
      <IonContent className="emergency-request-content">
        <div className="emergency-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="emergency-request-title">Emergency Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="emergency-badge">
            <span className="material-icons-round emergency-icon">emergency</span>
            <span className="emergency-text">Urgent Assistance Required</span>
          </div>

          <div className="request-card">
            <div className="form-section">
              <label className="form-label">Describe Problem</label>
              <textarea
                className="form-textarea"
                placeholder="Please describe your emergency situation..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={8}
              />
              <p className="helper-text">
                Our team will respond immediately to your emergency request.
              </p>
            </div>
          </div>

          <button className="btn-emergency-request" onClick={handleRequest}>
            <span className="material-icons-round icon-sm">emergency</span>
            Request Emergency Help
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EmergencyRequest;
