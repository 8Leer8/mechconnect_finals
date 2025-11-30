import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './QuotedRequest.css';

interface QuoteItem {
  id: string;
  item: string;
  price: number;
}

const QuotedRequest: React.FC = () => {
  const history = useHistory();

  const quoteItems: QuoteItem[] = [
    { id: '1', item: 'Engine Oil Change', price: 800.00 },
    { id: '2', item: 'Oil Filter Replacement', price: 300.00 },
    { id: '3', item: 'Labor', price: 500.00 },
    { id: '4', item: 'Service Fee', price: 200.00 }
  ];

  const total = quoteItems.reduce((sum, item) => sum + item.price, 0);

  const goBack = () => {
    history.goBack();
  };

  const handleAccept = () => {
    console.log('Accept quote');
  };

  const handleReject = () => {
    console.log('Reject quote');
  };

  const handleCounterQuote = () => {
    history.push('/client/counter-offer-form');
  };

  return (
    <IonPage>
      <IonContent className="quoted-request-content">
        <div className="quoted-request-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="quoted-request-title">Quoted Request</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="request-container">
          <div className="request-card">
            <div className="request-id-badge quoted">
              <span className="request-id">#REQ-1848</span>
            </div>

            <div className="request-section">
              <div className="detail-row">
                <span className="detail-label">Send to:</span>
                <span className="detail-value provider-name">Precision Service</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Provider type:</span>
                <span className="detail-value">Shop</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Requested at:</span>
                <span className="detail-value">Nov 25, 2025 - 1:45 PM</span>
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="request-section">
              <div className="response-badge">
                <span className="material-icons-round icon-sm">chat_bubble</span>
                <span>Response: Shop</span>
              </div>

              <h3 className="section-title">Quoted Item List</h3>
              
              <div className="quote-table">
                <div className="quote-table-header">
                  <span className="quote-header-item">Item</span>
                  <span className="quote-header-price">Price</span>
                </div>
                {quoteItems.map((item) => (
                  <div key={item.id} className="quote-row">
                    <span className="quote-item-name">{item.item}</span>
                    <span className="quote-item-price">₱{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="request-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-accept" onClick={handleAccept}>
              <span className="material-icons-round icon-sm">check_circle</span>
              Accept
            </button>
            <button className="btn-reject" onClick={handleReject}>
              <span className="material-icons-round icon-sm">cancel</span>
              Reject
            </button>
            <button className="btn-counter" onClick={handleCounterQuote}>
              <span className="material-icons-round icon-sm">edit</span>
              Counter Quote
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuotedRequest;
