import { IonContent, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import { bookingsAPI, formatTimeAgo, getInitials, BookingListItem } from '../../../utils/api';
import './Booking.css';

const Booking: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('active');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Client ID from authentication
  const [clientId, setClientId] = useState<number>(1);

  // Get client ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.acc_id || userData.account_id || 1;
        setClientId(id);
        console.log('Booking - User data:', userData);
        console.log('Booking - Using client ID:', id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const goToNotifications = () => history.push('/client/notifications');
  
  // Navigation to specific booking detail pages
  const goToBookingDetail = (bookingId: number, status: string) => {
    console.log('Navigating to booking detail:', bookingId, status); // Debug log
    switch (status) {
      case 'active':
        history.push(`/client/active-booking/${bookingId}`);
        break;
      case 'completed':
        history.push(`/client/completed-booking/${bookingId}`);
        break;
      case 'rescheduled':
        history.push(`/client/rescheduled-booking/${bookingId}`);
        break;
      case 'back_jobs':
        history.push(`/client/backjobs-booking/${bookingId}`);
        break;
      case 'cancelled':
        history.push(`/client/canceled-booking/${bookingId}`);
        break;
      case 'dispute':
        history.push(`/client/disputed-booking/${bookingId}`);
        break;
      case 'refunded':
        history.push(`/client/refunded-booking/${bookingId}`);
        break;
      default:
        console.log('Unknown status, defaulting to active:', status);
        history.push(`/client/active-booking/${bookingId}`);
    }
  };

  // Fetch bookings from API
  const fetchBookings = async (status = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsAPI.getClientBookings(clientId, status);
      
      if (result.error) {
        setError(result.error);
        setShowToast(true);
        setBookings([]);
      } else if (result.data) {
        setBookings(result.data.bookings || []);
      }
    } catch (err) {
      setError('Failed to load bookings');
      setShowToast(true);
      console.error('Error fetching bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setIsScrollable(tabsRef.current.scrollWidth > tabsRef.current.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    // Fetch bookings when component mounts or tab changes
    fetchBookings();
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab]);

  // Refresh bookings when navigating back to this page
  useIonViewWillEnter(() => {
    console.log('Booking page - refreshing bookings for tab:', activeTab);
    fetchBookings();
  });

  const handleTabActive = () => {
    setActiveTab('active');
    if (bookings.length === 0 && !loading) {
      fetchBookings('active');
    }
  };
  
  const handleTabCompleted = () => {
    setActiveTab('completed');
    if (bookings.length === 0 && !loading) {
      fetchBookings('completed');
    }
  };
  
  const handleTabRescheduled = () => {
    setActiveTab('rescheduled');
    if (bookings.length === 0 && !loading) {
      fetchBookings('rescheduled');
    }
  };
  
  const handleTabBackJobs = () => {
    setActiveTab('back_jobs');
    if (bookings.length === 0 && !loading) {
      fetchBookings('back_jobs');
    }
  };
  
  const handleTabCanceled = () => {
    setActiveTab('cancelled');
    if (bookings.length === 0 && !loading) {
      fetchBookings('cancelled');
    }
  };
  
  const handleTabDisputed = () => {
    setActiveTab('dispute');
    if (bookings.length === 0 && !loading) {
      fetchBookings('dispute');
    }
  };
  
  const handleTabRefunded = () => {
    setActiveTab('refunded');
    if (bookings.length === 0 && !loading) {
      fetchBookings('refunded');
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'play_circle';
      case 'completed': return 'check_circle';
      case 'rescheduled': return 'schedule';
      case 'back_jobs': return 'build_circle';
      case 'rejected': return 'cancel';
      case 'cancelled': return 'cancel';
      case 'dispute': return 'warning';
      case 'refunded': return 'payments';
      default: return 'help';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'tag-active';
      case 'completed': return 'tag-completed';
      case 'rescheduled': return 'tag-rescheduled';
      case 'back_jobs': return 'tag-back-jobs';
      case 'rejected': return 'tag-rejected';
      case 'cancelled': return 'tag-canceled';
      case 'dispute': return 'tag-disputed';
      case 'refunded': return 'tag-refunded';
      default: return 'tag-active';
    }
  };

  // Render booking cards
  const renderBookingCards = () => {
    if (loading) {
      return (
        <div className="loading-message">Loading bookings...</div>
      );
    }

    if (error) {
      return (
        <div className="error-message">{error}</div>
      );
    }

    if (bookings.length === 0) {
      const displayStatus = activeTab === 'back_jobs' ? 'back jobs' : 
                           activeTab === 'cancelled' ? 'canceled' : 
                           activeTab === 'dispute' ? 'disputed' : 
                           activeTab;
      return (
        <div className="no-bookings-message">
          No {displayStatus} bookings found
        </div>
      );
    }

    return bookings.map((booking) => (
      <div key={booking.booking_id} className="booking-card">
        <span className={`status-tag ${getStatusClass(booking.status)}`}>
          <span className="material-icons-round" style={{fontSize: '12px'}}>
            {getStatusIcon(booking.status)}
          </span>
          {booking.status === 'back_jobs' ? 'Back Jobs' : 
           booking.status === 'cancelled' ? 'Canceled' : 
           booking.status === 'dispute' ? 'Disputed' :
           booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
        
        <div className="booking-header">
          <div className="provider-info">
            <div className="provider-avatar">
              {getInitials(booking.provider_name || 'No Provider')}
            </div>
            <div className="provider-details">
              <div className="provider-name">
                {booking.provider_name || 'No Provider Assigned'}
              </div>
              <div className="provider-type">
                {booking.request_type === 'custom' ? 'Custom Request' : 
                 booking.request_type === 'direct' ? 'Direct Service' : 
                 'Emergency Request'}
              </div>
              <div className="booking-id">#BK-{booking.booking_id}</div>
            </div>
          </div>
        </div>

        <div className="booking-summary">
          {booking.request_summary}
        </div>
        
        <div className="booking-footer">
          <div className="booking-time">
            Booked {formatTimeAgo(booking.booked_at)}
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <button 
              className="btn-details" 
              onClick={() => goToBookingDetail(booking.booking_id, booking.status)}
            >
              <span className="material-icons-round icon-sm">visibility</span>
              See Details
            </button>
            {booking.status === 'completed' && (
              <button 
                className="btn-back-job" 
                onClick={() => history.push(`/client/backjobs-form?booking_id=${booking.booking_id}`)}
                title="Request a back job if the service needs additional work"
              >
                <span className="material-icons-round icon-sm">build_circle</span>
                Back Job
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  // Wrap entire component in error boundary try-catch
  try {
    return (
      <IonPage>
        <IonContent className="booking-content" style={{ paddingBottom: '80px' }}>
          {/* Header */}
          <div className="booking-header-top">
            <h1 className="booking-title">Booking</h1>
            <button 
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="booking-section">
            <div className={`tabs-container ${isScrollable ? 'scrollable' : ''}`}>
              <div className="tabs" ref={tabsRef}>
                <button 
                  className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={handleTabActive}
                >
                  Active
                </button>
                <button 
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={handleTabCompleted}
                >
                  Completed
                </button>
                <button 
                  className={`tab-button ${activeTab === 'rescheduled' ? 'active' : ''}`}
                  onClick={handleTabRescheduled}
                >
                  Rescheduled
                </button>
                <button 
                  className={`tab-button ${activeTab === 'back_jobs' ? 'active' : ''}`}
                  onClick={handleTabBackJobs}
                >
                  Back Jobs
                </button>

                <button 
                  className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={handleTabCanceled}
                >
                  Canceled
                </button>
                <button 
                  className={`tab-button ${activeTab === 'dispute' ? 'active' : ''}`}
                  onClick={handleTabDisputed}
                >
                  Disputed
                </button>
                <button 
                  className={`tab-button ${activeTab === 'refunded' ? 'active' : ''}`}
                  onClick={handleTabRefunded}
                >
                  Refunded
                </button>
              </div>
            </div>

            {/* Dynamic Booking Cards */}
            <div className="cards-container">
              {renderBookingCards()}
            </div>
          </div>

          {/* Toast Notifications */}
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={error || ''}
            duration={3000}
            color="danger"
            position="top"
          />
        </IonContent>

        <BottomNav />
      </IonPage>
    );
  } catch (err) {
    console.error('Booking page render error:', err);
    return (
      <IonPage>
        <IonContent className="booking-content">
          <div className="error-message" style={{margin: '20px'}}>
            <h2>Error Loading Page</h2>
            <p>Something went wrong. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '10px'}}>
              Refresh Page
            </button>
          </div>
        </IonContent>
        <BottomNav />
      </IonPage>
    );
  }
};

export default Booking;
