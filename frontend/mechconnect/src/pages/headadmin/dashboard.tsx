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
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSpinner,
} from '@ionic/react';
import {
  peopleOutline,
  calendarOutline,
  cashOutline,
  storefrontOutline,
  walletOutline,
  logOutOutline,
  moonOutline,
  sunnyOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface DashboardStats {
  users: {
    total: number;
    clients: number;
    mechanics: number;
    shop_owners: number;
    admins: number;
    active: number;
    banned: number;
    unverified: number;
  };
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    disputed: number;
    refunded: number;
  };
  financial: {
    total_revenue: string;
    pending_refunds: number;
    refund_amount_pending: string;
  };
  shops: {
    total: number;
    verified: number;
    unverified: number;
  };
  services: {
    total_categories: number;
    total_services: number;
  };
  moderation: {
    pending_reports: number;
    pending_disputes: number;
    pending_refunds: number;
  };
}

const HeadAdminDashboard: React.FC = () => {
  const history = useHistory();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in and is head admin
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      history.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    const roles = userData.roles || [];
    const hasHeadAdminRole = roles.some((r: any) => r.account_role === 'head_admin');

    if (!hasHeadAdminRole) {
      // Not authorized
      history.push('/login');
      return;
    }

    setUser(userData);
    fetchDashboardStats();
  }, [history]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      console.log('Fetching dashboard stats for user:', userId);
      const response = await fetch(`${API_BASE_URL}/head-admin/dashboard/stats/?user_id=${userId}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats loaded:', data);
        setStats(data);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const navigateTo = (path: string) => {
    history.push(path);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
            <IonTitle className="toolbar-title">Head Admin Panel</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="dashboard-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Dashboard Overview</h1>
                <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <IonGrid>
              <IonRow>
                {/* Key Metrics Cards Row */}
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card primary-card">
                    <div className="metric-icon">
                      <IonIcon icon={peopleOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">{stats?.users.total.toLocaleString() || 0}</h3>
                      <p className="metric-label">Total Users</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          <span className="detail-dot active"></span>
                          {stats?.users.active || 0} Active
                        </span>
                        <span className="detail-item">
                          <span className="detail-dot banned"></span>
                          {stats?.users.banned || 0} Banned
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card success-card">
                    <div className="metric-icon">
                      <IonIcon icon={calendarOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">{stats?.bookings.total.toLocaleString() || 0}</h3>
                      <p className="metric-label">Total Bookings</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          <span className="detail-dot success"></span>
                          {stats?.bookings.completed || 0} Completed
                        </span>
                        <span className="detail-item">
                          <span className="detail-dot warning"></span>
                          {stats?.bookings.active || 0} Active
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card revenue-card">
                    <div className="metric-icon">
                      <IonIcon icon={cashOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">₱{stats ? parseFloat(stats.financial.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</h3>
                      <p className="metric-label">Total Revenue</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          <span className="detail-dot warning"></span>
                          ₱{stats ? parseFloat(stats.financial.refund_amount_pending).toLocaleString() : '0'} Pending Refunds
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>

                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="metric-card danger-card">
                    <div className="metric-icon">
                      <IonIcon icon={alertCircleOutline} />
                    </div>
                    <div className="metric-content">
                      <h3 className="metric-value">{stats ? (stats.moderation.pending_reports + stats.moderation.pending_disputes + stats.moderation.pending_refunds) : 0}</h3>
                      <p className="metric-label">Pending Actions</p>
                      <div className="metric-details">
                        <span className="detail-item">
                          <span className="detail-dot danger"></span>
                          {stats?.moderation.pending_reports || 0} Reports
                        </span>
                        <span className="detail-item">
                          <span className="detail-dot warning"></span>
                          {stats?.moderation.pending_disputes || 0} Disputes
                        </span>
                      </div>
                    </div>
                  </div>
                </IonCol>
              </IonRow>

              <IonRow>
                {/* User Breakdown */}
                <IonCol size="12" sizeLg="6">
                  <IonCard className="dashboard-card">
                    <IonCardHeader>
                      <div className="card-header-flex">
                        <div>
                          <IonCardTitle>User Distribution</IonCardTitle>
                          <p className="card-subtitle">Breakdown by user type</p>
                        </div>
                        <IonIcon icon={peopleOutline} className="card-icon" />
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {stats ? (
                        <div className="distribution-grid">
                          <div className="distribution-item">
                            <div className="dist-header">
                              <span className="dist-label">Clients</span>
                              <span className="dist-percentage">{((stats.users.clients / stats.users.total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="dist-bar">
                              <div className="dist-fill client-color" style={{width: `${(stats.users.clients / stats.users.total) * 100}%`}}></div>
                            </div>
                            <span className="dist-count">{stats.users.clients.toLocaleString()} users</span>
                          </div>

                          <div className="distribution-item">
                            <div className="dist-header">
                              <span className="dist-label">Mechanics</span>
                              <span className="dist-percentage">{((stats.users.mechanics / stats.users.total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="dist-bar">
                              <div className="dist-fill mechanic-color" style={{width: `${(stats.users.mechanics / stats.users.total) * 100}%`}}></div>
                            </div>
                            <span className="dist-count">{stats.users.mechanics.toLocaleString()} users</span>
                          </div>

                          <div className="distribution-item">
                            <div className="dist-header">
                              <span className="dist-label">Shop Owners</span>
                              <span className="dist-percentage">{((stats.users.shop_owners / stats.users.total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="dist-bar">
                              <div className="dist-fill shop-color" style={{width: `${(stats.users.shop_owners / stats.users.total) * 100}%`}}></div>
                            </div>
                            <span className="dist-count">{stats.users.shop_owners.toLocaleString()} users</span>
                          </div>

                          <div className="distribution-item">
                            <div className="dist-header">
                              <span className="dist-label">Admins</span>
                              <span className="dist-percentage">{((stats.users.admins / stats.users.total) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="dist-bar">
                              <div className="dist-fill admin-color" style={{width: `${(stats.users.admins / stats.users.total) * 100}%`}}></div>
                            </div>
                            <span className="dist-count">{stats.users.admins.toLocaleString()} users</span>
                          </div>
                        </div>
                      ) : (
                        <div className="loading-state">
                          <IonSpinner name="crescent" />
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                {/* Booking Status */}
                <IonCol size="12" sizeLg="6">
                  <IonCard className="dashboard-card">
                    <IonCardHeader>
                      <div className="card-header-flex">
                        <div>
                          <IonCardTitle>Booking Analytics</IonCardTitle>
                          <p className="card-subtitle">Current booking status</p>
                        </div>
                        <IonIcon icon={calendarOutline} className="card-icon" />
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {stats ? (
                        <div className="stats-grid-2">
                          <div className="stat-box success-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={checkmarkCircleOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.completed}</h4>
                              <p>Completed</p>
                            </div>
                          </div>

                          <div className="stat-box primary-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={calendarOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.active}</h4>
                              <p>Active</p>
                            </div>
                          </div>

                          <div className="stat-box warning-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={alertCircleOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.cancelled}</h4>
                              <p>Cancelled</p>
                            </div>
                          </div>

                          <div className="stat-box danger-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={alertCircleOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.disputed}</h4>
                              <p>In Dispute</p>
                            </div>
                          </div>

                          <div className="stat-box info-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={cashOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.refunded}</h4>
                              <p>Refunded</p>
                            </div>
                          </div>

                          <div className="stat-box total-box">
                            <div className="stat-box-icon">
                              <IonIcon icon={statsChartOutline} />
                            </div>
                            <div className="stat-box-content">
                              <h4>{stats.bookings.total}</h4>
                              <p>Total Bookings</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="loading-state">
                          <IonSpinner name="crescent" />
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow>
                {/* Shop & Services */}
                <IonCol size="12" sizeLg="4">
                  <IonCard className="dashboard-card">
                    <IonCardHeader>
                      <div className="card-header-flex">
                        <div>
                          <IonCardTitle>Shops & Services</IonCardTitle>
                          <p className="card-subtitle">Platform offerings</p>
                        </div>
                        <IonIcon icon={storefrontOutline} className="card-icon" />
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {stats ? (
                        <div className="info-list">
                          <div className="info-item">
                            <div className="info-left">
                              <IonIcon icon={storefrontOutline} className="info-icon success" />
                              <span className="info-label">Verified Shops</span>
                            </div>
                            <span className="info-value">{stats.shops.verified}</span>
                          </div>

                          <div className="info-item">
                            <div className="info-left">
                              <IonIcon icon={storefrontOutline} className="info-icon warning" />
                              <span className="info-label">Pending Verification</span>
                            </div>
                            <span className="info-value">{stats.shops.unverified}</span>
                          </div>

                          <div className="info-item">
                            <div className="info-left">
                              <IonIcon icon={walletOutline} className="info-icon primary" />
                              <span className="info-label">Service Categories</span>
                            </div>
                            <span className="info-value">{stats.services.total_categories}</span>
                          </div>

                          <div className="info-item">
                            <div className="info-left">
                              <IonIcon icon={walletOutline} className="info-icon" />
                              <span className="info-label">Total Services</span>
                            </div>
                            <span className="info-value">{stats.services.total_services}</span>
                          </div>

                          <div className="info-total">
                            <strong>Total Shops:</strong> {stats.shops.total}
                          </div>
                        </div>
                      ) : (
                        <div className="loading-state">
                          <IonSpinner name="crescent" />
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                {/* Moderation Queue */}
                <IonCol size="12" sizeLg="8">
                  <IonCard className="dashboard-card">
                    <IonCardHeader>
                      <div className="card-header-flex">
                        <div>
                          <IonCardTitle>Moderation Queue</IonCardTitle>
                          <p className="card-subtitle">Items requiring attention</p>
                        </div>
                        <IonIcon icon={alertCircleOutline} className="card-icon danger" />
                      </div>
                    </IonCardHeader>
                    <IonCardContent>
                      {stats ? (
                        <div className="moderation-grid">
                          <div className="mod-card warning-mod">
                            <div className="mod-header">
                              <IonIcon icon={documentTextOutline} />
                              <span>Pending Reports</span>
                            </div>
                            <div className="mod-count">{stats.moderation.pending_reports}</div>
                            <button className="mod-button" onClick={() => navigateTo('/headadmin/reports')}>
                              Review Reports
                            </button>
                          </div>

                          <div className="mod-card danger-mod">
                            <div className="mod-header">
                              <IonIcon icon={alertCircleOutline} />
                              <span>Active Disputes</span>
                            </div>
                            <div className="mod-count">{stats.moderation.pending_disputes}</div>
                            <button className="mod-button" onClick={() => navigateTo('/headadmin/disputes')}>
                              Resolve Disputes
                            </button>
                          </div>

                          <div className="mod-card primary-mod">
                            <div className="mod-header">
                              <IonIcon icon={cashOutline} />
                              <span>Refund Requests</span>
                            </div>
                            <div className="mod-count">{stats.moderation.pending_refunds}</div>
                            <button className="mod-button" onClick={() => navigateTo('/headadmin/refunds')}>
                              Process Refunds
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="loading-state">
                          <IonSpinner name="crescent" />
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default HeadAdminDashboard;