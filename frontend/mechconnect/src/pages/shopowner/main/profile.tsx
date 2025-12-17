import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import './profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const [isEditing, setIsEditing] = useState(false);

  // Mock profile data - will be replaced with API calls
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'Shop',
    lastName: 'Owner',
    email: 'shopowner@example.com',
    contactNumber: '+63 912 345 6789',
    bio: 'Experienced shop owner with a passion for automotive excellence.',
    profilePhoto: null as string | null,
    
    // Shop Information
    shopName: 'My Auto Shop',
    shopContactNumber: '+63 912 345 6789',
    shopEmail: 'shop@example.com',
    shopWebsite: 'www.example.com',
    shopDescription: 'Professional automotive repair and maintenance services.',
    shopStatus: 'open' as 'open' | 'closed',
    isVerified: false,
    
    // Account Information
    username: 'shopowner'
  });

  const goBack = () => history.goBack();
  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToDashboard = () => history.push('/shopowner/dashboard');

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: API call to save profile data
    setIsEditing(false);
  };

  const handleCancel = () => {
    // TODO: Reset to original data
    setIsEditing(false);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password page or open modal
    console.log('Change password');
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push('/login');
  };

  const handleSwitchAccount = () => {
    history.push('/auth/switch-account');
  };

  const getInitials = () => {
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <IonPage>
      <IonContent className="profile-content" fullscreen scrollY>
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="profile-header-title">Profile</h1>
          <button className="notification-button" onClick={goToNotifications}>
            <span className="material-icons-round">notifications</span>
            <span className="notification-badge"></span>
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="profile-section">
          <div className="profile-picture-section">
            <div className="profile-picture-wrapper">
              {profileData.profilePhoto ? (
                <img src={profileData.profilePhoto} alt="Profile" className="profile-picture-image" />
              ) : (
                <div className="profile-picture-placeholder">{getInitials()}</div>
              )}
              {isEditing && (
                <button className="edit-picture-button" onClick={() => console.log('Edit picture')}>
                  <span className="material-icons-round">camera_alt</span>
                </button>
              )}
            </div>
            <div className="profile-name">
              {profileData.firstName} {profileData.lastName}
            </div>
            <div className="profile-username">@{profileData.username}</div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Personal Information</h3>
              {!isEditing && (
                <button className="edit-button" onClick={handleEditProfile}>
                  <span className="material-icons-round">edit</span>
                  Edit
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.firstName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.lastName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.email}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="form-input"
                  value={profileData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.contactNumber}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              {isEditing ? (
                <textarea
                  className="form-textarea"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                />
              ) : (
                <div className="form-value">{profileData.bio || 'No bio added'}</div>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="save-button" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shop Information */}
        <div className="profile-section">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Shop Information</h3>
              {!isEditing && (
                <button className="edit-button" onClick={handleEditProfile}>
                  <span className="material-icons-round">edit</span>
                  Edit
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Shop Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="form-input"
                  value={profileData.shopName}
                  onChange={(e) => handleInputChange('shopName', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.shopName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Shop Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="form-input"
                  value={profileData.shopContactNumber}
                  onChange={(e) => handleInputChange('shopContactNumber', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.shopContactNumber}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Shop Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className="form-input"
                  value={profileData.shopEmail}
                  onChange={(e) => handleInputChange('shopEmail', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.shopEmail}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  className="form-input"
                  value={profileData.shopWebsite}
                  onChange={(e) => handleInputChange('shopWebsite', e.target.value)}
                />
              ) : (
                <div className="form-value">{profileData.shopWebsite || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              {isEditing ? (
                <textarea
                  className="form-textarea"
                  value={profileData.shopDescription}
                  onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                  rows={4}
                />
              ) : (
                <div className="form-value">{profileData.shopDescription || 'No description added'}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              {isEditing ? (
                <select
                  className="form-select"
                  value={profileData.shopStatus}
                  onChange={(e) => handleInputChange('shopStatus', e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              ) : (
                <div className="form-value">
                  <span className={`status-badge status-${profileData.shopStatus}`}>
                    {profileData.shopStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Verification</label>
              <div className="form-value">
                {profileData.isVerified ? (
                  <span className="verified-badge">
                    <span className="material-icons-round">verified</span>
                    Verified
                  </span>
                ) : (
                  <span className="unverified-badge">Not Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="profile-section">
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Account Settings</h3>
            </div>

            <button className="settings-item" onClick={handleChangePassword}>
              <div className="settings-icon">
                <span className="material-icons-round">lock</span>
              </div>
              <div className="settings-content">
                <div className="settings-label">Change Password</div>
                <div className="settings-description">Update your account password</div>
              </div>
              <div className="settings-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>

            <div className="divider"></div>

            <button className="settings-item" onClick={handleSwitchAccount}>
              <div className="settings-icon">
                <span className="material-icons-round">switch_account</span>
              </div>
              <div className="settings-content">
                <div className="settings-label">Switch Account</div>
                <div className="settings-description">Change to another role</div>
              </div>
              <div className="settings-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>

            <div className="divider"></div>

            <button className="settings-item logout-item" onClick={handleLogout}>
              <div className="settings-icon logout-icon">
                <span className="material-icons-round">logout</span>
              </div>
              <div className="settings-content">
                <div className="settings-label logout-label">Logout</div>
                <div className="settings-description">Sign out of your account</div>
              </div>
              <div className="settings-arrow">
                <span className="material-icons-round">chevron_right</span>
              </div>
            </button>
          </div>
        </div>
      </IonContent>

      <BottomNavShop />
    </IonPage>
  );
};

export default Profile;

