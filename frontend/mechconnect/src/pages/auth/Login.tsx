import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login:', { email, password });
  };

  const goToSignup = () => {
    history.push('/signup');
  };

  const goToForgotPassword = () => {
    history.push('/forgot-password');
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
            <div className="input-container">
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="Email"
                className="auth-input"
              />
            </div>

            <div className="input-container">
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                placeholder="Password"
                className="auth-input"
              />
            </div>

            <IonButton
              expand="block"
              onClick={handleLogin}
              className="auth-button"
            >
              Login
            </IonButton>

            <div className="auth-footer">
              <IonText className="auth-link-text">
                Don't have an account?{' '}
                <button 
                  type="button"
                  className="auth-link" 
                  onClick={goToSignup}
                >
                  Signup
                </button>
              </IonText>
            </div>

            <div className="auth-footer">
              <IonText className="auth-link-text">
                <button 
                  type="button"
                  className="auth-link" 
                  onClick={goToForgotPassword}
                >
                  Forgot Password?
                </button>
              </IonText>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;