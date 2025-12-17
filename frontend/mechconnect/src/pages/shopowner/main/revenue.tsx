import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import './revenue.css';

interface Transaction {
  transaction_id: number;
  booking_id: number;
  service_name: string;
  mechanic_name: string;
  total_amount: number;
  commission_amount: number;
  provider_payout: number;
  transaction_date: string;
  status: 'pending' | 'completed' | 'refunded';
}

interface SummaryCard {
  id: string;
  icon: string;
  iconClass: string;
  value: string | number;
  label: string;
  subtext?: string;
}

const Revenue: React.FC = () => {
  const history = useHistory();
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  // Sample transaction data - will be replaced with API calls
  const transactions: Transaction[] = [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.service_name.toLowerCase().includes(searchLower) ||
        transaction.mechanic_name.toLowerCase().includes(searchLower) ||
        transaction.transaction_id.toString().includes(searchLower)
      );
    });
  }, [transactions, searchTerm]);

  const summaryStats = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
    const totalPayout = transactions.reduce((sum, t) => sum + t.provider_payout, 0);
    const completedTransactions = transactions.filter((t) => t.status === 'completed').length;

    return {
      totalRevenue,
      totalCommission,
      totalPayout,
      totalTransactions: transactions.length,
      completedTransactions,
      pendingTransactions: transactions.filter((t) => t.status === 'pending').length
    };
  }, [transactions]);

  const summaryCards: SummaryCard[] = useMemo(
    () => [
      {
        id: '1',
        icon: 'payments',
        iconClass: 'summary-icon-orange',
        value: `₱${summaryStats.totalRevenue.toLocaleString()}`,
        label: 'Total Revenue',
        subtext: 'All transactions'
      },
      {
        id: '2',
        icon: 'arrow_upward',
        iconClass: 'summary-icon-green',
        value: `₱${summaryStats.totalPayout.toLocaleString()}`,
        label: 'Total Payout',
        subtext: 'To mechanics'
      },
      {
        id: '3',
        icon: 'receipt',
        iconClass: 'summary-icon-purple',
        value: summaryStats.totalTransactions,
        label: 'Total Transactions',
        subtext: `${summaryStats.completedTransactions} completed`
      },
      {
        id: '4',
        icon: 'pending',
        iconClass: 'summary-icon-orange',
        value: summaryStats.pendingTransactions,
        label: 'Pending',
        subtext: 'Awaiting completion'
      },
      {
        id: '5',
        icon: 'check_circle',
        iconClass: 'summary-icon-green',
        value: summaryStats.completedTransactions,
        label: 'Completed',
        subtext: 'Successfully paid'
      }
    ],
    [summaryStats]
  );

  return (
    <IonPage>
      <IonContent className="revenue-content" fullscreen scrollY>
        {/* Header */}
        <div className="revenue-header">
          <div className="header-left">
            <h1 className="header-title">MechConnect</h1>
          </div>
          <div className="header-right">
            <button className="notification-button" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge"></span>
            </button>
            <button className="profile-button" onClick={goToProfile}>
              SO
            </button>
          </div>
        </div>

        {/* Revenue Analytics Title */}
        <div className="revenue-title-section">
          <h2 className="revenue-title">Revenue Analytics</h2>
          <p className="revenue-subtitle">Track your shop's financial performance and transactions.</p>
        </div>

        {/* Summary Cards */}
        <div className="revenue-section">
          <div className="summary-cards">
            {summaryCards.map((card) => (
              <div key={card.id} className="summary-card">
                <div className={`summary-icon ${card.iconClass}`}>
                  <span className="material-icons-round">{card.icon}</span>
                </div>
                <div className="summary-content">
                  <p className="summary-number">{card.value}</p>
                  <p className="summary-label">{card.label}</p>
                  {card.subtext && <p className="summary-subtext">{card.subtext}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="revenue-section">
          <div className="revenue-filter-card">
            <div className="search-container">
              <span className="material-icons-round search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="time-period-buttons">
              <button
                className={`period-button ${timePeriod === 'today' ? 'active' : ''}`}
                onClick={() => setTimePeriod('today')}
              >
                Today
              </button>
              <button
                className={`period-button ${timePeriod === 'week' ? 'active' : ''}`}
                onClick={() => setTimePeriod('week')}
              >
                This Week
              </button>
              <button
                className={`period-button ${timePeriod === 'month' ? 'active' : ''}`}
                onClick={() => setTimePeriod('month')}
              >
                This Month
              </button>
              <button
                className={`period-button ${timePeriod === 'year' ? 'active' : ''}`}
                onClick={() => setTimePeriod('year')}
              >
                This Year
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="revenue-section">
          <div className="transactions-header">
            <h3 className="section-title">Recent Transactions</h3>
            <p className="transaction-count">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="transactions-list">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.transaction_id} className="transaction-card">
                  <div className="transaction-header">
                    <div className="transaction-info">
                      <h4 className="transaction-service">{transaction.service_name}</h4>
                      <p className="transaction-id">Transaction #{transaction.transaction_id} • Booking #{transaction.booking_id}</p>
                    </div>
                    <span className={`transaction-status status-${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span className="material-icons-round detail-icon">engineering</span>
                      <span>{transaction.mechanic_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="material-icons-round detail-icon">calendar_today</span>
                      <span>{new Date(transaction.transaction_date).toLocaleString('en-PH', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  <div className="transaction-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Total Amount</span>
                      <span className="amount-value">₱{transaction.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Commission</span>
                      <span className="amount-value commission">₱{transaction.commission_amount.toFixed(2)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Payout</span>
                      <span className="amount-value payout">₱{transaction.provider_payout.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">receipt_long</span>
              <h3>No Transactions Found</h3>
              <p>No transactions match your search criteria.</p>
            </div>
          )}
        </div>
      </IonContent>

      <BottomNavShop />
    </IonPage>
  );
};

export default Revenue;

