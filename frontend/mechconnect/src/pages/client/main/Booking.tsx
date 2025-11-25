import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import './Booking.css';

const Booking: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('active');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const goToNotifications = () => history.push('/client/notifications');
  const goToBookingDetail = (id: string) => history.push(`/client/booking-detail/${id}`);

  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setIsScrollable(tabsRef.current.scrollWidth > tabsRef.current.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  const handleTabActive = () => setActiveTab('active');
  const handleTabCompleted = () => setActiveTab('completed');
  const handleTabRescheduled = () => setActiveTab('rescheduled');
  const handleTabBackJobs = () => setActiveTab('back-jobs');
  const handleTabRejected = () => setActiveTab('rejected');
  const handleTabCanceled = () => setActiveTab('canceled');
  const handleTabDisputed = () => setActiveTab('disputed');
  const handleTabRefunded = () => setActiveTab('refunded');

  const handleBookingCard1 = () => goToBookingDetail('2847');
  const handleBookingCard2 = () => goToBookingDetail('2846');
  const handleBookingCard3 = () => goToBookingDetail('2843');
  const handleBookingCard4 = () => goToBookingDetail('2839');

  return (
    <IonPage>
      <IonContent className="booking-content">
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

          {/* Active Bookings */}
          {activeTab === 'active' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard1}>
                <span className="status-tag tag-active">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>play_circle</span>
                  Active
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">MJ</div>
                    <div className="provider-details">
                      <div className="provider-name">Mike Johnson</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="booking-id">#BK-2847</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 2 hours ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completed Bookings */}
          {activeTab === 'completed' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard2}>
                <span className="status-tag tag-completed">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>check_circle</span>
                  Completed
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">PS</div>
                    <div className="provider-details">
                      <div className="provider-name">Precision Service</div>
                      <div className="provider-type">Shop</div>
                      <div className="booking-id">#BK-2846</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked yesterday</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rescheduled Bookings */}
          {activeTab === 'rescheduled' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard3}>
                <span className="status-tag tag-rescheduled">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>schedule</span>
                  Rescheduled
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">AE</div>
                    <div className="provider-details">
                      <div className="provider-name">Auto Expert Garage</div>
                      <div className="provider-type">Shop</div>
                      <div className="booking-id">#BK-2843</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 3 days ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Back Jobs Bookings */}
          {activeTab === 'back-jobs' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard4}>
                <span className="status-tag tag-back-jobs">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>build_circle</span>
                  Back Jobs
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">CS</div>
                    <div className="provider-details">
                      <div className="provider-name">City Service</div>
                      <div className="provider-type">Shop</div>
                      <div className="booking-id">#BK-2835</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 2 weeks ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejected Bookings */}
          {activeTab === 'rejected' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard1}>
                <span className="status-tag tag-rejected">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>cancel</span>
                  Rejected
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">DR</div>
                    <div className="provider-details">
                      <div className="provider-name">David Rodriguez</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="booking-id">#BK-2832</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 1 week ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Canceled Bookings */}
          {activeTab === 'canceled' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard2}>
                <span className="status-tag tag-canceled">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>cancel</span>
                  Canceled
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">DR</div>
                    <div className="provider-details">
                      <div className="provider-name">David Rodriguez</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="booking-id">#BK-2839</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 1 week ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disputed Bookings */}
          {activeTab === 'disputed' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard3}>
                <span className="status-tag tag-disputed">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>warning</span>
                  Disputed
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">QS</div>
                    <div className="provider-details">
                      <div className="provider-name">Quick Service</div>
                      <div className="provider-type">Shop</div>
                      <div className="booking-id">#BK-2828</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 1 month ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Refunded Bookings */}
          {activeTab === 'refunded' && (
            <div className="cards-container">
              <div className="booking-card" onClick={handleBookingCard4}>
                <span className="status-tag tag-refunded">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>payments</span>
                  Refunded
                </span>
                
                <div className="booking-header">
                  <div className="provider-info">
                    <div className="provider-avatar">MS</div>
                    <div className="provider-details">
                      <div className="provider-name">Mobile Service</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="booking-id">#BK-2832</div>
                    </div>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <div className="booking-time">Booked 3 weeks ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <BottomNav />
    </IonPage>
  );
};

export default Booking;
