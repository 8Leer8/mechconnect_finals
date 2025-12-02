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
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showRoleDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.list-item') && !target.closest('[data-dropdown]')) {
          setShowRoleDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

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
    setShowRoleDropdown(!showRoleDropdown);
  };

  const switchToRole = (role: string) => {
    setShowRoleDropdown(false);
    
    // Update current role in stored user data
    if (userProfile) {
      const updatedUser = { ...userProfile, currentRole: role };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    // Redirect based on role
    switch (role) {
      case 'mechanic':
        history.push('/mechanic/home');
        break;
      case 'shop_owner':
        history.push('/shopowner/home');
        break;
      default:
        history.push('/client/home');
    }
  };

  const registerAsRole = (role: string) => {
    setShowRoleDropdown(false);
    
    // Navigate to role registration
    switch (role) {
      case 'mechanic':
        history.push('/register/mechanic');
        break;
      case 'shop_owner':
        history.push('/register/shopowner');
        break;
    }
  };

  const hasProfile = (profileType: string): boolean => {
    if (!userProfile) return false;
    
    switch (profileType) {
      case 'mechanic':
        return !!userProfile.mechanic_profile;
      case 'shop_owner':
        return !!userProfile.shop_owner_profile;
      default:
        return false;
    }
  };

  const getRoleOptions = () => {
    const options = [];
    
    if (hasProfile('mechanic')) {
      options.push({ label: 'Switch to Mechanic', action: () => switchToRole('mechanic'), type: 'switch' });
    } else {
      options.push({ label: 'Register as Mechanic', action: () => registerAsRole('mechanic'), type: 'register' });
    }
    
    if (hasProfile('shop_owner')) {
      options.push({ label: 'Switch to Shopowner', action: () => switchToRole('shop_owner'), type: 'switch' });
    } else {
      options.push({ label: 'Register as Shopowner', action: () => registerAsRole('shop_owner'), type: 'register' });
    }
    
    return options;
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
            
            <div style={{ position: 'relative' }}>
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
              
              {showRoleDropdown && (
                <div 
                  data-dropdown
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                  {getRoleOptions().map((option, index) => (
                    <button
                      key={index}
                      onClick={option.action}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderBottom: index < getRoleOptions().length - 1 ? '1px solid #f1f5f9' : 'none',
                        fontSize: '16px',
                        color: '#374151',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
