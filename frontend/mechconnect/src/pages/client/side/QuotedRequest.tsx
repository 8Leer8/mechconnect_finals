import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './QuotedRequest.css';

interface QuoteItem {
  custom_request_item_id: number;
  item: string;
  price: number;
}

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
    quoted_items: QuoteItem[];
  };
}

const QuotedRequest: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const quoteItems = requestData?.custom_request?.quoted_items || [];
  const total = quoteItems.reduce((sum, item) => sum + Number(item.price), 0);

  // Fetch request details from API
  const fetchRequestDetails = async () => {
    if (!id) {
      console.log('QuotedRequest: No ID provided');
      return;
    }
    
    console.log('QuotedRequest: Fetching details for request ID:', id);
    
    try {
      setLoading(true);
      setError(null);
      
      const url = `http://localhost:8000/api/requests/${id}/`;
      console.log('QuotedRequest: Fetching from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('QuotedRequest: API Response:', response.status, data);
      
      if (response.ok) {
        console.log('QuotedRequest: Setting request data:', data.request);
        setRequestData(data.request);
      } else {
        console.error('QuotedRequest: API Error:', data.error);
        setError(data.error || 'Failed to load request details');
        setShowToast(true);
      }
    } catch (err) {
      console.error('QuotedRequest: Network error:', err);
      setError('Network error occurred');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('QuotedRequest: Component mounted/updated, ID:', id);
    if (id) {
      fetchRequestDetails();
    }
    return () => {
      console.log('QuotedRequest: Component unmounting');
    };
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

  const handleAccept = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/requests/${id}/accept-quotation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setError(null);
        setSuccessMessage('Quotation accepted! Redirecting to bookings...');
        setShowToast(true);
        setTimeout(() => {
          history.push('/client/booking');
        }, 1500);
      } else {
        setError(data.error || 'Failed to accept quotation');
        setShowToast(true);
      }
    } catch (err) {
      setError('Network error occurred');
      setShowToast(true);
      console.error('Error accepting quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    const confirmReject = window.confirm('Are you sure you want to reject this quotation?');
    if (!confirmReject) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/requests/${id}/reject-quotation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Client decided to reject the quotation'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setError(null);
        setSuccessMessage('Quotation rejected successfully.');
        setShowToast(true);
        setTimeout(() => {
          history.push('/client/request');
        }, 1500);
      } else {
        setError(data.error || 'Failed to reject quotation');
        setShowToast(true);
      }
    } catch (err) {
      setError('Network error occurred');
      setShowToast(true);
      console.error('Error rejecting quotation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCounterQuote = () => {
    // TODO: Implement counter quote functionality
    alert('Counter quote feature coming soon!');
  };

  console.log('QuotedRequest: Rendering component', { id, loading, error: !!error, hasData: !!requestData });

  return (
    <IonPage className="quoted-request-page">
      <IonContent className="quoted-request-content" fullscreen>
        <div className="quoted-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="quoted-request-title">Quoted Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          {loading && !requestData && (
            <div className="loading-container">
              <p>Loading request details...</p>
            </div>
          )}
          
          {error && !requestData && (
            <div className="error-container">
              <p>Error: {error}</p>
            </div>
          )}

          {requestData && (
            <div className="request-card">
              <div className="request-id-badge quoted">
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
                <div className="response-badge">
                  <span className="material-icons-round icon-sm">chat_bubble</span>
                  <span>Response: {requestData.request_type}</span>
                </div>

                <h3 className="section-title">Quoted Item List</h3>
                
                {quoteItems.length > 0 ? (
                  <div className="quote-table">
                    <div className="quote-table-header">
                      <span className="quote-header-item">Item</span>
                      <span className="quote-header-price">Price</span>
                    </div>
                    {quoteItems.map((item) => (
                      <div key={item.custom_request_item_id} className="quote-row">
                        <span className="quote-item-name">{item.item}</span>
                        <span className="quote-item-price">₱{Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-quotes">
                    <p>No quoted items available</p>
                  </div>
                )}
              </div>

              {quoteItems.length > 0 && (
                <>
                  <div className="request-divider"></div>
                  <div className="total-section">
                    <span className="total-label">Total</span>
                    <span className="total-amount">₱{total.toFixed(2)}</span>
                  </div>
                </>
              )}

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

          {requestData && requestData.request_status === 'qouted' && (
            <div className="action-buttons">
              <button className="btn-accept" onClick={handleAccept} disabled={loading}>
                <span className="material-icons-round icon-sm">check_circle</span>
                {loading ? 'Processing...' : 'Accept'}
              </button>
              <button className="btn-reject" onClick={handleReject} disabled={loading}>
                <span className="material-icons-round icon-sm">cancel</span>
                {loading ? 'Processing...' : 'Reject'}
              </button>
              <button className="btn-counter" onClick={handleCounterQuote} disabled={loading}>
                <span className="material-icons-round icon-sm">edit</span>
                Counter Quote
              </button>
            </div>
          )}
          
          {requestData && requestData.request_status !== 'qouted' && (
            <div className="status-message">
              <p>This quotation is no longer available for action. Status: {requestData.request_status}</p>
            </div>
          )}
          
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setShowToast(false);
              setError(null);
              setSuccessMessage(null);
            }}
            message={successMessage || error || ''}
            duration={3000}
            color={successMessage ? 'success' : 'danger'}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuotedRequest;
