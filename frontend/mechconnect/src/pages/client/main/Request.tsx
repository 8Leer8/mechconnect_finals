import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Request.css';

const Request: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('pending');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const goToNotifications = () => history.push('/client/notifications');
  const goToBooking = () => history.push('/client/booking');
  const goToHome = () => history.push('/client/home');
  const goToDiscover = () => history.push('/client/discover');
  const goToProfile = () => history.push('/client/profile');
  const goToCustomRequest = () => history.push('/client/custom-request');
  const goToRequestDetail = (id: string) => history.push(`/client/request-detail/${id}`);

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

  const handleTabPending = () => setActiveTab('pending');
  const handleTabQuoted = () => setActiveTab('quoted');
  const handleTabAccepted = () => setActiveTab('accepted');
  const handleTabRejected = () => setActiveTab('rejected');

  const handleRequestCard1 = () => goToRequestDetail('2847');
  const handleRequestCard2 = () => goToRequestDetail('2846');
  const handleRequestCard3 = () => goToRequestDetail('2843');
  const handleRequestCard4 = () => goToRequestDetail('2839');

  return (
    <IonPage>
      <IonContent className="request-content">
        {/* Header */}
        <div className="request-header-top">
          <h1 className="request-title">Request</h1>
          <button 
            className="notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="request-section">
          <div className={`tabs-container ${isScrollable ? 'scrollable' : ''}`}>
            <div className="tabs" ref={tabsRef}>
              <button 
                className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={handleTabPending}
              >
                Pending
              </button>
              <button 
                className={`tab-button ${activeTab === 'quoted' ? 'active' : ''}`}
                onClick={handleTabQuoted}
              >
                Quoted
              </button>
              <button 
                className={`tab-button ${activeTab === 'accepted' ? 'active' : ''}`}
                onClick={handleTabAccepted}
              >
                Accepted
              </button>
              <button 
                className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={handleTabRejected}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Pending Requests */}
          {activeTab === 'pending' && (
            <div className="cards-container">
              <div className="request-card" onClick={handleRequestCard1}>
                <span className="status-tag tag-pending">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>schedule</span>
                  Pending
                </span>
                
                <div className="request-header">
                  <div className="provider-info">
                    <div className="provider-avatar">MJ</div>
                    <div className="provider-details">
                      <div className="provider-name">Mike Johnson</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="request-id">#REQ-2847</div>
                    </div>
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-time">Requested 2 hours ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>

              <div className="request-card" onClick={handleRequestCard2}>
                <span className="status-tag tag-pending">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>schedule</span>
                  Pending
                </span>
                
                <div className="request-header">
                  <div className="provider-info">
                    <div className="provider-avatar">AE</div>
                    <div className="provider-details">
                      <div className="provider-name">Auto Expert</div>
                      <div className="provider-type">Shop</div>
                      <div className="request-id">#REQ-2846</div>
                    </div>
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-time">Requested 5 hours ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quoted Requests */}
          {activeTab === 'quoted' && (
            <div className="cards-container">
              <div className="request-card" onClick={handleRequestCard2}>
                <span className="status-tag tag-quoted">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>request_quote</span>
                  Quoted
                </span>
                
                <div className="request-header">
                  <div className="provider-info">
                    <div className="provider-avatar">PS</div>
                    <div className="provider-details">
                      <div className="provider-name">Precision Service</div>
                      <div className="provider-type">Shop</div>
                      <div className="request-id">#REQ-2846</div>
                    </div>
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-time">Requested yesterday</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accepted Requests */}
          {activeTab === 'accepted' && (
            <div className="cards-container">
              <div className="request-card" onClick={handleRequestCard3}>
                <span className="status-tag tag-accepted">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>check_circle</span>
                  Accepted
                </span>
                
                <div className="request-header">
                  <div className="provider-info">
                    <div className="provider-avatar">AE</div>
                    <div className="provider-details">
                      <div className="provider-name">Auto Expert Garage</div>
                      <div className="provider-type">Shop</div>
                      <div className="request-id">#REQ-2843</div>
                    </div>
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-time">Requested 3 days ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejected Requests */}
          {activeTab === 'rejected' && (
            <div className="cards-container">
              <div className="request-card" onClick={handleRequestCard4}>
                <span className="status-tag tag-rejected">
                  <span className="material-icons-round" style={{fontSize: '12px'}}>cancel</span>
                  Rejected
                </span>
                
                <div className="request-header">
                  <div className="provider-info">
                    <div className="provider-avatar">DR</div>
                    <div className="provider-details">
                      <div className="provider-name">David Rodriguez</div>
                      <div className="provider-type">Independent Mechanic</div>
                      <div className="request-id">#REQ-2839</div>
                    </div>
                  </div>
                </div>
                
                <div className="request-footer">
                  <div className="request-time">Requested 1 week ago</div>
                  <button className="btn-details">
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Request Button */}
        <div className="custom-request-section">
          <button className="custom-request-btn" onClick={goToCustomRequest}>
            <span className="material-icons-round">add_circle</span>
            Custom Request
          </button>
        </div>
      </IonContent>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={goToBooking}>
          <span className="material-icons-round">event</span>
          <span>Booking</span>
        </button>
        <button className="nav-item active">
          <span className="material-icons-round">build_circle</span>
          <span>Request</span>
        </button>
        <button className="nav-item" onClick={goToHome}>
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

export default Request;
