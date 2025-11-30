import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './RefundedBooking.css';

const RefundedBooking: React.FC = () => {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleSeeDisputedBooking = () => {
    history.push('/client/disputed-booking');
  };

  return (
    <IonPage>
      <IonContent className="refunded-booking-content">
        <div className="refunded-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="refunded-booking-title">Refunded Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge refunded">
              <span className="booking-id">#BK-2840</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider name:</span>
                <span className="detail-value provider-name">Precision Service</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Shop</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">Nov 22, 2025 - 1:00 PM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">AC Repair & Recharge</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Dispute booking ID:</span>
                <span className="detail-value dispute-id">#BK-2840</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="refunded-section">
              <div className="refunded-info">
                <span className="material-icons-round icon-sm refund-icon">account_balance_wallet</span>
                <div className="refunded-details">
                  <span className="refunded-label">Refunded at:</span>
                  <span className="refunded-time">Nov 25, 2025 - 5:30 PM</span>
                </div>
              </div>
              <div className="refunded-amount-section">
                <span className="refunded-amount-label">Refunded amount:</span>
                <span className="refunded-amount">₱3,500.00</span>
              </div>
            </div>
          </div>

          <button className="btn-see-disputed" onClick={handleSeeDisputedBooking}>
            <span className="material-icons-round icon-sm">report_problem</span>
            See Disputed Booking
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RefundedBooking;
