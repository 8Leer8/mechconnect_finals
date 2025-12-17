import { IonContent, IonPage, IonToast, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './Profile.css';

interface MechanicProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  specialties: string[];
  experience: string;
  location: string;
  profileImage?: string;
}

const Profile: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Feature coming soon');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mock profile data - in a real app, this would come from an API
  const profileData: MechanicProfile = {
    id: 5,
    firstName: 'John',
    lastName: 'Mechanic',
    email: 'john.mechanic@example.com',
    phone: '+63 912 345 6789',
    rating: 4.8,
    totalJobs: 156,
    completedJobs: 152,
    specialties: ['Engine Repair', 'Brake Systems', 'Electrical', 'Diagnostics'],
    experience: '8 years',
    location: 'Makati City, Philippines',
    profileImage: undefined // Would be a URL in real app
  };

  const goToSettings = () => {
    setShowSettingsModal(true);
  };

  const switchAccount = () => {
    // Frontend-only: clear local storage and redirect to login
    localStorage.clear();
    history.push('/login');
    setShowSettingsModal(false);
  };

  const switchToClient = () => {
    // Navigate to switch account page to change roles
    history.push('/auth/switch-account');
    setShowSettingsModal(false);
  };

  const editProfile = () => {
    setToastMessage('Edit Profile feature coming soon');
    setShowToast(true);
    setShowSettingsModal(false);
    // history.push('/mechanic/edit-profile'); // For future implementation
  };

  const goToReviews = () => {
    history.push('/mechanic/reviews');
  };

  const goToEarnings = () => {
    history.push('/mechanic/earnings');
  };

  const goToSupport = () => {
    setToastMessage('Support feature coming soon');
    setShowToast(true);
    // history.push('/mechanic/support');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="material-icons-round star-filled">star</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="material-icons-round star-half">star_half</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="material-icons-round star-empty">star_border</span>
      );
    }

    return stars;
  };

  return (
    <IonPage>
      <IonContent className="mechanic-profile-content" scrollY>
        {/* Header */}
        <div className="mechanic-profile-header">
          <button className="back-button" onClick={() => history.goBack()}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-profile-title">Profile</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="settings-button"
              onClick={goToSettings}
            >
              <span className="material-icons-round">settings</span>
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-avatar">
            {profileData.profileImage ? (
              <img src={profileData.profileImage} alt="Profile" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profileData.firstName[0]}{profileData.lastName[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
            <div className="profile-rating">
              <div className="rating-stars">
                {renderStars(profileData.rating)}
              </div>
              <span className="rating-score">{profileData.rating}</span>
              <span className="rating-count">({profileData.totalJobs} jobs)</span>
            </div>
            <div className="profile-location">
              <span className="material-icons-round location-icon">location_on</span>
              {profileData.location}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <span className="material-icons-round">work</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{profileData.totalJobs}</span>
                <span className="stat-label">Total Jobs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{profileData.completedJobs}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">{profileData.totalJobs - profileData.completedJobs}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <span className="material-icons-round">attach_money</span>
              </div>
              <div className="stat-info">
                <span className="stat-value">₱125K+</span>
                <span className="stat-label">Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details-section">
          <h3 className="section-title">Profile Details</h3>

          <div className="detail-item">
            <span className="detail-icon">
              <span className="material-icons-round">email</span>
            </span>
            <div className="detail-content">
              <span className="detail-label">Email</span>
              <span className="detail-value">{profileData.email}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">
              <span className="material-icons-round">phone</span>
            </span>
            <div className="detail-content">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{profileData.phone}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">
              <span className="material-icons-round">work_history</span>
            </span>
            <div className="detail-content">
              <span className="detail-label">Experience</span>
              <span className="detail-value">{profileData.experience}</span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="specialties-section">
          <h3 className="section-title">Specialties</h3>
          <div className="specialties-tags">
            {profileData.specialties.map((specialty, index) => (
              <span key={index} className="specialty-tag">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="menu-section">
          <div className="menu-item" onClick={goToEarnings}>
            <div className="menu-icon">
              <span className="material-icons-round">attach_money</span>
            </div>
            <div className="menu-content">
              <span className="menu-title">Earnings</span>
              <span className="menu-subtitle">View your earnings and transactions</span>
            </div>
            <div className="menu-arrow">
              <span className="material-icons-round">chevron_right</span>
            </div>
          </div>

          <div className="menu-item" onClick={goToReviews}>
            <div className="menu-icon">
              <span className="material-icons-round">star</span>
            </div>
            <div className="menu-content">
              <span className="menu-title">Reviews & Ratings</span>
              <span className="menu-subtitle">See client feedback</span>
            </div>
            <div className="menu-arrow">
              <span className="material-icons-round">chevron_right</span>
            </div>
          </div>

          <div className="menu-item" onClick={goToSupport}>
            <div className="menu-icon">
              <span className="material-icons-round">help</span>
            </div>
            <div className="menu-content">
              <span className="menu-title">Support</span>
              <span className="menu-subtitle">Get help and contact support</span>
            </div>
            <div className="menu-arrow">
              <span className="material-icons-round">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="primary"
        />
      </IonContent>

      {/* Settings Modal */}
      <IonModal isOpen={showSettingsModal} onDidDismiss={() => setShowSettingsModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowSettingsModal(false)}>
                <span className="material-icons-round">close</span>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem button onClick={editProfile}>
              <span className="material-icons-round" slot="start">edit</span>
              <IonLabel>Edit Profile</IonLabel>
            </IonItem>
            <IonItem button onClick={switchToClient}>
              <span className="material-icons-round" slot="start">switch_account</span>
              <IonLabel>Switch to Client</IonLabel>
            </IonItem>
            <IonItem button onClick={switchAccount}>
              <span className="material-icons-round" slot="start">person</span>
              <IonLabel>Switch Account</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Profile;