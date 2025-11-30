import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './ShopProfile.css';

const ShopProfile: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();
  const handleCustomRequest = () => history.push('/client/custom-request');
  const goToServiceDetail = (id: string) => history.push(`/client/service-detail/${id}`);

  const handleServiceCard1 = () => goToServiceDetail('1');
  const handleServiceCard2 = () => goToServiceDetail('2');
  const handleServiceCard3 = () => goToServiceDetail('3');

  return (
    <IonPage>
      <IonContent className="shop-profile-content">
        {/* Header with Back Button */}
        <div className="shop-profile-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Shop Profile</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Profile Banner */}
        <div className="profile-banner">
          {/* Profile Picture */}
          <div className="profile-picture-wrapper">
            <div className="profile-picture">AE</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="name-favorite">
            <h2 className="shop-name">Auto Expert Garage</h2>
            <button className="favorite-button">
              <span className="material-icons-round">favorite_border</span>
            </button>
          </div>

          {/* Bio */}
          <p className="shop-bio">
            Full-service automotive repair shop offering comprehensive vehicle maintenance 
            and repair solutions. Our team of certified mechanics ensures quality service 
            for all your automotive needs.
          </p>

          {/* Joined Date */}
          <div className="joined-info">
            <span className="material-icons-round joined-icon">event</span>
            <span className="joined-text">Joined in January 2022</span>
          </div>

          {/* Specialties Tags */}
          <div className="specialties-section">
            <h3 className="section-label">Specialties</h3>
            <div className="tags-container">
              <div className="specialty-tag">General Repair</div>
              <div className="specialty-tag">Engine Diagnostics</div>
              <div className="specialty-tag">Brake Service</div>
              <div className="specialty-tag">Oil Change</div>
              <div className="specialty-tag">Tire Service</div>
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
                <div className="stat-value">4.7</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">check_circle</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">512</div>
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
                <div className="service-type-tag service-shop">Shop</div>
                <div className="category-tag category-repair">Repair</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Complete Engine Overhaul</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">4.8 (95 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱15,000</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      1.2k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">AE</div>
                  <div className="provider-info">
                    <div className="provider-name">Auto Expert Garage</div>
                    <div className="provider-type">Shop</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="service-card" onClick={handleServiceCard2}>
              <div className="card-image" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <div className="service-type-tag service-shop">Shop</div>
                <div className="category-tag category-maintenance">Maintenance</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Premium Brake Service</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">4.9 (112 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱2,500</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      2.1k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">AE</div>
                  <div className="provider-info">
                    <div className="provider-name">Auto Expert Garage</div>
                    <div className="provider-type">Shop</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="service-card" onClick={handleServiceCard3}>
              <div className="card-image" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <div className="service-type-tag service-shop">Shop</div>
                <div className="category-tag category-maintenance">Maintenance</div>
              </div>
              <div className="card-content">
                <h3 className="service-name">Full Synthetic Oil Change</h3>
                
                <div className="ratings">
                  <span className="material-icons-round star">star</span>
                  <span className="rating-text">5.0 (203 reviews)</span>
                </div>
                
                <div className="price-stats">
                  <div className="price">₱1,800</div>
                  <div className="stats">
                    <div className="stat">
                      <span className="material-icons-round stat-icon">bookmark</span>
                      3.5k
                    </div>
                  </div>
                </div>
                
                <div className="provider">
                  <div className="provider-avatar">AE</div>
                  <div className="provider-info">
                    <div className="provider-name">Auto Expert Garage</div>
                    <div className="provider-type">Shop</div>
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

export default ShopProfile;
