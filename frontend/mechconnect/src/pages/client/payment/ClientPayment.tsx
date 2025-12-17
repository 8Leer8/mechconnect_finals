import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ClientPayment.css';

interface LocationState {
  bookingId: number;
  totalAmount: string;
  bookingDetails?: any;
}

const ClientPayment: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { bookingId, totalAmount, bookingDetails } = location.state || {};
  
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<string>(totalAmount || '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!bookingId) {
      setError('Booking information not found');
    }
  }, [bookingId]);

  const goBack = () => history.goBack();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!remainingAmount || parseFloat(remainingAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!proofImage) {
      alert('Please upload proof of payment');
      return;
    }
    
    try {
      if (!bookingId) {
        alert('Booking information not found');
        return;
      }
      
      // Mark booking as complete
      const response = await fetch('http://localhost:8000/api/bookings/complete/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Payment completed and booking marked as complete!');
        // Redirect to the completed booking detail page
        history.push(`/client/completed-booking/${bookingId}`);
      } else {
        alert(data.error || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Completion error:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonContent className="client-payment-content">
        {/* Header */}
        <div className="client-payment-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Complete Payment</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Payment Details Container */}
        <div className="payment-container">
          <div className="payment-card">
            {/* Booking ID */}
            <div className="booking-id-section">
              <span className="booking-id-label">Booking ID:</span>
              <span className="booking-id-value">#{bookingId || 'N/A'}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Service Name */}
            <div className="detail-row">
              <span className="detail-label">Service:</span>
              <span className="detail-value">Engine Oil Change</span>
            </div>

            {/* Total Price */}
            <div className="detail-row">
              <span className="detail-label">Total Price:</span>
              <span className="detail-value price-value">₱2,500.00</span>
            </div>

            {/* Remaining Balance to Pay */}
            <div className="amount-input-section">
              <label className="input-label">Remaining Balance to Pay:</label>
              <div className="input-wrapper">
                <span className="currency-symbol">₱</span>
                <input
                  type="number"
                  className="amount-input"
                  placeholder="0.00"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="payment-divider"></div>

            {/* Receiver */}
            <div className="detail-row">
              <span className="detail-label">Receiver:</span>
              <span className="detail-value receiver-name">Mike Johnson</span>
            </div>

            <div className="payment-divider"></div>

            {/* Proof of Payment */}
            <div className="proof-section">
              <h3 className="section-title">Proof of Payment</h3>
              
              <div className="image-upload-container">
                {proofImage ? (
                  <div className="uploaded-image-wrapper">
                    <img src={proofImage} alt="Proof of payment" className="uploaded-image" />
                    <button 
                      className="remove-image-button"
                      onClick={() => setProofImage(null)}
                    >
                      <span className="material-icons-round">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <div className="upload-placeholder">
                      <span className="material-icons-round upload-icon">add_photo_alternate</span>
                      <span className="upload-text">Upload proof of payment</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button className="btn-submit-payment" onClick={handleSubmit}>
            <span className="material-icons-round icon-sm">check_circle</span>
            Submit Payment
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ClientPayment;
