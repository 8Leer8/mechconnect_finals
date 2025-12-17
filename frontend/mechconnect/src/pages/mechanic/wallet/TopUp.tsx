import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonCard, IonCardContent, IonItem, IonLabel, IonRadioGroup, IonRadio, IonButton, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import './WalletTopUp.css';

interface TopUpOption {
  amount: number;
  tokens: number;
  bonus?: number;
}

const WalletTopUp: React.FC = () => {
  const history = useHistory();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mock current balance
  const currentBalance = 250;

  // Top-up options with bonus tokens
  const topUpOptions: TopUpOption[] = [
    { amount: 500, tokens: 500 },
    { amount: 1000, tokens: 1000, bonus: 50 },
    { amount: 2000, tokens: 2000, bonus: 150 },
    { amount: 5000, tokens: 5000, bonus: 500 },
    { amount: 10000, tokens: 10000, bonus: 1500 },
  ];

  const handleTopUp = async () => {
    if (!selectedAmount) {
      setToastMessage('Please select a top-up amount');
      setShowToast(true);
      return;
    }

    try {
      // In a real app, this would integrate with payment gateway
      // For now, just show success message
      setToastMessage(`Successfully topped up ₱${selectedAmount}! Tokens will be added to your wallet.`);
      setShowToast(true);

      // Redirect back to home after a delay
      setTimeout(() => {
        history.push('/mechanic/home');
      }, 2000);
    } catch (error) {
      console.error('Top-up error:', error);
      setToastMessage('Top-up failed. Please try again.');
      setShowToast(true);
    }
  };

  const selectedOption = topUpOptions.find(option => option.amount === selectedAmount);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/mechanic/home" />
          </IonButtons>
          <IonTitle>Top Up Tokens</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="wallet-topup-content">
        {/* Current Balance */}
        <div className="wallet-balance-card">
          <div className="balance-header">
            <span className="material-icons-round balance-icon">account_balance_wallet</span>
            <span className="balance-label">Current Balance</span>
          </div>
          <div className="balance-amount">₱{currentBalance.toLocaleString()}</div>
          <div className="balance-subtitle">Available Tokens</div>
        </div>

        {/* Commission Info */}
        <IonCard className="commission-info-card">
          <IonCardContent>
            <div className="commission-header">
              <span className="material-icons-round commission-icon">info</span>
              <h3>Token System</h3>
            </div>
            <div className="commission-details">
              <p>• Tokens are required to receive job orders</p>
              <p>• 10% commission deducted from each job in tokens</p>
              <p>• 1 token = ₱1 (Philippine Peso)</p>
              <p>• Bonus tokens awarded on larger top-ups</p>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Top-up Options */}
        <div className="topup-section">
          <h3 className="section-title">Select Top-up Amount</h3>

          <IonRadioGroup
            value={selectedAmount}
            onIonChange={(e) => setSelectedAmount(e.detail.value)}
          >
            {topUpOptions.map((option) => (
              <IonItem key={option.amount} className="topup-option">
                <IonLabel>
                  <div className="option-content">
                    <div className="option-main">
                      <span className="option-amount">₱{option.amount.toLocaleString()}</span>
                      <span className="option-tokens">{option.tokens.toLocaleString()} tokens</span>
                    </div>
                    {option.bonus && (
                      <div className="option-bonus">
                        <span className="bonus-badge">+{option.bonus} bonus</span>
                      </div>
                    )}
                  </div>
                </IonLabel>
                <IonRadio slot="end" value={option.amount} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </div>

        {/* Summary */}
        {selectedOption && (
          <IonCard className="summary-card">
            <IonCardContent>
              <h4>Top-up Summary</h4>
              <div className="summary-row">
                <span>Amount:</span>
                <span>₱{selectedOption.amount.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Base Tokens:</span>
                <span>{selectedOption.tokens.toLocaleString()}</span>
              </div>
              {selectedOption.bonus && (
                <div className="summary-row bonus-row">
                  <span>Bonus Tokens:</span>
                  <span>+{selectedOption.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total Tokens:</span>
                <span>{(selectedOption.tokens + (selectedOption.bonus || 0)).toLocaleString()}</span>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Top-up Button */}
        <div className="topup-actions">
          <IonButton
            expand="block"
            size="large"
            onClick={handleTopUp}
            disabled={!selectedAmount}
            className="topup-button"
          >
            <span className="material-icons-round">payment</span>
            Top Up Now
          </IonButton>
        </div>
      </IonContent>

      {/* Toast */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastMessage.includes('Successfully') ? 'success' : 'danger'}
      />

      <BottomNavMechanic />
    </IonPage>
  );
};

export default WalletTopUp;