import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './RescheduledBooking.css';

const RescheduledBooking: React.FC = () => {
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
      <IonContent className="rescheduled-booking-content">
        <div className="rescheduled-booking-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="rescheduled-booking-title">Rescheduled Booking</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <div className="booking-id-badge rescheduled">
              <span className="booking-id">#BK-2842</span>
            </div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">Precision Service</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact number:</span>
                <span className="detail-value">+63 923 456 7890</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">Transmission Fluid Change</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Includes:</span>
                <span className="detail-value">Transmission filter, Gasket</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Add-ons:</span>
                <span className="detail-value">None</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="rescheduled-section">
              <div className="rescheduled-info">
                <span className="material-icons-round icon-sm reschedule-icon">event</span>
                <div className="rescheduled-details">
                  <span className="rescheduled-label">Rescheduled at:</span>
                  <span className="rescheduled-time">Nov 24, 2025 - 4:15 PM</span>
                </div>
              </div>
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
                      <span className="location-value">456</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Street Name:</span>
                      <span className="location-value">Oak Avenue</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Subdivision/Village:</span>
                      <span className="location-value">Sunset Heights</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">Barangay:</span>
                      <span className="location-value">San Antonio</span>
                    </div>
                    <div className="location-item">
                      <span className="location-label">City/Municipality:</span>
                      <span className="location-value">Makati City</span>
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
                      <span className="location-value">1200</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="booking-divider"></div>

            <div className="booking-section">
              <div className="detail-row">
                <span className="detail-label">Service time:</span>
                <span className="detail-value">Nov 27, 2025 - 2:00 PM</span>
              </div>
            </div>

            <div className="booking-divider"></div>

            <div className="total-section">
              <span className="total-label">Total</span>
              <span className="total-amount">₱3,800.00</span>
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

export default RescheduledBooking;
