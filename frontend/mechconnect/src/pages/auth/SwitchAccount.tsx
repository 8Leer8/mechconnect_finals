import { IonContent, IonPage, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './SwitchAccount.css';

interface UserRoles {
  user_id: number;
  full_name: string;
  has_mechanic_profile: boolean;
  has_shop_owner_profile: boolean;
  roles: string[];
  mechanic_status: {
    registered: boolean;
    verified: boolean;
    status: string | null;
  };
  shop_owner_status: {
    registered: boolean;
    verified: boolean;
    status: string | null;
  };
}

const SwitchAccount: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRoles | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // FIXED: Never auto-redirect based on active_role
    // User came here explicitly, so clear intentional_switch flag and fetch roles
    sessionStorage.removeItem('intentional_switch');
    
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage - ensure it's from the CURRENT login
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user.acc_id || user.account_id || user.id;
      
      if (!userId) {
        setError('Invalid user data. Please login again.');
        localStorage.clear(); // Clear invalid state
        history.push('/auth/login');
        return;
      }

      console.log('SwitchAccount - Using user ID:', userId);
      const response = await fetch(`http://localhost:8000/api/accounts/check-roles/?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserRoles(data);
        
        // REMOVED: Auto-redirect for single-role clients
        // Let new users see the SwitchAccount page to apply for mechanic/shop owner
        // Even if they only have client role, they should be able to apply
      } else {
        setError(data.error || 'Failed to fetch user roles');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching user roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => history.goBack();

  const handleSwitchToMechanic = () => {
    // Store active role in localStorage
    localStorage.setItem('active_role', 'mechanic');
    // Navigate to mechanic dashboard
    history.push('/mechanic/home');
  };

  const handleSwitchToShopOwner = () => {
    // Store active role in localStorage
    localStorage.setItem('active_role', 'shop_owner');
    // Navigate to shop owner dashboard  
    history.push('/shopowner/dashboard');
  };
  
  const handleSwitchToClient = () => {
    // Store active role in localStorage
    localStorage.setItem('active_role', 'client');
    // Navigate to client home
    history.push('/client/home');
  };

  const handleApplyMechanic = () => {
    history.push('/mechanicsignup');
  };

  const handleApplyShopOwner = () => {
    history.push('/shopownersignup');
  };

  return (
    <IonPage>
      <IonContent className="switch-account-content">
        {/* Header */}
        <div className="switch-account-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Switch Account</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Content Container */}
        <div className="switch-account-container">
          {!loading && !error && userRoles && (
            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons-round">person</span>
              </div>
              <p className="info-text">
                Hello {userRoles.full_name}! {userRoles.has_mechanic_profile || userRoles.has_shop_owner_profile 
                  ? 'Switch between your roles or apply for new ones.' 
                  : 'Want to offer your services? Apply to become a mechanic or shop owner on our platform.'}
              </p>
            </div>
          )}

          {error && (
            <div className="info-card">
              <div className="info-icon">
                <span className="material-icons-round">error</span>
              </div>
              <p className="info-text" style={{color: '#dc2626'}}>
                {error}
              </p>
            </div>
          )}

          {/* Role Options */}
          {!loading && !error && userRoles && (
            <div className="application-options">
              {/* Show Mechanic options */}
              {userRoles.has_mechanic_profile ? (
                <button className="application-card mechanic registered" onClick={handleSwitchToMechanic}>
                  <div className="card-icon">
                    <span className="material-icons-round">build</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Switch to Mechanic</h3>
                    <p className="card-description">
                      {userRoles.mechanic_status.verified ? 
                        `Status: ${userRoles.mechanic_status.status || 'Active'} • Verified` :
                        'Registration pending verification'
                      }
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">launch</span>
                  </div>
                </button>
              ) : userRoles.mechanic_status.registered ? (
                <button className="application-card mechanic pending" disabled>
                  <div className="card-icon">
                    <span className="material-icons-round">hourglass_empty</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Mechanic Registration Pending</h3>
                    <p className="card-description">
                      Registration completed. Waiting for admin verification.
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">check_circle</span>
                  </div>
                </button>
              ) : (
                <button className="application-card mechanic" onClick={handleApplyMechanic}>
                  <div className="card-icon">
                    <span className="material-icons-round">build</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Apply for Mechanic</h3>
                    <p className="card-description">
                      Offer your automotive repair services as an independent mechanic
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">arrow_forward</span>
                  </div>
                </button>
              )}

              {/* Show Shop Owner options */}
              {userRoles.has_shop_owner_profile ? (
                <button className="application-card shop registered" onClick={handleSwitchToShopOwner}>
                  <div className="card-icon">
                    <span className="material-icons-round">store</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Switch to Shop Owner</h3>
                    <p className="card-description">
                      {userRoles.shop_owner_status.verified ? 
                        `Status: ${userRoles.shop_owner_status.status || 'Active'} • Verified` :
                        'Registration pending verification'
                      }
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">launch</span>
                  </div>
                </button>
              ) : userRoles.shop_owner_status.registered ? (
                <button className="application-card shop pending" disabled>
                  <div className="card-icon">
                    <span className="material-icons-round">hourglass_empty</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Shop Owner Registration Pending</h3>
                    <p className="card-description">
                      Registration completed. Waiting for admin verification.
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">check_circle</span>
                  </div>
                </button>
              ) : (
                <button className="application-card shop" onClick={handleApplyShopOwner}>
                  <div className="card-icon">
                    <span className="material-icons-round">store</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Apply for Shop Owner</h3>
                    <p className="card-description">
                      Register your automotive shop and manage mechanics
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">arrow_forward</span>
                  </div>
                </button>
              )}
              
              {/* Show Client option if user has other roles */}
              {(userRoles.has_mechanic_profile || userRoles.has_shop_owner_profile) && userRoles.roles.includes('client') && (
                <button className="application-card client registered" onClick={handleSwitchToClient} style={{borderColor: '#10b981'}}>
                  <div className="card-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>
                    <span className="material-icons-round">person</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Back to Client</h3>
                    <p className="card-description">
                      Return to your client dashboard
                    </p>
                  </div>
                  <div className="card-arrow">
                    <span className="material-icons-round">launch</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </IonContent>

      <IonLoading isOpen={loading} message="Loading user roles..." />
      
      <IonToast
        isOpen={!!error}
        onDidDismiss={() => setError(null)}
        message={error || ''}
        duration={3000}
        color="danger"
        position="top"
      />
    </IonPage>
  );
};

export default SwitchAccount;
