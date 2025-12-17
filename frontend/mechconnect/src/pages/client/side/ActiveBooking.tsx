import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ActiveBooking.css';

interface BookingData {
  booking_id: number;
  status: string;
  amount_fee: string | number;  // API returns string, but can be number
  booked_at: string;
  service_time: string;
  client_name: string;
  provider_name: string;
  provider_contact: string;
  request_summary: string;
  request_type: string;
  service_details: {
    service_name: string;
    includes?: string;
    addons?: string;
  };
  location: {
    house_number?: string;
    street_name?: string;
    subdivision?: string;
    barangay?: string;
    city?: string;
    province?: string;
    region?: string;
    postal_code?: string;
  };
  payment_info?: {
    payment_status: string;
    payment_status_display: string;
    payment_method?: string;
    payment_method_display?: string;
    total_amount: string;
    amount_paid: string;
    remaining_balance: string;
    payment_date?: string;
    reference_number?: string;
  };
}

const ActiveBooking: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    console.log('Cancel clicked, booking ID:', id, 'type:', typeof id);
    history.push({
      pathname: '/client/cancel-booking-form',
      state: { 
        bookingId: parseInt(id),  // Convert to number
        bookingData: bookingData
      }
    });
  };

  const handleReschedule = () => {
    console.log('Reschedule clicked, booking ID:', id, 'booking data:', bookingData);
    history.push({
      pathname: '/client/reschedule-booking-form',
      state: {
        bookingId: id,
        bookingData: bookingData
      }
    });
  };

  const handleComplete = () => {
    console.log('Complete clicked, booking ID:', id, 'booking data:', bookingData);
    history.push({
      pathname: '/client/client-payment',
      state: {
        bookingId: id,
        totalAmount: bookingData?.amount_fee || '0',
        bookingDetails: bookingData
      }
    });
  };

  const handleAdvancePayment = () => {
    history.push('/client/advance-payment');
  };

  const handlePayment = () => {
    if (bookingData) {
      history.push('/client/payment-form', {
        bookingId: bookingData.booking_id,
        totalAmount: typeof bookingData.amount_fee === 'string' 
          ? bookingData.amount_fee 
          : bookingData.amount_fee.toString(),
        bookingDetails: bookingData
      });
    }
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  // Fetch booking details from API
  const fetchBookingDetails = async () => {
    if (!id) {
      setError('Booking ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('ActiveBooking - Fetching booking ID:', id);
      console.log('ActiveBooking - API URL:', `http://localhost:8000/api/bookings/active/${id}/`);
      
      const response = await fetch(`http://localhost:8000/api/bookings/active/${id}/`);
      
      console.log('ActiveBooking - Response status:', response.status);
      console.log('ActiveBooking - Response ok:', response.ok);
      
      const data = await response.json();
      console.log('ActiveBooking - API Response data:', data);

      if (response.ok) {
        // The API returns nested structure with booking_details
        const bookingDetails = data.booking_details || data;
        setBookingData(bookingDetails);
        console.log('ActiveBooking - Booking data set:', bookingDetails);
        
        // Check if booking status is no longer active
        // If it changed status, redirect to the appropriate page
        if (bookingDetails.status && bookingDetails.status !== 'active') {
          console.log('Booking status changed to:', bookingDetails.status);
          setTimeout(() => {
            switch (bookingDetails.status) {
              case 'rescheduled':
                history.replace(`/client/rescheduled-booking/${id}`);
                break;
              case 'completed':
                history.replace(`/client/completed-booking/${id}`);
                break;
              case 'cancelled':
                history.replace(`/client/cancelled-booking/${id}`);
                break;
              case 'dispute':
                history.replace(`/client/disputed-booking/${id}`);
                break;
              default:
                // Stay on current page
                break;
            }
          }, 100);
        }
      } else {
        setError(data.error || 'Failed to load booking details');
        console.error('ActiveBooking - API Error:', data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network error: ${errorMessage}`);
      console.error('ActiveBooking - Fetch error:', err);
      console.error('ActiveBooking - Error details:', {
        message: errorMessage,
        bookingId: id
      });
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="active-booking-content">
          <div className="loading-container">
            <div className="loading-message">Loading booking details...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Show error state
  if (error || !bookingData) {
    return (
      <IonPage>
        <IonContent className="active-booking-content">
          <div className="error-container">
            <div className="error-message">{error || 'Booking not found'}</div>
            <button className="retry-button" onClick={fetchBookingDetails}>
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="active-booking-content" style={{ paddingBottom: '20px' }}>
        <div className="active-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="active-booking-title">Active Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge">
              <span className="booking-id">#BK-{bookingData.booking_id}</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">{bookingData.provider_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact number:</span>
                <span className="detail-value">{bookingData.provider_contact || 'Not available'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">{bookingData.service_details?.service_name || bookingData.request_summary}</span>
              </div>
              {bookingData.service_details?.includes && (
                <div className="detail-row">
                  <span className="detail-label">Includes:</span>
                  <span className="detail-value">{bookingData.service_details.includes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">{bookingData.service_details?.addons || 'None'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">{formatDate(bookingData.booked_at)}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="accordion-header" onClick={toggleLocation}>
                <span className="accordion-title">Service Location</span>
                <span className={`material-icons-round accordion-icon ${isLocationOpen ? 'open' : ''}`}>
                  expand_more
                </span>
              </div>
              {isLocationOpen && (
                <div className="accordion-content">
                  <div className="location-grid">
                    {bookingData.location?.house_number && (
                      <div className="location-item">
                        <span className="location-label">House/Building No:</span>
                        <span className="location-value">{bookingData.location.house_number}</span>
                      </div>
                    )}
                    {bookingData.location?.street_name && (
                      <div className="location-item">
                        <span className="location-label">Street Name:</span>
                        <span className="location-value">{bookingData.location.street_name}</span>
                      </div>
                    )}
                    {bookingData.location?.subdivision && (
                      <div className="location-item">
                        <span className="location-label">Subdivision/Village:</span>
                        <span className="location-value">{bookingData.location.subdivision}</span>
                      </div>
                    )}
                    {bookingData.location?.barangay && (
                      <div className="location-item">
                        <span className="location-label">Barangay:</span>
                        <span className="location-value">{bookingData.location.barangay}</span>
                      </div>
                    )}
                    {bookingData.location?.city && (
                      <div className="location-item">
                        <span className="location-label">City/Municipality:</span>
                        <span className="location-value">{bookingData.location.city}</span>
                      </div>
                    )}
                    {bookingData.location?.province && (
                      <div className="location-item">
                        <span className="location-label">Province:</span>
                        <span className="location-value">{bookingData.location.province}</span>
                      </div>
                    )}
                    {bookingData.location?.region && (
                      <div className="location-item">
                        <span className="location-label">Region:</span>
                        <span className="location-value">{bookingData.location.region}</span>
                      </div>
                    )}
                    {bookingData.location?.postal_code && (
                      <div className="location-item">
                        <span className="location-label">Postal Code:</span>
                        <span className="location-value">{bookingData.location.postal_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Service time:</span>
                <span className="detail-value">{bookingData.service_time ? formatDate(bookingData.service_time) : 'To be scheduled'}</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            {bookingData.payment_info && (
              <>
                <div className="booking-section payment-section">
                  <h3 className="section-title">Payment Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`payment-status-badge ${bookingData.payment_info.payment_status}`}>
                      {bookingData.payment_info.payment_status_display}
                    </span>
                  </div>
                  {bookingData.payment_info.payment_method && (
                    <div className="detail-row">
                      <span className="detail-label">Payment Method:</span>
                      <span className="detail-value">{bookingData.payment_info.payment_method_display}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Amount Paid:</span>
                    <span className="detail-value">₱{parseFloat(bookingData.payment_info.amount_paid).toFixed(2)}</span>
                  </div>
                  {parseFloat(bookingData.payment_info.remaining_balance) > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Remaining Balance:</span>
                      <span className="detail-value amount-due">₱{parseFloat(bookingData.payment_info.remaining_balance).toFixed(2)}</span>
                    </div>
                  )}
                  {bookingData.payment_info.payment_date && (
                    <div className="detail-row">
                      <span className="detail-label">Payment Date:</span>
                      <span className="detail-value">{formatDate(bookingData.payment_info.payment_date)}</span>
                    </div>
                  )}
                  {bookingData.payment_info.reference_number && (
                    <div className="detail-row">
                      <span className="detail-label">Reference Number:</span>
                      <span className="detail-value">{bookingData.payment_info.reference_number}</span>
                    </div>
                  )}
                </div>
                <div className="booking-divider"></div>
              </>
            )}

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱{typeof bookingData.amount_fee === 'string' ? parseFloat(bookingData.amount_fee).toFixed(2) : bookingData.amount_fee.toFixed(2)}</span>
            </div>
          </div>

          {(!bookingData.payment_info || bookingData.payment_info.payment_status === 'unpaid' || 
            (bookingData.payment_info.payment_status === 'advance_paid' && parseFloat(bookingData.payment_info.remaining_balance) > 0)) && (
            <button className="btn-submit-payment" onClick={handlePayment}>
              <span className="material-icons-round icon-sm">payment</span>
              {bookingData.payment_info?.payment_status === 'advance_paid' ? 'Pay Remaining Balance' : 'Submit Payment'}
            </button>
          )}

          <div className="action-buttons">
            <button className="btn-cancel" onClick={handleCancel}>
              <span className="material-icons-round icon-sm">close</span>
              Cancel
            </button>
            <button className="btn-reschedule" onClick={handleReschedule}>
              <span className="material-icons-round icon-sm">event</span>
              Reschedule
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ActiveBooking;
