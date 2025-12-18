import { IonContent, IonPage } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import BottomNavShop from '../../../components/bottomnavshop';
import AddItemModal from '../modal/AddItemModal';
import EditItemModal from '../modal/EditItemModal';
import DeleteItemModal from '../modal/DeleteItemModal';
import './shop.css';

interface ShopItem {
  item_id: number;
  item_name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

const Shop: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');
  const [itemSearch, setItemSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | string>('All');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch shop items from API
  const fetchShopItems = async () => {
    setLoading(true);
    try {
      // Get shop ID from localStorage or use default
      let shopId = localStorage.getItem('shop_id');
      
      if (!shopId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            shopId = user.shop_id?.toString() || '1';
          } catch {
            shopId = '1';
          }
        } else {
          shopId = '1';
        }
      }

      const response = await fetch(`http://localhost:8000/api/shops/items/?shop_id=${shopId}`);
      const data = await response.json();

      if (response.ok) {
        setShopItems(data.items || []);
      } else {
        console.error('Failed to fetch items:', data.error || data.message);
        setShopItems([]);
      }
    } catch (err) {
      console.error('Error fetching shop items:', err);
      setShopItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when component mounts or when items tab is active
  useEffect(() => {
    if (activeTab === 'items') {
      fetchShopItems();
    }
  }, [activeTab]);

  const filteredItems = shopItems.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = ['All', ...Array.from(new Set(shopItems.map(item => item.category)))];

  const summaryStats = {
    totalItems: shopItems.length,
    totalSales: 0, // TODO: Calculate from sales data
    mostSold: shopItems[0] || { name: 'No items', sold: 0 },
    leastSold: shopItems[0] || { name: 'No items', sold: 0 }
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
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button className="add-item-button" onClick={() => setIsAddItemModalOpen(true)}>
                <span className="material-icons-round">add</span>
                Add Item
              </button>
            </div>

            <div className="shop-items-list">
              {loading ? (
                <div className="empty-state">
                  <span className="material-icons-round empty-icon">hourglass_empty</span>
                  <h3>Loading Items...</h3>
                  <p>Please wait while we fetch your shop items.</p>
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.item_id} className="shop-item-card">
                    <div className="item-thumbnail">
                      <span className="material-icons-round">inventory_2</span>
                    </div>
                    <div className="item-info">
                      <h4>{item.item_name}</h4>
                      <p>{item.category}</p>
                      <span className="item-price">₱{parseFloat(item.price.toString()).toFixed(2)}</span>
                      <p className="stock-info">
                        Stock: {item.stock}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="edit-button" 
                        onClick={() => {
                          setSelectedItem(item);
                          setIsEditItemModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDeleteItemModalOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="material-icons-round empty-icon">inventory_2</span>
                  <h3>No Items Found</h3>
                  <p>{itemSearch || categoryFilter !== 'All' ? 'No items match your search criteria.' : 'No items in your shop yet. Add your first item to get started!'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </IonContent>
      <AddItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)}
        onItemAdded={() => {
          // Refresh items list after adding
          fetchShopItems();
        }}
      />
      <EditItemModal
        isOpen={isEditItemModalOpen}
        onClose={() => {
          setIsEditItemModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onItemUpdated={() => {
          // Refresh items list after updating
          fetchShopItems();
        }}
      />
      <DeleteItemModal
        isOpen={isDeleteItemModalOpen}
        onClose={() => {
          setIsDeleteItemModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onItemDeleted={() => {
          // Refresh items list after deleting
          fetchShopItems();
        }}
      />
      <BottomNavShop />
    </IonPage>
  );
};

export default Shop;

