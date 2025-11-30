import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Favorite.css';

interface Mechanic {
  id: string;
  name: string;
  avatar: string;
  type: 'independent' | 'shop-affiliated';
  rating: number;
  jobs: number;
  reviews: number;
  location: string;
  gradient: string;
}

interface Shop {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  jobs: number;
  mechanics: number;
  reviews: number;
  location: string;
  gradient: string;
}

const Favorite: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'mechanic' | 'shop'>('mechanic');

  const favoriteMechanics: Mechanic[] = [
    {
      id: '1',
      name: 'Mike Johnson',
      avatar: 'MJ',
      type: 'independent',
      rating: 4.8,
      jobs: 247,
      reviews: 128,
      location: 'Tetuan, Zamboanga City',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: '2',
      name: 'David Rodriguez',
      avatar: 'DR',
      type: 'independent',
      rating: 4.9,
      jobs: 156,
      reviews: 67,
      location: 'Tumaga, Zamboanga City',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: '3',
      name: 'Precision Service',
      avatar: 'PS',
      type: 'shop-affiliated',
      rating: 4.6,
      jobs: 189,
      reviews: 89,
      location: 'Guiwan, Zamboanga City',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  const favoriteShops: Shop[] = [
    {
      id: '1',
      name: 'Auto Expert Garage',
      avatar: 'AE',
      rating: 4.7,
      jobs: 512,
      mechanics: 8,
      reviews: 243,
      location: 'Tetuan, Zamboanga City',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: '2',
      name: 'Precision Auto Works',
      avatar: 'PA',
      rating: 4.5,
      jobs: 387,
      mechanics: 5,
      reviews: 156,
      location: 'Guiwan, Zamboanga City',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: '3',
      name: 'City Auto Service',
      avatar: 'CA',
      rating: 4.9,
      jobs: 621,
      mechanics: 12,
      reviews: 312,
      location: 'Tumaga, Zamboanga City',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  const goBack = () => {
    history.goBack();
  };

  const handleRemoveFavorite = (e: React.MouseEvent, type: 'mechanic' | 'shop', id: string) => {
    e.stopPropagation();
    console.log(`Remove ${type} favorite:`, id);
  };

  const handleMechanicClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const mechanicId = e.currentTarget.dataset.mechanicId;
    console.log('Navigate to mechanic:', mechanicId);
  };

  const handleShopClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const shopId = e.currentTarget.dataset.shopId;
    console.log('Navigate to shop:', shopId);
  };

  const handleTabClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const tab = e.currentTarget.dataset.tab as 'mechanic' | 'shop';
    setActiveTab(tab);
  };

  return (
    <IonPage>
      <IonContent className="favorite-content">
        <div className="favorite-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="favorite-title">Favorite</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'mechanic' ? 'active' : ''}`}
              data-tab="mechanic"
              onClick={handleTabClick}
            >
              Mechanic
            </button>
            <button 
              className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
              data-tab="shop"
              onClick={handleTabClick}
            >
              Shop
            </button>
          </div>
        </div>

        <div className="favorite-cards-container">
          {activeTab === 'mechanic' && (
            <>
              {favoriteMechanics.map((mechanic) => (
                <div 
                  key={mechanic.id} 
                  className="profile-card"
                  data-mechanic-id={mechanic.id}
                  onClick={handleMechanicClick}
                >
                  <div className="profile-header" style={{ background: mechanic.gradient }}>
                    <div className="profile-avatar">{mechanic.avatar}</div>
                    <button 
                      className="favorite-heart-button"
                      onClick={(e) => handleRemoveFavorite(e, 'mechanic', mechanic.id)}
                    >
                      <span className="material-icons-round">favorite</span>
                    </button>
                  </div>
                  
                  <div className="profile-content">
                    <div className="profile-name">{mechanic.name}</div>
                    <div className={`service-type-badge ${mechanic.type === 'independent' ? 'service-independent' : 'service-shop'}`}>
                      {mechanic.type === 'independent' ? 'Independent Mechanic' : 'Shop Affiliated'}
                    </div>
                    
                    <div className="profile-stats">
                      <div className="stat-item">
                        <div className="stat-value">{mechanic.rating}</div>
                        <div className="stat-label">Rating</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{mechanic.jobs}</div>
                        <div className="stat-label">Jobs</div>
                      </div>
                    </div>
                    
                    <div className="ratings">
                      <span className="material-icons-round star">star</span>
                      <span className="rating-text">{mechanic.rating} ({mechanic.reviews} reviews)</span>
                    </div>
                    
                    <div className="location">
                      <span className="material-icons-round location-icon">location_on</span>
                      <div className="location-text">{mechanic.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'shop' && (
            <>
              {favoriteShops.map((shop) => (
                <div 
                  key={shop.id} 
                  className="profile-card"
                  data-shop-id={shop.id}
                  onClick={handleShopClick}
                >
                  <div className="profile-header" style={{ background: shop.gradient }}>
                    <div className="profile-avatar">{shop.avatar}</div>
                    <button 
                      className="favorite-heart-button"
                      onClick={(e) => handleRemoveFavorite(e, 'shop', shop.id)}
                    >
                      <span className="material-icons-round">favorite</span>
                    </button>
                  </div>
                  
                  <div className="profile-content">
                    <div className="profile-name">{shop.name}</div>
                    
                    <div className="profile-stats">
                      <div className="stat-item">
                        <div className="stat-value">{shop.rating}</div>
                        <div className="stat-label">Rating</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{shop.jobs}</div>
                        <div className="stat-label">Jobs</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{shop.mechanics}</div>
                        <div className="stat-label">Mechanics</div>
                      </div>
                    </div>
                    
                    <div className="ratings">
                      <span className="material-icons-round star">star</span>
                      <span className="rating-text">{shop.rating} ({shop.reviews} reviews)</span>
                    </div>
                    
                    <div className="location">
                      <span className="material-icons-round location-icon">location_on</span>
                      <div className="location-text">{shop.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Favorite;
