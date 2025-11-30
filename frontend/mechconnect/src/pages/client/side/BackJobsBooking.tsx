import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './BackJobsBooking.css';

const BackJobsBooking: React.FC = () => {
  const history = useHistory();
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const goBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    history.push('/client/cancel-booking-form');
  };

  const handleComplete = () => {
    console.log('Complete booking');
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  return (
    <IonPage>
      <IonContent className="backjobs-booking-content">
        <div className="backjobs-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="backjobs-booking-title">Back Jobs Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge backjobs">
              <span className="booking-id">#BK-2841</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">Mike Johnson</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact number:</span>
                <span className="detail-value">+63 912 345 6789</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">Engine Diagnostics</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Booked at:</span>
                <span className="detail-value">Nov 20, 2025 - 8:00 AM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="backjob-section">
              <div className="backjob-badge">
                <span className="material-icons-round icon-sm">history</span>
                <span>Back Job</span>
              </div>
              <p className="backjob-note">This service requires a follow-up visit</p>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="accordion-header" onClick={toggleLocation}>
                <span className="accordion-title">Service Location</span>
                <span className={`material-icons-round accordion-icon ${isLocationOpen ? 'open' : ''}`}>
                  expand_more
                </span>
              </div>
              {isLocationOpen && (
                <div className="accordion-content">
                  <div className="location-grid">
                    <div className="location-item">
                      <span className="location-label">House/Building No:</span>
                      <span className="location-value">789</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Street Name:</span>
                      <span className="location-value">Elm Street</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Subdivision/Village:</span>
                      <span className="location-value">Pine Grove</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Barangay:</span>
                      <span className="location-value">Bagong Pag-asa</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">City/Municipality:</span>
                      <span className="location-value">Pasig City</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Province:</span>
                      <span className="location-value">Metro Manila</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Region:</span>
                      <span className="location-value">NCR</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Postal Code:</span>
                      <span className="location-value">1550</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Service time:</span>
                <span className="detail-value">Nov 28, 2025 - 3:00 PM</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-cancel" onClick={handleCancel}>
              <span className="material-icons-round icon-sm">close</span>
              Cancel
            </button>
            <button className="btn-complete" onClick={handleComplete}>
              <span className="material-icons-round icon-sm">check_circle</span>
              Complete
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BackJobsBooking;
