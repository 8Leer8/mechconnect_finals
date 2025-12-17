import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './JobDetail.css';

// Interface for job data from API
interface JobData {
  booking_id?: number;
  request_id: number;
  status: string;
  amount_fee?: number;
  booked_at?: string;
  client_name: string;
  provider_name?: string;
  request_summary: string;
  request_type: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  back_job_reason?: string;
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
    service_name?: string;
    description?: string;
    includes?: string;
    addons?: string;
  };
  // Request-specific fields
  client_contact?: string;
  custom_request?: any;
  direct_request?: any;
  emergency_request?: any;
}

const JobDetail: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  console.log('JobDetail component loaded, id:', id);
  console.log('Initial loading state:', loading);

  // Get job type from URL path or query parameter
  const getJobType = () => {
    const urlParams = new URLSearchParams(history.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam) {
      return typeParam;
    }
    
    // Fallback to URL path detection
    if (history.location.pathname.includes('/active-job/')) return 'active';
    if (history.location.pathname.includes('/completed-job/')) return 'completed';
    if (history.location.pathname.includes('/cancelled-job/')) return 'cancelled';
    return 'available';
  };

  const jobType = getJobType();

  const goBack = () => {
    history.goBack();
  };

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  // Fetch job details from API
  const fetchJobDetails = async () => {
    if (!id) {
      setError('Job ID not provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      // Use the general booking detail endpoint for all bookings
      const apiUrl = `http://localhost:8000/api/bookings/${id}/`;
      
      console.log('Fetching booking details from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found');
        } else if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to load booking details (Status: ${response.status})`);
      }

      const data = await response.json();

      // Normalize the booking data structure
      const normalizedData: JobData = {
        booking_id: data.booking_id,
        request_id: data.request,
        status: data.status,
        amount_fee: data.amount_fee ? parseFloat(data.amount_fee) : undefined,
        booked_at: data.booked_at,
        client_name: data.client_name,
        provider_name: data.provider_name,
        request_summary: data.request_summary,
        request_type: data.request_type,
        created_at: data.booked_at,
        updated_at: data.updated_at,
        completed_at: data.completed_at,
        back_job_reason: data.back_job_reason,
        client_address: data.client_address,
      };

      setJobData(normalizedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.message || 'Failed to load job details. Please try again.');
      setJobData(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get request summary from request data
  const getRequestSummary = (data: any): string => {
    const request = data.request || data;

    if (request.request_type === 'custom' && request.custom_request) {
      return request.custom_request.description || "Custom service request";
    } else if (request.request_type === 'direct' && request.direct_request) {
      return `Direct service request: ${request.direct_request.service?.name || 'Unknown Service'}`;
    } else if (request.request_type === 'emergency' && request.emergency_request) {
      return request.emergency_request.description || "Emergency request";
    }
    return "Service request details";
  };

  useEffect(() => {
    console.log('useEffect triggered, fetching job details...');
    fetchJobDetails();
  }, [id, jobType]);

  console.log('Current state - loading:', loading, 'error:', error, 'jobData:', jobData ? 'exists' : 'null');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAcceptJob = async () => {
    if (!jobData) return;

    try {
      const response = await fetch(`http://localhost:8000/api/requests/${jobData.request_id}/accept/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mechanic_id: 5, // In a real app, get from auth context
        })
      });

      if (response.ok) {
        setToastMessage('Job accepted successfully!');
        setShowToast(true);
        // Navigate to jobs page with active filter after accepting
        setTimeout(() => {
          history.push('/mechanic/jobs?filter=active');
        }, 2000);
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Failed to accept job');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Network error occurred');
      setShowToast(true);
    }
  };

  const handleStartJob = () => {
    // Navigate to starting job page
    history.push(`/mechanic/start-job/${id}`);
  };

  const handleCompleteJob = async () => {
    if (!jobData) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required');
        setShowToast(true);
        return;
      }

      // Use POST to /api/bookings/{id}/complete/ endpoint
      const response = await fetch(`http://localhost:8000/api/bookings/${jobData.booking_id}/complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state with returned booking data
        if (data.booking) {
          setJobData({
            ...jobData,
            status: data.booking.status,
            completed_at: data.booking.completed_at
          });
        }
        
        setToastMessage('Job completed successfully!');
        setShowToast(true);
        
        // Navigate to completed jobs list after 2 seconds
        setTimeout(() => {
          history.push('/mechanic/jobs?filter=completed');
        }, 2000);
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Failed to complete job');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error completing job:', err);
      setToastMessage('Network error occurred');
      setShowToast(true);
    }
  };

  const handleContactClient = () => {
    // In a real app, this would open messaging or call
    setToastMessage('Contact feature coming soon');
    setShowToast(true);
  };

  const handleAcceptBackJob = async () => {
    if (!jobData) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required');
        setShowToast(true);
        return;
      }

      // Update booking status to active
      const response = await fetch(`http://localhost:8000/api/bookings/${jobData.booking_id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setJobData({
          ...jobData,
          status: 'active'
        });
        
        setToastMessage('Back job accepted! Now active.');
        setShowToast(true);
        
        setTimeout(() => {
          history.push('/mechanic/jobs?filter=active');
        }, 2000);
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Failed to accept back job');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error accepting back job:', err);
      setToastMessage('Network error occurred');
      setShowToast(true);
    }
  };

  const handleDeclineBackJob = async () => {
    if (!jobData) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required');
        setShowToast(true);
        return;
      }

      // Update booking status to completed
      const response = await fetch(`http://localhost:8000/api/bookings/${jobData.booking_id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setJobData({
          ...jobData,
          status: 'completed',
          completed_at: new Date().toISOString()
        });
        
        setToastMessage('Back job declined. Marked as completed.');
        setShowToast(true);
        
        setTimeout(() => {
          history.push('/mechanic/jobs?filter=completed');
        }, 2000);
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Failed to decline back job');
        setShowToast(true);
      }
    } catch (err) {
      console.error('Error declining back job:', err);
      setToastMessage('Network error occurred');
      setShowToast(true);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="mechanic-job-detail-content" scrollY>
          <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-spinner"></div>
            <div className="loading-message" style={{ marginTop: '20px', fontSize: '16px', color: '#333' }}>Loading job details...</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Show error state
  if (error || !jobData) {
    return (
      <IonPage>
        <IonContent className="mechanic-job-detail-content" scrollY>
          <div className="error-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <span className="material-icons-round" style={{ fontSize: '64px', color: '#ff6b6b', marginBottom: '20px' }}>error_outline</span>
            <div className="error-message" style={{ fontSize: '18px', color: '#333', marginBottom: '20px', textAlign: 'center' }}>
              {error || 'Job not found'}
            </div>
            <button 
              className="retry-button" 
              onClick={fetchJobDetails}
              style={{ 
                padding: '12px 24px', 
                background: '#ff8c42', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'quoted':
        return 'status-available';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'Available';
      case 'quoted':
        return 'Quoted';
      case 'active':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <IonPage>
      <IonContent className="mechanic-job-detail-content" scrollY>
        {/* Header */}
        <div className="mechanic-job-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-job-detail-title">Job Details</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Job Card */}
        <div className="job-detail-container">
          <div className="job-detail-card">
            {/* Job ID and Status */}
            <div className="job-header">
              <div className="job-id-badge">
                <span className="job-id">
                  {jobData.booking_id ? `#BK-${jobData.booking_id}` : `#RQ-${jobData.request_id}`}
                </span>
              </div>
              <div className={`status-badge ${getStatusColor(jobData.status)}`}>
                {getStatusText(jobData.status)}
              </div>
            </div>

            {/* Client Information */}
            <div className="job-section">
              <h3 className="section-title">Client Information</h3>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{jobData.client_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{jobData.client_contact || '+63 XXX XXX XXXX'}</span>
              </div>
            </div>

            <div className="job-divider"></div>

            {/* Back Job Reason - Show only for back_jobs status */}
            {jobData.status === 'back_jobs' && jobData.back_job_reason && (
              <>
                <div className="job-section">
                  <h3 className="section-title">Back Job Reason</h3>
                  <div className="back-job-reason">
                    <p style={{ fontSize: '13px', color: 'hsl(0, 70%, 45%)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {jobData.back_job_reason}
                    </p>
                  </div>
                </div>
                <div className="job-divider"></div>
              </>
            )}

            {/* Service Details */}
            <div className="job-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name" style={{ fontSize: '14px', display: 'block', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                  {jobData.service_details?.service_name ||
                   (jobData.direct_request?.service?.name) ||
                   jobData.request_summary}
                </span>
              </div>
              {jobData.service_details?.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value" style={{ fontSize: '13px', whiteSpace: 'normal', wordWrap: 'break-word' }}>{jobData.service_details.description}</span>
                </div>
              )}
              {jobData.custom_request?.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value" style={{ fontSize: '13px', whiteSpace: 'normal', wordWrap: 'break-word' }}>{jobData.custom_request.description}</span>
                </div>
              )}
              {jobData.emergency_request?.description && (
                <div className="detail-row">
                  <span className="detail-label">Emergency Details:</span>
                  <span className="detail-value" style={{ fontSize: '13px', whiteSpace: 'normal', wordWrap: 'break-word' }}>{jobData.emergency_request.description}</span>
                </div>
              )}
              {jobData.service_details?.includes && (
                <div className="detail-row">
                  <span className="detail-label">Includes:</span>
                  <span className="detail-value" style={{ fontSize: '13px', whiteSpace: 'normal', wordWrap: 'break-word' }}>{jobData.service_details.includes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{jobData.request_type}</span>
              </div>
            </div>

            <div className="job-divider"></div>

            {/* Timeline */}
            <div className="job-section">
              <h3 className="section-title">Timeline</h3>
              <div className="detail-row">
                <span className="detail-label">Created:</span>
                <span className="detail-value">{formatDate(jobData.created_at)}</span>
              </div>
              {jobData.booked_at && jobData.booked_at !== jobData.created_at && (
                <div className="detail-row">
                  <span className="detail-label">Booked:</span>
                  <span className="detail-value">{formatDate(jobData.booked_at)}</span>
                </div>
              )}
              {jobData.updated_at && jobData.updated_at !== jobData.created_at && jobData.updated_at !== jobData.booked_at && (
                <div className="detail-row">
                  <span className="detail-label">Updated:</span>
                  <span className="detail-value">{formatDate(jobData.updated_at)}</span>
                </div>
              )}
              {jobData.completed_at && (
                <div className="detail-row">
                  <span className="detail-label">Completed:</span>
                  <span className="detail-value">{formatDate(jobData.completed_at)}</span>
                </div>
              )}
            </div>

            <div className="job-divider"></div>

            {/* Service Location */}
            <div className="job-section">
              <div className="accordion-header" onClick={toggleLocation}>
                <span className="accordion-title">Service Location</span>
                <span className={`material-icons-round accordion-icon ${isLocationOpen ? 'open' : ''}`}>
                  expand_more
                </span>
              </div>
              {isLocationOpen && (
                <div className="accordion-content">
                  <div className="location-grid">
                    {jobData.client_address?.house_building_number && (
                      <div className="location-item">
                        <span className="location-label">House/Building No:</span>
                        <span className="location-value">{jobData.client_address.house_building_number}</span>
                      </div>
                    )}
                    {jobData.client_address?.street_name && (
                      <div className="location-item">
                        <span className="location-label">Street Name:</span>
                        <span className="location-value">{jobData.client_address.street_name}</span>
                      </div>
                    )}
                    {jobData.client_address?.subdivision_village && (
                      <div className="location-item">
                        <span className="location-label">Subdivision/Village:</span>
                        <span className="location-value">{jobData.client_address.subdivision_village}</span>
                      </div>
                    )}
                    {jobData.client_address?.barangay && (
                      <div className="location-item">
                        <span className="location-label">Barangay:</span>
                        <span className="location-value">{jobData.client_address.barangay}</span>
                      </div>
                    )}
                    {jobData.client_address?.city_municipality && (
                      <div className="location-item">
                        <span className="location-label">City/Municipality:</span>
                        <span className="location-value">{jobData.client_address.city_municipality}</span>
                      </div>
                    )}
                    {jobData.client_address?.province && (
                      <div className="location-item">
                        <span className="location-label">Province:</span>
                        <span className="location-value">{jobData.client_address.province}</span>
                      </div>
                    )}
                    {jobData.client_address?.region && (
                      <div className="location-item">
                        <span className="location-label">Region:</span>
                        <span className="location-value">{jobData.client_address.region}</span>
                      </div>
                    )}
                    {jobData.client_address?.postal_code && (
                      <div className="location-item">
                        <span className="location-label">Postal Code:</span>
                        <span className="location-value">{jobData.client_address.postal_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="job-divider"></div>

            {/* Pricing Section */}
            {jobData.amount_fee !== undefined && jobData.amount_fee !== null && (
              <>
                <div className="job-divider"></div>
                <div className="pricing-section">
                  <div className="pricing-header">
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="pricing-breakdown">
                    <div className="pricing-row">
                      <span className="pricing-label">Service Fee:</span>
                      <span className="pricing-value">
                        ₱{typeof jobData.amount_fee === 'number' ? jobData.amount_fee.toFixed(2) : parseFloat(jobData.amount_fee || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="pricing-divider"></div>
                  <div className="pricing-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">
                      ₱{typeof jobData.amount_fee === 'number' ? jobData.amount_fee.toFixed(2) : parseFloat(jobData.amount_fee || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="job-divider"></div>
              </>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {/* Show Accept button for pending/quoted requests that haven't been booked yet */}
              {(jobData.status === 'pending' || jobData.status === 'quoted') && !jobData.booking_id && (
                <>
                  <button className="btn-accept" onClick={handleAcceptJob}>
                    <span className="material-icons-round icon-sm">check_circle</span>
                    Accept Job
                  </button>
                </>
              )}

              {/* Show Complete button for active bookings */}
              {jobData.status === 'active' && (
                <>
                  <button className="btn-complete" onClick={handleCompleteJob}>
                    <span className="material-icons-round icon-sm">check_circle</span>
                    Complete Job
                  </button>
                </>
              )}

              {/* Show Accept and Decline buttons for back_jobs */}
              {jobData.status === 'back_jobs' && (
                <>
                  <button className="btn-accept" onClick={handleAcceptBackJob}>
                    <span className="material-icons-round icon-sm">check_circle</span>
                    Accept
                  </button>
                  <button className="btn-decline" onClick={handleDeclineBackJob}>
                    <span className="material-icons-round icon-sm">cancel</span>
                    Decline
                  </button>
                </>
              )}

              {/* Show contact button for completed jobs */}
              {jobData.status === 'completed' && (
                <button className="btn-contact" onClick={handleContactClient}>
                  <span className="material-icons-round icon-sm">phone</span>
                  Contact Client
                </button>
              )}
            </div>
          </div>
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

export default JobDetail;