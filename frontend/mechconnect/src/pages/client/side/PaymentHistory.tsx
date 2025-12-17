import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserId } from '../../../utils/auth';
import './PaymentHistory.css';

interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: number;
  booked_at: string;
  completed_at: string;
  client_name: string;
  provider_name: string;
  provider_contact: string;
  request_summary: string;
  request_type: string;
}

const PaymentHistory: React.FC = () => {
  const history = useHistory();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    const userId = getUserId();
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('PaymentHistory - Fetching completed bookings for user:', userId);
      const response = await fetch(`http://localhost:8000/api/bookings/client/?client_id=${userId}&status=completed`);
      
      console.log('PaymentHistory - Response status:', response.status);
      const data = await response.json();
      console.log('PaymentHistory - Response data:', data);

      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || 'Failed to load payment history');
        console.error('PaymentHistory - API error:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error: ${errorMessage}`);
      console.error('PaymentHistory - Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    history.goBack();
  };

  const handleViewDetails = (bookingId: number) => {
    history.push(`/client/payment-detail/${bookingId}`);
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `Paid ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `Paid ${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Paid yesterday';
    } else if (diffInDays < 7) {
      return `Paid ${diffInDays} days ago`;
    } else {
      return `Paid ${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="payment-history-content">
          <div className="payment-history-header">
            <button className="back-button" onClick={goBack}>
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="payment-history-title">Payment History</h1>
            <div className="header-spacer"></div>
          </div>
          <div className="loading-container">
            <p>Loading payment history...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="payment-history-content">
          <div className="payment-history-header">
            <button className="back-button" onClick={goBack}>
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="payment-history-title">Payment History</h1>
            <div className="header-spacer"></div>
          </div>
          <div className="error-container">
            <p>{error}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p>No payment history yet</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.booking_id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-number">#PAY-{booking.booking_id}</div>
                  <div className="payment-amount">₱{formatCurrency(booking.amount_fee)}</div>
                </div>
                
                <div className="payment-details">
                  <div className="detail-row">
                    <span className="detail-label">Paid to</span>
                    <span className="detail-value paid-to">{booking.provider_name || 'Provider'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Booking ID</span>
                    <span className="detail-value booking-id">#BK-{booking.booking_id}</span>
                  </div>
                </div>
                
                <div className="payment-footer">
                  <div className="payment-time">{formatTimeAgo(booking.completed_at)}</div>
                  <button 
                    className="btn-details"
                    onClick={() => handleViewDetails(booking.booking_id)}
                  >
                    <span className="material-icons-round icon-sm">visibility</span>
                    See Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentHistory;

