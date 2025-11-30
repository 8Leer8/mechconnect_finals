import { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

const Signup: React.FC = () => {
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  
  // Step 1: Basic Info (matching backend Account model)
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Step 2: Personal Info
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Step 3: Address
  const [houseBuildingNumber, setHouseBuildingNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [subdivisionVillage, setSubdivisionVillage] = useState('');
  const [barangay, setBarangay] = useState('');
  const [cityMunicipality, setCityMunicipality] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Step 4: Account
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 5: Verification (simplified - just success message)
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!firstname || !lastname || !email) {
          setToastMessage('Please fill in required fields: First name, Last name, and Email');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setToastMessage('Please enter a valid email address');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        break;
      case 2:
        if (!dateOfBirth) {
          setToastMessage('Please enter your date of birth');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        break;
      case 4:
        if (!username || !password || !confirmPassword) {
          setToastMessage('Please fill in all account fields');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        if (password !== confirmPassword) {
          setToastMessage('Passwords do not match');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        if (password.length < 8) {
          setToastMessage('Password must be at least 8 characters long');
          setToastColor('danger');
          setShowToast(true);
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 5) setStep(step + 1);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const signupData = {
        // Account fields (matching backend model)
        lastname: lastname,
        firstname: firstname,
        middlename: middlename || '', // Optional field
        email: email,
        date_of_birth: dateOfBirth || null,
        gender: gender || '',
        username: username,
        password: password,
        password_confirm: confirmPassword,
        role: 'client', // Default role
        
        // Address fields (optional)
        house_building_number: houseBuildingNumber,
        street_name: streetName,
        subdivision_village: subdivisionVillage,
        barangay: barangay,
        city_municipality: cityMunicipality,
        province: province,
        region: region,
        postal_code: postalCode,
        
        // Profile fields
        contact_number: contactNumber,
      };

      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        setToastMessage('Account created successfully!');
        setToastColor('success');
        setShowToast(true);
        setRegistrationComplete(true);
        
        setTimeout(() => {
          history.push('/login');
        }, 2000);
      } else {
        let errorMessage = 'Registration failed. Please try again.';
        if (data.details) {
          // Extract specific error messages
          const errors = [];
          for (const field in data.details) {
            if (data.details[field] && Array.isArray(data.details[field])) {
              errors.push(`${field}: ${data.details[field][0]}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join(', ');
          }
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        setToastMessage(errorMessage);
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
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

          <div className="signup-steps">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`step-indicator ${step >= s ? 'active' : ''}`} />
            ))}
          </div>

          <div className="auth-form">
            {step === 1 && (
              <>
                <div className="input-container">
                  <IonInput
                    value={firstname}
                    onIonInput={(e) => setFirstname(e.detail.value!)}
                    placeholder="Firstname *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={lastname}
                    onIonInput={(e) => setLastname(e.detail.value!)}
                    placeholder="Lastname *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={middlename}
                    onIonInput={(e) => setMiddlename(e.detail.value!)}
                    placeholder="Middlename (optional)"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    placeholder="Email *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    type="tel"
                    value={contactNumber}
                    onIonInput={(e) => setContactNumber(e.detail.value!)}
                    placeholder="Contact Number"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="input-container">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      color: '#374151',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-container">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      color: '#374151',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="input-container">
                  <IonInput
                    value={houseBuildingNumber}
                    onIonInput={(e) => setHouseBuildingNumber(e.detail.value!)}
                    placeholder="House/Building Number"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={streetName}
                    onIonInput={(e) => setStreetName(e.detail.value!)}
                    placeholder="Street Name"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={subdivisionVillage}
                    onIonInput={(e) => setSubdivisionVillage(e.detail.value!)}
                    placeholder="Subdivision/Village"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={barangay}
                    onIonInput={(e) => setBarangay(e.detail.value!)}
                    placeholder="Barangay"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={cityMunicipality}
                    onIonInput={(e) => setCityMunicipality(e.detail.value!)}
                    placeholder="City/Municipality"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={province}
                    onIonInput={(e) => setProvince(e.detail.value!)}
                    placeholder="Province"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={region}
                    onIonInput={(e) => setRegion(e.detail.value!)}
                    placeholder="Region"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={postalCode}
                    onIonInput={(e) => setPostalCode(e.detail.value!)}
                    placeholder="Postal Code"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="input-container">
                  <IonInput
                    value={username}
                    onIonInput={(e) => setUsername(e.detail.value!)}
                    placeholder="Username"
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

            {step === 5 && (
              <>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  {registrationComplete ? (
                    <>
                      <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>✓</div>
                      <h3 style={{ color: '#10b981', marginBottom: '8px' }}>Registration Complete!</h3>
                      <p style={{ color: '#64748b' }}>Your account has been created successfully. Redirecting to login...</p>
                    </>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: '16px' }}>Review & Complete</h3>
                      <p style={{ color: '#64748b', marginBottom: '20px' }}>
                        Please review your information and click "Create Account" to complete your registration.
                      </p>
                    </>
                  )}
                </div>
              </>
            )}

            <IonButton
              expand="block"
              onClick={step === 5 ? handleSignup : handleNext}
              className="auth-button"
              disabled={loading || registrationComplete}
            >
              {loading ? 'Creating Account...' : step === 5 ? 'Create Account' : 'Next'}
            </IonButton>

            <div className="auth-footer">
              <IonText className="auth-link-text">
                Already have an account?{' '}
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
        
        <IonLoading isOpen={loading} message="Creating your account..." />
        
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

export default Signup;