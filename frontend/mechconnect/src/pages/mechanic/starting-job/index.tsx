import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './StartingJob.css';

const StartingJob: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [travelStatus, setTravelStatus] = useState<'not_started' | 'traveling'>('not_started');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const goBack = () => {
    history.goBack();
  };

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const handleStartTravel = () => {
    setTravelStatus('traveling');
    setToastMessage('Travel started! Safe journey.');
    setShowToast(true);
  };

  const handleArrived = () => {
    setToastMessage('You have arrived at the location!');
    setShowToast(true);
    // Navigate to working job page immediately
    history.push(`/mechanic/working-job/${id}`);
  };

  const handleContactClient = () => {
    // In a real app, this would open messaging or call
    setToastMessage('Contact feature coming soon');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonContent className="starting-job-content" scrollY>
        {/* Header */}
        <div className="mechanic-job-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-job-detail-title">Starting Job</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-content">
              <span className="material-icons-round map-icon">location_on</span>
              <p className="map-text">Your Location</p>
              <p className="map-subtext">Map integration coming soon</p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="status-section">
          <div className="status-card">
            <h3 className="status-title">Job Status</h3>
            <div className="status-indicator">
              <div className={`status-dot ${travelStatus === 'not_started' ? 'active' : ''}`}></div>
              <span className="status-text">Ready to Start</span>
            </div>
            <div className="status-indicator">
              <div className={`status-dot ${travelStatus === 'traveling' ? 'active' : ''}`}></div>
              <span className="status-text">On the Way</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-contact" onClick={handleContactClient}>
            <span className="material-icons-round icon-sm">phone</span>
            Contact Client
          </button>

          {travelStatus === 'not_started' && (
            <button className="btn-start-travel" onClick={handleStartTravel}>
              <span className="material-icons-round icon-sm">directions_car</span>
              Start Travel
            </button>
          )}

          {travelStatus === 'traveling' && (
            <button className="btn-arrived" onClick={handleArrived}>
              <span className="material-icons-round icon-sm">location_on</span>
              Arrived
            </button>
          )}
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default StartingJob;