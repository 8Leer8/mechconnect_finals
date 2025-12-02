import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonAlert,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonChip,
  IonAvatar,
} from '@ionic/react';
import {
  logOutOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  storefrontOutline,
  eyeOutline,
  searchOutline,
  locationOutline,
  callOutline,
  mailOutline,
  personOutline,
  timeOutline,
  starOutline,
  hammerOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Shops.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface Shop {
  id: number;
  shop_name: string;
  shop_photo: string | null;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  owner_contact: string;
  is_verified: boolean;
  is_active: boolean;
  address: string;
  city: string;
  created_at: string;
  total_mechanics: number;
  average_rating: string | null;
  total_services: number;
}

const Shops: React.FC = () => {
  const history = useHistory();
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    header: '', 
    message: '', 
    shopId: 0, 
    action: '' 
  });
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      history.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    const roles = userData.roles || [];
    const hasHeadAdminRole = roles.some((r: any) => r.account_role === 'head_admin');

    if (!hasHeadAdminRole) {
      history.push('/login');
      return;
    }

    fetchShops();
  }, [history]);

  useEffect(() => {
    filterShopsList();
  }, [searchText, filterStatus, filterVerification, shops]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/shops/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setShops(data);
        setFilteredShops(data);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShopsList = () => {
    let filtered = [...shops];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(shop => 
        shop.shop_name.toLowerCase().includes(searchText.toLowerCase()) ||
        shop.owner_name.toLowerCase().includes(searchText.toLowerCase()) ||
        shop.city.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(shop => shop.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(shop => !shop.is_active);
    }

    // Verification filter
    if (filterVerification === 'verified') {
      filtered = filtered.filter(shop => shop.is_verified);
    } else if (filterVerification === 'unverified') {
      filtered = filtered.filter(shop => !shop.is_verified);
    }

    setFilteredShops(filtered);
  };

  const handleVerifyShop = (shopId: number, shopName: string) => {
    setAlertConfig({
      header: 'Verify Shop',
      message: `Are you sure you want to verify ${shopName}?`,
      shopId,
      action: 'verify'
    });
    setShowAlert(true);
  };

  const handleDeactivateShop = (shopId: number, shopName: string) => {
    setAlertConfig({
      header: 'Deactivate Shop',
      message: `Are you sure you want to deactivate ${shopName}?`,
      shopId,
      action: 'deactivate'
    });
    setShowAlert(true);
  };

  const handleActivateShop = (shopId: number, shopName: string) => {
    setAlertConfig({
      header: 'Activate Shop',
      message: `Are you sure you want to activate ${shopName}?`,
      shopId,
      action: 'activate'
    });
    setShowAlert(true);
  };

  const confirmAction = async () => {
    try {
      const adminId = localStorage.getItem('userId');
      let endpoint = '';
      
      if (alertConfig.action === 'verify') {
        endpoint = 'head-admin/verify-shop';
      } else if (alertConfig.action === 'deactivate') {
        endpoint = 'head-admin/deactivate-shop';
      } else if (alertConfig.action === 'activate') {
        endpoint = 'head-admin/activate-shop';
      }
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          shop_id: alertConfig.shopId
        })
      });

      if (response.ok) {
        fetchShops(); // Refresh the list
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setShowAlert(false);
  };

  const handleViewDetails = (shop: Shop) => {
    setSelectedShop(shop);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <>
      <HeadAdminSidebar />
      <IonPage className="head-admin-page">
        <IonHeader>
          <IonToolbar className="dashboard-toolbar">
            <IonButtons slot="start" className="mobile-only">
              <IonMenuButton />
            </IonButtons>
            <IonTitle className="toolbar-title">Shop Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="shops-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Shop Management</h1>
                <p className="page-subtitle">Manage all registered shops on the platform</p>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by shop name, owner, or city"
                    className="search-bar"
                  />
                  
                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="active">Active</IonSelectOption>
                    <IonSelectOption value="inactive">Inactive</IonSelectOption>
                  </IonSelect>

                  <IonSelect
                    value={filterVerification}
                    onIonChange={(e) => setFilterVerification(e.detail.value)}
                    placeholder="Filter by Verification"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Verification</IonSelectOption>
                    <IonSelectOption value="verified">Verified</IonSelectOption>
                    <IonSelectOption value="unverified">Unverified</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={storefrontOutline} className="stat-icon" />
                <div>
                  <h3>{shops.length}</h3>
                  <p>Total Shops</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{shops.filter(s => s.is_verified).length}</h3>
                  <p>Verified</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={timeOutline} className="stat-icon warning" />
                <div>
                  <h3>{shops.filter(s => s.is_active).length}</h3>
                  <p>Active</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={hammerOutline} className="stat-icon" />
                <div>
                  <h3>{shops.reduce((sum, shop) => sum + shop.total_mechanics, 0)}</h3>
                  <p>Total Mechanics</p>
                </div>
              </div>
            </div>

            {/* Shops Grid */}
            <div className="shops-grid">
              {filteredShops.map(shop => (
                <IonCard key={shop.id} className="shop-card">
                  <IonCardContent>
                    <div className="shop-header">
                      <IonAvatar className="shop-avatar">
                        {shop.shop_photo ? (
                          <img src={shop.shop_photo} alt={shop.shop_name} />
                        ) : (
                          <div className="avatar-placeholder">
                            <IonIcon icon={storefrontOutline} />
                          </div>
                        )}
                      </IonAvatar>
                      <div className="shop-badges">
                        {shop.is_verified && (
                          <IonBadge color="success">
                            <IonIcon icon={checkmarkCircleOutline} /> Verified
                          </IonBadge>
                        )}
                        <IonBadge color={shop.is_active ? 'primary' : 'medium'}>
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </IonBadge>
                      </div>
                    </div>

                    <h2 className="shop-name">{shop.shop_name}</h2>

                    <div className="shop-info">
                      <div className="info-item">
                        <IonIcon icon={personOutline} />
                        <span>{shop.owner_name}</span>
                      </div>
                      <div className="info-item">
                        <IonIcon icon={locationOutline} />
                        <span>{shop.city}</span>
                      </div>
                      {shop.average_rating && (
                        <div className="info-item">
                          <IonIcon icon={starOutline} />
                          <span>{shop.average_rating} Rating</span>
                        </div>
                      )}
                    </div>

                    <div className="shop-stats">
                      <div className="stat-item">
                        <IonIcon icon={hammerOutline} />
                        <span>{shop.total_mechanics} Mechanics</span>
                      </div>
                      <div className="stat-item">
                        <IonIcon icon={documentTextOutline} />
                        <span>{shop.total_services} Services</span>
                      </div>
                    </div>

                    <div className="shop-actions">
                      <IonButton
                        size="small"
                        fill="clear"
                        onClick={() => handleViewDetails(shop)}
                      >
                        <IonIcon icon={eyeOutline} slot="start" />
                        View Details
                      </IonButton>
                      
                      {!shop.is_verified && (
                        <IonButton
                          size="small"
                          color="success"
                          onClick={() => handleVerifyShop(shop.id, shop.shop_name)}
                        >
                          <IonIcon icon={checkmarkCircleOutline} slot="start" />
                          Verify
                        </IonButton>
                      )}
                      
                      {shop.is_active ? (
                        <IonButton
                          size="small"
                          color="danger"
                          onClick={() => handleDeactivateShop(shop.id, shop.shop_name)}
                        >
                          <IonIcon icon={closeCircleOutline} slot="start" />
                          Deactivate
                        </IonButton>
                      ) : (
                        <IonButton
                          size="small"
                          color="success"
                          onClick={() => handleActivateShop(shop.id, shop.shop_name)}
                        >
                          <IonIcon icon={checkmarkCircleOutline} slot="start" />
                          Activate
                        </IonButton>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>

            {filteredShops.length === 0 && (
              <div className="no-results">
                <IonIcon icon={searchOutline} />
                <p>No shops found matching your criteria</p>
              </div>
            )}
          </div>
        </IonContent>

        {/* Details Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="shop-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Shop Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedShop && (
              <div className="shop-details">
                <IonCard>
                  <IonCardContent className="shop-detail-header">
                    <IonAvatar className="shop-detail-avatar">
                      {selectedShop.shop_photo ? (
                        <img src={selectedShop.shop_photo} alt={selectedShop.shop_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          <IonIcon icon={storefrontOutline} />
                        </div>
                      )}
                    </IonAvatar>
                    <div>
                      <h2>{selectedShop.shop_name}</h2>
                      <div className="detail-badges">
                        {selectedShop.is_verified && (
                          <IonBadge color="success">Verified</IonBadge>
                        )}
                        <IonBadge color={selectedShop.is_active ? 'primary' : 'medium'}>
                          {selectedShop.is_active ? 'Active' : 'Inactive'}
                        </IonBadge>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Owner Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>
                          <h3>Owner Name</h3>
                          <p>{selectedShop.owner_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={mailOutline} slot="start" />
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{selectedShop.owner_email}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={callOutline} slot="start" />
                        <IonLabel>
                          <h3>Contact</h3>
                          <p>{selectedShop.owner_contact}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Shop Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonLabel>
                          <h3>Address</h3>
                          <p>{selectedShop.address}</p>
                          <p>{selectedShop.city}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={hammerOutline} slot="start" />
                        <IonLabel>
                          <h3>Total Mechanics</h3>
                          <p>{selectedShop.total_mechanics}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={documentTextOutline} slot="start" />
                        <IonLabel>
                          <h3>Total Services</h3>
                          <p>{selectedShop.total_services}</p>
                        </IonLabel>
                      </IonItem>
                      {selectedShop.average_rating && (
                        <IonItem>
                          <IonIcon icon={starOutline} slot="start" />
                          <IonLabel>
                            <h3>Average Rating</h3>
                            <p>{selectedShop.average_rating} / 5.0</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      <IonItem>
                        <IonIcon icon={timeOutline} slot="start" />
                        <IonLabel>
                          <h3>Registered</h3>
                          <p>{new Date(selectedShop.created_at).toLocaleDateString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <div className="modal-actions">
                  {!selectedShop.is_verified && (
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={() => {
                        setShowModal(false);
                        handleVerifyShop(selectedShop.id, selectedShop.shop_name);
                      }}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Verify Shop
                    </IonButton>
                  )}
                  
                  {selectedShop.is_active ? (
                    <IonButton 
                      expand="block" 
                      color="danger"
                      onClick={() => {
                        setShowModal(false);
                        handleDeactivateShop(selectedShop.id, selectedShop.shop_name);
                      }}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Deactivate Shop
                    </IonButton>
                  ) : (
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={() => {
                        setShowModal(false);
                        handleActivateShop(selectedShop.id, selectedShop.shop_name);
                      }}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Activate Shop
                    </IonButton>
                  )}
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertConfig.header}
          message={alertConfig.message}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Confirm', handler: confirmAction }
          ]}
        />
      </IonPage>
    </>
  );
};

export default Shops;