import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import './Booking.css';

// Interface for booking data from API
interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  client_name: string;
  provider_name: string;
  request_summary: string;
  request_type: string;
}

const Booking: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('active');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Client ID - In a real app, this would come from authentication context
  const [clientId, setClientId] = useState<number>(1); // Default to 1 for testing

  const goToNotifications = () => history.push('/client/notifications');
  
  // Navigation to specific booking detail pages
  const goToBookingDetail = (bookingId: number, status: string) => {
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
      case 'rejected':
        history.push(`/client/rejected-booking/${bookingId}`);
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
        history.push(`/client/active-booking/${bookingId}`);
    }
  };

  // Fetch bookings from API
  const fetchBookings = async (status = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:8000/api/bookings/client/?client_id=${clientId}&status=${status}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || 'Failed to load bookings');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching bookings:', err);
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
    setActiveTab('back-jobs');
    if (bookings.length === 0 && !loading) {
      fetchBookings('back-jobs');
    }
  };
  
  const handleTabRejected = () => {
    setActiveTab('rejected');
    if (bookings.length === 0 && !loading) {
      fetchBookings('rejected');
    }
  };
  
  const handleTabCanceled = () => {
    setActiveTab('canceled');
    if (bookings.length === 0 && !loading) {
      fetchBookings('canceled');
    }
  };
  
  const handleTabDisputed = () => {
    setActiveTab('disputed');
    if (bookings.length === 0 && !loading) {
      fetchBookings('disputed');
    }
  };
  
  const handleTabRefunded = () => {
    setActiveTab('refunded');
    if (bookings.length === 0 && !loading) {
      fetchBookings('refunded');
    }
  };

  // Helper functions
  const getInitials = (fullName: string) => {
    if (!fullName) return 'UN';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
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
      return (
        <div className="no-bookings-message">
          No {activeTab} bookings found
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
          <button 
            className="btn-details" 
            onClick={() => goToBookingDetail(booking.booking_id, booking.status)}
          >
            <span className="material-icons-round icon-sm">visibility</span>
            See Details
          </button>
        </div>
      </div>
    ));
  };

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
                className={`tab-button ${activeTab === 'back-jobs' ? 'active' : ''}`}
                onClick={handleTabBackJobs}
              >
                Back Jobs
              </button>
              <button 
                className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={handleTabRejected}
              >
                Rejected
              </button>
              <button 
                className={`tab-button ${activeTab === 'canceled' ? 'active' : ''}`}
                onClick={handleTabCanceled}
              >
                Canceled
              </button>
              <button 
                className={`tab-button ${activeTab === 'disputed' ? 'active' : ''}`}
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
};

export default Booking;
