import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonText, IonLoading, IonToast, IonIcon, IonSelect, IonSelectOption, IonSpinner } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { checkmarkCircle, createOutline } from 'ionicons/icons';
import './Login.css';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/accounts';

// Step labels for the signup flow
const STEP_LABELS = ['Name', 'Personal', 'Location', 'Email', 'Account', 'Review'];

// PSGC API Configuration (Official GitLab API)
const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

// Types for PSGC data
interface PSGCItem {
  code: string;
  name: string;
}

const Signup: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  
  // Step 1: Name
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middlename, setMiddlename] = useState('');
  
  // Step 2: Gender & Birthday
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Step 3: Location/Address
  const [houseBuildingNumber, setHouseBuildingNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [subdivisionVillage, setSubdivisionVillage] = useState('');
  const [barangay, setBarangay] = useState('');
  const [cityMunicipality, setCityMunicipality] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Step 4: Email Verification (BEFORE account creation)
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Step 5: Account Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 6: Overview & Registration
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // PSGC Location Data
  const [regionsList, setRegionsList] = useState<PSGCItem[]>([]);
  const [provincesList, setProvincesList] = useState<PSGCItem[]>([]);
  const [citiesList, setCitiesList] = useState<PSGCItem[]>([]);
  const [barangaysList, setBarangaysList] = useState<PSGCItem[]>([]);
  
  // Selected PSGC Codes (for cascading)
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  
  // PSGC Loading States
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Reset all form state when navigating to signup page
  useEffect(() => {
    // Reset form when component mounts or when navigating to /signup
    resetForm();
  }, [location.pathname]);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/regions/`);
        if (response.ok) {
          const data = await response.json();
          setRegionsList(data);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setRegionsList([]);
      } finally {
        setLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (!selectedRegionCode) {
      setProvincesList([]);
      return;
    }
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const url = `${PSGC_API_BASE}/regions/${selectedRegionCode}/provinces/`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProvincesList(data);
        } else {
          console.error('Failed to fetch provinces:', response.status);
          setProvincesList([]);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setProvincesList([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, [selectedRegionCode]);

  // Fetch cities/municipalities when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const url = `${PSGC_API_BASE}/provinces/${selectedProvinceCode}/cities-municipalities/`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCitiesList(data);
        } else {
          console.error('Failed to fetch cities:', response.status);
          setCitiesList([]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCitiesList([]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedProvinceCode]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (!selectedCityCode) {
      setBarangaysList([]);
      return;
    }
    const fetchBarangays = async () => {
      setLoadingBarangays(true);
      try {
        const url = `${PSGC_API_BASE}/cities-municipalities/${selectedCityCode}/barangays/`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setBarangaysList(data);
        } else {
          console.error('Failed to fetch barangays:', response.status);
          setBarangaysList([]);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
        setBarangaysList([]);
      } finally {
        setLoadingBarangays(false);
      }
    };
    fetchBarangays();
  }, [selectedCityCode]);

  // Handle region selection
  const handleRegionChange = (regionCode: string) => {
    const selectedRegion = regionsList.find(r => r.code === regionCode);
    setSelectedRegionCode(regionCode);
    setRegion(selectedRegion?.name || '');
    // Reset child selections
    setSelectedProvinceCode('');
    setProvince('');
    setSelectedCityCode('');
    setCityMunicipality('');
    setBarangay('');
    setProvincesList([]);
    setCitiesList([]);
  };

  // Handle province selection
  const handleProvinceChange = (provinceCode: string) => {
    const selectedProv = provincesList.find(p => p.code === provinceCode);
    setSelectedProvinceCode(provinceCode);
    setProvince(selectedProv?.name || '');
    // Reset child selections
    setSelectedCityCode('');
    setCityMunicipality('');
    setBarangay('');
    setCitiesList([]);
  };

  // Handle city selection
  const handleCityChange = (cityCode: string) => {
    const selectedCity = citiesList.find(c => c.code === cityCode);
    setSelectedCityCode(cityCode);
    setCityMunicipality(selectedCity?.name || '');
    // Reset barangay
    setBarangay('');
    setBarangaysList([]);
  };

  // Handle barangay selection
  const handleBarangayChange = (barangayCode: string) => {
    const selectedBrgy = barangaysList.find(b => b.code === barangayCode);
    setBarangay(selectedBrgy?.name || '');
  };

  // Function to reset all form fields
  const resetForm = () => {
    setStep(1);
    setLoading(false);
    setShowToast(false);
    setToastMessage('');
    setToastColor('danger');
    // Step 1
    setFirstname('');
    setLastname('');
    setMiddlename('');
    // Step 2
    setGender('');
    setDateOfBirth('');
    // Step 3
    setHouseBuildingNumber('');
    setStreetName('');
    setSubdivisionVillage('');
    setBarangay('');
    setCityMunicipality('');
    setProvince('');
    setRegion('');
    setPostalCode('');
    // Step 4
    setEmail('');
    setVerificationCode('');
    setIsEmailVerified(false);
    setOtpSent(false);
    setIsVerifying(false);
    // Step 5
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    // Step 6
    setRegistrationComplete(false);
    // PSGC
    setProvincesList([]);
    setCitiesList([]);
    setBarangaysList([]);
    setSelectedRegionCode('');
    setSelectedProvinceCode('');
    setSelectedCityCode('');
  };

  // Helper function to show toast messages
  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Validate each step before proceeding
  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: // Name validation
        if (!firstname.trim() || !lastname.trim()) {
          showToastMessage('Please fill in required fields: First name and Last name', 'danger');
          return false;
        }
        break;
        
      case 2: // Personal info validation
        if (!dateOfBirth) {
          showToastMessage('Please enter your date of birth', 'danger');
          return false;
        }
        break;
        
      case 3: // Location validation
        if (!region.trim() || !province.trim() || !cityMunicipality.trim() || !barangay.trim()) {
          showToastMessage('Please fill in required fields: Region, Province, City/Municipality, and Barangay', 'danger');
          return false;
        }
        break;
        
      case 4: // Email verification - must be verified before proceeding
        if (!isEmailVerified) {
          showToastMessage('Please verify your email before continuing', 'danger');
          return false;
        }
        break;
        
      case 5: // Account credentials validation
        if (!username.trim() || !password || !confirmPassword) {
          showToastMessage('Please fill in all account fields', 'danger');
          return false;
        }
        if (password !== confirmPassword) {
          showToastMessage('Passwords do not match', 'danger');
          return false;
        }
        if (password.length < 8) {
          showToastMessage('Password must be at least 8 characters long', 'danger');
          return false;
        }
        // Check for at least one number and one letter
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
          showToastMessage('Password must contain at least one letter and one number', 'danger');
          return false;
        }
        break;
    }
    return true;
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 6) setStep(step + 1);
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Jump to a specific step (for editing from overview)
  const goToStep = (targetStep: number) => {
    // Only allow going back to edit, not skipping ahead
    if (targetStep < step || targetStep <= 6) {
      setStep(targetStep);
    }
  };

  // Send OTP to email (Step 4) - NO user creation yet
  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      showToastMessage('Please enter a valid email address', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/request-email-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        showToastMessage('Verification code sent to your email!', 'success');
      } else {
        showToastMessage(data.error || 'Failed to send verification code', 'danger');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Step 4) - NO user creation yet
  const handleVerifyOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToastMessage('Please enter a valid 6-digit code', 'danger');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEmailVerified(true);
        showToastMessage('Email verified successfully! ✓', 'success');
      } else {
        showToastMessage(data.error || 'Invalid verification code', 'danger');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/request-email-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationCode('');
        showToastMessage('New verification code sent!', 'success');
      } else {
        showToastMessage(data.error || 'Failed to resend code', 'danger');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Final signup - Create user ONLY at Step 6
  const handleSignup = async () => {
    if (!isEmailVerified) {
      showToastMessage('Email must be verified before creating account', 'danger');
      return;
    }

    setLoading(true);
    try {
      const signupData = {
        // Personal info
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        middlename: middlename.trim() || '',
        email: email.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || '',
        
        // Account credentials
        username: username.trim(),
        password: password,
        password_confirm: confirmPassword,
        role: 'client',
        
        // Address fields
        house_building_number: houseBuildingNumber.trim(),
        street_name: streetName.trim(),
        subdivision_village: subdivisionVillage.trim(),
        barangay: barangay.trim(),
        city_municipality: cityMunicipality.trim(),
        province: province.trim(),
        region: region.trim(),
        postal_code: postalCode.trim(),
        
        // Mark email as pre-verified
        email_verified: true,
      };

      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationComplete(true);
        showToastMessage('Account created successfully!', 'success');
        
        // Redirect to login after success
        setTimeout(() => {
          history.push('/login');
        }, 2500);
      } else {
        // Handle validation errors
        let errorMessage = 'Registration failed. Please try again.';
        if (data.details) {
          const errors: string[] = [];
          for (const field in data.details) {
            if (Array.isArray(data.details[field])) {
              errors.push(`${field}: ${data.details[field][0]}`);
            }
          }
          if (errors.length > 0) errorMessage = errors.join(', ');
        } else if (data.error) {
          errorMessage = data.error;
        }
        showToastMessage(errorMessage, 'danger');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    history.push('/login');
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Build full address string
  const getFullAddress = (): string => {
    const parts = [
      houseBuildingNumber,
      streetName,
      subdivisionVillage,
      barangay,
      cityMunicipality,
      province,
      region,
      postalCode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <IonPage>
      <IonContent className="auth-content">
        <div className="auth-container">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/src/assets/images/mechlogo.png" alt="MechConnect Logo" />
          </div>
          
          <h1 className="auth-title">MechConnect</h1>

          {/* Step Indicator - 6 steps */}
          <div className="signup-steps">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div 
                key={s} 
                className={`step-indicator ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}
                title={STEP_LABELS[s - 1]}
              />
            ))}
          </div>
          
          {/* Step Label */}
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            Step {step} of 6: {STEP_LABELS[step - 1]}
          </p>

          <div className="auth-form">
            
            {/* ========== STEP 1: NAME ========== */}
            {step === 1 && (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
                  What's your name?
                </h3>
                <div className="input-container">
                  <IonInput
                    value={firstname}
                    onIonInput={(e) => setFirstname(e.detail.value || '')}
                    placeholder="First Name *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={lastname}
                    onIonInput={(e) => setLastname(e.detail.value || '')}
                    placeholder="Last Name *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    value={middlename}
                    onIonInput={(e) => setMiddlename(e.detail.value || '')}
                    placeholder="Middle Name (optional)"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            {/* ========== STEP 2: GENDER & BIRTHDAY ========== */}
            {step === 2 && (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
                  Personal Information
                </h3>
                <div className="input-container">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Gender
                  </label>
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
                    <option value="">Select Gender (optional)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="input-container">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
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

            {/* ========== STEP 3: LOCATION ========== */}
            {step === 3 && (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
                  Where are you located?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="input-container">
                    <IonInput
                      value={houseBuildingNumber}
                      onIonInput={(e) => setHouseBuildingNumber(e.detail.value || '')}
                      placeholder="House/Bldg No."
                      className="auth-input"
                    />
                  </div>
                  <div className="input-container">
                    <IonInput
                      value={streetName}
                      onIonInput={(e) => setStreetName(e.detail.value || '')}
                      placeholder="Street Name"
                      className="auth-input"
                    />
                  </div>
                </div>
                <div className="input-container">
                  <IonInput
                    value={subdivisionVillage}
                    onIonInput={(e) => setSubdivisionVillage(e.detail.value || '')}
                    placeholder="Subdivision/Village"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonSelect
                    value={selectedRegionCode}
                    onIonChange={(e) => handleRegionChange(e.detail.value)}
                    placeholder={loadingRegions ? 'Loading regions...' : 'Select Region*'}
                    className="auth-input"
                    interface="alert"
                    interfaceOptions={{ header: 'Select Region', cssClass: 'psgc-select-alert' }}
                    disabled={loadingRegions}
                    style={{ width: '100%' }}
                  >
                    {regionsList.map((r) => (
                      <IonSelectOption key={r.code} value={r.code}>{r.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {loadingRegions && <IonSpinner name="dots" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                </div>
                <div className="input-container">
                  <IonSelect
                    value={selectedProvinceCode}
                    onIonChange={(e) => handleProvinceChange(e.detail.value)}
                    placeholder={loadingProvinces ? 'Loading...' : 'Select Province*'}
                    className="auth-input"
                    interface="alert"
                    interfaceOptions={{ header: 'Select Province', cssClass: 'psgc-select-alert' }}
                    disabled={!selectedRegionCode || loadingProvinces}
                    style={{ width: '100%' }}
                  >
                    {provincesList.map((p) => (
                      <IonSelectOption key={p.code} value={p.code}>{p.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {loadingProvinces && <IonSpinner name="dots" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                </div>
                <div className="input-container">
                  <IonSelect
                    value={selectedCityCode}
                    onIonChange={(e) => handleCityChange(e.detail.value)}
                    placeholder={loadingCities ? 'Loading...' : 'Select City/Municipality*'}
                    className="auth-input"
                    interface="alert"
                    interfaceOptions={{ header: 'Select City/Municipality', cssClass: 'psgc-select-alert' }}
                    disabled={!selectedProvinceCode || loadingCities}
                    style={{ width: '100%' }}
                  >
                    {citiesList.map((c) => (
                      <IonSelectOption key={c.code} value={c.code}>{c.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {loadingCities && <IonSpinner name="dots" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                </div>
                <div className="input-container">
                  <IonSelect
                    value={selectedCityCode ? barangaysList.find(b => b.name === barangay)?.code || '' : ''}
                    onIonChange={(e) => handleBarangayChange(e.detail.value)}
                    placeholder={loadingBarangays ? 'Loading...' : 'Select Barangay*'}
                    className="auth-input"
                    interface="alert"
                    interfaceOptions={{ header: 'Select Barangay', cssClass: 'psgc-select-alert' }}
                    disabled={!selectedCityCode || loadingBarangays}
                    style={{ width: '100%' }}
                  >
                    {barangaysList.map((b) => (
                      <IonSelectOption key={b.code} value={b.code}>{b.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                  {loadingBarangays && <IonSpinner name="dots" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                </div>
                <div className="input-container">
                  <IonInput
                    value={postalCode}
                    onIonInput={(e) => setPostalCode(e.detail.value || '')}
                    placeholder="Postal Code"
                    className="auth-input"
                    inputMode="numeric"
                  />
                </div>
              </>
            )}

            {/* ========== STEP 4: EMAIL VERIFICATION ========== */}
            {step === 4 && (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
                  Verify Your Email
                </h3>
                
                {isEmailVerified ? (
                  // Email already verified
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <IonIcon 
                      icon={checkmarkCircle} 
                      style={{ fontSize: '64px', color: '#10b981', marginBottom: '16px' }}
                    />
                    <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Email Verified ✓</h4>
                    <p style={{ color: '#6b7280', marginBottom: '4px' }}>{email}</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                      You can proceed to the next step
                    </p>
                  </div>
                ) : !otpSent ? (
                  // Email input - OTP not sent yet
                  <>
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                      We'll send a 6-digit code to verify your email
                    </p>
                    <div className="input-container">
                      <IonInput
                        type="email"
                        value={email}
                        onIonInput={(e) => setEmail(e.detail.value || '')}
                        placeholder="Enter your email address *"
                        className="auth-input"
                      />
                    </div>
                    <IonButton
                      expand="block"
                      onClick={handleSendOTP}
                      className="auth-button"
                      disabled={loading || !email.trim()}
                    >
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </IonButton>
                  </>
                ) : (
                  // OTP sent - waiting for verification
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
                      <p style={{ color: '#1f2937', fontWeight: '500', marginBottom: '4px' }}>
                        Code sent to:
                      </p>
                      <p style={{ color: '#2563eb', fontWeight: '600', marginBottom: '12px' }}>
                        {email}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '13px' }}>
                        Enter the 6-digit code below
                      </p>
                    </div>
                    
                    <div className="input-container">
                      <IonInput
                        value={verificationCode}
                        onIonInput={(e) => {
                          // Only allow numeric input
                          const value = (e.detail.value || '').replace(/\D/g, '');
                          setVerificationCode(value);
                        }}
                        placeholder="000000"
                        className="auth-input"
                        maxlength={6}
                        inputMode="numeric"
                        style={{ 
                          textAlign: 'center', 
                          fontSize: '24px', 
                          letterSpacing: '12px',
                          fontWeight: '600'
                        }}
                      />
                    </div>
                    
                    <IonButton
                      expand="block"
                      onClick={handleVerifyOTP}
                      className="auth-button"
                      disabled={isVerifying || verificationCode.length !== 6}
                      style={{ marginBottom: '12px' }}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Code'}
                    </IonButton>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setVerificationCode(''); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '8px 0'
                        }}
                      >
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: '8px 0'
                        }}
                      >
                        {loading ? 'Sending...' : 'Resend code'}
                      </button>
                    </div>
                    
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
                      Code expires in 10 minutes
                    </p>
                  </>
                )}
              </>
            )}

            {/* ========== STEP 5: ACCOUNT CREDENTIALS ========== */}
            {step === 5 && (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1f2937' }}>
                  Create Your Account
                </h3>
                <div className="input-container">
                  <IonInput
                    value={username}
                    onIonInput={(e) => setUsername(e.detail.value || '')}
                    placeholder="Username *"
                    className="auth-input"
                    autocapitalize="off"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value || '')}
                    placeholder="Password *"
                    className="auth-input"
                  />
                </div>
                <div className="input-container">
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                    placeholder="Confirm Password *"
                    className="auth-input"
                  />
                </div>
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    Password requirements:
                  </p>
                  <ul style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0', paddingLeft: '16px' }}>
                    <li style={{ color: password.length >= 8 ? '#10b981' : '#6b7280' }}>
                      At least 8 characters
                    </li>
                    <li style={{ color: /(?=.*[a-zA-Z])(?=.*\d)/.test(password) ? '#10b981' : '#6b7280' }}>
                      Contains letters and numbers
                    </li>
                    <li style={{ color: password && password === confirmPassword ? '#10b981' : '#6b7280' }}>
                      Passwords match
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* ========== STEP 6: REVIEW & CREATE ACCOUNT ========== */}
            {step === 6 && (
              <>
                {registrationComplete ? (
                  // Success state
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <IonIcon 
                      icon={checkmarkCircle} 
                      style={{ fontSize: '72px', color: '#10b981', marginBottom: '16px' }}
                    />
                    <h3 style={{ color: '#10b981', marginBottom: '12px' }}>
                      Account Created Successfully!
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                      Welcome to MechConnect, {firstname}!
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                      Redirecting to login...
                    </p>
                  </div>
                ) : (
                  // Review state
                  <>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px', color: '#1f2937' }}>
                      Review Your Information
                    </h3>
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
                      Please verify all details before creating your account
                    </p>
                    
                    {/* Summary Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* Name Section */}
                      <div style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: '14px', 
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Name</span>
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2563eb', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px'
                            }}
                          >
                            <IonIcon icon={createOutline} /> Edit
                          </button>
                        </div>
                        <p style={{ color: '#1f2937', margin: 0, fontSize: '15px' }}>
                          {firstname} {middlename ? `${middlename} ` : ''}{lastname}
                        </p>
                      </div>
                      
                      {/* Personal Info Section */}
                      <div style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: '14px', 
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Personal Info</span>
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2563eb', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px'
                            }}
                          >
                            <IonIcon icon={createOutline} /> Edit
                          </button>
                        </div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0', fontSize: '13px' }}>
                          <strong>Gender:</strong> {gender ? gender.charAt(0).toUpperCase() + gender.slice(1).replace('_', ' ') : 'Not provided'}
                        </p>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
                          <strong>Birthday:</strong> {formatDate(dateOfBirth)}
                        </p>
                      </div>
                      
                      {/* Location Section */}
                      <div style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: '14px', 
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Location</span>
                          <button
                            type="button"
                            onClick={() => goToStep(3)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2563eb', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px'
                            }}
                          >
                            <IonIcon icon={createOutline} /> Edit
                          </button>
                        </div>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                          {getFullAddress()}
                        </p>
                      </div>
                      
                      {/* Email Section */}
                      <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        padding: '14px', 
                        borderRadius: '10px',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Email</span>
                          <span style={{ 
                            color: '#10b981', 
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <IonIcon icon={checkmarkCircle} /> Verified
                          </span>
                        </div>
                        <p style={{ color: '#1f2937', margin: 0, fontSize: '15px' }}>
                          {email}
                        </p>
                      </div>
                      
                      {/* Account Section */}
                      <div style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: '14px', 
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>Account</span>
                          <button
                            type="button"
                            onClick={() => goToStep(5)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#2563eb', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px'
                            }}
                          >
                            <IonIcon icon={createOutline} /> Edit
                          </button>
                        </div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0', fontSize: '13px' }}>
                          <strong>Username:</strong> {username}
                        </p>
                        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
                          <strong>Password:</strong> ••••••••
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ========== NAVIGATION BUTTONS ========== */}
            {!registrationComplete && (
              <div style={{ marginTop: '20px' }}>
                {/* For steps 2, 3, 5: Back and Next side by side */}
                {(step === 2 || step === 3 || step === 5) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <IonButton
                      fill="outline"
                      onClick={handleBack}
                      className="auth-button"
                      style={{ margin: 0, '--color': '#fff', '--border-color': '#fff' }}
                    >
                      Back
                    </IonButton>
                    <IonButton
                      onClick={handleNext}
                      className="auth-button"
                      disabled={loading}
                      style={{ margin: 0 }}
                    >
                      Next
                    </IonButton>
                  </div>
                )}
                
                {/* Step 1: Only Next button */}
                {step === 1 && (
                  <IonButton
                    expand="block"
                    onClick={handleNext}
                    className="auth-button"
                  >
                    Next
                  </IonButton>
                )}
                
                {/* Step 4: Email verification - has custom buttons within the step */}
                {step === 4 && isEmailVerified && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <IonButton
                      fill="outline"
                      onClick={handleBack}
                      className="auth-button"
                      style={{ margin: 0, '--color': '#fff', '--border-color': '#fff' }}
                    >
                      Back
                    </IonButton>
                    <IonButton
                      onClick={handleNext}
                      className="auth-button"
                      style={{ margin: 0 }}
                    >
                      Next
                    </IonButton>
                  </div>
                )}
                
                {/* Step 4 back button when not verified and OTP sent */}
                {step === 4 && !isEmailVerified && otpSent && (
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleBack}
                    className="auth-button"
                    style={{ marginTop: '12px', '--color': '#fff', '--border-color': '#fff' }}
                  >
                    Back
                  </IonButton>
                )}
                
                {/* Step 4 back button when not verified and OTP not sent */}
                {step === 4 && !isEmailVerified && !otpSent && (
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleBack}
                    className="auth-button"
                    style={{ marginTop: '8px', '--color': '#fff', '--border-color': '#fff' }}
                  >
                    Back
                  </IonButton>
                )}
                
                {/* Step 6: Review - Back and Create Account side by side */}
                {step === 6 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <IonButton
                      fill="outline"
                      onClick={handleBack}
                      className="auth-button"
                      style={{ margin: 0, '--color': '#fff', '--border-color': '#fff' }}
                    >
                      Back
                    </IonButton>
                    <IonButton
                      onClick={handleSignup}
                      className="auth-button"
                      disabled={loading}
                      style={{ margin: 0 }}
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </IonButton>
                  </div>
                )}
              </div>
            )}

            {/* Login Link */}
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
        
        <IonLoading isOpen={loading} message="Please wait..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3500}
          color={toastColor}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Signup;