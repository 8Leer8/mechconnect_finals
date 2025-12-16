import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import BottomNavShop from '../../../components/bottomnavshop';
import AddItemModal from '../modal/AddItemModal';
import './shop.css';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'active' | 'out';
}

const Shop: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');
  const [itemSearch, setItemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | string>('All');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  const shopInfo = {
    name: 'AutoFix Pro',
    phone: '+1 (555) 234-5678',
    email: 'contact@autofixpro.com',
    address: '123 Main Street, Downtown, NY 10001',
    description:
      'Professional automotive repair services with certified mechanics and quality parts. We specialize in engine diagnostics, brake repair, and routine maintenance.'
  };

  const shopItems: ShopItem[] = [
    { id: '1', name: 'Premium Motor Oil (5W-30)', category: 'Engine', price: 35.99, stock: 24, sold: 89, status: 'active' }
  ];

  const filteredItems = shopItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const summaryStats = {
    totalItems: shopItems.length,
    totalSales: 12745.37,
    mostSold: shopItems[0],
    leastSold: shopItems[0]
  };

  return (
    <IonPage>
      <IonContent className="shop-content" fullscreen>
        <div className="shop-header">
          <div className="header-left">
            <h1 className="header-title">MechConnect</h1>
          </div>
          <div className="header-right">
            <button className="notification-button" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge" />
            </button>
            <button className="profile-button" onClick={goToProfile}>
              SO
            </button>
          </div>
        </div>

        <div className="shop-title-section">
          <h2 className="shop-title">Manage Shop</h2>
          <p className="shop-subtitle">Update your shop information, services, and settings.</p>
        </div>

        <div className="shop-tabs">
          <button className={`shop-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
            <span className="material-icons-round">store</span>
            Shop Details
          </button>
          <button className={`shop-tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
            <span className="material-icons-round">inventory_2</span>
            Shop Items
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="shop-section">
            <div className="info-card">
              <div className="info-card-header">
                <span className="material-icons-round">home</span>
                <h3>Basic Information</h3>
              </div>
              <div className="info-card-content">
                <div className="logo-upload">
                  <div className="logo-placeholder">
                    <span className="material-icons-round">storefront</span>
                  </div>
                  <button className="upload-button">Upload Logo</button>
                  <p>PNG, JPG up to 2MB</p>
                </div>
                <form className="shop-form">
                  <label>
                    Shop Name
                    <input type="text" value={shopInfo.name} readOnly />
                  </label>
                  <label>
                    Phone Number
                    <input type="text" value={shopInfo.phone} readOnly />
                  </label>
                  <label>
                    Email Address
                    <input type="text" value={shopInfo.email} readOnly />
                  </label>
                  <label>
                    Shop Address
                    <input type="text" value={shopInfo.address} readOnly />
                  </label>
                  <label>
                    Description
                    <textarea rows={4} value={shopInfo.description} readOnly />
                  </label>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="shop-section">
            <div className="items-summary">
              <div className="summary-card">
                <div className="summary-icon summary-icon-orange">
                  <span className="material-icons-round">inventory</span>
                </div>
                <div>
                  <p className="summary-number">{summaryStats.totalItems}</p>
                  <p className="summary-label">Total Items</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon summary-icon-green">
                  <span className="material-icons-round">trending_up</span>
                </div>
                <div>
                  <p className="summary-number">₱{summaryStats.totalSales.toLocaleString()}</p>
                  <p className="summary-label">Total Sales</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon summary-icon-blue">
                  <span className="material-icons-round">emoji_events</span>
                </div>
                <div>
                  <p className="summary-number">{summaryStats.mostSold.name}</p>
                  <p className="summary-label">{summaryStats.mostSold.sold} sold</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon summary-icon-warning">
                  <span className="material-icons-round">warning</span>
                </div>
                <div>
                  <p className="summary-number">{summaryStats.leastSold.name}</p>
                  <p className="summary-label">{summaryStats.leastSold.sold} sold</p>
                </div>
              </div>
            </div>

            <div className="items-toolbar">
              <div className="search-box">
                <span className="material-icons-round">search</span>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                <option value="All">All Categories</option>
                <option value="Engine">Engine</option>
                <option value="Electrical">Electrical</option>
                <option value="Brake System">Brake System</option>
              </select>
              <button className="add-item-button" onClick={() => setIsAddItemModalOpen(true)}>
                <span className="material-icons-round">add</span>
                Add Item
              </button>
            </div>

            <div className="shop-items-list">
              {filteredItems.map((item) => (
                <div key={item.id} className="shop-item-card">
                  <div className="item-thumbnail">
                    <span className="material-icons-round">image</span>
                  </div>
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{item.category}</p>
                    <span className="item-price">₱{item.price.toFixed(2)}</span>
                    <p className="stock-info">
                      Stock: {item.stock} | Sold: {item.sold}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button className="edit-button">Edit</button>
                    <button className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </IonContent>
      <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} />
      <BottomNavShop />
    </IonPage>
  );
};

export default Shop;

