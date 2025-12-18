import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './PaymentForm.css';

interface LocationState {
  bookingId: number;
  totalAmount: string;
  bookingDetails?: any;
}

interface PaymentData {
  payment_type: 'full' | 'advance';
  payment_method: string;
  amount_paid: string;
  payment_proof?: string;
  reference_number: string;
  notes?: string;
}

interface ExistingPayment {
  payment_id?: number;
  payment_status: string;
  total_amount: string;
  amount_paid: string;
  remaining_balance: string;
}

const PaymentForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { bookingId, totalAmount, bookingDetails } = location.state || {};

  const [existingPayment, setExistingPayment] = useState<ExistingPayment | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    payment_type: 'full',
    payment_method: 'gcash',
    amount_paid: '0',
    reference_number: '',
    notes: '',
  });

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing payment information
  useEffect(() => {
    if (!bookingId) {
      setError('Booking information not found');
      return;
    }

    const fetchPaymentInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/payments/booking/${bookingId}/`);
        const data = await response.json();
        
        setExistingPayment(data);
        
        // Set amount_paid to remaining balance by default
        const remainingBalance = data.remaining_balance || totalAmount || '0';
        setPaymentData(prev => ({
          ...prev,
          amount_paid: remainingBalance
        }));
      } catch (err) {
        console.error('Error fetching payment info:', err);
        // Fallback to totalAmount if fetch fails
        setPaymentData(prev => ({
          ...prev,
          amount_paid: totalAmount || '0'
        }));
      }
    };

    fetchPaymentInfo();
  }, [bookingId, totalAmount]);

  const goBack = () => {
    history.goBack();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));

    // Auto-set amount for full payment (use remaining balance)
    if (name === 'payment_type' && value === 'full') {
      const remainingBalance = existingPayment?.remaining_balance || totalAmount || '0';
      setPaymentData(prev => ({ ...prev, amount_paid: remainingBalance }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!paymentData.reference_number.trim()) {
      setError('Please enter a reference number');
      return;
    }

    if (!paymentData.amount_paid || parseFloat(paymentData.amount_paid) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const remainingBalance = parseFloat(existingPayment?.remaining_balance || totalAmount);
    if (parseFloat(paymentData.amount_paid) > remainingBalance) {
      setError(`Amount paid cannot exceed remaining balance (₱${remainingBalance.toFixed(2)})`);
      return;
    }

    setLoading(true);

    try {
      // Get client ID from user object
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const clientId = userData?.acc_id || userData?.account_id;
      
      if (!clientId) {
        setError('User session not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Compress image if provided
      let paymentProof = null;
      if (proofFile) {
        paymentProof = await compressImage(proofFile);
      }

      // Check if this is an additional payment or first payment
      const isAdditionalPayment = existingPayment && existingPayment.payment_id && existingPayment.payment_status === 'advance_paid';
      
      if (isAdditionalPayment) {
        // Update existing payment by adding to amount_paid
        const newTotalPaid = parseFloat(existingPayment.amount_paid) + parseFloat(paymentData.amount_paid);
        
        const payload = {
          amount_paid: newTotalPaid.toString(),
          payment_proof: paymentProof,
          reference_number: paymentData.reference_number,
          notes: paymentData.notes,
          payment_method: paymentData.payment_method,
        };

        const response = await fetch(`http://localhost:8000/api/payments/${existingPayment.payment_id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          const isFullyPaid = newTotalPaid >= parseFloat(existingPayment.total_amount);
          alert(isFullyPaid ? 'Payment completed! Booking is now fully paid.' : 'Additional payment submitted successfully!');
          history.push('/client/booking');
        } else {
          setError(data.error || 'Failed to submit payment');
        }
      } else {
        // Create new payment
        const payload = {
          booking_id: bookingId,
          paid_by_id: clientId,
          ...paymentData,
          payment_proof: paymentProof,
        };

        const response = await fetch('http://localhost:8000/api/payments/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Payment submitted successfully!');
          history.push('/client/booking');
        } else {
          setError(data.error || Object.values(data).flat().join(', ') || 'Failed to submit payment');
        }
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <IonPage>
        <IonContent className="payment-form-content">
          <div className="error-container">
            <div className="error-message">{error || 'Invalid booking information'}</div>
            <button className="btn-back" onClick={() => history.push('/client/bookings')}>
              Go to Bookings
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="payment-form-content">
        <div className="payment-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="payment-form-title">Submit Payment</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="payment-container">
          <div className="booking-info-card">
            <h3>Booking Information</h3>
            <div className="info-row">
              <span className="info-label">Booking ID:</span>
              <span className="info-value">#BK-{bookingId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value total">₱{parseFloat(existingPayment?.total_amount || totalAmount).toFixed(2)}</span>
            </div>
            {existingPayment && existingPayment.payment_status !== 'unpaid' && (
              <>
                <div className="info-row">
                  <span className="info-label">Payment Status:</span>
                  <span className={`info-value status-${existingPayment.payment_status}`}>
                    {existingPayment.payment_status === 'advance_paid' ? 'Advance Paid' : 
                     existingPayment.payment_status === 'fully_paid' ? 'Fully Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Already Paid:</span>
                  <span className="info-value">₱{parseFloat(existingPayment.amount_paid).toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Remaining Balance:</span>
                  <span className="info-value remaining">₱{parseFloat(existingPayment.remaining_balance).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <form className="payment-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-banner">
                <span className="material-icons-round">error</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="payment_type">Payment Type</label>
              <select
                id="payment_type"
                name="payment_type"
                value={paymentData.payment_type}
                onChange={handleInputChange}
                required
              >
                <option value="full">Full Payment</option>
                <option value="advance">Advance Payment</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="payment_method">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                value={paymentData.payment_method}
                onChange={handleInputChange}
                required
              >
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash on Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount_paid">Amount to Pay</label>
              <input
                type="number"
                id="amount_paid"
                name="amount_paid"
                value={paymentData.amount_paid}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max={existingPayment?.remaining_balance || totalAmount}
                required
              />
              <small className="hint">
                {existingPayment?.payment_status === 'advance_paid'
                  ? `Remaining balance: ₱${parseFloat(existingPayment.remaining_balance).toFixed(2)}`
                  : paymentData.payment_type === 'advance' 
                    ? 'Enter the advance payment amount' 
                    : `Full payment: ₱${parseFloat(existingPayment?.remaining_balance || totalAmount).toFixed(2)}`}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="reference_number">Reference Number *</label>
              <input
                type="text"
                id="reference_number"
                name="reference_number"
                value={paymentData.reference_number}
                onChange={handleInputChange}
                placeholder="e.g., GCASH-123456789"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="payment_proof">Payment Proof (Optional)</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="payment_proof"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="payment_proof" className="file-upload-label">
                  <span className="material-icons-round">cloud_upload</span>
                  {proofFile ? proofFile.name : 'Upload Screenshot or Photo'}
                </label>
              </div>
              {proofPreview && (
                <div className="image-preview">
                  <img src={proofPreview} alt="Payment proof preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview(null);
                    }}
                  >
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={paymentData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes..."
              />
            </div>

            <button type="submit" className="btn-submit-payment" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-icons-round">payment</span>
                  Submit Payment
                </>
              )}
            </button>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentForm;
