import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import './RescheduleBookingForm.css';

const RescheduleBookingForm: React.FC = () => {
  const history = useHistory();
  const [reason, setReason] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceTime, setServiceTime] = useState<string>('');
  
  // Location fields
  const [houseNo, setHouseNo] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [subdivision, setSubdivision] = useState<string>('');
  const [barangay, setBarangay] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  const goBack = () => history.goBack();

  const handleSubmit = () => {
    console.log('Reschedule booking submitted');
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="reschedule-form-content">
        {/* Header */}
        <div className="reschedule-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Reschedule Booking</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <div className="form-card">
            {/* Booking ID */}
            <div className="booking-id-section">
              <span className="booking-id-label">Booking ID:</span>
              <span className="booking-id-value">#BK-2847</span>
            </div>

            <div className="form-divider"></div>

            {/* Reason for Reschedule */}
            <div className="form-section">
              <label className="form-label">Reason for Reschedule</label>
              <textarea
                className="form-textarea"
                placeholder="Please provide a reason for rescheduling..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-divider"></div>

            {/* New Service Time */}
            <div className="form-section">
              <h3 className="section-title">New Service Time</h3>
              
              <div className="input-group">
                <label className="input-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-divider"></div>

            {/* New Location */}
            <div className="form-section">
              <h3 className="section-title">New Service Location</h3>
              
              <div className="location-grid">
                <div className="input-group">
                  <label className="input-label">House/Building No</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Street Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Main Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Subdivision/Village</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Green Valley"
                    value={subdivision}
                    onChange={(e) => setSubdivision(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Barangay</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Poblacion"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">City/Municipality</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Quezon City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Province</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Metro Manila"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Region</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="NCR"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1100"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button className="btn-submit-reschedule" onClick={handleSubmit}>
            <span className="material-icons-round icon-sm">event</span>
            Submit Reschedule Request
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RescheduleBookingForm;
