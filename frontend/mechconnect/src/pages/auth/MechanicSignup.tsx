import { IonContent, IonPage, IonToast, IonLoading, IonSelect, IonSelectOption, IonSpinner, IonModal, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './MechanicSignup.css';

/**
 * MechanicSignup - Role Extension Flow
 * 
 * This component allows an existing CLIENT to register as a MECHANIC.
 * It does NOT create a new account - it extends the existing user's roles.
 * 
 * Removed sections (already in client account):
 * - Personal Information (name, DOB, gender, email)
 * - Contact Information
 * - Account Credentials (username, password)
 * 
 * Kept sections:
 * - Address Information (with reuse option)
 * - Profile Information (mechanic-specific photo & bio)
 * - Documents (certifications, licenses)
 */

interface Document {
  id: number;
  name: string;
  type: string;
  file: string | null;
  dateIssued: string;
  dateExpiry: string;
}

// Client data loaded from backend
interface ClientData {
  acc_id: number;
  firstname: string;
  lastname: string;
  email: string;
  is_verified: boolean;
  address: {
    house_building_number: string;
    street_name: string;
    subdivision_village: string;
    barangay: string;
    city_municipality: string;
    province: string;
    region: string;
    postal_code: string;
  } | null;
}

// PSGC API types
interface PSGCItem {
  code: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:8000/api';
const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

const MechanicSignup: React.FC = () => {
  const history = useHistory();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  // Client data from existing account
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [hasMechanicProfile, setHasMechanicProfile] = useState(false);

  // Email verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  /**
   * Address Mode:
   * - 'existing': Reuse client's current address (read-only fields)
   * - 'new': Enter a new mechanic-specific address
   */
  const [addressMode, setAddressMode] = useState<'existing' | 'new'>('existing');

  // Address Information (only editable when addressMode === 'new')
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Profile Information (mechanic-specific)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  // Documents (certifications, licenses for mechanic role)
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'license', file: null, dateIssued: '', dateExpiry: '' }
  ]);

  // PSGC Location Data
  const [regionsList, setRegionsList] = useState<PSGCItem[]>([]);
  const [provincesList, setProvincesList] = useState<PSGCItem[]>([]);
  const [citiesList, setCitiesList] = useState<PSGCItem[]>([]);
  const [barangaysList, setBarangaysList] = useState<PSGCItem[]>([]);
  
  // Selected PSGC Codes (for cascading dropdowns)
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  
  // PSGC Loading States
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoadingRegions(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/regions/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setRegionsList(sorted);
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
        const response = await fetch(`${PSGC_API_BASE}/regions/${selectedRegionCode}/provinces/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setProvincesList(sorted);
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

  // Fetch cities when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch(`${PSGC_API_BASE}/provinces/${selectedProvinceCode}/cities-municipalities/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setCitiesList(sorted);
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
        const response = await fetch(`${PSGC_API_BASE}/cities-municipalities/${selectedCityCode}/barangays/`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a: PSGCItem, b: PSGCItem) => a.name.localeCompare(b.name));
          setBarangaysList(sorted);
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

  // Handle PSGC dropdown changes
  const handleRegionChange = (regionCode: string) => {
    const selectedRegion = regionsList.find(r => r.code === regionCode);
    setSelectedRegionCode(regionCode);
    setRegion(selectedRegion?.name || '');
    // Reset child selections
    setSelectedProvinceCode('');
    setProvince('');
    setSelectedCityCode('');
    setCity('');
    setBarangay('');
    setProvincesList([]);
    setCitiesList([]);
    setBarangaysList([]);
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProv = provincesList.find(p => p.code === provinceCode);
    setSelectedProvinceCode(provinceCode);
    setProvince(selectedProv?.name || '');
    // Reset child selections
    setSelectedCityCode('');
    setCity('');
    setBarangay('');
    setCitiesList([]);
    setBarangaysList([]);
  };

  const handleCityChange = (cityCode: string) => {
    const selectedCity = citiesList.find(c => c.code === cityCode);
    setSelectedCityCode(cityCode);
    setCity(selectedCity?.name || '');
    // Reset barangay
    setBarangay('');
    setBarangaysList([]);
  };

  const handleBarangayChange = (barangayCode: string) => {
    const selectedBrgy = barangaysList.find(b => b.code === barangayCode);
    setBarangay(selectedBrgy?.name || '');
  };

  /**
   * Load client data on component mount
   * - Uses user data from localStorage (stored during login)
   * - The login response includes address data via AccountSerializer
   * - Checks if mechanic profile already exists
   * - Pre-fills address fields if available
   * 
   * NOTE: If "No address saved" shows incorrectly, user needs to log out and log back in
   * to refresh the localStorage with the complete user data including address.
   */
  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      try {
        // Get user data from localStorage (set during login - includes address)
        const userData = localStorage.getItem('user');
        if (!userData) {
          showToastMessage('Please login first', 'danger');
          history.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        const userId = user.acc_id;

        console.log('User data from localStorage:', user);
        console.log('Address data:', user.address);

        // Use user data directly from localStorage (already includes address from login)
        // The AccountSerializer includes address via: address = AccountAddressSerializer(read_only=True)
        setClientData({
          acc_id: user.acc_id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          is_verified: user.is_verified,
          address: user.address || null
        });

        // Pre-fill address fields from client profile
        if (user.address) {
          const addr = user.address;
          setHouseNumber(addr.house_building_number || '');
          setStreet(addr.street_name || '');
          setSubdivision(addr.subdivision_village || '');
          setBarangay(addr.barangay || '');
          setCity(addr.city_municipality || '');
          setProvince(addr.province || '');
          setRegion(addr.region || '');
          setPostalCode(addr.postal_code || '');
          // User has existing address, default to using it
          setAddressMode('existing');
        } else {
          // No existing address, default to new address mode
          setAddressMode('new');
        }

        // Check if user already has a mechanic profile
        const rolesResponse = await fetch(`${API_BASE_URL}/accounts/check-roles/?user_id=${userId}`);
        const rolesData = await rolesResponse.json();

        if (rolesResponse.ok && rolesData.has_mechanic_profile) {
          setHasMechanicProfile(true);
          showToastMessage('You already have a mechanic profile', 'danger');
        }

      } catch (error) {
        console.error('Error loading client data:', error);
        showToastMessage('Failed to load profile data', 'danger');
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [history]);

  const showToastMessage = (message: string, color: 'success' | 'danger') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const goBack = () => history.goBack();

  /**
   * Send verification code to user's email
   */
  const sendVerificationCode = async () => {
    if (!clientData) return;

    setSendingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/resend-verification-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: clientData.acc_id
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToastMessage('Verification code sent to your email!', 'success');
        // Start 60 second timer for resend
        setResendTimer(60);
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToastMessage(data.error || 'Failed to send verification code', 'danger');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setSendingCode(false);
    }
  };

  /**
   * Verify the code entered by user
   */
  const verifyEmailCode = async () => {
    if (!clientData || !verificationCode.trim()) {
      showToastMessage('Please enter the verification code', 'danger');
      return;
    }

    setVerifyingCode(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/verify-email-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: clientData.acc_id,
          code: verificationCode.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToastMessage('Email verified successfully!', 'success');
        
        // Update client data to mark as verified
        setClientData({ ...clientData, is_verified: true });
        
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.is_verified = true;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Close modal and proceed with submission
        setShowVerificationModal(false);
        setVerificationCode('');
        
        // Now submit the mechanic application
        setTimeout(() => {
          handleMechanicSubmit();
        }, 500);
      } else {
        showToastMessage(data.error || 'Invalid verification code', 'danger');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setVerifyingCode(false);
    }
  };

  /**
   * Handle address mode change
   * When switching to 'existing', restore client's original address
   * When switching to 'new', clear all fields and PSGC selections for fresh entry
   */
  const handleAddressModeChange = (mode: 'existing' | 'new') => {
    setAddressMode(mode);
    
    if (mode === 'existing' && clientData?.address) {
      // Restore original client address
      const addr = clientData.address;
      setHouseNumber(addr.house_building_number || '');
      setStreet(addr.street_name || '');
      setSubdivision(addr.subdivision_village || '');
      setBarangay(addr.barangay || '');
      setCity(addr.city_municipality || '');
      setProvince(addr.province || '');
      setRegion(addr.region || '');
      setPostalCode(addr.postal_code || '');
      // Clear PSGC codes since we're using existing text values
      setSelectedRegionCode('');
      setSelectedProvinceCode('');
      setSelectedCityCode('');
      setProvincesList([]);
      setCitiesList([]);
      setBarangaysList([]);
    } else if (mode === 'new') {
      // Clear all fields for new address entry
      setHouseNumber('');
      setStreet('');
      setSubdivision('');
      setBarangay('');
      setCity('');
      setProvince('');
      setRegion('');
      setPostalCode('');
      // Reset PSGC selections
      setSelectedRegionCode('');
      setSelectedProvinceCode('');
      setSelectedCityCode('');
      setProvincesList([]);
      setCitiesList([]);
      setBarangaysList([]);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
  };

  const handleAddDocument = () => {
    const newDocument: Document = {
      id: documents.length + 1,
      name: '',
      type: 'license',
      file: null,
      dateIssued: '',
      dateExpiry: ''
    };
    setDocuments([...documents, newDocument]);
  };

  const handleRemoveDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleDocumentChange = (id: number, field: keyof Document, value: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleDocumentFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments(documents.map(doc => 
          doc.id === id ? { ...doc, file: reader.result as string } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Form Validation
   */
  const validateForm = (): boolean => {
    // Check required address fields
    if (!region) {
      showToastMessage('Please select a Region for your service location', 'danger');
      return false;
    }
    if (!province) {
      showToastMessage('Please select a Province for your service location', 'danger');
      return false;
    }
    if (!city) {
      showToastMessage('Please select a City/Municipality for your service location', 'danger');
      return false;
    }
    if (!barangay) {
      showToastMessage('Please select a Barangay for your service location', 'danger');
      return false;
    }

    // Check documents
    const validDocuments = documents.filter(doc => doc.name && doc.file);
    if (validDocuments.length === 0) {
      showToastMessage('Please upload at least one certification or license document', 'danger');
      return false;
    }

    // Check if documents have names
    const documentsWithoutName = documents.filter(doc => doc.file && !doc.name);
    if (documentsWithoutName.length > 0) {
      showToastMessage('Please provide names for all uploaded documents', 'danger');
      return false;
    }

    // Optional: Check if bio is provided (recommended but not required)
    if (!bio || bio.trim().length < 20) {
      showToastMessage('Please add a bio (at least 20 characters) to introduce yourself to clients', 'danger');
      return false;
    }

    return true;
  };

  /**
   * Submit Handler
   * 
   * Creates a MechanicProfile linked to the existing user account.
   * Does NOT create a new User - only adds the mechanic role.
   * 
   * Backend API expectations:
   * POST /api/accounts/mechanic/register/
   * {
   *   user_id: number,           // Existing client's user ID
   *   use_existing_address: boolean,
   *   address: { ... } | null,   // Only if use_existing_address is false
   *   profile_photo: string,     // Base64 encoded
   *   bio: string,
   *   documents: Document[]
   * }
   */
  const handleSubmit = async () => {
    // Prevent submission if mechanic profile exists
    if (hasMechanicProfile) {
      showToastMessage('You already have a mechanic profile', 'danger');
      return;
    }

    // Validate client is logged in
    if (!clientData) {
      showToastMessage('Please login first', 'danger');
      history.push('/login');
      return;
    }

    /**
     * Email Verification:
     * If not verified, show modal to verify email before proceeding
     */
    if (!clientData.is_verified) {
      setShowVerificationModal(true);
      await sendVerificationCode();
      return;
    }

    if (!validateForm()) return;

    // If verified, proceed with submission
    await handleMechanicSubmit();
  };

  /**
   * Actual mechanic application submission
   * Called after email verification is confirmed
   */
  const handleMechanicSubmit = async () => {
    if (!clientData) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        user_id: clientData.acc_id,
        
        // Address handling:
        // If 'existing', backend reuses client_address_id
        // If 'new', backend creates a new mechanic_address
        use_existing_address: addressMode === 'existing',
        
        // Only send address data if creating new address
        address: addressMode === 'new' ? {
          house_building_number: houseNumber,
          street_name: street,
          subdivision_village: subdivision,
          barangay: barangay,
          city_municipality: city,
          province: province,
          region: region,
          postal_code: postalCode
        } : null,
        
        // Mechanic-specific profile data
        profile_photo: profilePhoto,
        bio: bio,
        
        // Documents for verification
        documents: documents.filter(doc => doc.name && doc.file).map(doc => ({
          name: doc.name,
          type: doc.type,
          file: doc.file,
          date_issued: doc.dateIssued || null,
          date_expiry: doc.dateExpiry || null
        }))
      };

      const response = await fetch(`${API_BASE_URL}/accounts/mechanic/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showToastMessage('Mechanic application submitted successfully!', 'success');
        
        // Update local user data with new role
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.roles = [...(user.roles || []), 'mechanic'];
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setTimeout(() => {
          history.push('/client/profile');
        }, 2000);
      } else {
        showToastMessage(data.error || 'Failed to submit application', 'danger');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showToastMessage('Network error. Please try again.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching client data
  if (loading) {
    return (
      <IonPage>
        <IonContent className="mechanic-signup-content">
          <IonLoading isOpen={true} message="Loading profile..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="mechanic-signup-content">
        <div className="mechanic-signup-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Apply as Mechanic</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="signup-container">
          {/* Show warning if mechanic profile already exists */}
          {hasMechanicProfile && (
            <div className="form-card" style={{ background: '#fee2e2', borderColor: '#fca5a5' }}>
              <p style={{ color: '#991b1b', margin: 0, textAlign: 'center' }}>
                <span className="material-icons-round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>warning</span>
                You already have a mechanic profile registered.
              </p>
            </div>
          )}

          {/* User Info Summary (read-only) */}
          {clientData && (
            <div className="form-card">
              <h2 className="section-title">Account Information</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                Your mechanic profile will be linked to your existing account.
              </p>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1f2937' }}>
                  {clientData.firstname} {clientData.lastname}
                </p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  {clientData.email}
                  {clientData.is_verified && (
                    <span style={{ color: '#10b981', marginLeft: '8px' }}>
                      <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle' }}>verified</span>
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Address Information with Reuse Logic */}
          <div className="form-card">
            <h2 className="section-title">Service Location</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Where will you provide your mechanic services?
            </p>

            {/* Address Mode Toggle */}
            <div className="address-mode-toggle" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                className={`mode-button ${addressMode === 'existing' ? 'active' : ''}`}
                onClick={() => {
                  if (clientData?.address) {
                    handleAddressModeChange('existing');
                  } else {
                    showToastMessage('No existing address found. Please enter a new address.', 'danger');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: addressMode === 'existing' ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: addressMode === 'existing' ? '#fff7ed' : 'white',
                  color: addressMode === 'existing' ? '#ea580c' : clientData?.address ? '#64748b' : '#cbd5e1',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: clientData?.address ? 1 : 0.5,
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px' }}>home</span>
                Use Current Address
                {!clientData?.address && <span style={{ display: 'block', fontSize: '10px', marginTop: '4px', fontWeight: '400' }}>(No address saved)</span>}
              </button>
              <button
                type="button"
                className={`mode-button ${addressMode === 'new' ? 'active' : ''}`}
                onClick={() => handleAddressModeChange('new')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: addressMode === 'new' ? '2px solid #f97316' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: addressMode === 'new' ? '#fff7ed' : 'white',
                  color: addressMode === 'new' ? '#ea580c' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-icons-round" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px' }}>add_location</span>
                New Address
              </button>
            </div>

            {/* Address Fields */}
            <div className="location-grid">
              <div className="input-group">
                <label className="input-label">House/Building No.</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter house/building no."
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Street Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter street name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Subdivision/Village</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter subdivision/village"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>

              {/* Region - Dropdown for new address, read-only for existing */}
              <div className="input-group">
                <label className="input-label">Region *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={region}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedRegionCode}
                      onIonChange={(e) => handleRegionChange(e.detail.value)}
                      placeholder={loadingRegions ? 'Loading regions...' : 'Select Region'}
                      className="form-input psgc-select"
                      interface="alert"
                      interfaceOptions={{ header: 'Select Region', cssClass: 'psgc-select-alert' }}
                      disabled={loadingRegions}
                    >
                      {regionsList.map((r) => (
                        <IonSelectOption key={r.code} value={r.code}>{r.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingRegions && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* Province - Dropdown for new address, read-only for existing */}
              <div className="input-group">
                <label className="input-label">Province *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={province}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedProvinceCode}
                      onIonChange={(e) => handleProvinceChange(e.detail.value)}
                      placeholder={loadingProvinces ? 'Loading...' : 'Select Province'}
                      className="form-input psgc-select"
                      interface="alert"
                      interfaceOptions={{ header: 'Select Province', cssClass: 'psgc-select-alert' }}
                      disabled={!selectedRegionCode || loadingProvinces}
                    >
                      {provincesList.map((p) => (
                        <IonSelectOption key={p.code} value={p.code}>{p.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingProvinces && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* City/Municipality - Dropdown for new address, read-only for existing */}
              <div className="input-group">
                <label className="input-label">City/Municipality *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedCityCode}
                      onIonChange={(e) => handleCityChange(e.detail.value)}
                      placeholder={loadingCities ? 'Loading...' : 'Select City/Municipality'}
                      className="form-input psgc-select"
                      interface="alert"
                      interfaceOptions={{ header: 'Select City/Municipality', cssClass: 'psgc-select-alert' }}
                      disabled={!selectedProvinceCode || loadingCities}
                    >
                      {citiesList.map((c) => (
                        <IonSelectOption key={c.code} value={c.code}>{c.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingCities && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              {/* Barangay - Dropdown for new address, read-only for existing */}
              <div className="input-group">
                <label className="input-label">Barangay *</label>
                {addressMode === 'existing' ? (
                  <input
                    type="text"
                    className="form-input"
                    value={barangay}
                    readOnly
                    style={{ background: '#f3f4f6' }}
                  />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <IonSelect
                      value={selectedCityCode ? barangaysList.find(b => b.name === barangay)?.code || '' : ''}
                      onIonChange={(e) => handleBarangayChange(e.detail.value)}
                      placeholder={loadingBarangays ? 'Loading...' : 'Select Barangay'}
                      className="form-input psgc-select"
                      interface="alert"
                      interfaceOptions={{ header: 'Select Barangay', cssClass: 'psgc-select-alert' }}
                      disabled={!selectedCityCode || loadingBarangays}
                    >
                      {barangaysList.map((b) => (
                        <IonSelectOption key={b.code} value={b.code}>{b.name}</IonSelectOption>
                      ))}
                    </IonSelect>
                    {loadingBarangays && <IonSpinner name="dots" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)' }} />}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  readOnly={addressMode === 'existing'}
                  style={{ background: addressMode === 'existing' ? '#f3f4f6' : 'white' }}
                />
              </div>
            </div>
          </div>

          {/* Profile Information (Mechanic-specific) */}
          <div className="form-card">
            <h2 className="section-title">Mechanic Profile</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              This information will be shown to clients looking for mechanics.
            </p>
            
            <div className="input-group">
              <label className="input-label">Profile Photo</label>
              {profilePhoto ? (
                <div className="image-preview-container">
                  <img src={profilePhoto} alt="Profile" className="image-preview" />
                  <button className="btn-remove-image" onClick={handleRemoveProfilePhoto}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ) : (
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span className="material-icons-round">add_photo_alternate</span>
                    <span>Upload Profile Photo</span>
                  </div>
                </label>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Bio / About Me</label>
              <textarea
                className="form-textarea"
                placeholder="Tell clients about your experience, specialties, and skills..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Documents & Certifications</h2>
              <button className="btn-add-document" onClick={handleAddDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Upload your licenses, certifications, or other relevant documents.
            </p>

            {documents.map((doc, index) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <span className="document-number">Document #{index + 1}</span>
                  {documents.length > 1 && (
                    <button 
                      className="btn-remove-doc" 
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Document Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Driver's License, TESDA Certificate"
                    value={doc.name}
                    onChange={(e) => handleDocumentChange(doc.id, 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Document Type *</label>
                  <select
                    className="form-input"
                    value={doc.type}
                    onChange={(e) => handleDocumentChange(doc.id, 'type', e.target.value)}
                  >
                    <option value="license">License</option>
                    <option value="certification">Certification</option>
                    <option value="ID">Government ID</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Document File *</label>
                  {doc.file ? (
                    <div className="file-preview-container">
                      <div className="file-info">
                        <span className="material-icons-round">description</span>
                        <span className="file-name">{doc.name || 'Document'}</span>
                      </div>
                      <button 
                        className="btn-remove-file" 
                        onClick={() => handleDocumentChange(doc.id, 'file', '')}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleDocumentFileChange(doc.id, e)}
                        style={{ display: 'none' }}
                      />
                      <div className="upload-placeholder">
                        <span className="material-icons-round">upload_file</span>
                        <span>Upload Document</span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="date-row">
                  <div className="input-group">
                    <label className="input-label">Date Issued</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateIssued}
                      onChange={(e) => handleDocumentChange(doc.id, 'dateIssued', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Expiry</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateExpiry}
                      onChange={(e) => handleDocumentChange(doc.id, 'dateExpiry', e.target.value)}
                    />
                  </div>
                </div>

                {index < documents.length - 1 && <div className="document-divider"></div>}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={submitting || hasMechanicProfile}
            style={{ opacity: (submitting || hasMechanicProfile) ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>

        <IonLoading isOpen={submitting} message="Submitting application..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />

        {/* Email Verification Modal */}
        <IonModal
          isOpen={showVerificationModal}
          onDidDismiss={() => {
            setShowVerificationModal(false);
            setVerificationCode('');
          }}
          className="verification-modal"
        >
          <div style={{ 
            padding: '32px 24px', 
            maxWidth: '460px', 
            margin: '0 auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)'
              }}>
                <span className="material-icons-round" style={{ fontSize: '40px', color: '#f97316' }}>mark_email_read</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Verify Your Email</h2>
              <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                We've sent a 6-digit verification code to:
              </p>
              <p style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                {clientData?.email}
              </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                Enter Verification Code
              </label>
              <input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '24px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontWeight: '700',
                  color: '#1f2937',
                  background: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f97316';
                  e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#9ca3af', 
                textAlign: 'center', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Check your email inbox and spam folder
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={verifyEmailCode}
                disabled={verifyingCode || verificationCode.length !== 6}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: verificationCode.length === 6 ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#d1d5db',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: verificationCode.length === 6 ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                  opacity: verifyingCode ? 0.7 : 1
                }}
              >
                {verifyingCode ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <IonSpinner name="dots" style={{ width: '20px', height: '20px' }} />
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>

            <div style={{ 
              textAlign: 'center', 
              padding: '16px 0',
              borderTop: '1px solid #f3f4f6',
              marginTop: '8px'
            }}>
              {resendTimer > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="material-icons-round" style={{ fontSize: '18px', color: '#9ca3af' }}>schedule</span>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                    Resend code in <strong style={{ color: '#f97316' }}>{resendTimer}s</strong>
                  </p>
                </div>
              ) : (
                <button
                  onClick={sendVerificationCode}
                  disabled={sendingCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: sendingCode ? '#9ca3af' : '#f97316',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: sendingCode ? 'not-allowed' : 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => !sendingCode && (e.currentTarget.style.background = '#fff7ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span className="material-icons-round" style={{ fontSize: '18px' }}>refresh</span>
                  {sendingCode ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.background = 'none';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default MechanicSignup;
