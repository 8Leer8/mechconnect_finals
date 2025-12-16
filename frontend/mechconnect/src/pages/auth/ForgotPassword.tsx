import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading, IonToast, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { checkmarkCircle } from 'ionicons/icons';
import './Login.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState(1); // 1: Email, 2: Code verification, 3: New password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  // Step 1: Send OTP to email
  const handleSendCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setToastMessage('Please enter a valid email address');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/password/reset/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage('Password reset code sent to your email!');
        setToastColor('success');
        setShowToast(true);
        setTimeout(() => setStep(2), 1500);
      } else {
        setToastMessage(data.error || 'Failed to send reset code');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Send code error:', error);
      setToastMessage('Network error. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setToastMessage('Please enter a valid 6-digit code');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/password/reset/verify-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeVerified(true);
        setToastMessage('Code verified successfully! ✓');
        setToastColor('success');
        setShowToast(true);
        setTimeout(() => setStep(3), 1500);
      } else {
        setToastMessage(data.error || 'Invalid verification code');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setToastMessage('Network error. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: newPassword,
          password_confirm: confirmPassword,
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
      console.error('Password reset error:', error);
      setToastMessage('Network error. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/password/reset/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationCode('');
        setToastMessage('New code sent to your email!');
        setToastColor('success');
        setShowToast(true);
      } else {
        setToastMessage(data.error || 'Failed to resend code');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Resend code error:', error);
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
                    Enter your email address and we'll send you a 6-digit verification code.
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
                <IonButton
                  expand="block"
                  onClick={handleSendCode}
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </IonButton>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3>Enter Verification Code</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    We sent a 6-digit code to {email}
                  </p>
                </div>
                <div className="input-container" style={{ position: 'relative' }}>
                  <IonInput
                    type="text"
                    value={verificationCode}
                    onIonInput={(e) => {
                      const value = e.detail.value || '';
                      if (/^\d{0,6}$/.test(value)) {
                        setVerificationCode(value);
                      }
                    }}
                    placeholder="Enter 6-digit code"
                    maxlength={6}
                    className="auth-input"
                    style={{ paddingRight: isCodeVerified ? '40px' : '12px' }}
                  />
                  {isCodeVerified && (
                    <IonIcon
                      icon={checkmarkCircle}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '24px',
                        color: '#28a745'
                      }}
                    />
                  )}
                </div>
                <IonButton
                  expand="block"
                  onClick={handleVerifyCode}
                  className="auth-button"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </IonButton>
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={handleResendCode}
                  style={{ marginTop: '8px', fontSize: '14px' }}
                  disabled={loading}
                >
                  Resend Code
                </IonButton>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3>Create New Password</h3>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    Enter your new password below
                  </p>
                </div>
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
                <IonButton
                  expand="block"
                  onClick={handleResetPassword}
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </IonButton>
              </>
            )}

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