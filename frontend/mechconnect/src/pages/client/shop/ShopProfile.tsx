import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ShopProfile.css';

interface RouteParams {
  id: string;
}

interface ShopMechanic {
  mechanic_id: number;
  full_name: string;
  bio: string;
  specialties: string[];
}

interface ShopService {
  service_id: number;
  service_name: string;
  description: string;
  price: number;
  category: string;
  assigned_mechanics: Array<{
    mechanic_id: number;
    full_name: string;
  }>;
  created_at: string;
}

interface ShopStats {
  total_services: number;
  total_mechanics: number;
  rating: number;
  jobs_completed: number;
}

interface ShopData {
  shop_id: number;
  shop_name: string;
  contact_number: string;
  email: string;
  website: string;
  description: string;
  service_banner: string;
  is_verified: boolean;
  status: string;
  created_at: string;
  location?: string;
}

interface ShopDetailResponse {
  message: string;
  shop: ShopData;
  services: ShopService[];
  mechanics: ShopMechanic[];
  stats: ShopStats;
}

const ShopProfile: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [shopData, setShopData] = useState<ShopDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => history.goBack();
  const handleCustomRequest = () => history.push('/client/custom-request');
  const goToServiceDetail = (id: string) => history.push(`/client/service-detail/${id}`);
  const goToMechanicDetail = (mechanicId: number) => history.push(`/client/mechanic-detail/${mechanicId}`);

  // Smart service redirect - determines if service belongs to shop or mechanic
  const handleServiceCardClick = async (serviceId: string | number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/services/provider/${serviceId}/`);
      const data = await response.json();
      
      if (response.ok && data.redirect_url) {
        history.push(data.redirect_url);
      } else {
        // Fallback to generic service detail page
        goToServiceDetail(serviceId.toString());
      }
    } catch (error) {
      console.error('Error fetching service provider info:', error);
      // Fallback to generic service detail page
      goToServiceDetail(serviceId.toString());
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/shops/detail/${id}/`);
      const data = await response.json();
      
      if (response.ok) {
        setShopData(data);
      } else {
        setError(data.error || 'Failed to fetch shop details');
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'repair': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'maintenance': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'installation': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'diagnosis': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return gradients[category.toLowerCase()] || gradients['default'];
  };

  const getShopInitials = (shopName: string) => {
    return shopName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="shop-profile-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading shop details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="shop-profile-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Shop</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!shopData) {
    return (
      <IonPage>
        <IonContent className="shop-profile-content">
          <div className="error-container">
            <h3>Shop Not Found</h3>
            <p>The shop you're looking for doesn't exist.</p>
            <button className="retry-button" onClick={goBack}>
              Go Back
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
            <div className="profile-picture">
              {getShopInitials(shopData.shop.shop_name)}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="name-favorite">
            <h2 className="shop-name">{shopData.shop.shop_name}</h2>
            <button className="favorite-button">
              <span className="material-icons-round">favorite_border</span>
            </button>
          </div>

          {/* Bio */}
          <p className="shop-bio">
            {shopData.shop.description || 'Full-service automotive repair shop offering comprehensive vehicle maintenance and repair solutions.'}
          </p>

          {/* Location */}
          {shopData.shop.location && (
            <div className="location-info">
              <span className="material-icons-round location-icon">location_on</span>
              <span className="location-text">{shopData.shop.location}</span>
            </div>
          )}

          {/* Contact Info */}
          <div className="contact-info">
            {shopData.shop.contact_number && (
              <div className="contact-item">
                <span className="material-icons-round contact-icon">phone</span>
                <span className="contact-text">{shopData.shop.contact_number}</span>
              </div>
            )}
            {shopData.shop.email && (
              <div className="contact-item">
                <span className="material-icons-round contact-icon">email</span>
                <span className="contact-text">{shopData.shop.email}</span>
              </div>
            )}
            {shopData.shop.website && (
              <div className="contact-item">
                <span className="material-icons-round contact-icon">language</span>
                <span className="contact-text">{shopData.shop.website}</span>
              </div>
            )}
          </div>

          {/* Joined Date */}
          <div className="joined-info">
            <span className="material-icons-round joined-icon">event</span>
            <span className="joined-text">Joined in {formatJoinDate(shopData.shop.created_at)}</span>
          </div>

          {/* Shop Mechanics Section */}
          {shopData.mechanics.length > 0 && (
            <div className="mechanics-section">
              <h3 className="section-label">Our Mechanics</h3>
              <div className="mechanics-list">
                {shopData.mechanics.map((mechanic) => (
                  <div key={mechanic.mechanic_id} className="mechanic-item" onClick={() => goToMechanicDetail(mechanic.mechanic_id)}>
                    <div className="mechanic-avatar">
                      {mechanic.full_name.split(' ').map(name => name[0]).join('').substring(0, 2)}
                    </div>
                    <div className="mechanic-info">
                      <div className="mechanic-name">{mechanic.full_name}</div>
                      {mechanic.specialties.length > 0 && (
                        <div className="mechanic-specialties">
                          {mechanic.specialties.slice(0, 2).join(', ')}
                          {mechanic.specialties.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                    <span className="material-icons-round arrow-icon">arrow_forward_ios</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">star</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{shopData.stats.rating}</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">check_circle</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{shopData.stats.jobs_completed}</div>
                <div className="stat-label">Jobs Completed</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round stat-icon">build</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{shopData.stats.total_services}</div>
                <div className="stat-label">Services</div>
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
          
          {shopData.services.length === 0 ? (
            <div className="no-services">
              <span className="material-icons-round no-services-icon">build_circle</span>
              <p>No services available at the moment</p>
            </div>
          ) : (
            <div className="cards-container">
              {shopData.services.map((service) => (
                <div key={service.service_id} className="service-card" onClick={() => handleServiceCardClick(service.service_id)}>
                  <div className="card-image" style={{background: getCategoryGradient(service.category)}}>
                    <div className="service-type-tag service-shop">Shop</div>
                    <div className="category-tag">{service.category}</div>
                  </div>
                  <div className="card-content">
                    <h3 className="service-name">{service.service_name}</h3>
                    
                    <div className="ratings">
                      <span className="material-icons-round star">star</span>
                      <span className="rating-text">4.8 (95 reviews)</span>
                    </div>
                    
                    <div className="price-stats">
                      <div className="price">₱{service.price.toLocaleString()}</div>
                      <div className="stats">
                        <div className="stat">
                          <span className="material-icons-round stat-icon">bookmark</span>
                          1.2k
                        </div>
                      </div>
                    </div>
                    
                    <div className="provider">
                      <div className="provider-avatar">
                        {getShopInitials(shopData.shop.shop_name)}
                      </div>
                      <div className="provider-info">
                        <div className="provider-name">{shopData.shop.shop_name}</div>
                        <div className="provider-type">Shop</div>
                      </div>
                    </div>

                    {service.assigned_mechanics.length > 0 && (
                      <div className="assigned-mechanics">
                        <span className="mechanics-label">Assigned to: </span>
                        <span className="mechanics-names">
                          {service.assigned_mechanics.slice(0, 2).map(m => m.full_name).join(', ')}
                          {service.assigned_mechanics.length > 2 && ` +${service.assigned_mechanics.length - 2} more`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShopProfile;
