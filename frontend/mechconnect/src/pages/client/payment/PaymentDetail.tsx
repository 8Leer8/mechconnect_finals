import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './PaymentDetail.css';

interface CompletedBookingData {
  completed_booking_id?: number;
  booking?: number;
  completed_at?: string;
  total_amount?: string;
  notes?: string;
  booking_details?: {
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
    service_details?: {
      service_name: string;
      includes?: string;
      addons?: string;
    };
  };
  // Fallback fields from regular Booking
  booking_id?: number;
  status?: string;
  amount_fee?: number;
  booked_at?: string;
  client_name?: string;
  provider_name?: string;
  provider_contact?: string;
  request_summary?: string;
  request_type?: string;
  service_details?: {
    service_name: string;
    includes?: string;
    addons?: string;
  };
}

const PaymentDetail: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [bookingData, setBookingData] = useState<CompletedBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => history.goBack();

  // Fetch completed booking details
  const fetchBookingDetails = async () => {
    if (!id) {
      setError('Booking ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('PaymentDetail - Fetching booking ID:', id);
      const response = await fetch(`http://localhost:8000/api/bookings/completed/${id}/`);
      
      console.log('PaymentDetail - Response status:', response.status);
      const data = await response.json();
      console.log('PaymentDetail - Response data:', data);

      if (response.ok) {
        setBookingData(data);
      } else {
        setError(data.error || 'Failed to load payment details');
        console.error('PaymentDetail - API error:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error: ${errorMessage}`);
      console.error('PaymentDetail - Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="payment-detail-content">
          <div className="payment-detail-header">
            <button className="back-button" onClick={goBack}>
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="page-title">Payment Detail</h1>
            <div className="header-spacer"></div>
          </div>
          <div className="loading-container">
            <p>Loading payment details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !bookingData) {
    return (
      <IonPage>
        <IonContent className="payment-detail-content">
          <div className="payment-detail-header">
            <button className="back-button" onClick={goBack}>
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="page-title">Payment Detail</h1>
            <div className="header-spacer"></div>
          </div>
          <div className="error-container">
            <p>{error || 'Payment details not found'}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Helper to get data from either CompletedBooking or regular Booking structure
  const getBookingId = () => bookingData.booking_details?.booking_id || bookingData.booking_id || 0;
  const getProviderName = () => bookingData.booking_details?.provider_name || bookingData.provider_name || 'Provider';
  const getRequestSummary = () => bookingData.booking_details?.request_summary || bookingData.request_summary || 
                                   bookingData.booking_details?.service_details?.service_name || bookingData.service_details?.service_name || 'Service';
  const getAmountFee = () => bookingData.booking_details?.amount_fee || bookingData.amount_fee || 0;
  const getTotalAmount = () => bookingData.total_amount || String(bookingData.amount_fee || 0);
  const getCompletedAt = () => bookingData.completed_at || bookingData.booking_details?.completed_at || new Date().toISOString();
  const getPaymentNumber = () => bookingData.completed_booking_id || bookingData.booking_id || 0;

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
              <span className="payment-number-value">#PAY-{getPaymentNumber()}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Booking ID */}
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="detail-value booking-id-value">#BK-{getBookingId()}</span>
            </div>

            {/* Service Name */}
            <div className="detail-row">
              <span className="detail-label">Service:</span>
              <span className="detail-value">{getRequestSummary()}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Provider */}
            <div className="detail-row">
              <span className="detail-label">Paid to:</span>
              <span className="detail-value provider-name">{getProviderName()}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Payment Details */}
            <div className="payment-breakdown-section">
              <h3 className="section-title">Payment Breakdown</h3>
              
              <div className="detail-row">
                <span className="detail-label">Total Price:</span>
                <span className="detail-value">₱{formatCurrency(getTotalAmount())}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Service Fee:</span>
                <span className="detail-value">₱{formatCurrency(getAmountFee())}</span>
              </div>
            </div>

            <div className="payment-divider"></div>

            {/* Total Amount Paid */}
            <div className="total-section">
              <span className="total-label">Total Paid</span>
              <span className="total-amount">₱{formatCurrency(getTotalAmount())}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Payment Date */}
            <div className="detail-row">
              <span className="detail-label">Payment Date:</span>
              <span className="detail-value">{formatDate(getCompletedAt())}</span>
            </div>

            <div className="payment-divider"></div>

            {/* Notes */}
            {bookingData.notes && (
              <>
                <div className="payment-divider"></div>
                <div className="proof-section">
                  <h3 className="section-title">Notes</h3>
                  <div className="detail-row">
                    <span className="detail-value">{bookingData.notes}</span>
                  </div>
                </div>
              </>
            )}

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
