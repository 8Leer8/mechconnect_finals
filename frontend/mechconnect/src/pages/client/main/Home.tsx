import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  const goToNotifications = () => history.push('/client/notifications');
  const goToCustomRequest = () => history.push('/client/custom-request');
  const goToMechanicDiscover = () => history.push('/client/discover?type=mechanic');
  const goToShopDiscover = () => history.push('/client/discover?type=shop');
  const goToEmergencyRequest = () => history.push('/client/emergency-request');
  const goToBookingDetail = () => history.push('/client/booking-detail/12345');
  const goToBooking = () => history.push('/client/booking');
  const goToRequest = () => history.push('/client/request');
  const goToDiscover = () => history.push('/client/discover');
  const goToProfile = () => history.push('/client/profile');

  return (
    <IonPage>
      <IonContent className="home-content">
        {/* Header */}
        <div className="home-header">
          <h1 className="home-title">Home</h1>
          <button 
            className="notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="home-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <button 
              className="action-card"
              onClick={goToCustomRequest}
            >
              <div className="action-icon">
                <span className="material-icons-round">build_circle</span>
              </div>
              <span className="action-label">Request</span>
            </button>

            <button 
              className="action-card"
              onClick={goToMechanicDiscover}
            >
              <div className="action-icon">
                <span className="material-icons-round">engineering</span>
              </div>
              <span className="action-label">Mechanic</span>
            </button>

            <button 
              className="action-card"
              onClick={goToShopDiscover}
            >
              <div className="action-icon">
                <span className="material-icons-round">storefront</span>
              </div>
              <span className="action-label">Shop</span>
            </button>

            <button 
              className="action-card"
              onClick={goToEmergencyRequest}
            >
              <div className="action-icon action-icon-emergency">
                <span className="material-icons-round">emergency</span>
              </div>
              <span className="action-label">Emergency</span>
            </button>
          </div>
        </div>

        {/* Booking Section */}
        <div className="home-section">
          <h2 className="section-title">Booking</h2>
          <div className="booking-card">
            <span className="status-tag tag-active">
              <span className="material-icons-round" style={{fontSize: '12px'}}>play_circle</span>
              Active
            </span>
            
            <div className="booking-header">
              <div className="provider-info">
                <div className="provider-avatar">JD</div>
                <div className="provider-details">
                  <div className="provider-name">John Doe</div>
                  <div className="provider-type">Independent Mechanic</div>
                  <div className="booking-id">#BK-12345</div>
                </div>
              </div>
            </div>
            
            <div className="booking-footer">
              <div className="booking-time">Booked 2 hours ago</div>
              <button 
                className="btn-details"
                onClick={goToBookingDetail}
              >
                <span className="material-icons-round icon-sm">visibility</span>
                See Details
              </button>
            </div>
          </div>
        </div>
      </IonContent>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={goToBooking}>
          <span className="material-icons-round">event</span>
          <span>Booking</span>
        </button>
        <button className="nav-item" onClick={goToRequest}>
          <span className="material-icons-round">build_circle</span>
          <span>Request</span>
        </button>
        <button className="nav-item active">
          <span className="material-icons-round">home</span>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={goToDiscover}>
          <span className="material-icons-round">explore</span>
          <span>Discover</span>
        </button>
        <button className="nav-item" onClick={goToProfile}>
          <span className="material-icons-round">person</span>
          <span>Profile</span>
        </button>
      </div>
    </IonPage>
  );
};

export default Home;
