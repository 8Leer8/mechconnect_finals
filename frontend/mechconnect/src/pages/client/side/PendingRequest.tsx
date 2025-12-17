import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './PendingRequest.css';

interface RequestData {
  request_id: number;
  client_name: string;
  provider_name: string | null;
  request_type: string;
  request_status: string;
  created_at: string;
  client_address?: {
    house_building_number?: string;
    street_name?: string;
    subdivision_village?: string;
    barangay?: string;
    city_municipality?: string;
    province?: string;
    region?: string;
    postal_code?: string;
  };
  custom_request?: {
    description: string;
    concern_picture: string | null;
  };
}

const PendingRequest: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch request details from API
  const fetchRequestDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/requests/${id}/`);
      const data = await response.json();
      
      if (response.ok) {
        setRequestData(data.request);
      } else {
        setError(data.error || 'Failed to load request details');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching request details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    if (requestData) {
      history.push({
        pathname: '/client/cancel-request-form',
        state: {
          requestId: requestData.request_id,
          requestData: requestData
        }
      });
    } else {
      alert('Request data not available');
    }
  };

  return (
    <IonPage>
      <IonContent className="pending-request-content">
        <div className="pending-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="pending-request-title">Pending Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          {loading && (
            <div className="loading-container">
              <p>Loading request details...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <p>Error: {error}</p>
            </div>
          )}

          {requestData && !loading && !error && (
            <div className="request-card">
              <div className="request-id-badge">
                <span className="request-id">#REQ-{requestData.request_id}</span>
              </div>

              <div className="request-section">
                <div className="detail-row">
                  <span className="detail-label">Send to:</span>
                  <span className="detail-value provider-name">
                    {requestData.provider_name || 'No provider assigned'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Provider type:</span>
                  <span className="detail-value">{requestData.request_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requested at:</span>
                  <span className="detail-value">{formatDate(requestData.created_at)}</span>
                </div>
              </div>

              <div className="request-divider"></div>

              <div className="request-section">
                <h3 className="section-title">Service Details</h3>
                {requestData.custom_request && (
                  <div className="service-item">
                    <span className="service-name">{requestData.custom_request.description}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{requestData.request_status}</span>
                </div>
              </div>

              {requestData.client_address && (
                <>
                  <div className="request-divider"></div>
                  <div className="request-section">
                    <h3 className="section-title">Service Location</h3>
                    <div className="location-details">
                      {requestData.client_address.house_building_number && (
                        <div className="location-line">
                          <span className="material-icons-round location-icon">home</span>
                          <span>{requestData.client_address.house_building_number}</span>
                        </div>
                      )}
                      {requestData.client_address.street_name && (
                        <div className="location-line">
                          <span className="material-icons-round location-icon">road</span>
                          <span>{requestData.client_address.street_name}</span>
                        </div>
                      )}
                      {(requestData.client_address.barangay || requestData.client_address.city_municipality) && (
                        <div className="location-line">
                          <span className="material-icons-round location-icon">location_city</span>
                          <span>
                            {[requestData.client_address.subdivision_village, requestData.client_address.barangay, requestData.client_address.city_municipality]
                              .filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      {requestData.client_address.province && (
                        <div className="location-line">
                          <span className="material-icons-round location-icon">map</span>
                          <span>{requestData.client_address.province}, {requestData.client_address.region}</span>
                        </div>
                      )}
                      {requestData.client_address.postal_code && (
                        <div className="location-line">
                          <span className="material-icons-round location-icon">markunread_mailbox</span>
                          <span>{requestData.client_address.postal_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {requestData && !loading && !error && (
            <button className="btn-cancel" onClick={handleCancel}>
              <span className="material-icons-round icon-sm">close</span>
              Cancel Request
            </button>
          )}
          
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={error || ''}
            duration={3000}
            color="danger"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PendingRequest;
