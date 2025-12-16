import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './BackJobsForm.css';
import { bookingsAPI } from '../../../utils/api';

interface BookingDetails {
  booking_id: number;
  provider_name: string;
  service_name: string;
  provider_type: string;
}

const BackJobsForm: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceTime, setServiceTime] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Location fields
  const [houseNo, setHouseNo] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [subdivision, setSubdivision] = useState<string>('');
  const [barangay, setBarangay] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  // Get booking_id from URL
  const getBookingIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('booking_id');
  };

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const bookingId = getBookingIdFromUrl();
      console.log('BackJobsForm - booking_id from URL:', bookingId);
      
      if (!bookingId) {
        console.error('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching booking details for ID:', bookingId);
        const response = await bookingsAPI.getCompletedBooking(parseInt(bookingId));
        console.log('API Response:', response);
        
        if (response.error) {
          console.error('API Error:', response.error);
          setBookingDetails(null);
          setLoading(false);
          return;
        }
        
        if (response.data) {
          console.log('Booking details fetched successfully:', response.data);
          
          // The API returns nested data under booking_details
          const bookingData = response.data.booking_details || response.data;
          
          setBookingDetails({
            booking_id: bookingData.booking_id,
            provider_name: bookingData.provider_name,
            service_name: bookingData.service_name || 'Service',
            provider_type: bookingData.provider_type
          });
        } else {
          console.error('No data in response');
          setBookingDetails(null);
        }
      } catch (error) {
        console.error('Exception fetching booking details:', error);
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [location]);

  const goBack = () => history.goBack();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!bookingDetails) {
      alert('Booking details not loaded');
      return;
    }

    if (!issueDescription.trim()) {
      alert('Please describe the issue');
      return;
    }

    try {
      console.log('Submitting back job request...');
      
      // Get client ID from localStorage
      const userDataString = localStorage.getItem('user');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const clientId = userData?.acc_id || userData?.account_id || 1;
      console.log('BackJobsForm - Submitting with client ID:', clientId);
      
      const response = await bookingsAPI.createBackJobRequest(
        bookingDetails.booking_id,
        clientId,
        issueDescription
      );

      if (response.error) {
        alert(`Error: ${response.error}`);
        return;
      }

      console.log('Back job request created:', response.data);
      alert('Back job request submitted successfully!');
      history.push('/client/booking');
    } catch (error) {
      console.error('Error submitting back job request:', error);
      alert('Failed to submit back job request. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonContent className="back-jobs-form-content">
        {/* Header */}
        <div className="back-jobs-form-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Request Back Job</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          {loading ? (
            <div className="loading-message">Loading booking details...</div>
          ) : !bookingDetails ? (
            <div className="error-message">
              <p>Booking not found. Please try again.</p>
              <button className="btn-back-home" onClick={goBack}>Go Back</button>
            </div>
          ) : (
            <div className="form-card">
              {/* Booking ID */}
              <div className="booking-id-section">
                <span className="booking-id-label">Original Booking ID:</span>
                <span className="booking-id-value">#BK-{bookingDetails.booking_id}</span>
              </div>

              <div className="form-divider"></div>

              {/* Provider Info */}
              <div className="detail-row">
                <span className="detail-label">Provider:</span>
                <span className="detail-value provider-name">{bookingDetails.provider_name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Provider Type:</span>
                <span className="detail-value">{bookingDetails.provider_type === 'shop' ? 'Shop' : 'Mechanic'}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Original Service:</span>
                <span className="detail-value">{bookingDetails.service_name}</span>
              </div>

              <div className="form-divider"></div>

              {/* Issue Description */}
              <div className="form-section">
                <label className="form-label">Describe the Issue</label>
                <textarea
                  className="form-textarea"
                  placeholder="Please describe the problem with the completed service..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="form-divider"></div>

              {/* Issue Picture */}
              <div className="form-section">
                <h3 className="section-title">Issue Picture</h3>
              
                <div className="image-upload-container">
                  {issueImage ? (
                    <div className="uploaded-image-wrapper">
                      <img src={issueImage} alt="Issue" className="uploaded-image" />
                      <button 
                        className="remove-image-button"
                        onClick={() => setIssueImage(null)}
                      >
                        <span className="material-icons-round">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                      />
                      <div className="upload-placeholder">
                        <span className="material-icons-round upload-icon">add_photo_alternate</span>
                        <span className="upload-text">Upload issue picture</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-divider"></div>

              {/* Service Time */}
              <div className="form-section">
                <h3 className="section-title">Preferred Service Time</h3>
                
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

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">Service Location</h3>
                
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

              {/* Submit Button */}
              <button className="btn-submit-backjob" onClick={handleSubmit}>
                <span className="material-icons-round icon-sm">send</span>
                Submit Back Job Request
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BackJobsForm;
