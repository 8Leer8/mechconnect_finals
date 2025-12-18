import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import MechanicDiscoveryFilter, { Filters } from '../../../components/MechanicDiscoveryFilter';
import ShopDiscoveryFilter, { ShopFilters } from '../../../components/ShopDiscoveryFilter';
import ServiceDiscoveryFilter, { ServiceFilters } from '../../../components/ServiceDiscoveryFilter';
import './Discover.css';

// Interface for mechanic data from API
interface Mechanic {
  acc_id: number;
  full_name: string;
  profile_photo: string | null;
  bio: string;
  average_rating: string;
  ranking: string;
  location: string;
  total_jobs: number;
  contact_number: string;
  status: string;
}

// Interface for shop data from API
interface Shop {
  shop_id: number;
  shop_name: string;
  contact_number: string | null;
  email: string | null;
  description: string | null;
  service_banner: string | null;
  is_verified: boolean;
  status: string;
  location?: string;
  average_rating?: string;
  total_jobs?: number;
  total_mechanics?: number;
}

// Interface for service data from API
interface Service {
  service_id: number;
  name: string;
  description: string | null;
  service_banner: string | null;
  price: string;
  service_category?: {
    name: string;
  };
  provider_type?: string;
  provider_name?: string;
  provider_id?: number;
  average_rating?: string;
  total_bookings?: number;
}



const Discover: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  
  // Get initial tab from URL parameter
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'mechanic' || type === 'shop' || type === 'service') {
      return type;
    }
    return 'service'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    city: '',
    barangay: '',
    ranking: '',
    status: ''
  });
  const [shopFilters, setShopFilters] = useState<ShopFilters>({
    city: '',
    verified: '',
    status: ''
  });
  const [serviceFilters, setServiceFilters] = useState<ServiceFilters>({
    category: '',
    priceRange: '',
    providerType: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showShopFilterModal, setShowShopFilterModal] = useState(false);
  const [showServiceFilterModal, setShowServiceFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  const goToNotifications = () => history.push('/client/notifications');
  const goToServiceDetail = (id: string | number) => history.push(`/client/service-detail/${id}`);
  const goToMechanicDetail = (id: string | number) => history.push(`/client/mechanic-detail/${id}`);
  const goToShopDetail = (id: string | number) => history.push(`/client/shop-detail/${id}`);
  const goToIndependentMechanicServiceDetail = (id: string | number) => history.push(`/client/service-detail/${id}`);
  const goToShopServiceDetail = (id: string | number) => history.push(`/client/service-detail/${id}`);

  // Smart service redirect - determines if service belongs to shop or mechanic
  const handleServiceCardClick = async (serviceId: string | number) => {
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
  const goToShopProfile = (id: string | number) => history.push(`/client/shop-detail/${id}`);

  // Fetch shops from API
  const fetchShops = async (search = shopSearchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8000/api/shops/discover/`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        let filteredShops = data.shops || [];
        
        // Client-side search filtering by shop name
        if (search.trim()) {
          filteredShops = filteredShops.filter((shop: Shop) => 
            shop.shop_name.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        setShops(filteredShops);
      } else {
        setError('Failed to load shops');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services from API
  const fetchServices = async (search = serviceSearchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8000/api/services/discover/`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        let filteredServices = data.services || [];
        
        // Client-side search filtering by service name
        if (search.trim()) {
          filteredServices = filteredServices.filter((service: Service) => 
            service.name.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        setServices(filteredServices);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mechanics from API
  const fetchMechanics = async (filterParams = filters, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filterParams.city) params.append('city', filterParams.city);
      if (filterParams.barangay) params.append('barangay', filterParams.barangay);
      if (filterParams.ranking) params.append('ranking', filterParams.ranking);
      if (filterParams.status) params.append('status', filterParams.status);
      
      const url = `http://localhost:8000/api/accounts/discover/mechanics/?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        let filteredMechanics = data.mechanics || [];
        
        // Client-side search filtering by name
        if (search.trim()) {
          filteredMechanics = filteredMechanics.filter((mechanic: Mechanic) => 
            mechanic.full_name.toLowerCase().includes(search.toLowerCase())
          );
        }
        
        setMechanics(filteredMechanics);
      } else {
        setError('Failed to load mechanics');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching mechanics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setIsScrollable(tabsRef.current.scrollWidth > tabsRef.current.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    // Fetch data when component mounts or when tab becomes active
    if (activeTab === 'mechanic') {
      fetchMechanics();
    } else if (activeTab === 'shop') {
      fetchShops();
    } else if (activeTab === 'service') {
      fetchServices();
    }
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab]);

  const handleTabService = () => {
    setActiveTab('service');
    if (services.length === 0 && !loading) {
      fetchServices();
    }
  };
  const handleTabMechanic = () => {
    setActiveTab('mechanic');
    if (mechanics.length === 0 && !loading) {
      fetchMechanics();
    }
  };
  const handleTabShop = () => {
    setActiveTab('shop');
    if (shops.length === 0 && !loading) {
      fetchShops();
    }
  };
  
  // Dynamic click handlers
  const handleServiceClick = (serviceId: number) => {
    handleServiceCardClick(serviceId);
  };

  const handleShopClick = (shopId: number) => {
    goToShopDetail(shopId);
  };
  
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
      case 'gold': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 'silver': return 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)';
      case 'bronze': return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const handleMechanicClick = (mechanicId: number) => {
    goToMechanicDetail(mechanicId.toString());
  };

  // Filter and search handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchMechanics(filters, value);
  };

  const handleShopSearchChange = (value: string) => {
    setShopSearchQuery(value);
    fetchShops(value);
  };

  const handleServiceSearchChange = (value: string) => {
    setServiceSearchQuery(value);
    fetchServices(value);
  };

  const handleFilterApply = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    fetchMechanics(newFilters, searchQuery);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = { city: '', barangay: '', ranking: '', status: '' };
    setFilters(clearedFilters);
    setSearchQuery('');
    fetchMechanics(clearedFilters, '');
  };

  const clearShopSearch = () => {
    setShopSearchQuery('');
    fetchShops('');
  };

  const clearServiceSearch = () => {
    setServiceSearchQuery('');
    fetchServices('');
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const openShopFilterModal = () => {
    setShowShopFilterModal(true);
  };

  const openServiceFilterModal = () => {
    setShowServiceFilterModal(true);
  };

  const handleShopFilterApply = (newFilters: ShopFilters) => {
    setShopFilters(newFilters);
    setShowShopFilterModal(false);
    // For now, we'll just re-fetch with search. Backend can be extended later for filtering
    fetchShops(shopSearchQuery);
  };

  const handleServiceFilterApply = (newFilters: ServiceFilters) => {
    setServiceFilters(newFilters);
    setShowServiceFilterModal(false);
    // For now, we'll just re-fetch with search. Backend can be extended later for filtering  
    fetchServices(serviceSearchQuery);
  };

  const clearShopFilters = () => {
    const clearedFilters: ShopFilters = { city: '', verified: '', status: '' };
    setShopFilters(clearedFilters);
    setShopSearchQuery('');
    fetchShops('');
  };

  const clearServiceFilters = () => {
    const clearedFilters: ServiceFilters = { category: '', priceRange: '', providerType: '' };
    setServiceFilters(clearedFilters);
    setServiceSearchQuery('');
    fetchServices('');
  };
  


  return (
    <IonPage>
      <IonContent className="discover-content" style={{ paddingBottom: '80px' }}>
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
                {(serviceFilters.category || serviceFilters.priceRange || serviceFilters.providerType || serviceSearchQuery) && (
                  <span className="filter-indicator"></span>
                )}
              </button>
              <button 
                className={`tab-button ${activeTab === 'mechanic' ? 'active' : ''}`}
                onClick={handleTabMechanic}
              >
                Mechanic
                {(filters.city || filters.ranking || filters.status || searchQuery) && (
                  <span className="filter-indicator"></span>
                )}
              </button>
              <button 
                className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
                onClick={handleTabShop}
              >
                Shop
                {(shopFilters.city || shopFilters.verified || shopFilters.status || shopSearchQuery) && (
                  <span className="filter-indicator"></span>
                )}
              </button>
            </div>
          </div>

          {/* Search and Filter Section - Show for mechanic, shop, and service tabs */}
          {activeTab === 'mechanic' && (
            <div className="search-filter-section">
              <div className="search-filter-container">
                <div className="search-input-container">
                  <span className="material-icons-round search-icon">search</span>
                  <input
                    type="text"
                    placeholder="Search mechanic by name..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => handleSearchChange('')}
                    >
                      <span className="material-icons-round">close</span>
                    </button>
                  )}
                </div>
                
                <button 
                  className={`filter-btn ${(filters.city || filters.ranking || filters.status) ? 'active' : ''}`}
                  onClick={openFilterModal}
                >
                  <span className="material-icons-round">tune</span>
                  {(filters.city || filters.ranking || filters.status) && (
                    <span className="filter-dot"></span>
                  )}
                </button>
              </div>
              
              {(filters.city || filters.ranking || filters.status || searchQuery) && (
                <button className="clear-all-btn" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Search and Filter Section - Show for service tab */}
          {activeTab === 'service' && (
            <div className="search-filter-section">
              <div className="search-filter-container">
                <div className="search-input-container">
                  <span className="material-icons-round search-icon">search</span>
                  <input
                    type="text"
                    placeholder="Search services by name..."
                    className="search-input"
                    value={serviceSearchQuery}
                    onChange={(e) => handleServiceSearchChange(e.target.value)}
                  />
                  {serviceSearchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => handleServiceSearchChange('')}
                    >
                      <span className="material-icons-round">close</span>
                    </button>
                  )}
                </div>
                
                <button 
                  className={`filter-btn ${(serviceFilters.category || serviceFilters.priceRange || serviceFilters.providerType) ? 'active' : ''}`}
                  onClick={openServiceFilterModal}
                >
                  <span className="material-icons-round">tune</span>
                  {(serviceFilters.category || serviceFilters.priceRange || serviceFilters.providerType) && (
                    <span className="filter-dot"></span>
                  )}
                </button>
              </div>
              
              {(serviceFilters.category || serviceFilters.priceRange || serviceFilters.providerType || serviceSearchQuery) && (
                <button className="clear-all-btn" onClick={clearServiceFilters}>
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Service Cards */}
          {activeTab === 'service' && (
            <div className="cards-container" style={{ paddingBottom: '20px' }}>
              {loading && (
                <div className="loading-message">Loading services...</div>
              )}
              
              {error && (
                <div className="error-message">{error}</div>
              )}
              
              {!loading && !error && services.length === 0 && (
                <div className="no-services-message">
                  {serviceSearchQuery
                    ? 'No services found' 
                    : 'No services available'
                  }
                </div>
              )}
              
              {!loading && !error && services.length > 0 && services.map((service, index) => {
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
                        {service.provider_type || 'Independent Mechanic'}
                      </div>
                      <div className="category-tag category-repair">
                        {service.service_category?.name || 'Service'}
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="service-name">{service.name}</h3>
                      
                      <div className="ratings">
                        <span className="material-icons-round star">star</span>
                        <span className="rating-text">{service.average_rating || '0.0'} ({service.total_bookings || 0} reviews)</span>
                      </div>
                      
                      <div className="price-stats">
                        <div className="price">₱{service.price}</div>
                        <div className="stats">
                          <div className="stat">
                            <span className="material-icons-round stat-icon">bookmark</span>
                            {Math.floor((service.total_bookings || 0) * 10)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="provider">
                        <div className="provider-avatar">
                          {service.provider_name ? service.provider_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'NA'}
                        </div>
                        <div className="provider-info">
                          <div className="provider-name">{service.provider_name || 'Unknown Provider'}</div>
                          <div className="provider-type">{service.provider_type || 'Independent Mechanic'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mechanic Cards */}
          {activeTab === 'mechanic' && (
            <div className="cards-container">
              {loading && (
                <div className="loading-message">Loading mechanics...</div>
              )}
              
              {error && (
                <div className="error-message">{error}</div>
              )}
              
              {!loading && !error && mechanics.length === 0 && (
                <div className="no-mechanics-message">
                  {(filters.city || filters.ranking || filters.status || searchQuery) 
                    ? 'No mechanics found' 
                    : 'No mechanic available'
                  }
                </div>
              )}
              
              {!loading && !error && mechanics.length > 0 && mechanics.map((mechanic) => (
                <div key={mechanic.acc_id} className="profile-card" onClick={() => handleMechanicClick(mechanic.acc_id)}>
                  <div className="profile-header" style={{background: getRankingColor(mechanic.ranking)}}>
                    <div className="profile-avatar">
                      {mechanic.profile_photo ? (
                        <img src={mechanic.profile_photo} alt={mechanic.full_name} />
                      ) : (
                        getInitials(mechanic.full_name)
                      )}
                    </div>
                    <div className={`ranking-tag ranking-${mechanic.ranking.toLowerCase()}`}>
                      <span className="material-icons-round" style={{fontSize: '14px'}}>workspace_premium</span>
                      {mechanic.ranking.charAt(0).toUpperCase() + mechanic.ranking.slice(1)} Mechanic
                    </div>
                  </div>
                  
                  <div className="profile-content">
                    <div className="profile-name">{mechanic.full_name}</div>
                    <div className="service-type-badge service-independent">
                      {mechanic.bio || 'Independent Mechanic'}
                    </div>
                    
                    <div className="profile-stats">
                      <div className="stat-item">
                        <div className="stat-value">{mechanic.average_rating || '0.0'}</div>
                        <div className="stat-label">Rating</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{mechanic.total_jobs}</div>
                        <div className="stat-label">Jobs</div>
                      </div>
                    </div>
                    
                    <div className="ratings">
                      <span className="material-icons-round star">star</span>
                      <span className="rating-text">{mechanic.average_rating || '0.0'} ({Math.floor(mechanic.total_jobs / 2)} reviews)</span>
                    </div>
                    
                    <div className="location">
                      <span className="material-icons-round location-icon">location_on</span>
                      <div className="location-text">{mechanic.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search and Filter Section - Show for shop tab */}
          {activeTab === 'shop' && (
            <div className="search-filter-section">
              <div className="search-filter-container">
                <div className="search-input-container">
                  <span className="material-icons-round search-icon">search</span>
                  <input
                    type="text"
                    placeholder="Search shops by name..."
                    className="search-input"
                    value={shopSearchQuery}
                    onChange={(e) => handleShopSearchChange(e.target.value)}
                  />
                  {shopSearchQuery && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => handleShopSearchChange('')}
                    >
                      <span className="material-icons-round">close</span>
                    </button>
                  )}
                </div>
                
                <button 
                  className={`filter-btn ${(shopFilters.city || shopFilters.verified || shopFilters.status) ? 'active' : ''}`}
                  onClick={openShopFilterModal}
                >
                  <span className="material-icons-round">tune</span>
                  {(shopFilters.city || shopFilters.verified || shopFilters.status) && (
                    <span className="filter-dot"></span>
                  )}
                </button>
              </div>
              
              {(shopFilters.city || shopFilters.verified || shopFilters.status || shopSearchQuery) && (
                <button className="clear-all-btn" onClick={clearShopFilters}>
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Shop Cards */}
          {activeTab === 'shop' && (
            <div className="cards-container">
              {loading && (
                <div className="loading-message">Loading shops...</div>
              )}
              
              {error && (
                <div className="error-message">{error}</div>
              )}
              
              {!loading && !error && shops.length === 0 && (
                <div className="no-shops-message">
                  {shopSearchQuery
                    ? 'No shops found' 
                    : 'No shops available'
                  }
                </div>
              )}
              
              {!loading && !error && shops.length > 0 && shops.map((shop, index) => {
                const gradients = [
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <div key={shop.shop_id} className="profile-card" onClick={() => handleShopClick(shop.shop_id)}>
                    <div className="profile-header" style={{background: gradient}}>
                      <div className="profile-avatar">
                        {shop.shop_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                      </div>
                    </div>
                    
                    <div className="profile-content">
                      <div className="profile-name">{shop.shop_name}</div>
                      
                      <div className="profile-stats">
                        <div className="stat-item">
                          <div className="stat-value">{shop.average_rating || '0.0'}</div>
                          <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{shop.total_jobs || 0}</div>
                          <div className="stat-label">Jobs</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-value">{shop.total_mechanics || 0}</div>
                          <div className="stat-label">Mechanics</div>
                        </div>
                      </div>
                      
                      <div className="ratings">
                        <span className="material-icons-round star">star</span>
                        <span className="rating-text">{shop.average_rating || '0.0'} ({Math.floor((shop.total_jobs || 0) / 2)} reviews)</span>
                      </div>
                      
                      <div className="location">
                        <span className="material-icons-round location-icon">location_on</span>
                        <div className="location-text">{shop.location || 'Location not specified'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>

      {/* Filter Modals */}
      <MechanicDiscoveryFilter
        isOpen={showFilterModal}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setShowFilterModal(false)}
      />

      <ShopDiscoveryFilter
        isOpen={showShopFilterModal}
        filters={shopFilters}
        onApply={handleShopFilterApply}
        onClose={() => setShowShopFilterModal(false)}
      />

      <ServiceDiscoveryFilter
        isOpen={showServiceFilterModal}
        filters={serviceFilters}
        onApply={handleServiceFilterApply}
        onClose={() => setShowServiceFilterModal(false)}
      />

      <BottomNav />
    </IonPage>
  );
};

export default Discover;
