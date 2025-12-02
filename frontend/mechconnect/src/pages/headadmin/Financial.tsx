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
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  logOutOutline,
  cashOutline,
  trendingUpOutline,
  walletOutline,
  calculatorOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  timeOutline,
  closeCircleOutline,
  searchOutline,
  calendarOutline,
  statsChartOutline,
  cardOutline,
  settingsOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Financial.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface FinancialStats {
  total_revenue: string;
  total_commission: string;
  commission_rate: number;
  pending_payouts: number;
  pending_payout_amount: string;
  completed_bookings: number;
  refunded_amount: string;
  platform_earnings: string;
}

interface Transaction {
  id: number;
  booking_id: number;
  mechanic_name: string;
  mechanic_email: string;
  client_name: string;
  service_name: string;
  amount: string;
  commission_amount: string;
  commission_rate: number;
  status: string;
  payment_method: string;
  transaction_date: string;
}

interface CommissionSettings {
  default_commission_rate: number;
  mechanic_bronze_rate: number;
  mechanic_silver_rate: number;
  mechanic_gold_rate: number;
  shop_commission_rate: number;
}

const Financial: React.FC = () => {
  const history = useHistory();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState('all');

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

    fetchFinancialData();
  }, [history]);

  useEffect(() => {
    filterTransactionsList();
  }, [searchText, filterStatus, dateFilter, transactions]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      // Fetch financial stats
      const statsResponse = await fetch(`${API_BASE_URL}/head-admin/financial/stats/?user_id=${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch transactions
      const transactionsResponse = await fetch(`${API_BASE_URL}/head-admin/financial/transactions/?user_id=${userId}`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      }

      // Fetch commission settings
      const settingsResponse = await fetch(`${API_BASE_URL}/head-admin/commission/settings/?user_id=${userId}`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setCommissionSettings(settingsData);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsList = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(transaction => 
        transaction.mechanic_name.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.service_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filterStatus);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        switch (dateFilter) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            return transactionDate.getMonth() === now.getMonth() && 
                   transactionDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleUpdateCommissionSettings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/commission/settings/?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commissionSettings),
      });

      if (response.ok) {
        alert('Commission settings updated successfully!');
        setShowSettingsModal(false);
        fetchFinancialData();
      } else {
        alert('Failed to update commission settings');
      }
    } catch (error) {
      console.error('Error updating commission settings:', error);
      alert('Error updating commission settings');
    }
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
      case 'refunded': return 'danger';
      case 'processing': return 'primary';
      default: return 'medium';
    }
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
            <IonTitle className="toolbar-title">Financial & Commission</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setShowSettingsModal(true)}>
                <IonIcon icon={settingsOutline} />
              </IonButton>
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="financial-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Financial Overview</h1>
                <p className="page-subtitle">Track revenue, commissions, and transactions</p>
              </div>
            </div>

            {/* Financial Stats */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card revenue-card">
                    <div className="metric-icon">
                      <IonIcon icon={cashOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">
                        ₱{stats ? parseFloat(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                      </h3>
                      <p className="metric-label">Total Revenue</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          {stats?.completed_bookings || 0} completed bookings
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card success-card">
                    <div className="metric-icon">
                      <IonIcon icon={trendingUpOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">
                        ₱{stats ? parseFloat(stats.platform_earnings).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                      </h3>
                      <p className="metric-label">Platform Earnings</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          <IonIcon icon={calculatorOutline} />
                          {stats?.commission_rate || 0}% commission rate
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card warning-card">
                    <div className="metric-icon">
                      <IonIcon icon={walletOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">
                        ₱{stats ? parseFloat(stats.pending_payout_amount).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                      </h3>
                      <p className="metric-label">Pending Payouts</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          {stats?.pending_payouts || 0} pending
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card danger-card">
                    <div className="metric-icon">
                      <IonIcon icon={closeCircleOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">
                        ₱{stats ? parseFloat(stats.refunded_amount).toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                      </h3>
                      <p className="metric-label">Total Refunded</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          Refunded transactions
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Commission Settings Summary */}
            {commissionSettings && (
              <IonCard className="commission-summary-card">
                <IonCardHeader>
                  <div className="card-header-flex">
                    <IonCardTitle>Current Commission Rates</IonCardTitle>
                    <IonButton size="small" onClick={() => setShowSettingsModal(true)}>
                      <IonIcon icon={settingsOutline} slot="start" />
                      Update Rates
                    </IonButton>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <div className="commission-rates-grid">
                    <div className="rate-box">
                      <IonIcon icon={calculatorOutline} className="rate-icon default" />
                      <div>
                        <h4>{commissionSettings.default_commission_rate}%</h4>
                        <p>Default Rate</p>
                      </div>
                    </div>
                    <div className="rate-box">
                      <IonIcon icon={calculatorOutline} className="rate-icon bronze" />
                      <div>
                        <h4>{commissionSettings.mechanic_bronze_rate}%</h4>
                        <p>Bronze Mechanic</p>
                      </div>
                    </div>
                    <div className="rate-box">
                      <IonIcon icon={calculatorOutline} className="rate-icon silver" />
                      <div>
                        <h4>{commissionSettings.mechanic_silver_rate}%</h4>
                        <p>Silver Mechanic</p>
                      </div>
                    </div>
                    <div className="rate-box">
                      <IonIcon icon={calculatorOutline} className="rate-icon gold" />
                      <div>
                        <h4>{commissionSettings.mechanic_gold_rate}%</h4>
                        <p>Gold Mechanic</p>
                      </div>
                    </div>
                    <div className="rate-box">
                      <IonIcon icon={calculatorOutline} className="rate-icon shop" />
                      <div>
                        <h4>{commissionSettings.shop_commission_rate}%</h4>
                        <p>Shop Commission</p>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by mechanic, client, or service"
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
                    <IonSelectOption value="processing">Processing</IonSelectOption>
                    <IonSelectOption value="refunded">Refunded</IonSelectOption>
                  </IonSelect>

                  <IonSelect
                    value={dateFilter}
                    onIonChange={(e) => setDateFilter(e.detail.value)}
                    placeholder="Filter by Date"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Time</IonSelectOption>
                    <IonSelectOption value="today">Today</IonSelectOption>
                    <IonSelectOption value="week">This Week</IonSelectOption>
                    <IonSelectOption value="month">This Month</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Transactions Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Transactions ({filteredTransactions.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="financial-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Booking</th>
                        <th>Mechanic</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Amount</th>
                        <th>Commission</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(transaction => (
                        <tr key={transaction.id}>
                          <td>{transaction.id}</td>
                          <td>#{transaction.booking_id}</td>
                          <td>
                            <div className="user-cell">
                              <div>
                                <div className="username">{transaction.mechanic_name}</div>
                                <div className="email">{transaction.mechanic_email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{transaction.client_name}</td>
                          <td className="service-name">{transaction.service_name}</td>
                          <td className="amount-cell">
                            ₱{parseFloat(transaction.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td className="commission-cell">
                            ₱{parseFloat(transaction.commission_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                          <td>
                            <IonBadge color="primary">{transaction.commission_rate}%</IonBadge>
                          </td>
                          <td>
                            <IonBadge color={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </IonBadge>
                          </td>
                          <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                          <td>
                            <IonButton
                              size="small"
                              fill="clear"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <IonIcon icon={searchOutline} slot="icon-only" />
                            </IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTransactions.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No transactions found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Commission Settings Modal */}
        <IonModal isOpen={showSettingsModal} onDidDismiss={() => setShowSettingsModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Commission Settings</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowSettingsModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {commissionSettings && (
              <div className="settings-form">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Update Commission Rates</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel position="stacked">Default Commission Rate (%)</IonLabel>
                        <IonInput
                          type="number"
                          value={commissionSettings.default_commission_rate}
                          onIonInput={(e) => setCommissionSettings({
                            ...commissionSettings,
                            default_commission_rate: parseFloat(e.detail.value!)
                          })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Bronze Mechanic Rate (%)</IonLabel>
                        <IonInput
                          type="number"
                          value={commissionSettings.mechanic_bronze_rate}
                          onIonInput={(e) => setCommissionSettings({
                            ...commissionSettings,
                            mechanic_bronze_rate: parseFloat(e.detail.value!)
                          })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Silver Mechanic Rate (%)</IonLabel>
                        <IonInput
                          type="number"
                          value={commissionSettings.mechanic_silver_rate}
                          onIonInput={(e) => setCommissionSettings({
                            ...commissionSettings,
                            mechanic_silver_rate: parseFloat(e.detail.value!)
                          })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Gold Mechanic Rate (%)</IonLabel>
                        <IonInput
                          type="number"
                          value={commissionSettings.mechanic_gold_rate}
                          onIonInput={(e) => setCommissionSettings({
                            ...commissionSettings,
                            mechanic_gold_rate: parseFloat(e.detail.value!)
                          })}
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Shop Commission Rate (%)</IonLabel>
                        <IonInput
                          type="number"
                          value={commissionSettings.shop_commission_rate}
                          onIonInput={(e) => setCommissionSettings({
                            ...commissionSettings,
                            shop_commission_rate: parseFloat(e.detail.value!)
                          })}
                        />
                      </IonItem>
                    </IonList>

                    <IonButton expand="block" onClick={handleUpdateCommissionSettings} className="save-button">
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Save Changes
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Transaction Details Modal */}
        <IonModal isOpen={showTransactionModal} onDidDismiss={() => setShowTransactionModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Transaction Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowTransactionModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedTransaction && (
              <div className="transaction-details">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Transaction Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Transaction ID</h3>
                          <p>#{selectedTransaction.id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Booking ID</h3>
                          <p>#{selectedTransaction.booking_id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={cashOutline} slot="start" />
                        <IonLabel>
                          <h3>Total Amount</h3>
                          <p>₱{parseFloat(selectedTransaction.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={calculatorOutline} slot="start" />
                        <IonLabel>
                          <h3>Commission ({selectedTransaction.commission_rate}%)</h3>
                          <p>₱{parseFloat(selectedTransaction.commission_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={cardOutline} slot="start" />
                        <IonLabel>
                          <h3>Payment Method</h3>
                          <p>{selectedTransaction.payment_method}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Status</h3>
                          <p>
                            <IonBadge color={getStatusColor(selectedTransaction.status)}>
                              {selectedTransaction.status}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={calendarOutline} slot="start" />
                        <IonLabel>
                          <h3>Transaction Date</h3>
                          <p>{new Date(selectedTransaction.transaction_date).toLocaleString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Service Details</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Service Name</h3>
                          <p>{selectedTransaction.service_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Mechanic</h3>
                          <p>{selectedTransaction.mechanic_name}</p>
                          <p className="email">{selectedTransaction.mechanic_email}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Client</h3>
                          <p>{selectedTransaction.client_name}</p>
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

export default Financial;