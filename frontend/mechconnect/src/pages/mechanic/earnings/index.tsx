import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './Earnings.css';

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  recentTransactions: {
    id: number;
    jobId: string;
    clientName: string;
    service: string;
    amount: number;
    date: string;
    status: string;
  }[];
}

const Earnings: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const goToJobDetail = (jobId: number, status: string) => {
    // Navigate to job detail page with type parameter
    history.push(`/mechanic/job-detail/${jobId}?type=${status}`);
  };

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setEarningsData({
          today: 1250,
          thisWeek: 8750,
          thisMonth: 32500,
          total: 156750,
          recentTransactions: [
            {
              id: 1,
              jobId: 'JB-12346',
              clientName: 'John Doe',
              service: 'Brake Inspection',
              amount: 850,
              date: '2025-12-14',
              status: 'completed'
            },
            {
              id: 2,
              jobId: 'JB-12345',
              clientName: 'Jane Smith',
              service: 'Engine Repair',
              amount: 1200,
              date: '2025-12-14',
              status: 'active'
            },
            {
              id: 3,
              jobId: 'JB-12344',
              clientName: 'Mike Johnson',
              service: 'Oil Change',
              amount: 650,
              date: '2025-12-13',
              status: 'completed'
            },
            {
              id: 4,
              jobId: 'JB-12343',
              clientName: 'Sarah Wilson',
              service: 'Tire Replacement',
              amount: 1800,
              date: '2025-12-12',
              status: 'completed'
            }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchEarnings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="mechanic-earnings-content" scrollY>
          <div className="loading-container">
            <div className="loading-message">Loading earnings...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="mechanic-earnings-content" scrollY>
        {/* Header */}
        <div className="mechanic-earnings-header">
          <button className="back-button" onClick={() => history.goBack()}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-earnings-title">Earnings</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="earnings-overview-section">
          <h2 className="section-title">Earnings Overview</h2>
          <div className="earnings-cards">
            <div className="earnings-card">
              <div className="earnings-icon">
                <span className="material-icons-round">today</span>
              </div>
              <div className="earnings-info">
                <span className="earnings-label">Today</span>
                <span className="earnings-amount">{formatCurrency(earningsData?.today || 0)}</span>
              </div>
            </div>

            <div className="earnings-card">
              <div className="earnings-icon">
                <span className="material-icons-round">date_range</span>
              </div>
              <div className="earnings-info">
                <span className="earnings-label">This Week</span>
                <span className="earnings-amount">{formatCurrency(earningsData?.thisWeek || 0)}</span>
              </div>
            </div>

            <div className="earnings-card">
              <div className="earnings-icon">
                <span className="material-icons-round">calendar_month</span>
              </div>
              <div className="earnings-info">
                <span className="earnings-label">This Month</span>
                <span className="earnings-amount">{formatCurrency(earningsData?.thisMonth || 0)}</span>
              </div>
            </div>

            <div className="earnings-card total-card">
              <div className="earnings-icon">
                <span className="material-icons-round">account_balance_wallet</span>
              </div>
              <div className="earnings-info">
                <span className="earnings-label">Total Earnings</span>
                <span className="earnings-amount">{formatCurrency(earningsData?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-section">
          <h2 className="section-title">Recent Transactions</h2>
          <div className="transactions-list">
            {earningsData?.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="transaction-item"
                onClick={() => goToJobDetail(transaction.id, transaction.status)}
              >
                <div className="transaction-icon">
                  <span className="material-icons-round">
                    {transaction.status === 'completed' ? 'check_circle' : 'schedule'}
                  </span>
                </div>
                <div className="transaction-info">
                  <div className="transaction-header">
                    <span className="transaction-job-id">{transaction.jobId}</span>
                    <span className="transaction-amount">{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-client">{transaction.clientName}</span>
                    <span className="transaction-service">{transaction.service}</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                    <span className={`transaction-status status-${transaction.status}`}>
                      {transaction.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <div className="transaction-arrow">
                  <span className="material-icons-round">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Feature coming soon"
          duration={2000}
          color="primary"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Earnings;