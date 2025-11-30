import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './IndependentMechanicProfile.css';

// Interface for service data from API
interface MechanicService {
  service_id: number;
  name: string;
  description: string | null;
  price: string;
  service_banner: string | null;
  category_name: string;
  provider_type: string;
  provider_name: string;
  provider_id: number;
  average_rating: string;
  total_bookings: number;
}

interface ShopInfo {
  shop_id: number;
  shop_name: string;
  description: string | null;
  service_banner: string | null;
}

interface MechanicData {
  acc_id: number;
  full_name: string;
  email: string;
  profile_photo: string | null;
  contact_number: string;
  bio: string;
  average_rating: string;
  ranking: string;
  location: string;
  total_jobs: number;
  date_joined: string;
  status: string;
  is_working_for_shop: boolean;
  shop_info: ShopInfo | null;
  specialties: string[];
  services: MechanicService[];
}

const IndependentMechanicProfile: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [mechanicData, setMechanicData] = useState<MechanicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => history.goBack();
  const handleCustomRequest = () => history.push('/client/custom-request');
  const goToServiceDetail = (serviceId: number) => history.push(`/client/service-detail/${serviceId}`);
  const goToShopDetail = (shopId: number) => history.push(`/client/shop-detail/${shopId}`);

  // Smart service redirect - determines if service belongs to shop or mechanic
  const handleServiceCardClick = async (serviceId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/services/provider/${serviceId}/`);
      const data = await response.json();
      
      if (response.ok && data.redirect_url) {
        history.push(data.redirect_url);
      } else {
        // Fallback to generic service detail page
        goToServiceDetail(serviceId);
      }
    } catch (error) {
      console.error('Error fetching service provider info:', error);
      // Fallback to generic service detail page
      goToServiceDetail(serviceId);
    }
  };

  // Fetch mechanic data from API
  const fetchMechanicData = async () => {
    if (!id) {
      setError('Mechanic ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/accounts/mechanic/${id}/`);
      const data = await response.json();

      if (response.ok) {
        setMechanicData(data.mechanic);
      } else {
        setError(data.error || 'Failed to load mechanic details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching mechanic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanicData();
  }, [id]);

  // Helper functions
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking.toLowerCase()) {
      case 'gold': return 'ranking-gold';
      case 'silver': return 'ranking-silver';
      case 'bronze': return 'ranking-bronze';
      default: return 'ranking-standard';
    }
  };

  const handleServiceClick = (serviceId: number) => {
    handleServiceCardClick(serviceId);
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="mechanic-profile-content">
          <div className="loading-container">
            <div className="loading-message">Loading mechanic profile...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Show error state
  if (error || !mechanicData) {
    return (
      <IonPage>
        <IonContent className="mechanic-profile-content">
          <div className="error-container">
            <div className="error-message">{error || 'Mechanic not found'}</div>
            <button className="retry-button" onClick={fetchMechanicData}>
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
            <div className="profile-picture">
              {mechanicData.profile_photo ? (
                <img src={mechanicData.profile_photo} alt={mechanicData.full_name} />
              ) : (
                getInitials(mechanicData.full_name)
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="name-favorite">
            <h2 className="mechanic-name">{mechanicData.full_name}</h2>
            <button className="favorite-button">
              <span className="material-icons-round">favorite_border</span>
            </button>
          </div>

          {/* Ranking Tag */}
          <div className={`ranking-badge ${getRankingColor(mechanicData.ranking)}`}>
            <span className="material-icons-round badge-icon">workspace_premium</span>
            {mechanicData.ranking.charAt(0).toUpperCase() + mechanicData.ranking.slice(1)} Mechanic
          </div>

          {/* Bio */}
          <p className="mechanic-bio">
            {mechanicData.bio}
          </p>

          {/* Joined Date */}
          <div className="joined-info">
            <span className="material-icons-round joined-icon">event</span>
            <span className="joined-text">Joined in {mechanicData.date_joined}</span>
          </div>

          {/* Shop Info - Show only if mechanic works for a shop */}
          {mechanicData.is_working_for_shop && mechanicData.shop_info && (
            <div className="shop-info-section">
              <h3 className="section-label">Works at</h3>
              <div 
                className="shop-info-card" 
                onClick={() => goToShopDetail(mechanicData.shop_info!.shop_id)}
              >
                <div className="shop-avatar">
                  {mechanicData.shop_info.shop_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="shop-details">
                  <div className="shop-name">{mechanicData.shop_info.shop_name}</div>
                  <div className="shop-description">{mechanicData.shop_info.description || 'Professional automotive shop'}</div>
                  <div className="visit-shop">
                    <span className="material-icons-round">arrow_forward</span>
                    Visit Shop Profile
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specialties Tags */}
          <div className="specialties-section">
            <h3 className="section-label">Specialties</h3>
            <div className="tags-container">
              {mechanicData.specialties.length > 0 ? (
                mechanicData.specialties.map((specialty, index) => (
                  <div key={index} className="specialty-tag">{specialty}</div>
                ))
              ) : (
                <div className="specialty-tag">General Auto Repair</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">star</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{mechanicData.average_rating}</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">check_circle</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{mechanicData.total_jobs}</div>
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
          <h3 className="section-title">
            {mechanicData.is_working_for_shop ? 'Assigned Services' : 'Services Offered'}
          </h3>
          {mechanicData.is_working_for_shop && mechanicData.shop_info && (
            <p className="services-description">
              Services assigned by {mechanicData.shop_info.shop_name}
            </p>
          )}
          
          <div className="cards-container" style={{ paddingBottom: '20px' }}>
            {mechanicData.services.length > 0 ? (
              mechanicData.services.map((service, index) => {
                const gradients = [
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <div key={service.service_id} className="service-card" onClick={() => handleServiceClick(service.service_id)}>
                    <div className="card-image" style={{background: gradient}}>
                      <div className={`service-type-tag ${service.provider_type === 'Shop' ? 'service-shop' : 'service-mechanic'}`}>
                        {service.provider_type}
                      </div>
                      <div className={`category-tag category-${service.category_name.toLowerCase()}`}>{service.category_name}</div>
                    </div>
                    <div className="card-content">
                      <h3 className="service-name">{service.name}</h3>
                      
                      <div className="ratings">
                        <span className="material-icons-round star">star</span>
                        <span className="rating-text">{service.average_rating} ({service.total_bookings} reviews)</span>
                      </div>
                      
                      <div className="price-stats">
                        <div className="price">₱{service.price}</div>
                        <div className="stats">
                          <div className="stat">
                            <span className="material-icons-round stat-icon">bookmark</span>
                            {Math.floor(service.total_bookings * 10)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="provider">
                        <div className="provider-avatar">
                          {service.provider_type === 'Shop' ? (
                            service.provider_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
                          ) : mechanicData.profile_photo ? (
                            <img src={mechanicData.profile_photo} alt={mechanicData.full_name} />
                          ) : (
                            getInitials(mechanicData.full_name)
                          )}
                        </div>
                        <div className="provider-info">
                          <div className="provider-name">{service.provider_name}</div>
                          <div className="provider-type">{service.provider_type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-services-message">
                {mechanicData.is_working_for_shop 
                  ? 'No services have been assigned to this mechanic by the shop yet.' 
                  : 'No services available for this mechanic.'
                }
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default IndependentMechanicProfile;
