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
    // Don't auto-redirect if user intentionally came here to switch roles
    // Only redirect if active_role exists AND user didn't come from a "switch" action
    const activeRole = localStorage.getItem('active_role');
    const intentionalSwitch = sessionStorage.getItem('intentional_switch');
    
    if (activeRole && !intentionalSwitch) {
      // User has an active role and didn't intentionally come to switch -> redirect back
      switch(activeRole) {
        case 'mechanic':
          history.replace('/mechanic/home');
          return;
        case 'shop_owner':
          history.replace('/shopowner/home');
          return;
        case 'client':
          history.replace('/client/home');
          return;
        case 'admin':
          history.replace('/admin/dashboard');
          return;
        case 'head_admin':
          history.replace('/headadmin/dashboard');
          return;
      }
    }
    
    // Clear the intentional switch flag
    sessionStorage.removeItem('intentional_switch');
    
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      
      // Get user ID from localStorage (you might need to adjust this based on your auth implementation)
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User not found. Please login again.');
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user.acc_id || user.id || 10; // fallback to 10 for testing

      const response = await fetch(`http://localhost:8000/api/accounts/check-roles/?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserRoles(data);
        
        // If user only has client role and no other profiles, redirect to client home
        if (!data.has_mechanic_profile && !data.has_shop_owner_profile && 
            data.roles.length === 1 && data.roles[0] === 'client') {
          localStorage.setItem('active_role', 'client');
          history.replace('/client/home');
          return;
        }
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
    history.push('/shopowner/home');
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
