import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const ForgotPassword: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [code3, setCode3] = useState('');
  const [code4, setCode4] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleConfirm = () => {
    // TODO: Implement password reset logic
    console.log('Password reset complete');
    history.push('/login');
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
                <div className="code-inputs">
                  <IonInput
                    type="number"
                    maxlength={1}
                    value={code1}
                    onIonInput={(e) => setCode1(e.detail.value!)}
                    className="code-input auth-input"
                  />
                  <IonInput
                    type="number"
                    maxlength={1}
                    value={code2}
                    onIonInput={(e) => setCode2(e.detail.value!)}
                    className="code-input auth-input"
                  />
                  <IonInput
                    type="number"
                    maxlength={1}
                    value={code3}
                    onIonInput={(e) => setCode3(e.detail.value!)}
                    className="code-input auth-input"
                  />
                  <IonInput
                    type="number"
                    maxlength={1}
                    value={code4}
                    onIonInput={(e) => setCode4(e.detail.value!)}
                    className="code-input auth-input"
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
            >
              {step === 3 ? 'Confirm' : 'Next'}
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
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;