import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNavShop from '../../../components/bottomnavshop';
import './dashboard.css';

const Dashboard: React.FC = () => {
  const history = useHistory();

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  return (
    <IonPage>
      <IonContent className="dashboard-content" fullscreen scrollY>
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">MechConnect</h1>
          </div>
          <div className="header-right">
            <button 
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge"></span>
            </button>
            <button 
              className="profile-button"
              onClick={goToProfile}
            >
              SO
            </button>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="dashboard-title-section">
          <h2 className="dashboard-title">Dashboard</h2>
        </div>

        {/* Performance Overview Card */}
        <div className="dashboard-section">
          <div className="performance-card">
            <div className="performance-header">
              <div>
                <h3 className="performance-greeting">Welcome Back, Shop Owner!</h3>
                <p className="performance-subtitle">Here's your shop performance overview.</p>
              </div>
            </div>
            <div className="performance-revenue">
              <div>
                <p className="revenue-label">Today's revenue</p>
                <p className="revenue-amount">₱1,250</p>
              </div>
              <div className="revenue-icon">
                <span className="material-icons-round">bar_chart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon summary-icon-blue">
                <span className="material-icons-round">people</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">75</p>
                <p className="summary-label">Total Mechanic</p>
                <p className="summary-subtext">This month</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-green">
                <span className="material-icons-round">event</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">175</p>
                <p className="summary-label">Total Booking</p>
                <p className="summary-subtext summary-positive">+12% from last month</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-orange">
                <span className="material-icons-round">attach_money</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">₱25,756</p>
                <p className="summary-label">Total Revenue</p>
                <p className="summary-subtext summary-positive">+10% from last month</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-purple">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">13</p>
                <p className="summary-label">Today's Booking</p>
                <p className="summary-subtext">5 Pending Approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Earning Mechanic Card */}
        <div className="dashboard-section">
          <div className="earning-mechanic-card">
            <h3 className="card-title">★ Top Earning Mechanic</h3>
            <div className="mechanic-info">
              <div className="mechanic-avatar">
                <span className="material-icons-round">person</span>
              </div>
              <div className="mechanic-details">
                <p className="mechanic-name">Rimard Bengil</p>
                <p className="mechanic-specialty">Engine Repair</p>
                <p className="mechanic-performance">50 bookings ★ 4.3★</p>
              </div>
              <div className="mechanic-revenue">
                <p className="mechanic-revenue-amount">₱5,000</p>
                <p className="mechanic-revenue-label">This Month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mechanic Revenue Card */}
        <div className="dashboard-section">
          <div className="revenue-list-card">
            <div className="card-header">
              <h3 className="card-title">Mechanic Revenue</h3>
              <button className="view-all-button">View All</button>
            </div>
            <div className="revenue-list-content">
              {/* Content can be added here later */}
            </div>
          </div>
        </div>
      </IonContent>

      <BottomNavShop />
    </IonPage>
  );
};

export default Dashboard;

