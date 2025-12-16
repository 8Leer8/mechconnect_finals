import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNav from '../../../components/BottomNav';
import { bookingsAPI, formatTimeAgo, getInitials } from '../../../utils/api';
import './Home.css';

interface ActiveBooking {
  booking_id: number;
  status: string;
  booked_at: string;
  created_at?: string;
  provider_name: string;
  provider_type?: string;
  service_name?: string;
  request_summary?: string;
  total_price?: number;
}

const Home: React.FC = () => {
  const history = useHistory();
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<number>(1);

  const goToNotifications = () => history.push('/client/notifications');
  const goToCustomRequest = () => history.push('/client/custom-request');
  const goToMechanicDiscover = () => history.push('/client/discover?type=mechanic');
  const goToShopDiscover = () => history.push('/client/discover?type=shop');
  const goToEmergencyRequest = () => history.push('/client/emergency-request');
  
  // Get client ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.acc_id || userData.account_id || 1;
        setClientId(id);
        console.log('Home - User data:', userData);
        console.log('Home - Using client ID:', id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const goToBookingDetail = (bookingId: number, status: string) => {
    // Route to the appropriate booking detail page based on status
    switch (status.toLowerCase()) {
      case 'active':
        history.push(`/client/active-booking/${bookingId}`);
        break;
      case 'completed':
        history.push(`/client/completed-booking/${bookingId}`);
        break;
      case 'rescheduled':
        history.push(`/client/rescheduled-booking/${bookingId}`);
        break;
      case 'cancelled':
        history.push(`/client/canceled-booking/${bookingId}`);
        break;
      case 'back_jobs':
        history.push(`/client/backjobs-booking/${bookingId}`);
        break;
      case 'dispute':
        history.push(`/client/disputed-booking/${bookingId}`);
        break;
      default:
        history.push(`/client/active-booking/${bookingId}`);
    }
  };

  // Fetch active bookings on mount
  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const result = await bookingsAPI.getClientBookings(clientId, 'active');
        console.log('Bookings API result:', result);
        if (result.data && result.data.bookings && result.data.bookings.length > 0) {
          console.log('First active booking:', result.data.bookings[0]);
          setActiveBooking(result.data.bookings[0]); // Get the first active booking
        } else {
          console.log('No active bookings found');
        }
      } catch (error) {
        console.error('Error fetching active booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchActiveBooking();
    }
  }, [clientId]);

  return (
    <IonPage>
      <IonContent className="home-content" style={{ paddingBottom: '80px' }}>
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
          
          {loading ? (
            <div className="booking-card" style={{padding: '30px', textAlign: 'center', color: '#999'}}>
              <div className="loading-spinner" style={{margin: '0 auto 10px'}}></div>
              <p>Loading bookings...</p>
            </div>
          ) : activeBooking ? (
            <div className="booking-card">
              <span className="status-tag tag-active">
                <span className="material-icons-round" style={{fontSize: '12px'}}>play_circle</span>
                Active
              </span>
              
              <div className="booking-header">
                <div className="provider-info">
                  <div className="provider-avatar">{getInitials(activeBooking.provider_name)}</div>
                  <div className="provider-details">
                    <div className="provider-name">{activeBooking.provider_name}</div>
                    <div className="provider-type">{activeBooking.provider_type}</div>
                    <div className="booking-id">#BK-{activeBooking.booking_id}</div>
                  </div>
                </div>
              </div>

              {(activeBooking.service_name || activeBooking.request_summary) && (
                <div style={{marginTop: '12px', fontSize: '14px', color: '#666'}}>
                  <span className="material-icons-round" style={{fontSize: '16px', verticalAlign: 'middle', marginRight: '6px'}}>
                    build
                  </span>
                  {activeBooking.service_name || activeBooking.request_summary}
                </div>
              )}
              
              <div className="booking-footer">
                <div className="booking-time">{formatTimeAgo(activeBooking.booked_at || activeBooking.created_at || '')}</div>
                <button 
                  className="btn-details"
                  onClick={() => {
                    console.log('Navigating to booking:', activeBooking.booking_id, activeBooking.status);
                    goToBookingDetail(activeBooking.booking_id, activeBooking.status);
                  }}
                >
                  <span className="material-icons-round icon-sm">visibility</span>
                  See Details
                </button>
              </div>
            </div>
          ) : (
            <div className="booking-card" style={{padding: '40px', textAlign: 'center'}}>
              <span className="material-icons-round" style={{fontSize: '48px', color: '#ddd', marginBottom: '10px'}}>
                event_busy
              </span>
              <p style={{color: '#999', margin: '10px 0 20px'}}>No active bookings</p>
              <button 
                className="btn-details"
                onClick={() => history.push('/client/discover')}
                style={{margin: '0 auto'}}
              >
                <span className="material-icons-round icon-sm">search</span>
                Browse Services
              </button>
            </div>
          )}
        </div>
      </IonContent>

      <BottomNav />
    </IonPage>
  );
};

export default Home;
