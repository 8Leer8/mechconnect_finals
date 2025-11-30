import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './ShopOwnerSignup.css';

interface Document {
  id: number;
  name: string;
  type: string;
  file: string | null;
  dateIssued: string;
  dateExpiry: string;
}

const ShopOwnerSignup: React.FC = () => {
  const history = useHistory();

  // Personal Information
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Contact Information
  const [contactNumber, setContactNumber] = useState('');

  // Address Information
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Profile Information
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  // Shop Information
  const [shopName, setShopName] = useState('');
  const [shopContactNumber, setShopContactNumber] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [shopWebsite, setShopWebsite] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [serviceBanner, setServiceBanner] = useState<string | null>(null);

  // Shop Owner Documents
  const [ownerDocuments, setOwnerDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'business_permit', file: null, dateIssued: '', dateExpiry: '' }
  ]);

  // Shop Documents
  const [shopDocuments, setShopDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'business_permit', file: null, dateIssued: '', dateExpiry: '' }
  ]);

  const goBack = () => history.goBack();

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

  const handleServiceBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveServiceBanner = () => {
    setServiceBanner(null);
  };

  // Owner Documents Handlers
  const handleAddOwnerDocument = () => {
    const newDocument: Document = {
      id: ownerDocuments.length + 1,
      name: '',
      type: 'business_permit',
      file: null,
      dateIssued: '',
      dateExpiry: ''
    };
    setOwnerDocuments([...ownerDocuments, newDocument]);
  };

  const handleRemoveOwnerDocument = (id: number) => {
    setOwnerDocuments(ownerDocuments.filter(doc => doc.id !== id));
  };

  const handleOwnerDocumentChange = (id: number, field: keyof Document, value: string) => {
    setOwnerDocuments(ownerDocuments.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleOwnerDocumentFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOwnerDocuments(ownerDocuments.map(doc => 
          doc.id === id ? { ...doc, file: reader.result as string } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  // Shop Documents Handlers
  const handleAddShopDocument = () => {
    const newDocument: Document = {
      id: shopDocuments.length + 1,
      name: '',
      type: 'business_permit',
      file: null,
      dateIssued: '',
      dateExpiry: ''
    };
    setShopDocuments([...shopDocuments, newDocument]);
  };

  const handleRemoveShopDocument = (id: number) => {
    setShopDocuments(shopDocuments.filter(doc => doc.id !== id));
  };

  const handleShopDocumentChange = (id: number, field: keyof Document, value: string) => {
    setShopDocuments(shopDocuments.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  const handleShopDocumentFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopDocuments(shopDocuments.map(doc => 
          doc.id === id ? { ...doc, file: reader.result as string } : doc
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log('Shop owner application submitted');
    // Handle form submission
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent className="shop-owner-signup-content">
        <div className="shop-owner-signup-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Apply for Shop Owner</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="signup-container">
          {/* Personal Information */}
          <div className="form-card">
            <h2 className="section-title">Personal Information</h2>
            
            <div className="input-group">
              <label className="input-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter last name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter first name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Middle Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter middle name (optional)"
                value={middlename}
                onChange={(e) => setMiddlename(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Date of Birth *</label>
              <input
                type="date"
                className="form-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Gender *</label>
              <select
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Contact Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter contact number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="form-card">
            <h2 className="section-title">Address Information</h2>
            
            <div className="location-grid">
              <div className="input-group">
                <label className="input-label">House/Building No.</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter house/building no."
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
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
                />
              </div>

              <div className="input-group">
                <label className="input-label">Barangay *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter barangay"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">City/Municipality *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter city/municipality"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Province *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Region *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="form-card">
            <h2 className="section-title">Account Credentials</h2>
            
            <div className="input-group">
              <label className="input-label">Username *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Profile Information */}
          <div className="form-card">
            <h2 className="section-title">Profile Information</h2>
            
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
              <label className="input-label">Bio</label>
              <textarea
                className="form-textarea"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Shop Information */}
          <div className="form-card">
            <h2 className="section-title">Shop Information</h2>
            
            <div className="input-group">
              <label className="input-label">Shop Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Contact Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter shop contact number"
                value={shopContactNumber}
                onChange={(e) => setShopContactNumber(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter shop email address"
                value={shopEmail}
                onChange={(e) => setShopEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Website</label>
              <input
                type="url"
                className="form-input"
                placeholder="Enter website URL (optional)"
                value={shopWebsite}
                onChange={(e) => setShopWebsite(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Shop Description</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your shop and services..."
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Service Banner</label>
              {serviceBanner ? (
                <div className="image-preview-container banner">
                  <img src={serviceBanner} alt="Service Banner" className="image-preview" />
                  <button className="btn-remove-image" onClick={handleRemoveServiceBanner}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ) : (
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleServiceBannerChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span className="material-icons-round">add_photo_alternate</span>
                    <span>Upload Service Banner</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Shop Owner Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Shop Owner Documents</h2>
              <button className="btn-add-document" onClick={handleAddOwnerDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>

            {ownerDocuments.map((doc, index) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <span className="document-number">Document #{index + 1}</span>
                  {ownerDocuments.length > 1 && (
                    <button 
                      className="btn-remove-doc" 
                      onClick={() => handleRemoveOwnerDocument(doc.id)}
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
                    placeholder="e.g., Business Permit, Mayor's Permit"
                    value={doc.name}
                    onChange={(e) => handleOwnerDocumentChange(doc.id, 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Document Type *</label>
                  <select
                    className="form-input"
                    value={doc.type}
                    onChange={(e) => handleOwnerDocumentChange(doc.id, 'type', e.target.value)}
                  >
                    <option value="business_permit">Business Permit</option>
                    <option value="mayor_permit">Mayor Permit</option>
                    <option value="BIR_registration">BIR Registration</option>
                    <option value="ID">ID</option>
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
                        onClick={() => handleOwnerDocumentChange(doc.id, 'file', '')}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleOwnerDocumentFileChange(doc.id, e)}
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
                      onChange={(e) => handleOwnerDocumentChange(doc.id, 'dateIssued', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Expiry</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateExpiry}
                      onChange={(e) => handleOwnerDocumentChange(doc.id, 'dateExpiry', e.target.value)}
                    />
                  </div>
                </div>

                {index < ownerDocuments.length - 1 && <div className="document-divider"></div>}
              </div>
            ))}
          </div>

          {/* Shop Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Shop Documents</h2>
              <button className="btn-add-document" onClick={handleAddShopDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>

            {shopDocuments.map((doc, index) => (
              <div key={doc.id} className="document-item">
                <div className="document-header">
                  <span className="document-number">Document #{index + 1}</span>
                  {shopDocuments.length > 1 && (
                    <button 
                      className="btn-remove-doc" 
                      onClick={() => handleRemoveShopDocument(doc.id)}
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
                    placeholder="e.g., Business Permit, Occupancy Permit"
                    value={doc.name}
                    onChange={(e) => handleShopDocumentChange(doc.id, 'name', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Document Type *</label>
                  <select
                    className="form-input"
                    value={doc.type}
                    onChange={(e) => handleShopDocumentChange(doc.id, 'type', e.target.value)}
                  >
                    <option value="business_permit">Business Permit</option>
                    <option value="mayor_permit">Mayor Permit</option>
                    <option value="BIR_registration">BIR Registration</option>
                    <option value="occupancy_permit">Occupancy Permit</option>
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
                        onClick={() => handleShopDocumentChange(doc.id, 'file', '')}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleShopDocumentFileChange(doc.id, e)}
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
                      onChange={(e) => handleShopDocumentChange(doc.id, 'dateIssued', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Expiry</label>
                    <input
                      type="date"
                      className="form-input"
                      value={doc.dateExpiry}
                      onChange={(e) => handleShopDocumentChange(doc.id, 'dateExpiry', e.target.value)}
                    />
                  </div>
                </div>

                {index < shopDocuments.length - 1 && <div className="document-divider"></div>}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button className="btn-submit" onClick={handleSubmit}>
            Submit Application
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ShopOwnerSignup;
