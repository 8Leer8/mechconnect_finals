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
      // For demo purposes, skip API call and use mock data directly
      console.log('Using mock data for job details (backend not available)');
      throw new Error('Backend not available - using mock data');

      let apiUrl = '';
      let isBooking = false;

      // Determine API endpoint based on job type
      if (jobType === 'available') {
        // For available jobs, we need to fetch from requests API
        apiUrl = `http://localhost:8000/api/requests/${id}/`;
        isBooking = false;
      } else {
        // For bookings, use bookings API
        const statusMap: { [key: string]: string } = {
          'active': 'active',
          'completed': 'completed',
          'cancelled': 'cancelled'
        };
        const apiStatus = statusMap[jobType] || 'active';
        apiUrl = `http://localhost:8000/api/bookings/${apiStatus}/${id}/`;
        isBooking = true;
      }

      console.log('Fetching from:', apiUrl);
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        // Normalize the data structure
        let normalizedData: JobData;

        if (isBooking) {
          // Booking data structure
          normalizedData = {
            booking_id: data.booking_id,
            request_id: data.request?.request_id || data.request_id,
            status: data.status,
            amount_fee: data.amount_fee,
            booked_at: data.booked_at,
            client_name: data.client_name,
            provider_name: data.provider_name,
            request_summary: data.request_summary,
            request_type: data.request_type,
            created_at: data.booked_at || data.created_at,
            updated_at: data.updated_at,
            completed_at: data.completed_at,
            client_address: data.client_address,
            service_details: data.service_details
          };
        } else {
          // Request data structure
          normalizedData = {
            request_id: data.request?.request_id || data.request_id,
            status: data.request?.request_status || data.status,
            client_name: data.client_name || data.request?.client_name,
            provider_name: data.provider_name || data.request?.provider_name,
            request_summary: getRequestSummary(data),
            request_type: data.request?.request_type || data.request_type,
            created_at: data.request?.created_at || data.created_at,
            client_address: data.client_address || data.request?.client_address,
            client_contact: data.client_contact || data.request?.client_contact,
            custom_request: data.custom_request || data.request?.custom_request,
            direct_request: data.direct_request || data.request?.direct_request,
            emergency_request: data.emergency_request || data.request?.emergency_request
          };
        }

        setJobData(normalizedData);
      } else {
        setError(data.error || 'Failed to load job details');
      }
    } catch (err) {
      // On network error, use mock data
      console.error('Error fetching job details:', err);
      
      // Mock data fallback - use specific data for active job 102 (Pedro Garcia's diagnostic service)
      const mockJobData: JobData = {
        booking_id: jobType !== 'available' ? parseInt(id) : undefined,
        request_id: parseInt(id),
        status: jobType,
        amount_fee: jobType !== 'available' ? 3200 : undefined,
        booked_at: jobType !== 'available' ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : undefined, // 30 minutes ago
        client_name: id === '102' ? 'Pedro Garcia' : 'John Doe',
        provider_name: 'John Mechanic',
        request_summary: id === '102' ? 'Full diagnostic scan and error code reading' : 'Engine oil change and filter replacement',
        request_type: id === '102' ? 'Diagnostics' : 'Oil Change Service',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        updated_at: jobType === 'completed' ? new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() : undefined,
        completed_at: jobType === 'completed' ? new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() : undefined,
        client_address: {
          house_building_number: id === '102' ? '456' : '123',
          street_name: id === '102' ? 'Technology Avenue' : 'Main Street',
          subdivision_village: id === '102' ? 'Cyber Village' : 'Green Village',
          barangay: id === '102' ? 'Barangay 2' : 'Barangay 1',
          city_municipality: id === '102' ? 'Taguig City' : 'Makati City',
          province: 'Metro Manila',
          region: 'NCR',
          postal_code: id === '102' ? '1630' : '1200'
        },
        service_details: {
          service_name: id === '102' ? 'Full Diagnostics Service' : 'Oil Change Service',
          description: id === '102' ? 'Complete engine diagnostic scan with error code reading and analysis' : 'Complete engine oil change with filter replacement',
          includes: id === '102' ? 'OBD-II scan, error code analysis, diagnostic report' : 'Synthetic oil, oil filter, gasket, disposal of old oil',
          addons: 'None'
        },
        client_contact: id === '102' ? '+63 917 123 4567' : '+63 912 345 6789'
      };
      
      setJobData(mockJobData);
      setError(null); // Clear error since we have mock data
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
    fetchJobDetails();
  }, [id, jobType]);

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

  const handleCompleteJob = () => {
    // Navigate to completion process
    history.push(`/mechanic/complete-job/${id}`);
  };

  const handleContactClient = () => {
    // In a real app, this would open messaging or call
    setToastMessage('Contact feature coming soon');
    setShowToast(true);
  };

  // Show loading state
  if (loading) {
    return (
      <IonPage>
        <IonContent className="mechanic-job-detail-content" scrollY>
          <div className="loading-container">
            <div className="loading-message">Loading job details...</div>
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
          <div className="error-container">
            <div className="error-message">{error || 'Job not found'}</div>
            <button className="retry-button" onClick={fetchJobDetails}>
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

            {/* Service Details */}
            <div className="job-section">
              <h3 className="section-title">Service Details</h3>
              <div className="service-item">
                <span className="service-name">
                  {jobData.service_details?.service_name ||
                   (jobData.direct_request?.service?.name) ||
                   jobData.request_summary}
                </span>
              </div>
              {jobData.service_details?.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{jobData.service_details.description}</span>
                </div>
              )}
              {jobData.custom_request?.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <span className="detail-value">{jobData.custom_request.description}</span>
                </div>
              )}
              {jobData.emergency_request?.description && (
                <div className="detail-row">
                  <span className="detail-label">Emergency Details:</span>
                  <span className="detail-value">{jobData.emergency_request.description}</span>
                </div>
              )}
              {jobData.service_details?.includes && (
                <div className="detail-row">
                  <span className="detail-label">Includes:</span>
                  <span className="detail-value">{jobData.service_details.includes}</span>
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

            {/* Pricing */}
            {jobData.amount_fee && (
              <>
                <div className="total-section">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">₱{jobData.amount_fee.toFixed(2)}</span>
                </div>
                <div className="job-divider"></div>
              </>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {jobType === 'available' && (
                <>
                  <button className="btn-contact" onClick={handleContactClient}>
                    <span className="material-icons-round icon-sm">phone</span>
                    Contact Client
                  </button>
                  <button className="btn-accept" onClick={handleAcceptJob}>
                    <span className="material-icons-round icon-sm">check_circle</span>
                    Accept Job
                  </button>
                </>
              )}

              {jobType === 'active' && (
                <>
                  <button className="btn-contact" onClick={handleContactClient}>
                    <span className="material-icons-round icon-sm">phone</span>
                    Contact Client
                  </button>
                  <button className="btn-start" onClick={handleStartJob}>
                    <span className="material-icons-round icon-sm">play_arrow</span>
                    Start Job
                  </button>
                </>
              )}

              {jobType === 'completed' && (
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