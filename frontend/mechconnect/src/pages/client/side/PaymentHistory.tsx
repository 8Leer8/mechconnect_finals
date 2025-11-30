import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './PaymentHistory.css';

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paidTo: string;
  bookingId: string;
  time: string;
}

const PaymentHistory: React.FC = () => {
  const history = useHistory();

  const payments: Payment[] = [
    {
      id: '1',
      paymentNumber: '#PAY-8472',
      amount: 2500.00,
      paidTo: 'Auto Expert Garage',
      bookingId: '#BK-2847',
      time: 'Paid 2 hours ago'
    },
    {
      id: '2',
      paymentNumber: '#PAY-8471',
      amount: 1800.00,
      paidTo: 'Mike Johnson',
      bookingId: '#BK-2846',
      time: 'Paid yesterday'
    },
    {
      id: '3',
      paymentNumber: '#PAY-8470',
      amount: 3200.00,
      paidTo: 'Precision Service',
      bookingId: '#BK-2843',
      time: 'Paid 3 days ago'
    },
    {
      id: '4',
      paymentNumber: '#PAY-8469',
      amount: 1500.00,
      paidTo: 'David Rodriguez',
      bookingId: '#BK-2839',
      time: 'Paid 1 week ago'
    }
  ];

  const goBack = () => {
    history.goBack();
  };

  const handleViewDetails = (e: React.MouseEvent<HTMLButtonElement>) => {
    const paymentId = e.currentTarget.dataset.paymentId;
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      history.push('/client/payment-detail');
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <IonPage>
      <IonContent className="payment-history-content">
        <div className="payment-history-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="payment-history-title">Payment History</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="payment-cards-container">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <div className="payment-header">
                <div className="payment-number">{payment.paymentNumber}</div>
                <div className="payment-amount">{formatCurrency(payment.amount)}</div>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Paid to</span>
                  <span className="detail-value paid-to">{payment.paidTo}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value booking-id">{payment.bookingId}</span>
                </div>
              </div>
              
              <div className="payment-footer">
                <div className="payment-time">{payment.time}</div>
                <button 
                  className="btn-details"
                  data-payment-id={payment.id}
                  onClick={handleViewDetails}
                >
                  <span className="material-icons-round icon-sm">visibility</span>
                  See Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentHistory;

