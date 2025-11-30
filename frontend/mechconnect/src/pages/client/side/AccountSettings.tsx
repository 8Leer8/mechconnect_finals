import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './AccountSettings.css';

const AccountSettings: React.FC = () => {
  const history = useHistory();
  
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+63 912 345 6789',
    houseBuildingNumber: '123',
    streetName: 'Main Street',
    subdivisionVillage: 'Sunset Village',
    barangay: 'Tetuan',
    cityMunicipality: 'Zamboanga City',
    province: 'Zamboanga del Sur',
    region: 'Region IX',
    postalCode: '7000'
  });

  const goBack = () => {
    history.goBack();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditProfile = () => {
    console.log('Edit profile picture');
  };

  const handleSaveChanges = () => {
    console.log('Save changes:', formData);
  };

  const handleChangePassword = () => {
    console.log('Change password');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account');
  };

  return (
    <IonPage>
      <IonContent className="account-settings-content">
        <div className="account-settings-header">
          <button 
            className="back-button"
            onClick={goBack}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="account-settings-title">Account Settings</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="account-settings-container">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-wrapper">
              <div className="profile-picture">JD</div>
              <button className="edit-picture-button" onClick={handleEditProfile}>
                <span className="material-icons-round">edit</span>
              </button>
            </div>
            <div className="profile-username">johndoe</div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">Personal Information</div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <div className="section-header">Address Information</div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">House/Building Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.houseBuildingNumber}
                  onChange={(e) => handleInputChange('houseBuildingNumber', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Street Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.streetName}
                  onChange={(e) => handleInputChange('streetName', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subdivision/Village</label>
              <input
                type="text"
                className="form-input"
                value={formData.subdivisionVillage}
                onChange={(e) => handleInputChange('subdivisionVillage', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Barangay</label>
              <input
                type="text"
                className="form-input"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City/Municipality</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cityMunicipality}
                  onChange={(e) => handleInputChange('cityMunicipality', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Province</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Region</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSaveChanges}>
              <span className="material-icons-round">save</span>
              Save Changes
            </button>
          </div>

          {/* Security Actions */}
          <div className="list-section">
            <div className="section-title">Security</div>
            
            <button className="list-item" onClick={handleChangePassword}>
              <div className="item-icon icon-primary">
                <span className="material-icons-round">lock</span>
              </div>
              <div className="item-content">
                <div className="item-label">Change Password</div>
                <div className="item-description">Update your password to keep your account secure</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="list-section danger-section">
            <div className="section-title">Danger Zone</div>
            
            <button className="list-item" onClick={handleDeleteAccount}>
              <div className="item-icon icon-danger">
                <span className="material-icons-round">delete</span>
              </div>
              <div className="item-content">
                <div className="item-label">Delete Account</div>
                <div className="item-description">Permanently delete your account and all data</div>
              </div>
              <div className="item-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccountSettings;
