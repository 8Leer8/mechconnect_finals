import { IonContent, IonPage, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNav from '../../../components/BottomNav';
import { clearAuthData } from '../../../utils/auth';
import './Profile.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface UserProfile {
  acc_id: number;
  roles: Array<{ account_role: string }>;
  client_profile?: any;
  mechanic_profile?: any;
  shop_owner_profile?: any;
}

const Profile: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);



  const loadUserProfile = () => {
    // Get user from localStorage (set during login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserProfile(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  };

  const goToNotifications = () => history.push('/client/notifications');
  const goToAccountSettings = () => history.push('/client/account-settings');
  const goToSwitchAccount = () => history.push('/client/switch-account');
  const goToFavorites = () => history.push('/client/favorite');
  const goToPaymentHistory = () => history.push('/client/payment-history');

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear all stored data using utility function
      clearAuthData();
      
      setToastMessage('Logged out successfully');
      setToastColor('success');
      setShowToast(true);
      
      // Immediate redirect to prevent blank screen
      history.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setToastMessage('Error during logout');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRoles = () => {
    // Mark this as an intentional switch so SwitchAccount doesn't auto-redirect
    sessionStorage.setItem('intentional_switch', 'true');
    // Clear active role to allow user to select a new one
    localStorage.removeItem('active_role');
    history.push('/auth/switch-account');
  };



  return (
    <IonPage>
      <IonContent className="profile-content" style={{ paddingBottom: '80px' }}>
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
            
            <button className="list-item" onClick={handleSwitchRoles}>
              <div className="item-icon icon-secondary">
                <span className="material-icons-round">switch_account</span>
              </div>
              <div className="item-content">
                <div className="item-label">Switch Roles</div>
                <div className="item-description">Change to another role</div>
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

      <BottomNav />
      
      <IonLoading isOpen={loading} message="Processing..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
      />
    </IonPage>
  );
};

export default Profile;
