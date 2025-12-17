import React from 'react';
import { useHistory } from 'react-router-dom';
import './Wallet.css';

interface WalletProps {
  className?: string;
}

const Wallet: React.FC<WalletProps> = ({ className = '' }) => {
  const history = useHistory();

  // Mock wallet data - in real app this would come from API/state
  const tokenBalance = 250; // Mock balance

  const goToTopUp = () => {
    history.push('/mechanic/wallet/topup');
  };

  return (
    <button
      className={`mechanic-wallet ${className}`}
      onClick={goToTopUp}
    >
      <div className="wallet-icon">
        <span className="material-icons-round">account_balance_wallet</span>
      </div>
      <div className="wallet-info">
        <div className="wallet-label">Tokens</div>
        <div className="wallet-balance">₱{tokenBalance.toLocaleString()}</div>
      </div>
      <div className="wallet-arrow">
        <span className="material-icons-round">chevron_right</span>
      </div>
    </button>
  );
};

export default Wallet;