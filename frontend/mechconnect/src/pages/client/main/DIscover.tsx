import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import MechanicDiscoveryFilter, { Filters } from '../../../components/MechanicDiscoveryFilter';
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



const Discover: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('service');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    city: '',
    ranking: '',
    status: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const goToNotifications = () => history.push('/client/notifications');
  const goToServiceDetail = (id: string) => history.push(`/client/service-detail/${id}`);
  const goToMechanicDetail = (id: string) => history.push(`/client/mechanic-detail/${id}`);
  const goToShopDetail = (id: string) => history.push(`/client/shop-detail/${id}`);

  // Fetch mechanics from API
  const fetchMechanics = async (filterParams = filters, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filterParams.city) params.append('city', filterParams.city);
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
    
    // Fetch mechanics when component mounts or when mechanic tab becomes active
    if (activeTab === 'mechanic') {
      fetchMechanics();
    }
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab]);

  const handleTabService = () => setActiveTab('service');
  const handleTabMechanic = () => {
    setActiveTab('mechanic');
    if (mechanics.length === 0 && !loading) {
      fetchMechanics();
    }
  };
  const handleTabShop = () => setActiveTab('shop');
  
  const handleServiceCard1 = () => goToIndependentMechanicServiceDetail('1'); // Independent Mechanic Service
  const handleServiceCard2 = () => goToShopServiceDetail('1'); // Shop Service
  const handleServiceCard3 = () => goToIndependentMechanicServiceDetail('2'); // Independent Mechanic Service
  
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

  const handleFilterApply = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    fetchMechanics(newFilters, searchQuery);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = { city: '', ranking: '', status: '' };
    setFilters(clearedFilters);
    setSearchQuery('');
    fetchMechanics(clearedFilters, '');
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };
  
  const handleShopCard1 = () => goToShopProfile('1');
  const handleShopCard2 = () => goToShopProfile('2');
  const handleShopCard3 = () => goToShopProfile('3');

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
              </button>
            </div>
          </div>

          {/* Search and Filter Section - Only show for mechanic tab */}
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

      {/* Filter Modal */}
      <MechanicDiscoveryFilter
        isOpen={showFilterModal}
        filters={filters}
        onApply={handleFilterApply}
        onClose={() => setShowFilterModal(false)}
      />

      <BottomNav />
    </IonPage>
  );
};

export default Discover;
