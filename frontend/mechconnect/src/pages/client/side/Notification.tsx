import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Notification.css';

const Notification: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();

  return (
    <IonPage>
      <IonContent className="notification-content">
        {/* Header */}
        <div className="notification-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Notification</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Empty state - will be populated later */}
        <div className="notification-container">
          {/* Notifications will be added here */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Notification;
