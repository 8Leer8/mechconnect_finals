import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import './Discover.css';

const Discover: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('service');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const goToNotifications = () => history.push('/client/notifications');
  const goToServiceDetail = (id: string) => history.push(`/client/service-detail/${id}`);
  const goToMechanicDetail = (id: string) => history.push(`/client/mechanic-detail/${id}`);
  const goToShopDetail = (id: string) => history.push(`/client/shop-detail/${id}`);

  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setIsScrollable(tabsRef.current.scrollWidth > tabsRef.current.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  const handleTabService = () => setActiveTab('service');
  const handleTabMechanic = () => setActiveTab('mechanic');
  const handleTabShop = () => setActiveTab('shop');
  
  const handleServiceCard1 = () => goToServiceDetail('1');
  const handleServiceCard2 = () => goToServiceDetail('2');
  const handleServiceCard3 = () => goToServiceDetail('3');
  
  const handleMechanicCard1 = () => goToMechanicDetail('1');
  const handleMechanicCard2 = () => goToMechanicDetail('2');
  const handleMechanicCard3 = () => goToMechanicDetail('3');
  
  const handleShopCard1 = () => goToShopDetail('1');
  const handleShopCard2 = () => goToShopDetail('2');
  const handleShopCard3 = () => goToShopDetail('3');

  return (
    <IonPage>
      <IonContent className="discover-content">
        {/* Header */}
        <div className="discover-header">
          <h1 className="discover-title">Discover</h1>
          <button 
            className="notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="discover-section">
          <div className={`tabs-container ${isScrollable ? 'scrollable' : ''}`}>
            <div className="tabs" ref={tabsRef}>
              <button 
                className={`tab-button ${activeTab === 'service' ? 'active' : ''}`}
                onClick={handleTabService}
              >
                Service
              </button>
              <button 
                className={`tab-button ${activeTab === 'mechanic' ? 'active' : ''}`}
                onClick={handleTabMechanic}
              >
                Mechanic
              </button>
              <button 
                className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
                onClick={handleTabShop}
              >
                Shop
              </button>
            </div>
          </div>

          {/* Service Cards */}
          {activeTab === 'service' && (
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
                  <div className="service-type-tag service-shop">Shop</div>
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
                    <div className="provider-avatar">PS</div>
                    <div className="provider-info">
                      <div className="provider-name">Precision Service</div>
                      <div className="provider-type">Shop</div>
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
                    <div className="provider-avatar">DR</div>
                    <div className="provider-info">
                      <div className="provider-name">David Rodriguez</div>
                      <div className="provider-type">Independent Mechanic</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mechanic Cards */}
          {activeTab === 'mechanic' && (
            <div className="cards-container">
              <div className="profile-card" onClick={handleMechanicCard1}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="profile-avatar">MJ</div>
                  <div className="ranking-tag ranking-gold">
                    <span className="material-icons-round" style={{fontSize: '14px'}}>workspace_premium</span>
                    Gold Mechanic
                  </div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">Mike Johnson</div>
                  <div className="service-type-badge service-independent">
                    Independent Mechanic
                  </div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.8</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">247</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.8 (128 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Tetuan, Zamboanga City</div>
                  </div>
                </div>
              </div>

              <div className="profile-card" onClick={handleMechanicCard2}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <div className="profile-avatar">PS</div>
                  <div className="ranking-tag ranking-silver">
                    <span className="material-icons-round" style={{fontSize: '14px'}}>workspace_premium</span>
                    Silver Mechanic
                  </div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">Precision Service</div>
                  <div className="service-type-badge service-shop">
                    Shop Affiliated
                  </div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.6</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">189</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.6 (89 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Guiwan, Zamboanga City</div>
                  </div>
                </div>
              </div>

              <div className="profile-card" onClick={handleMechanicCard3}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                  <div className="profile-avatar">DR</div>
                  <div className="ranking-tag ranking-bronze">
                    <span className="material-icons-round" style={{fontSize: '14px'}}>workspace_premium</span>
                    Bronze Mechanic
                  </div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">David Rodriguez</div>
                  <div className="service-type-badge service-independent">
                    Independent Mechanic
                  </div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.9</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">156</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.9 (67 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Tumaga, Zamboanga City</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shop Cards */}
          {activeTab === 'shop' && (
            <div className="cards-container">
              <div className="profile-card" onClick={handleShopCard1}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="profile-avatar">AE</div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">Auto Expert Garage</div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.7</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">512</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">8</div>
                      <div className="stat-label">Mechanics</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.7 (243 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Tetuan, Zamboanga City</div>
                  </div>
                </div>
              </div>

              <div className="profile-card" onClick={handleShopCard2}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <div className="profile-avatar">PA</div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">Precision Auto Works</div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.5</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">387</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">5</div>
                      <div className="stat-label">Mechanics</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.5 (156 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Guiwan, Zamboanga City</div>
                  </div>
                </div>
              </div>

              <div className="profile-card" onClick={handleShopCard3}>
                <div className="profile-header" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                  <div className="profile-avatar">CA</div>
                </div>
                
                <div className="profile-content">
                  <div className="profile-name">City Auto Service</div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-value">4.9</div>
                      <div className="stat-label">Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">621</div>
                      <div className="stat-label">Jobs</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Mechanics</div>
                    </div>
                  </div>
                  
                  <div className="ratings">
                    <span className="material-icons-round star">star</span>
                    <span className="rating-text">4.9 (312 reviews)</span>
                  </div>
                  
                  <div className="location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <div className="location-text">Tumaga, Zamboanga City</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <BottomNav />
    </IonPage>
  );
};

export default Discover;
