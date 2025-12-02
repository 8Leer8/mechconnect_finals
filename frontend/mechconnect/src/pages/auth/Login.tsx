import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage('Please fill in all fields');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, 
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage('Login successful!');
        setToastColor('success');
        setShowToast(true);
        
        // Store authentication token
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('authToken', data.token);
        }
        
        // Store user data if needed
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Navigate to client home page
        setTimeout(() => {
          history.push('/client/home');
        }, 1000);
      } else {
        setToastMessage(data.error || 'Login failed. Please check your credentials.');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setToastMessage('Network error. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
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
        
        <IonLoading isOpen={loading} message="Logging in..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;