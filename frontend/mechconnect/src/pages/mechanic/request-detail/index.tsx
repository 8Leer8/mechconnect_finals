import { IonContent, IonPage, IonToast, IonButton } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './RequestDetail.css';

interface RequestData {
  request_id: number;
  request_status: string;
  request_type: string;
  created_at: string;
  client_name: string;
  client_contact?: string;
  service_location?: string;
  estimated_amount?: number;
  custom_request?: {
    description?: string;
    concern_picture?: string;
    providers_note?: string;
  };
  direct_request?: any;
  emergency_request?: any;
}

const RequestDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ job?: any }>();
  const { id } = useParams<{ id: string }>();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const goBack = () => history.goBack();
  const goToNotifications = () => history.push('/mechanic/notifications');

  // Fetch request details from API
  const fetchRequestDetails = async () => {
    if (!id) {
      setError('Request ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      // If job data was passed via navigation state, use it
      if (location.state?.job) {
        setRequestData(location.state.job);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      const response = await fetch(`http://localhost:8000/api/requests/${id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Request data:', data.request);
      console.log('Request status:', data.request?.request_status);
      console.log('Should show buttons:', data.request?.request_status === 'pending');
      // Extract the request data from the response
      setRequestData(data.request);
      setError(null);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Failed to load request details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleAcceptRequest = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required. Please login.');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/requests/${id}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        throw new Error(data.error || 'Failed to accept request');
      }

      // Update local state with the accepted request
      if (requestData && data.request) {
        setRequestData({
          ...requestData,
          request_status: 'accepted',
        });
      }

      setToastMessage('Request accepted successfully!');
      setToastColor('success');
      setShowToast(true);

      // Optional: Navigate to jobs list after a short delay
      setTimeout(() => {
        history.push('/mechanic/jobs?filter=active');
      }, 1500);
    } catch (error: any) {
      console.error('Error accepting request:', error);
      setToastMessage(error.message || 'Failed to accept request. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8000/api/requests/${id}/decline/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      setToastMessage('Request declined');
      setToastColor('success');
      setShowToast(true);

      setTimeout(() => {
        history.push('/mechanic/jobs?filter=requests');
      }, 1500);
    } catch (error) {
      console.error('Error declining request:', error);
      setToastMessage('Failed to decline request. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <IonPage>
      <IonContent className="request-detail-content" scrollY>
        {/* Header */}
        <div className="request-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="request-detail-title">Request Details</h1>
          <div className="header-actions">
            <Wallet />
            <button className="notification-button" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading request details...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <span className="material-icons-round error-icon">error_outline</span>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchRequestDetails}>
              Retry
            </button>
          </div>
        ) : requestData ? (
          <div className="request-detail-container">
            {/* Request Info Card */}
            <div className="detail-card">
              <div className="card-header">
                <h2>Request Information</h2>
                <span className={`status-badge status-${requestData.request_status}`}>
                  {requestData.request_status === 'pending' ? 'Pending Response' : requestData.request_status}
                </span>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Request ID:</span>
                  <span className="value">#RQ-{requestData.request_id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Type:</span>
                  <span className="value">{requestData.request_type}</span>
                </div>
                <div className="info-row">
                  <span className="label">Requested:</span>
                  <span className="value">{formatDate(requestData.created_at)}</span>
                </div>
                {requestData.estimated_amount && (
                  <div className="info-row">
                    <span className="label">Estimated Amount:</span>
                    <span className="value amount">₱{requestData.estimated_amount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info Card */}
            <div className="detail-card">
              <div className="card-header">
                <h2>Client Information</h2>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{requestData.client_name}</span>
                </div>
                {requestData.client_contact && (
                  <div className="info-row">
                    <span className="label">Contact:</span>
                    <span className="value">{requestData.client_contact}</span>
                  </div>
                )}
                {requestData.service_location && (
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value location">
                      <span className="material-icons-round">location_on</span>
                      {requestData.service_location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Request Details */}
            {requestData.custom_request && (
              <div className="detail-card">
                <div className="card-header">
                  <h2>Problem Description</h2>
                </div>
                <div className="card-content">
                  <p className="description">
                    {requestData.custom_request.description || 'No description provided'}
                  </p>
                  {requestData.custom_request.concern_picture && (
                    <div className="info-row">
                      <span className="label">Preferred Date:</span>
                      <span className="value">{requestData.custom_request.preferred_date}</span>
                    </div>
                  )}
                  {requestData.custom_request.preferred_time && (
                    <div className="info-row">
                      <span className="label">Preferred Time:</span>
                      <span className="value">{requestData.custom_request.preferred_time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {requestData.request_status === 'pending' && (
              <div className="action-buttons">
                <IonButton
                  expand="block"
                  color="danger"
                  onClick={handleDeclineRequest}
                  className="decline-btn"
                >
                  <span className="material-icons-round">close</span>
                  Decline Request
                </IonButton>
                <IonButton
                  expand="block"
                  color="success"
                  onClick={handleAcceptRequest}
                  className="accept-btn"
                >
                  <span className="material-icons-round">check</span>
                  Accept Request
                </IonButton>
              </div>
            )}
            
            {/* Show acceptance confirmation when accepted */}
            {requestData.request_status === 'accepted' && (
              <div className="acceptance-confirmation">
                <div className="confirmation-icon">
                  <span className="material-icons-round">check_circle</span>
                </div>
                <p className="confirmation-text">You have accepted this request</p>
              </div>
            )}
          </div>
        ) : null}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color={toastColor}
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default RequestDetail;
