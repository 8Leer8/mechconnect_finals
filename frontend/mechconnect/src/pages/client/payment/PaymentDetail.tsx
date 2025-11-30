import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './PaymentDetail.css';

const PaymentDetail: React.FC = () => {
  const history = useHistory();

  const goBack = () => history.goBack();

  return (
    <IonPage>
      <IonContent className="payment-detail-content">
        {/* Header */}
        <div className="payment-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Payment Detail</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Payment Details Container */}
        <div className="payment-container">
          <div className="payment-card">
            {/* Payment Number */}
            <div className="payment-number-section">
              <span className="payment-number-label">Payment Number:</span>
              <span className="payment-number-value">#PAY-8472</span>
            </div>

            <div className="payment-divider"></div>

            {/* Booking ID */}
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="detail-value booking-id-value">#BK-2847</span>
            </div>

            {/* Service Name */}
            <div className="detail-row">
              <span className="detail-label">Service:</span>
              <span className="detail-value">Engine Oil Change</span>
            </div>

            <div className="payment-divider"></div>

            {/* Provider */}
            <div className="detail-row">
              <span className="detail-label">Paid to:</span>
              <span className="detail-value provider-name">Mike Johnson</span>
            </div>

            <div className="payment-divider"></div>

            {/* Payment Details */}
            <div className="payment-breakdown-section">
              <h3 className="section-title">Payment Breakdown</h3>
              
              <div className="detail-row">
                <span className="detail-label">Total Price:</span>
                <span className="detail-value">₱2,500.00</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Advance Payment:</span>
                <span className="detail-value">₱1,250.00</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Remaining Balance:</span>
                <span className="detail-value">₱1,250.00</span>
              </div>
            </div>

            <div className="payment-divider"></div>

            {/* Total Amount Paid */}
            <div className="total-section">
              <span className="total-label">Total Paid</span>
              <span className="total-amount">₱2,500.00</span>
            </div>

            <div className="payment-divider"></div>

            {/* Payment Date */}
            <div className="detail-row">
              <span className="detail-label">Payment Date:</span>
              <span className="detail-value">Nov 25, 2025 - 3:45 PM</span>
            </div>

            <div className="payment-divider"></div>

            {/* Proof of Payment */}
            <div className="proof-section">
              <h3 className="section-title">Proof of Payment</h3>
              
              <div className="proof-images">
                {/* Advance Payment Proof */}
                <div className="proof-item">
                  <div className="proof-label">Advance Payment</div>
                  <div className="proof-image-wrapper">
                    <div className="proof-placeholder">
                      <span className="material-icons-round proof-icon">image</span>
                      <span className="proof-text">Payment proof</span>
                    </div>
                  </div>
                </div>

                {/* Final Payment Proof */}
                <div className="proof-item">
                  <div className="proof-label">Final Payment</div>
                  <div className="proof-image-wrapper">
                    <div className="proof-placeholder">
                      <span className="material-icons-round proof-icon">image</span>
                      <span className="proof-text">Payment proof</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-divider"></div>

            {/* Status */}
            <div className="status-section">
              <div className="status-badge completed">
                <span className="material-icons-round status-icon">check_circle</span>
                <span className="status-text">Payment Completed</span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentDetail;
