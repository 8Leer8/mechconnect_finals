import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './IndependentMechanicProfile.css';

const IndependentMechanicProfile: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();
  const handleCustomRequest = () => history.push('/client/custom-request');
  const goToServiceDetail = (id: string) => history.push(`/client/service-detail/${id}`);

  const handleServiceCard1 = () => goToServiceDetail('1');
  const handleServiceCard2 = () => goToServiceDetail('2');
  const handleServiceCard3 = () => goToServiceDetail('3');

  return (
    <IonPage>
      <IonContent className="mechanic-profile-content">
        {/* Header with Back Button */}
        <div className="mechanic-profile-header">
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
            <div className="profile-picture">MJ</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="name-favorite">
            <h2 className="mechanic-name">Mike Johnson</h2>
            <button className="favorite-button">
              <span className="material-icons-round">favorite_border</span>
            </button>
          </div>

          {/* Ranking Tag */}
          <div className="ranking-badge ranking-gold">
            <span className="material-icons-round badge-icon">workspace_premium</span>
            Gold Mechanic
          </div>

          {/* Bio */}
          <p className="mechanic-bio">
            Professional auto mechanic with over 10 years of experience in vehicle repair 
            and maintenance. Specialized in engine diagnostics and electrical systems.
          </p>

          {/* Joined Date */}
          <div className="joined-info">
            <span className="material-icons-round joined-icon">event</span>
            <span className="joined-text">Joined in January 2023</span>
          </div>

          {/* Specialties Tags */}
          <div className="specialties-section">
            <h3 className="section-label">Specialties</h3>
            <div className="tags-container">
              <div className="specialty-tag">Engine Repair</div>
              <div className="specialty-tag">Brake System</div>
              <div className="specialty-tag">Electrical</div>
              <div className="specialty-tag">Transmission</div>
              <div className="specialty-tag">AC Repair</div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">star</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">4.8</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">check_circle</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">247</div>
                <div className="stat-label">Jobs Completed</div>
              </div>
            </div>
          </div>

          {/* Custom Request Button */}
          <button className="custom-request-button" onClick={handleCustomRequest}>
            <span className="material-icons-round button-icon">add_circle</span>
            Send Custom Request
          </button>
        </div>

        {/* Services Section */}
        <div className="services-section">
          <h3 className="section-title">Services</h3>
          
          <div className="cards-container">
            <div className="service-card" onClick={handleServiceCard1}>
              <div className="card-image">
                <div className="service-type-tag service-mechanic">Independent Mechanic</div>
                <div className="category-tag category-repair">Repair</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Car Engine Repair</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">4.5 (128 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱1,200</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      2.4k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">MJ</div>
                  <div className="provider-info">
                    <div className="provider-name">Mike Johnson Auto</div>
                    <div className="provider-type">Independent Mechanic</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="service-card" onClick={handleServiceCard2}>
              <div className="card-image" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <div className="service-type-tag service-mechanic">Independent Mechanic</div>
                <div className="category-tag category-maintenance">Maintenance</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Brake System Service</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">5.0 (89 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱850</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      1.8k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">MJ</div>
                  <div className="provider-info">
                    <div className="provider-name">Mike Johnson Auto</div>
                    <div className="provider-type">Independent Mechanic</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="service-card" onClick={handleServiceCard3}>
              <div className="card-image" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <div className="service-type-tag service-mechanic">Independent Mechanic</div>
                <div className="category-tag category-maintenance">Maintenance</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Oil Change Service</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">4.2 (256 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱450</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      3.1k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">MJ</div>
                  <div className="provider-info">
                    <div className="provider-name">Mike Johnson Auto</div>
                    <div className="provider-type">Independent Mechanic</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default IndependentMechanicProfile;
