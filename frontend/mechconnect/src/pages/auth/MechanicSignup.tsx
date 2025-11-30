import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './MechanicSignup.css';

interface Document {
  id: number;
  name: string;
  type: string;
  file: string | null;
  dateIssued: string;
  dateExpiry: string;
}

const MechanicSignup: React.FC = () => {
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

  // Documents
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: '', type: 'license', file: null, dateIssued: '', dateExpiry: '' }
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

  const handleSubmit = () => {
    console.log('Mechanic application submitted');
    // Handle form submission
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent className="mechanic-signup-content">
        <div className="mechanic-signup-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Apply for Mechanic</h1>
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
                placeholder="Tell us about yourself and your experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="form-card">
            <div className="section-header">
              <h2 className="section-title">Documents</h2>
              <button className="btn-add-document" onClick={handleAddDocument}>
                <span className="material-icons-round">add</span>
                Add Document
              </button>
            </div>

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
                    placeholder="e.g., Driver's License, Certification"
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
          <button className="btn-submit" onClick={handleSubmit}>
            Submit Application
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MechanicSignup;
