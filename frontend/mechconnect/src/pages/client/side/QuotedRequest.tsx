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
  const [showToast, setShowToast] = useState(false);

  const quoteItems = requestData?.custom_request?.quoted_items || [];
  const total = quoteItems.reduce((sum, item) => sum + item.price, 0);

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

  const handleAccept = () => {
    console.log('Accept quote');
  };

  const handleReject = () => {
    console.log('Reject quote');
  };

  const handleCounterQuote = () => {
    history.push('/client/counter-offer-form');
  };

  return (
    <IonPage>
      <IonContent className="quoted-request-content">
        <div className="quoted-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="quoted-request-title">Quoted Request</h1>
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
                        <span className="quote-item-price">₱{item.price.toFixed(2)}</span>
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

          {requestData && !loading && !error && (
            <div className="action-buttons">
              <button className="btn-accept" onClick={handleAccept}>
                <span className="material-icons-round icon-sm">check_circle</span>
                Accept
              </button>
              <button className="btn-reject" onClick={handleReject}>
                <span className="material-icons-round icon-sm">cancel</span>
                Reject
              </button>
              <button className="btn-counter" onClick={handleCounterQuote}>
                <span className="material-icons-round icon-sm">edit</span>
                Counter Quote
              </button>
            </div>
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

export default QuotedRequest;
