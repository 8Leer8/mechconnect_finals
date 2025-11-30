import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './CounterOfferForm.css';

interface QuoteItem {
  id: string;
  item: string;
  originalPrice: number;
  counterPrice: string;
}

const CounterOfferForm: React.FC = () => {
  const history = useHistory();
  
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: '1', item: 'Engine Oil Change', originalPrice: 800.00, counterPrice: '800.00' },
    { id: '2', item: 'Oil Filter Replacement', originalPrice: 300.00, counterPrice: '300.00' },
    { id: '3', item: 'Labor', originalPrice: 500.00, counterPrice: '500.00' },
    { id: '4', item: 'Service Fee', originalPrice: 200.00, counterPrice: '200.00' }
  ]);

  const [reason, setReason] = useState<string>('');

  const goBack = () => history.goBack();

  const handlePriceChange = (id: string, value: string) => {
    setQuoteItems(items =>
      items.map(item =>
        item.id === id ? { ...item, counterPrice: value } : item
      )
    );
  };

  const calculateOriginalTotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.originalPrice, 0);
  };

  const calculateCounterTotal = () => {
    return quoteItems.reduce((sum, item) => sum + (parseFloat(item.counterPrice) || 0), 0);
  };

  const handleSubmit = () => {
    console.log('Submit counter offer');
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="counter-offer-content">
        {/* Header */}
        <div className="counter-offer-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Counter Offer</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <div className="form-card">
            {/* Request ID */}
            <div className="request-id-section">
              <span className="request-id-label">Request ID:</span>
              <span className="request-id-value">#REQ-1848</span>
            </div>

            <div className="form-divider"></div>

            {/* Provider Info */}
            <div className="detail-row">
              <span className="detail-label">Provider:</span>
              <span className="detail-value provider-name">Precision Service</span>
            </div>

            <div className="form-divider"></div>

            {/* Quote Items Table */}
            <div className="form-section">
              <h3 className="section-title">Edit Quote Items</h3>
              
              <div className="quote-edit-table">
                <div className="quote-table-header">
                  <span className="header-item">Item</span>
                  <span className="header-original">Original</span>
                  <span className="header-counter">Your Offer</span>
                </div>

                {quoteItems.map((item) => (
                  <div key={item.id} className="quote-edit-row">
                    <span className="item-name">{item.item}</span>
                    <span className="original-price">₱{item.originalPrice.toFixed(2)}</span>
                    <div className="counter-price-input">
                      <span className="currency-symbol">₱</span>
                      <input
                        type="number"
                        className="price-input"
                        value={item.counterPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-divider"></div>

            {/* Total Comparison */}
            <div className="total-comparison">
              <div className="total-row original">
                <span className="total-label">Original Total:</span>
                <span className="total-amount">₱{calculateOriginalTotal().toFixed(2)}</span>
              </div>
              <div className="total-row counter">
                <span className="total-label">Your Counter Offer:</span>
                <span className="total-amount">₱{calculateCounterTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="form-divider"></div>

            {/* Reason for Counter Offer */}
            <div className="form-section">
              <label className="form-label">Reason for Counter Offer</label>
              <textarea
                className="form-textarea"
                placeholder="Please explain why you're proposing a different price..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="btn-submit-counter" onClick={handleSubmit}>
            <span className="material-icons-round icon-sm">send</span>
            Send Counter Offer
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CounterOfferForm;
