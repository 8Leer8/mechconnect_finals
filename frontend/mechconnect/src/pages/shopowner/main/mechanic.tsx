import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import './mechanic.css';

const Mechanic: React.FC = () => {
  const history = useHistory();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  return (
    <IonPage>
      <IonContent className="mechanic-content" fullscreen scrollY>
        {/* Header */}
        <div className="mechanic-header">
          <div className="header-left">
            <button className="menu-button">
              <span className="material-icons-round">menu</span>
            </button>
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

        {/* Mechanics Management Title */}
        <div className="mechanic-title-section">
          <h2 className="mechanic-title">Mechanics Management</h2>
          <p className="mechanic-subtitle">Manage your shop's mechanics, add new team members, and track performance.</p>
        </div>

        {/* Summary Cards */}
        <div className="mechanic-section">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon summary-icon-blue">
                <span className="material-icons-round">people</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">4</p>
                <p className="summary-label">Total Mechanics</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-green">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">3</p>
                <p className="summary-label">Active</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-purple">
                <span className="material-icons-round">person_add</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">1</p>
                <p className="summary-label">Invited</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-orange">
                <span className="material-icons-round">attach_money</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">₱8,400</p>
                <p className="summary-label">Total Earnings</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-blue">
                <span className="material-icons-round">event</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">115</p>
                <p className="summary-label">Total Bookings</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon summary-icon-orange">
                <span className="material-icons-round">star</span>
              </div>
              <div className="summary-content">
                <p className="summary-number">4.8</p>
                <p className="summary-label">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mechanic-section">
          <div className="search-filter-card">
            <div className="search-container">
              <span className="material-icons-round search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search mechanics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                onClick={() => setActiveFilter('All')}
              >
                All
              </button>
              <button
                className={`filter-button ${activeFilter === 'Active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Active')}
              >
                Active
              </button>
              <button
                className={`filter-button ${activeFilter === 'Invited' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Invited')}
              >
                Invited
              </button>
            </div>
            <button className="invite-button">
              <span className="material-icons-round">person_add</span>
              Invite Mechanic
            </button>
          </div>
        </div>

        {/* Mechanic Profile Cards */}
        <div className="mechanic-section">
          <div className="mechanic-profile-card">
            <div className="mechanic-card-header">
              <div className="mechanic-card-avatar">JD</div>
              <div className="status-badge status-active">Active</div>
            </div>
            <div className="mechanic-card-info">
              <h3 className="mechanic-card-name">John Doe</h3>
              <p className="mechanic-card-specialty">Engine Repair</p>
              <p className="mechanic-card-performance">45 bookings ★ 4.9</p>
              <div className="mechanic-card-details">
                <div className="mechanic-card-detail">
                  <span className="material-icons-round detail-icon">email</span>
                  <span>john.doe@example.com</span>
                </div>
                <div className="mechanic-card-detail">
                  <span className="material-icons-round detail-icon">phone</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="mechanic-card-detail">
                  <span className="material-icons-round detail-icon">calendar_today</span>
                  <span>Joined: 1/15/2023</span>
                </div>
              </div>
              <div className="mechanic-card-revenue">
                <p className="mechanic-revenue-amount">₱3,200</p>
                <p className="mechanic-revenue-label">Earnings</p>
              </div>
              <button className="remove-button">
                <span className="material-icons-round">delete</span>
                Remove from Shop
              </button>
            </div>
          </div>
        </div>
      </IonContent>

      <BottomNavShop />
    </IonPage>
  );
};

export default Mechanic;

