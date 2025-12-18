import { IonContent, IonPage, IonToast, IonButton } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './RequestDetail.css';

interface RequestData {
  request_id: number;
  status: string;
  request_summary: string;
  request_type: string;
  created_at: string;
  client_name: string;
  client_contact?: string;
  service_location?: string;
  estimated_amount?: number;
  custom_request?: {
    problem_description?: string;
    images?: string[];
    preferred_date?: string;
    preferred_time?: string;
  };
  direct_request?: {
    service: number;
    service_name?: string;
    service_price?: number;
    quoted_items?: Array<{item: string; price: string}>;
  };
  emergency_request?: any;
}

interface QuotationItem {
  item: string;
  price: string;
}

const RequestDetail: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ job?: any; openQuotation?: boolean }>();
  const { id } = useParams<{ id: string }>();
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  
  // Quotation states
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([{ item: '', price: '' }]);
  const [quotationNote, setQuotationNote] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);

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
        
        // Auto-open quotation form if requested (when QUOTE button clicked)
        if (location.state.openQuotation) {
          setTimeout(() => setShowQuotationForm(true), 100);
        }
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
      setRequestData(data);
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
          status: 'accepted',
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

  const handleShowQuotationForm = () => {
    setShowQuotationForm(true);
  };

  const handleCancelQuotation = () => {
    setShowQuotationForm(false);
    setQuotationItems([{ item: '', price: '' }]);
    setQuotationNote('');
  };

  const handleAddQuotationItem = () => {
    setQuotationItems([...quotationItems, { item: '', price: '' }]);
  };

  const handleRemoveQuotationItem = (index: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const handleQuotationItemChange = (index: number, field: 'item' | 'price', value: string) => {
    const newItems = [...quotationItems];
    newItems[index][field] = value;
    setQuotationItems(newItems);
  };

  const handleSubmitQuotation = async () => {
    try {
      // Validate quotation items
      const validItems = quotationItems.filter(item => item.item.trim() && item.price.trim());
      
      if (validItems.length === 0) {
        setToastMessage('Please add at least one quotation item');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      // Validate prices
      for (const item of validItems) {
        const price = parseFloat(item.price);
        if (isNaN(price) || price < 0) {
          setToastMessage('Please enter valid prices for all items');
          setToastColor('danger');
          setShowToast(true);
          return;
        }
      }

      setSubmittingQuote(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required. Please login.');
        setToastColor('danger');
        setShowToast(true);
        setSubmittingQuote(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/requests/${id}/quote/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoted_items: validItems,
          providers_note: quotationNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quotation');
      }

      // Update local state
      if (requestData && data.request) {
        setRequestData({
          ...requestData,
          status: 'qouted',
        });
      }

      setToastMessage('Quotation submitted successfully!');
      setToastColor('success');
      setShowToast(true);
      setShowQuotationForm(false);

      // Navigate to quotation tab after a short delay
      setTimeout(() => {
        history.push('/mechanic/jobs?filter=quotation');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting quotation:', error);
      setToastMessage(error.message || 'Failed to submit quotation. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setSubmittingQuote(false);
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
        <div className="mechanic-job-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-job-detail-title">Request Details</h1>
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
          <div className="job-detail-container">
            <div className="job-detail-card">
              {/* Job ID and Status */}
              <div className="job-header">
                <div className="job-id-badge">
                  <span className="job-id">#RQ-{requestData.request_id}</span>
                </div>
                <div className={`status-badge status-${requestData.status}`}>
                  {requestData.status === 'pending' ? 'Pending Response' : requestData.status}
                </div>
              </div>

              {/* Client Information */}
              <div className="job-section">
                <h3 className="section-title">Client Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{requestData.client_name}</span>
                </div>
                {requestData.client_contact && (
                  <div className="detail-row">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{requestData.client_contact}</span>
                  </div>
                )}
                {requestData.service_location && (
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{requestData.service_location}</span>
                  </div>
                )}
              </div>

              <div className="job-divider"></div>

              {/* Request Details */}
              <div className="job-section">
                <h3 className="section-title">Request Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{requestData.request_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Summary:</span>
                  <span className="detail-value">{requestData.request_summary}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Requested:</span>
                  <span className="detail-value">{formatDate(requestData.created_at)}</span>
                </div>
                {requestData.estimated_amount && (
                  <div className="detail-row">
                    <span className="detail-label">Estimated Amount:</span>
                    <span className="detail-value amount">₱{requestData.estimated_amount}</span>
                  </div>
                )}
              </div>

              {/* Custom Request Details */}
              {requestData.custom_request && (
                <>
                  <div className="job-divider"></div>
                  <div className="job-section">
                    <h3 className="section-title">Problem Description</h3>
                    <p className="description">
                      {requestData.custom_request.problem_description || 'No description provided'}
                    </p>
                    {requestData.custom_request.preferred_date && (
                      <div className="detail-row">
                        <span className="detail-label">Preferred Date:</span>
                        <span className="detail-value">{requestData.custom_request.preferred_date}</span>
                      </div>
                    )}
                    {requestData.custom_request.preferred_time && (
                      <div className="detail-row">
                        <span className="detail-label">Preferred Time:</span>
                        <span className="detail-value">{requestData.custom_request.preferred_time}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {requestData.status === 'pending' && (
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
                
                {/* Show Quote button only for direct requests */}
                {requestData.request_type === 'direct' && (
                  <IonButton
                    expand="block"
                    color="warning"
                    onClick={handleShowQuotationForm}
                    className="quote-btn"
                  >
                    <span className="material-icons-round">receipt</span>
                    Quote
                  </IonButton>
                )}
                
                <IonButton
                  expand="block"
                  color="success"
                  onClick={handleAcceptRequest}
                  className="accept-btn"
                >
                  <span className="material-icons-round">check</span>
                  {requestData.request_type === 'direct' ? 'Confirm' : 'Accept Request'}
                </IonButton>
              </div>
            )}
            
            {/* Quotation Form */}
            {showQuotationForm && requestData.request_type === 'direct' && (
              <div className="quotation-form-card">
                <div className="card-header">
                  <h2>Create Quotation</h2>
                  <p className="subtitle">Provide detailed breakdown of costs for this service</p>
                </div>
                <div className="card-content">
                  {/* Service Info */}
                  {requestData.direct_request && (
                    <div className="service-info">
                      <div className="info-row">
                        <span className="label">Service:</span>
                        <span className="value">{requestData.direct_request.service_name}</span>
                      </div>
                      {requestData.direct_request.service_price && (
                        <div className="info-row">
                          <span className="label">Base Price:</span>
                          <span className="value">₱{requestData.direct_request.service_price}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Quotation Items */}
                  <div className="quotation-items">
                    <h3>Quotation Items</h3>
                    {quotationItems.map((item, index) => (
                      <div key={index} className="quotation-item-row">
                        <input
                          type="text"
                          placeholder="Item / Service Description"
                          value={item.item}
                          onChange={(e) => handleQuotationItemChange(index, 'item', e.target.value)}
                          className="item-input"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => handleQuotationItemChange(index, 'price', e.target.value)}
                          className="price-input"
                          min="0"
                          step="0.01"
                        />
                        {quotationItems.length > 1 && (
                          <button
                            onClick={() => handleRemoveQuotationItem(index)}
                            className="remove-item-btn"
                          >
                            <span className="material-icons-round">delete</span>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddQuotationItem}
                      className="add-item-btn"
                    >
                      <span className="material-icons-round">add</span>
                      Add Item
                    </button>
                  </div>
                  
                  {/* Total */}
                  <div className="quotation-total">
                    <span className="total-label">Total Quotation:</span>
                    <span className="total-value">
                      ₱{quotationItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Optional Note */}
                  <div className="quotation-note">
                    <label htmlFor="quotation-note">Additional Notes (Optional)</label>
                    <textarea
                      id="quotation-note"
                      placeholder="Add any additional notes or requirements..."
                      value={quotationNote}
                      onChange={(e) => setQuotationNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {/* Form Actions */}
                  <div className="quotation-form-actions">
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleCancelQuotation}
                      disabled={submittingQuote}
                    >
                      Cancel
                    </IonButton>
                    <IonButton
                      expand="block"
                      onClick={handleSubmitQuotation}
                      disabled={submittingQuote}
                    >
                      {submittingQuote ? 'Submitting...' : 'Submit Quotation'}
                    </IonButton>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show acceptance confirmation when accepted */}
            {requestData.status === 'accepted' && (
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
