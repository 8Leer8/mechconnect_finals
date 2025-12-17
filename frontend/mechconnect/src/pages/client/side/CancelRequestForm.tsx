import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './CancelBookingForm.css';

interface LocationState {
  requestId: number;
  requestData?: any;
}

const CancelRequestForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { requestId, requestData } = location.state || {};
  
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requestId) {
      setError('Request information not found');
    }
  }, [requestId]);

  const goBack = () => {
    history.goBack();
  };

  const handleSubmit = async () => {
    // Validation
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    
    if (!requestId) {
      alert('Request information not found');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Cancelling request:', {
        request_id: requestId,
        reason: reason
      });
      
      const response = await fetch('http://localhost:8000/api/requests/cancel/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          reason: reason
        }),
      });
      
      const data = await response.json();
      console.log('Cancel request response:', data);
      
      if (response.ok) {
        alert('Request cancelled successfully!');
        // Redirect to booking page with cancelled tab
        history.push('/client/booking?tab=cancelled');
      } else {
        console.error('Cancel request error:', data);
        alert(data.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="cancel-booking-form-content">
        <div className="cancel-booking-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="cancel-booking-form-title">Cancel Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="cancel-booking-form-container">
          <div className="cancel-booking-card">
            <div className="booking-info-section">
              <div className="info-row">
                <span className="info-label">Request ID:</span>
                <span className="info-value">#{requestData?.request_id || requestId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Request Type:</span>
                <span className="info-value">{requestData?.request_type || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">{requestData?.request_status || 'Pending'}</span>
              </div>
              {requestData?.provider_name && (
                <div className="info-row">
                  <span className="info-label">Mechanic:</span>
                  <span className="info-value">{requestData.provider_name}</span>
                </div>
              )}
            </div>

            <div className="section-divider"></div>

            <div className="reason-section">
              <label className="reason-label">Reason for Cancellation</label>
              <textarea
                className="reason-textarea"
                placeholder="Please provide a reason for canceling this request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
              />
            </div>

            <div className="warning-section">
              <div className="warning-card">
                <span className="material-icons-round warning-icon">info</span>
                <p className="warning-text">
                  Canceling this request will withdraw it from the system. 
                  You can create a new request anytime.
                </p>
              </div>
            </div>

            <button 
              className="btn-submit-cancel" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CancelRequestForm;
