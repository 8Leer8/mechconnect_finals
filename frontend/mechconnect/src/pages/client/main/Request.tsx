import { IonContent, IonPage, IonToast, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../../components/BottomNav';
import { requestsAPI, notificationsAPI, formatTimeAgo, getInitials, RequestListItem } from '../../../utils/api';
import './Request.css';

const Request: React.FC = () => {
  const history = useHistory();
  
  // Check URL for tab parameter
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'pending';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Data states
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Client ID from authentication
  const [clientId, setClientId] = useState<number | null>(null);

  // Get client ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.acc_id || userData.account_id;
        if (id) {
          setClientId(id);
          console.log('Request - Using client ID:', id);
        } else {
          console.error('No user ID found in localStorage');
          setError('User session not found. Please log in again.');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setError('Invalid user session. Please log in again.');
      }
    } else {
      console.error('No user data in localStorage');
      setError('Not authenticated. Please log in.');
    }
  }, []);

  const goToNotifications = () => history.push('/client/notifications');
  const goToCustomRequest = () => history.push('/client/custom-request');
  
  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!clientId) return;
    try {
      const result = await notificationsAPI.getUserNotifications(clientId, false);
      if (result.data) {
        setUnreadCount(result.data.notifications.length);
      }
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
    }
  };
  
  const goToRequestDetail = (requestId: number, status: string) => {
    switch (status) {
      case 'pending':
        history.push(`/client/pending-request/${requestId}`);
        break;
      case 'qouted':
        history.push(`/client/quoted-request/${requestId}`);
        break;
      case 'accepted':
        history.push(`/client/accepted-request/${requestId}`);
        break;
      case 'rejected':
        history.push(`/client/rejected-request/${requestId}`);
        break;
      default:
        history.push(`/client/pending-request/${requestId}`);
    }
  };

  // Fetch unread count when clientId is available
  useEffect(() => {
    if (clientId) {
      fetchUnreadCount();
    }
  }, [clientId]);

  // Refresh notification count when page becomes active
  useIonViewWillEnter(() => {
    if (clientId) {
      fetchUnreadCount();
    }
  });

  // Fetch requests from API
  const fetchRequests = async (status = activeTab) => {
    if (!clientId) {
      console.log('Request - No clientId, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('Request - Fetching with clientId:', clientId);
      // Map frontend status to backend status (quoted -> qouted in backend)
      const backendStatus = status === 'quoted' ? 'qouted' : status;
      const result = await requestsAPI.getClientRequests(clientId, backendStatus);
      
      if (result.error) {
        setError(result.error);
        setShowToast(true);
        setRequests([]);
      } else if (result.data) {
        setRequests(result.data.requests || []);
      }
    } catch (err) {
      setError('Failed to load requests');
      setShowToast(true);
      console.error('Error fetching requests:', err);
      setRequests([]);
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
    
    // Fetch requests when component mounts or tab changes - but only if clientId is valid
    if (clientId) {
      fetchRequests();
    }
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab, clientId]);

  const handleTabPending = () => {
    setActiveTab('pending');
    if (requests.length === 0 && !loading) {
      fetchRequests('pending');
    }
  };
  
  const handleTabQuoted = () => {
    setActiveTab('quoted');
    if (requests.length === 0 && !loading) {
      fetchRequests('quoted');
    }
  };
  
  const handleTabAccepted = () => {
    setActiveTab('accepted');
    if (requests.length === 0 && !loading) {
      fetchRequests('accepted');
    }
  };
  
  const handleTabRejected = () => {
    setActiveTab('rejected');
    if (requests.length === 0 && !loading) {
      fetchRequests('rejected');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'qouted': return 'request_quote';
      case 'accepted': return 'check_circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'tag-pending';
      case 'qouted': return 'tag-quoted';
      case 'accepted': return 'tag-accepted';
      case 'rejected': return 'tag-rejected';
      default: return 'tag-pending';
    }
  };

  // Render request cards
  const renderRequestCards = () => {
    if (loading) {
      return (
        <div className="loading-message">Loading requests...</div>
      );
    }

    if (error) {
      return (
        <div className="error-message">{error}</div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="no-requests-message">
          No {activeTab} requests found
        </div>
      );
    }

    return requests.map((request) => (
      <div key={request.request_id} className="request-card">
        <span className={`status-tag ${getStatusClass(request.request_status)}`}>
          <span className="material-icons-round" style={{fontSize: '12px'}}>
            {getStatusIcon(request.request_status)}
          </span>
          {request.request_status === 'qouted' ? 'Quotation' : request.request_status.charAt(0).toUpperCase() + request.request_status.slice(1)}
        </span>
        
        <div className="request-header">
          <div className="provider-info">
            <div className="provider-avatar">
              {getInitials(request.provider_name || 'No Provider')}
            </div>
            <div className="provider-details">
              <div className="provider-name">
                {request.provider_name || 'No Provider Assigned'}
              </div>
              <div className="provider-type">
                {request.request_type === 'custom' ? 'Custom Request' : 
                 request.request_type === 'direct' ? 'Direct Service' : 
                 'Emergency Request'}
              </div>
              <div className="request-id">#REQ-{request.request_id}</div>
            </div>
          </div>
        </div>

        <div className="request-summary">
          {request.request_summary}
        </div>
        
        <div className="request-footer">
          <div className="request-time">
            Requested {formatTimeAgo(request.created_at)}
          </div>
          <button 
            className="btn-details" 
            onClick={() => goToRequestDetail(request.request_id, request.request_status)}
          >
            <span className="material-icons-round icon-sm">visibility</span>
            See Details
          </button>
        </div>
      </div>
    ));
  };

  // Wrap entire component in error boundary try-catch
  try {
    return (
      <IonPage>
        <IonContent className="request-content" style={{ paddingBottom: '80px' }}>
          {/* Header */}
          <div className="request-header-top">
            <h1 className="request-title">Request</h1>
            <button 
              className="notification-button"
              onClick={goToNotifications}
              aria-label="View notifications"
            >
              <span className="material-icons-round">notifications</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
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
                  Quotation
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

            {/* Dynamic Request Cards */}
            <div className="cards-container">
              {renderRequestCards()}
            </div>
          </div>

          {/* Custom Request Button */}
          <div className="custom-request-section">
            <button className="custom-request-btn" onClick={goToCustomRequest}>
              <span className="material-icons-round">add_circle</span>
              Custom Request
            </button>
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
    console.error('Request page render error:', err);
    return (
      <IonPage>
        <IonContent className="request-content">
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

export default Request;
