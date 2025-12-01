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
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from '@ionic/react';
import {
  logOutOutline,
  walletOutline,
  personOutline,
  calendarOutline,
  searchOutline,
  cardOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  trendingUpOutline,
  cashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Tokens.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface TokenPurchase {
  id: number;
  user_id: number;
  username: string;
  user_email: string;
  user_type: string;
  tokens_amount: number;
  price: string;
  payment_method: string;
  status: string;
  purchased_at: string;
}

const Tokens: React.FC = () => {
  const history = useHistory();
  const [purchases, setPurchases] = useState<TokenPurchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<TokenPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUserType, setFilterUserType] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<TokenPurchase | null>(null);
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

    fetchTokenPurchases();
  }, [history]);

  useEffect(() => {
    filterPurchasesList();
  }, [searchText, filterStatus, filterUserType, purchases]);

  const fetchTokenPurchases = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/token-purchases/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
        setFilteredPurchases(data);
      }
    } catch (error) {
      console.error('Error fetching token purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPurchasesList = () => {
    let filtered = [...purchases];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(purchase => 
        purchase.username.toLowerCase().includes(searchText.toLowerCase()) ||
        purchase.user_email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === filterStatus);
    }

    // User type filter
    if (filterUserType !== 'all') {
      filtered = filtered.filter(purchase => purchase.user_type === filterUserType);
    }

    setFilteredPurchases(filtered);
  };

  const handleViewDetails = (purchase: TokenPurchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'medium';
    }
  };

  const totalRevenue = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.price), 0);

  const totalTokens = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.tokens_amount, 0);

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
            <IonTitle className="toolbar-title">Token Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="tokens-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Token Management</h1>
                <p className="page-subtitle">Monitor all token purchases and transactions</p>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by username or email"
                    className="search-bar"
                  />
                  
                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="completed">Completed</IonSelectOption>
                    <IonSelectOption value="pending">Pending</IonSelectOption>
                    <IonSelectOption value="failed">Failed</IonSelectOption>
                  </IonSelect>

                  <IonSelect
                    value={filterUserType}
                    onIonChange={(e) => setFilterUserType(e.detail.value)}
                    placeholder="Filter by User Type"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Users</IonSelectOption>
                    <IonSelectOption value="mechanic">Mechanics</IonSelectOption>
                    <IonSelectOption value="shop_owner">Shop Owners</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={cashOutline} className="stat-icon success" />
                <div>
                  <h3>₱{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={walletOutline} className="stat-icon" />
                <div>
                  <h3>{totalTokens.toLocaleString()}</h3>
                  <p>Total Tokens Sold</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={trendingUpOutline} className="stat-icon warning" />
                <div>
                  <h3>{purchases.length}</h3>
                  <p>Total Transactions</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={timeOutline} className="stat-icon" />
                <div>
                  <h3>{purchases.filter(p => p.status === 'pending').length}</h3>
                  <p>Pending</p>
                </div>
              </div>
            </div>

            {/* Purchases Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Token Purchases ({filteredPurchases.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="tokens-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Tokens</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map(purchase => (
                        <tr key={purchase.id}>
                          <td>{purchase.id}</td>
                          <td>
                            <div className="user-cell">
                              <div>
                                <div className="username">{purchase.username}</div>
                                <div className="email">{purchase.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <IonBadge color={purchase.user_type === 'mechanic' ? 'success' : 'warning'}>
                              {purchase.user_type.replace('_', ' ')}
                            </IonBadge>
                          </td>
                          <td className="tokens-amount">
                            <IonIcon icon={walletOutline} />
                            {purchase.tokens_amount}
                          </td>
                          <td className="price">₱{parseFloat(purchase.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td>
                            <IonIcon icon={cardOutline} /> {purchase.payment_method}
                          </td>
                          <td>
                            <IonBadge color={getStatusColor(purchase.status)}>
                              {purchase.status}
                            </IonBadge>
                          </td>
                          <td>{new Date(purchase.purchased_at).toLocaleDateString()}</td>
                          <td>
                            <IonButton
                              size="small"
                              fill="clear"
                              onClick={() => handleViewDetails(purchase)}
                            >
                              <IonIcon icon={searchOutline} slot="icon-only" />
                            </IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPurchases.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No token purchases found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Details Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="token-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Purchase Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedPurchase && (
              <div className="purchase-details">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Transaction Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Transaction ID</h3>
                          <p>#{selectedPurchase.id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={walletOutline} slot="start" />
                        <IonLabel>
                          <h3>Tokens Purchased</h3>
                          <p>{selectedPurchase.tokens_amount} tokens</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={cashOutline} slot="start" />
                        <IonLabel>
                          <h3>Amount Paid</h3>
                          <p>₱{parseFloat(selectedPurchase.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={cardOutline} slot="start" />
                        <IonLabel>
                          <h3>Payment Method</h3>
                          <p>{selectedPurchase.payment_method}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Status</h3>
                          <p>
                            <IonBadge color={getStatusColor(selectedPurchase.status)}>
                              {selectedPurchase.status}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={calendarOutline} slot="start" />
                        <IonLabel>
                          <h3>Purchase Date</h3>
                          <p>{new Date(selectedPurchase.purchased_at).toLocaleString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>User Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>
                          <h3>Username</h3>
                          <p>{selectedPurchase.username}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{selectedPurchase.user_email}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>User Type</h3>
                          <p>
                            <IonBadge color={selectedPurchase.user_type === 'mechanic' ? 'success' : 'warning'}>
                              {selectedPurchase.user_type.replace('_', ' ')}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonPage>
    </>
  );
};

export default Tokens;