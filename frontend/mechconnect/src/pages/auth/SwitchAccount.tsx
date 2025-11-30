import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './SwitchAccount.css';

const SwitchAccount: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();

  const handleApplyMechanic = () => {
    history.push('/mechanic-signup');
  };

  const handleApplyShopOwner = () => {
    history.push('/shop-owner-signup');
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
          <div className="info-card">
            <div className="info-icon">
              <span className="material-icons-round">info</span>
            </div>
            <p className="info-text">
              Want to offer your services? Apply to become a mechanic or shop owner on our platform.
            </p>
          </div>

          {/* Application Options */}
          <div className="application-options">
            {/* Apply for Mechanic */}
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

            {/* Apply for Shop Owner */}
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
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SwitchAccount;
