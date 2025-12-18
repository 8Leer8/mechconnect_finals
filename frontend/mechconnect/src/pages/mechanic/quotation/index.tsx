import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './Quotation.css';

interface JobData {
  request_id: number;
  status: string;
  request_summary: string;
  request_type: string;
  created_at: string;
  client_name: string;
  service_location?: string;
  custom_request?: {
    problem_description?: string;
    preferred_date?: string;
    preferred_time?: string;
  };
  direct_request?: {
    service_name?: string;
    service_price?: number;
  };
}

interface QuotationItem {
  item: string;
  price: string;
}

const Quotation: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ job?: JobData }>();
  const job = location.state?.job;

  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([
    { item: '', price: '' }
  ]);
  const [providersNote, setProvidersNote] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const goBack = () => history.goBack();
  const goToNotifications = () => history.push('/mechanic/notifications');
  const handleCancel = () => history.goBack();

  // Add new quotation item
  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, { item: '', price: '' }]);
  };

  // Remove quotation item
  const removeQuotationItem = (index: number) => {
    if (quotationItems.length > 1) {
      const newItems = quotationItems.filter((_, i) => i !== index);
      setQuotationItems(newItems);
    }
  };

  // Update quotation item
  const updateQuotationItem = (index: number, field: 'item' | 'price', value: string) => {
    const newItems = [...quotationItems];
    newItems[index][field] = value;
    setQuotationItems(newItems);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return quotationItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + price;
    }, 0);
  };

  // Check if form is valid
  const isFormValid = () => {
    const validItems = quotationItems.filter(item => item.item.trim() && item.price.trim());
    return validItems.length > 0;
  };

  // Submit quotation
  const handleSubmitQuotation = async () => {
    if (!job) {
      setToastMessage('Job data not found');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    // Validate items
    const validItems = quotationItems.filter(item => item.item.trim() && item.price.trim());
    
    if (validItems.length === 0) {
      setToastMessage('Please add at least one item with a price');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setSubmittingQuote(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required. Please login.');
        setToastColor('danger');
        setShowToast(true);
        setSubmittingQuote(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/requests/${job.request_id}/quote/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoted_items: validItems.map(item => ({
            item: item.item,
            price: item.price
          })),
          providers_note: providersNote
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quotation');
      }

      setToastMessage('Quotation submitted successfully!');
      setToastColor('success');
      setShowToast(true);
      
      // Navigate back to jobs page with quotation filter after a short delay
      setTimeout(() => {
        history.push('/mechanic/jobs?filter=quotation');
      }, 1500);

    } catch (error: any) {
      console.error('Error submitting quotation:', error);
      setToastMessage(error.message || 'Failed to submit quotation');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setSubmittingQuote(false);
    }
  };

  // If no job data, show error
  if (!job) {
    return (
      <IonPage>
        <IonContent className="quotation-content">
          {/* Clean Header */}
          <div className="quotation-header">
            <button className="header-back-btn" onClick={goBack}>
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="header-title">Create Quotation</h1>
            <div className="header-actions">
              <Wallet />
              <button className="header-icon-btn" onClick={goToNotifications}>
                <span className="material-icons-round">notifications</span>
              </button>
            </div>
          </div>

          <div className="error-state">
            <span className="material-icons-round error-state-icon">error_outline</span>
            <p className="error-state-text">Job data not found</p>
            <button className="error-state-btn" onClick={goBack}>
              Go Back
            </button>
          </div>
        </IonContent>
        <BottomNavMechanic />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="quotation-content" scrollY>
        {/* Clean Header - Consistent with other pages */}
        <div className="quotation-header">
          <button className="header-back-btn" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="header-title">Create Quotation</h1>
          <div className="header-actions">
            <Wallet />
            <button className="header-icon-btn" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="quotation-container">
          
          {/* Section 1: Request Info Card - Simplified without expandable details */}
          <section className="quotation-card">
            <div className="request-info-header">
              <div className="client-details">
                <h2 className="client-name">{job.client_name}</h2>
                <span className="request-meta">Request #{job.request_id}</span>
              </div>
              <span className={`request-type-badge ${job.request_type.toLowerCase()}`}>
                {job.request_type}
              </span>
            </div>
            
            <p className="request-description">{job.request_summary}</p>

            {/* Show relevant details inline */}
            <div className="request-details-inline">
              {job.service_location && (
                <div className="detail-row">
                  <span className="material-icons-round detail-icon">location_on</span>
                  <span className="detail-text">{job.service_location}</span>
                </div>
              )}
              {job.direct_request?.service_name && (
                <div className="detail-row">
                  <span className="material-icons-round detail-icon">build</span>
                  <span className="detail-text">{job.direct_request.service_name}</span>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Quotation Items */}
          <section className="quotation-card">
            <div className="card-section-header">
              <span className="material-icons-round section-icon">receipt_long</span>
              <h3 className="section-title">Quotation Breakdown</h3>
            </div>

            {/* Column Headers */}
            <div className="items-header">
              <span className="items-header-label">Item / Service</span>
              <span className="items-header-label price-header">Price (₱)</span>
            </div>

            <div className="quotation-items-list">
              {quotationItems.map((item, index) => (
                <div key={index} className="quotation-item">
                  <div className="item-index">{index + 1}</div>
                  
                  <div className="item-inputs">
                    <input
                      type="text"
                      className="form-input item-description"
                      placeholder="e.g., Oil change, Brake pads"
                      value={item.item}
                      onChange={(e) => updateQuotationItem(index, 'item', e.target.value)}
                    />
                    
                    <input
                      type="number"
                      className="form-input price-input"
                      placeholder="0.00"
                      value={item.price}
                      onChange={(e) => updateQuotationItem(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {quotationItems.length > 1 && (
                    <button
                      className="remove-item-btn"
                      onClick={() => removeQuotationItem(index)}
                      aria-label="Remove item"
                    >
                      <span className="material-icons-round">close</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="add-item-btn" onClick={addQuotationItem}>
              <span className="material-icons-round">add</span>
              <span>Add Item</span>
            </button>

            {/* Total Row - Inside the card, simple style */}
            <div className="total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-amount">₱{calculateTotal().toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </section>

          {/* Section 3: Note for Client */}
          <section className="quotation-card">
            <div className="card-section-header">
              <span className="material-icons-round section-icon">note_alt</span>
              <h3 className="section-title">Note for Client</h3>
              <span className="optional-label">(Optional)</span>
            </div>
            
            <textarea
              className="note-textarea"
              placeholder="Add any additional notes, terms, or conditions for the client..."
              value={providersNote}
              onChange={(e) => setProvidersNote(e.target.value)}
              rows={3}
            />
          </section>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={submittingQuote}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmitQuotation}
              disabled={submittingQuote || !isFormValid()}
            >
              {submittingQuote ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span className="material-icons-round">send</span>
                  <span>Submit Quotation</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Toast for notifications */}
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

export default Quotation;
