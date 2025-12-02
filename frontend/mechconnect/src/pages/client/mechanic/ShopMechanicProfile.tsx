import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './ShopMechanicProfile.css';

const ShopMechanicProfile: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();
  const handleCustomRequest = () => history.push(`/client/custom-request?provider_id=${id}`);
  const goToShopDetail = (id: string) => history.push(`/client/shop-detail/${id}`);

  return (
    <IonPage>
      <IonContent className="shop-mechanic-profile-content">
        {/* Header with Back Button */}
        <div className="shop-mechanic-profile-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Mechanic Profile</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Profile Banner */}
        <div className="profile-banner">
          {/* Profile Picture */}
          <div className="profile-picture-wrapper">
            <div className="profile-picture">PS</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="name-favorite">
            <h2 className="mechanic-name">Precision Service</h2>
            <button className="favorite-button">
              <span className="material-icons-round">favorite_border</span>
            </button>
          </div>

          {/* Ranking Tag */}
          <div className="ranking-badge ranking-silver">
            <span className="material-icons-round badge-icon">workspace_premium</span>
            Silver Mechanic
          </div>

          {/* Bio */}
          <p className="mechanic-bio">
            Expert mechanic specializing in comprehensive auto repair services. 
            Affiliated with Precision Auto Works, bringing quality service and expertise.
          </p>

          {/* Joined Date */}
          <div className="joined-info">
            <span className="material-icons-round joined-icon">event</span>
            <span className="joined-text">Joined in March 2023</span>
          </div>

          {/* Shop Name with Visit Link */}
          <div className="shop-link-section">
            <div className="shop-label">Shop:</div>
            <button className="shop-visit-link" onClick={() => goToShopDetail('1')}>
              <span className="shop-name">Precision Auto Works</span>
              <span className="material-icons-round">arrow_forward</span>
            </button>
          </div>

          {/* Specialties Tags */}
          <div className="specialties-section">
            <h3 className="section-label">Specialties</h3>
            <div className="tags-container">
              <div className="specialty-tag">Brake System</div>
              <div className="specialty-tag">Suspension</div>
              <div className="specialty-tag">Diagnostics</div>
              <div className="specialty-tag">Oil Change</div>
              <div className="specialty-tag">Tire Service</div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">star</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">4.6</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">check_circle</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">189</div>
                <div className="stat-label">Jobs Completed</div>
              </div>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShopMechanicProfile;
