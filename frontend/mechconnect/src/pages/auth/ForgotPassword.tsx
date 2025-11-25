import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  const handleNext = async () => {
    if (step === 1) {
      // Request password reset
      if (!email) {
        setToastMessage('Please enter your email address');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/password/reset/request/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setToastMessage('Password reset instructions sent to your email!');
          setToastColor('success');
          setShowToast(true);
          
          // For development, the token is returned in response
          if (data.reset_token) {
            setResetToken(data.reset_token);
          }
          
          setTimeout(() => {
            setStep(2);
          }, 1500);
        } else {
          setToastMessage(data.error || 'Failed to send reset instructions');
          setToastColor('danger');
          setShowToast(true);
        }
      } catch (error) {
        console.error('Password reset request error:', error);
        setToastMessage('Network error. Please try again.');
        setToastColor('danger');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!resetToken) {
        setToastMessage('Please enter the reset token from your email');
        setToastColor('danger');
        setShowToast(true);
        return;
      }
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    if (!newPassword || !confirmPassword) {
      setToastMessage('Please fill in all fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMessage('Passwords do not match');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (newPassword.length < 8) {
      setToastMessage('Password must be at least 8 characters long');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage('Password reset successful!');
        setToastColor('success');
        setShowToast(true);
        
        setTimeout(() => {
          history.push('/login');
        }, 2000);
      } else {
        setToastMessage(data.error || 'Failed to reset password');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Password reset confirm error:', error);
      setToastMessage('Network error. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent className="auth-content">
        <div className="auth-container">
          <div className="auth-logo">
            <img src="/src/assets/images/mechlogo.png" alt="MechConnect Logo" />
          </div>
          
          <h1 className="auth-title">MechConnect</h1>

          <div className="auth-form">
            {step === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3>Forgot Password?</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>
                <div className="input-container">
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    placeholder="Email"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3>Enter Reset Token</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    We've sent a reset token to your email. Enter it below to proceed.
                  </p>
                  {/* For development - show the token */}
                  {resetToken && (
                    <p style={{ color: '#10b981', fontSize: '12px', backgroundColor: '#f0f9ff', padding: '8px', borderRadius: '4px' }}>
                      Dev mode: {resetToken}
                    </p>
                  )}
                </div>
                <div className="input-container">
                  <IonInput
                    type="text"
                    value={resetToken}
                    onIonInput={(e) => setResetToken(e.detail.value!)}
                    placeholder="Enter reset token"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="input-container">
                  <IonInput
                    type="password"
                    value={newPassword}
                    onIonInput={(e) => setNewPassword(e.detail.value!)}
                    placeholder="New Password"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    placeholder="Confirm Password"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            <IonButton
              expand="block"
              onClick={step === 3 ? handleConfirm : handleNext}
              className="auth-button"
              disabled={loading}
            >
              {loading 
                ? (step === 1 ? 'Sending...' : step === 3 ? 'Resetting...' : 'Processing...') 
                : (step === 3 ? 'Reset Password' : step === 1 ? 'Send Reset Token' : 'Next')
              }
            </IonButton>

            <div className="auth-footer">
              <IonText className="auth-link-text">
                Remember your password?{' '}
                <button 
                  type="button"
                  className="auth-link" 
                  onClick={goToLogin}
                >
                  Login
                </button>
              </IonText>
            </div>
          </div>
        </div>
        
        <IonLoading isOpen={loading} message="Processing..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={4000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
