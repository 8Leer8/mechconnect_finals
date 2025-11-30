import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();

  const goToNotifications = () => history.push('/client/notifications');
  const goToBooking = () => history.push('/client/booking');
  const goToRequest = () => history.push('/client/request');
  const goToHome = () => history.push('/client/home');
  const goToDiscover = () => history.push('/client/discover');
  const goToAccountSettings = () => history.push('/client/account-settings');
  const goToSwitchAccount = () => history.push('/client/switch-account');
  const goToFavorites = () => history.push('/client/favorite');
  const goToPaymentHistory = () => history.push('/client/payment-history');
  const handleLogout = () => {
    // In real app: clear auth tokens, redirect to login
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent className="profile-content">
        {/* Header */}
        <div className="profile-header-top">
          <h1 className="profile-title">Profile</h1>
          <button 
            className="notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Profile Content */}
        <div className="profile-section">
          {/* Account Section */}
          <div className="list-section">
            <div className="section-title">Account</div>
            
            <button className="list-item" onClick={goToAccountSettings}>
              <div className="item-icon icon-primary">
                <span className="material-icons-round">person</span>
              </div>
              <div className="item-content">
                <div className="item-label">Account Settings</div>
                <div className="item-description">Manage your profile and preferences</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
            
            <div className="divider"></div>
            
            <button className="list-item" onClick={goToSwitchAccount}>
              <div className="item-icon icon-secondary">
                <span className="material-icons-round">switch_account</span>
              </div>
              <div className="item-content">
                <div className="item-label">Switch Account</div>
                <div className="item-description">Change to another account</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>

          {/* Favorites Section */}
          <div className="list-section">
            <div className="section-title">Favorites</div>
            
            <button className="list-item" onClick={goToFavorites}>
              <div className="item-icon icon-favorite">
                <span className="material-icons-round">favorite</span>
              </div>
              <div className="item-content">
                <div className="item-label">Favorites</div>
                <div className="item-description">View your saved mechanics and shops</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>

          {/* History Section */}
          <div className="list-section">
            <div className="section-title">History</div>
            
            <button className="list-item" onClick={goToPaymentHistory}>
              <div className="item-icon icon-history">
                <span className="material-icons-round">history</span>
              </div>
              <div className="item-content">
                <div className="item-label">Payment History</div>
                <div className="item-description">View your transaction history</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>

          {/* Actions Section */}
          <div className="list-section">
            <div className="section-title">Actions</div>
            
            <button className="list-item" onClick={handleLogout}>
              <div className="item-icon icon-danger">
                <span className="material-icons-round">logout</span>
              </div>
              <div className="item-content">
                <div className="item-label">Log Out</div>
                <div className="item-description">Sign out of your account</div>
              </div>
            </button>
          </div>
        </div>
      </IonContent>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={goToBooking}>
          <span className="material-icons-round">event</span>
          <span>Booking</span>
        </button>
        <button className="nav-item" onClick={goToRequest}>
          <span className="material-icons-round">build_circle</span>
          <span>Request</span>
        </button>
        <button className="nav-item" onClick={goToHome}>
          <span className="material-icons-round">home</span>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={goToDiscover}>
          <span className="material-icons-round">explore</span>
          <span>Discover</span>
        </button>
        <button className="nav-item active">
          <span className="material-icons-round">person</span>
          <span>Profile</span>
        </button>
      </div>
    </IonPage>
  );
};

export default Profile;
