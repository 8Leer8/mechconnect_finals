import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './CompletedJobDetail.css';

// Interface for completed job data
interface CompletedJobData {
  booking_id: number;
  request_id: number;
  status: 'completed';
  amount_fee: number;
  booked_at: string;
  completed_at: string;
  client_name: string;
  provider_name: string;
  request_summary: string;
  request_type: string;
  created_at: string;
  work_duration?: string; // Duration of the work in HH:MM:SS format
  final_amount?: number; // Final amount charged
  client_rating?: number; // Rating given by client (1-5)
  client_feedback?: string; // Client feedback/review
  service_location: string;
  client_address?: {
    house_building_number?: string;
    street_name?: string;
    subdivision_village?: string;
    barangay?: string;
    city_municipality?: string;
    province?: string;
    region?: string;
    postal_code?: string;
  };
  service_details?: {
    service_name: string;
    description: string;
    includes?: string;
    addons?: string;
  };
  // Completed job specific fields
  before_photos?: string[];
  after_photos?: string[];
  quotes_provided?: Array<{
    id: number;
    title: string;
    amount: number;
    description: string;
    accepted: boolean;
  }>;
  mechanic_notes?: string;
}

const CompletedJobDetail: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [jobData, setJobData] = useState<CompletedJobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const goBack = () => {
    history.goBack();
  };

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  // Mock data for completed job
  const getMockCompletedJobData = (jobId: string): CompletedJobData => {
    return {
      booking_id: parseInt(jobId),
      request_id: parseInt(jobId),
      status: 'completed',
      amount_fee: 4200,
      booked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      completed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      client_name: 'Maria Santos',
      provider_name: 'Juan Mechanic',
      request_summary: 'Complete engine diagnostic and oil change service',
      request_type: 'Engine Service',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      work_duration: '01:45:23', // 1 hour 45 minutes 23 seconds
      final_amount: 4200,
      client_rating: 5,
      client_feedback: 'Excellent service! Juan was very professional and thorough. The car runs much better now.',
      service_location: 'Quezon City, Philippines',
      client_address: {
        house_building_number: '123',
        street_name: 'Main Street',
        subdivision_village: 'Green Village',
        barangay: 'San Antonio',
        city_municipality: 'Quezon City',
        province: 'Metro Manila',
        region: 'NCR',
        postal_code: '1100'
      },
      service_details: {
        service_name: 'Complete Engine Service',
        description: 'Full engine diagnostic, oil change, and performance check',
        includes: 'Engine diagnostic scan, Oil change (5W-30 synthetic), Air filter check, Cabin filter replacement',
        addons: 'Brake fluid top-up, Tire pressure check'
      },
      before_photos: ['engine_before_1.jpg', 'engine_before_2.jpg'],
      after_photos: ['engine_after_1.jpg', 'engine_after_2.jpg'],
      quotes_provided: [
        {
          id: 1,
          title: 'Basic Engine Service',
          amount: 2800,
          description: 'Oil change and basic diagnostic',
          accepted: false
        },
        {
          id: 2,
          title: 'Complete Engine Service',
          amount: 4200,
          description: 'Full diagnostic, oil change, and additional services',
          accepted: true
        }
      ],
      mechanic_notes: 'Engine was in good condition. Performed complete service as requested. All systems functioning normally after service.'
    };
  };

  // Fetch completed job details
  const fetchJobDetails = async () => {
    if (!id) {
      setError('Job ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo purposes, use mock data
      console.log('Loading completed job details for ID:', id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const mockData = getMockCompletedJobData(id);
      setJobData(mockData);
    } catch (err) {
      console.error('Error fetching completed job details:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="job-detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading completed job details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error || !jobData) {
    return (
      <IonPage>
        <IonContent className="job-detail-content">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error || 'Job not found'}</p>
            <button className="btn-primary" onClick={goBack}>Go Back</button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="job-detail-content" scrollY>
        {/* Header */}
        <div className="mechanic-job-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-job-detail-title">Completed Job</h1>
          <div className="header-actions">
            <div className="status-badge completed">
              <span className="material-icons-round status-icon">check_circle</span>
              Completed
            </div>
            <Wallet />
            <button
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Job Summary Card */}
        <div className="job-summary-card">
          <div className="job-header">
            <div className="job-title-section">
              <h2 className="job-title">{jobData.request_summary}</h2>
              <p className="job-type">{jobData.request_type}</p>
            </div>
            <div className="job-amount">
              <span className="amount-label">Final Amount</span>
              <span className="amount-value">{formatCurrency(jobData.final_amount || jobData.amount_fee)}</span>
            </div>
          </div>

          <div className="job-meta">
            <div className="meta-item">
              <span className="material-icons-round meta-icon">person</span>
              <span className="meta-label">Client:</span>
              <span className="meta-value">{jobData.client_name}</span>
            </div>
            <div className="meta-item">
              <span className="material-icons-round meta-icon">event</span>
              <span className="meta-label">Completed:</span>
              <span className="meta-value">{formatDate(jobData.completed_at)}</span>
            </div>
            {jobData.work_duration && (
              <div className="meta-item">
                <span className="material-icons-round meta-icon">schedule</span>
                <span className="meta-label">Work Duration:</span>
                <span className="meta-value">{jobData.work_duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Client Rating & Feedback */}
        {jobData.client_rating && (
          <div className="rating-card">
            <h3 className="section-title">Client Review</h3>
            <div className="rating-stars">
              {renderStars(jobData.client_rating)}
              <span className="rating-text">{jobData.client_rating}/5</span>
            </div>
            {jobData.client_feedback && (
              <p className="client-feedback">"{jobData.client_feedback}"</p>
            )}
          </div>
        )}

        {/* Service Details */}
        {jobData.service_details && (
          <div className="service-details-card">
            <h3 className="section-title">Service Details</h3>
            <div className="service-info">
              <h4 className="service-name">{jobData.service_details.service_name}</h4>
              <p className="service-description">{jobData.service_details.description}</p>

              {jobData.service_details.includes && (
                <div className="service-includes">
                  <h5>Included Services:</h5>
                  <p>{jobData.service_details.includes}</p>
                </div>
              )}

              {jobData.service_details.addons && (
                <div className="service-addons">
                  <h5>Additional Services:</h5>
                  <p>{jobData.service_details.addons}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes Provided */}
        {jobData.quotes_provided && jobData.quotes_provided.length > 0 && (
          <div className="quotes-card">
            <h3 className="section-title">Quotes Provided</h3>
            <div className="quotes-list">
              {jobData.quotes_provided.map(quote => (
                <div key={quote.id} className={`quote-item ${quote.accepted ? 'accepted' : ''}`}>
                  <div className="quote-header">
                    <span className="quote-title">{quote.title}</span>
                    <span className="quote-amount">{formatCurrency(quote.amount)}</span>
                    {quote.accepted && <span className="accepted-badge">Accepted</span>}
                  </div>
                  <p className="quote-description">{quote.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Photos */}
        {(jobData.before_photos || jobData.after_photos) && (
          <div className="photos-card">
            <h3 className="section-title">Work Photos</h3>
            {jobData.before_photos && jobData.before_photos.length > 0 && (
              <div className="photo-section">
                <h4>Before Service</h4>
                <div className="photo-grid">
                  {jobData.before_photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src="/placeholder-image.jpg" alt={`Before ${index + 1}`} className="photo-preview" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {jobData.after_photos && jobData.after_photos.length > 0 && (
              <div className="photo-section">
                <h4>After Service</h4>
                <div className="photo-grid">
                  {jobData.after_photos.map((photo, index) => (
                    <div key={index} className="photo-preview" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mechanic Notes */}
        {jobData.mechanic_notes && (
          <div className="notes-card">
            <h3 className="section-title">Mechanic Notes</h3>
            <p className="mechanic-notes">{jobData.mechanic_notes}</p>
          </div>
        )}

        {/* Location Details */}
        <div className="location-card">
          <div className="location-header" onClick={toggleLocation}>
            <h3 className="section-title">Service Location</h3>
            <span className={`toggle-icon ${isLocationOpen ? 'open' : ''}`}>
              <span className="material-icons-round">expand_more</span>
            </span>
          </div>

          <div className="location-summary">
            <span className="material-icons-round location-icon">location_on</span>
            <span className="location-text">{jobData.service_location}</span>
          </div>

          {isLocationOpen && jobData.client_address && (
            <div className="location-details">
              <div className="address-item">
                <span className="address-label">Address:</span>
                <span className="address-value">
                  {jobData.client_address.house_building_number} {jobData.client_address.street_name}
                  {jobData.client_address.subdivision_village && `, ${jobData.client_address.subdivision_village}`}
                </span>
              </div>
              <div className="address-item">
                <span className="address-label">Barangay:</span>
                <span className="address-value">{jobData.client_address.barangay}</span>
              </div>
              <div className="address-item">
                <span className="address-label">City:</span>
                <span className="address-value">{jobData.client_address.city_municipality}</span>
              </div>
              <div className="address-item">
                <span className="address-label">Province:</span>
                <span className="address-value">{jobData.client_address.province}</span>
              </div>
              {jobData.client_address.postal_code && (
                <div className="address-item">
                  <span className="address-label">Postal Code:</span>
                  <span className="address-value">{jobData.client_address.postal_code}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-contact" onClick={() => setToastMessage('Contact feature coming soon')}>
            <span className="material-icons-round icon-sm">phone</span>
            Contact Client
          </button>
          <button className="btn-primary" onClick={() => history.push('/mechanic/jobs?filter=completed')}>
            <span className="material-icons-round icon-sm">list</span>
            View All Completed Jobs
          </button>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default CompletedJobDetail;