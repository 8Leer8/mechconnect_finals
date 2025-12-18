import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './Jobs.css';

// Interface for job data from API
interface JobData {
  booking_id?: number;
  request_id: number;
  status: string;
  amount_fee?: number;
  booked_at?: string;
  completed_at?: string;
  client_name: string;
  provider_name?: string;
  request_summary: string;
  request_type: string;
  created_at: string;
  service_location?: string;
  original_job_id?: number;
}

const Jobs: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('available');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Data states
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Job status updated');

  // Read query parameters and set initial tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');
    if (filter && ['all', 'requests', 'available', 'quotation', 'active', 'completed', 'cancelled'].includes(filter)) {
      setActiveTab(filter);
    }
  }, [location.search]);

  const goToNotifications = () => history.push('/mechanic/notifications');

  // Navigation to job detail pages
  const goToJobDetail = (job: JobData) => {
    const jobId = job.booking_id || job.request_id;
    const status = job.status;
    
    console.log('Navigating to job detail:', jobId, status);
    
    // Use request-detail for pending requests, otherwise use unified job-detail
    let route = '/mechanic/job-detail';
    if (status === 'pending') {
      route = `/mechanic/request-detail/${jobId}`;
    } else {
      // All other statuses (active, completed, cancelled, etc.) use the same job detail page
      route = `/mechanic/job-detail/${jobId}`;
    }
    
    // Pass the job data and status via state for optimistic rendering
    history.push(route, { job, status });
  };

  // Fetch jobs from API based on tab
  const fetchJobs = async (status = activeTab) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get JWT token from localStorage
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication required. Please login.');
        setJobs([]);
        setLoading(false);
        return;
      }

      let url = '';
      let endpoint = '';
      
      // Determine endpoint based on status/tab
      if (status === 'requests') {
        // Pending requests assigned to this mechanic
        endpoint = 'http://localhost:8000/api/requests/mechanic/pending/';
      } else if (status === 'available') {
        // Available jobs (quoted/accepted but not booked)
        endpoint = 'http://localhost:8000/api/requests/mechanic/available/';
      } else if (status === 'quotation') {
        // Quoted requests - requests that have been quoted
        endpoint = 'http://localhost:8000/api/requests/mechanic/quoted/';
      } else if (status === 'all') {
        // All bookings (no status filter)
        endpoint = 'http://localhost:8000/api/bookings/mechanic/';
      } else {
        // Specific status: active, completed, cancelled, backjob
        endpoint = `http://localhost:8000/api/bookings/mechanic/?status=${status}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setJobs([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns { jobs: [], total: number } or { message: string }
      const fetchedJobs = data.jobs || [];
      
      if (fetchedJobs.length === 0 && data.message) {
        console.log(data.message);
      }
      
      setJobs(fetchedJobs);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept/decline actions for requests
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required. Please login.');
        setShowToast(true);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/requests/${requestId}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept request');
      }

      setShowToast(true);
      setToastMessage('Request accepted successfully!');
      
      // Refresh the jobs list
      fetchJobs(activeTab);
    } catch (error: any) {
      console.error('Error accepting request:', error);
      setShowToast(true);
      setToastMessage(error.message || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setToastMessage('Authentication required. Please login.');
        setShowToast(true);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/requests/${requestId}/decline/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to decline request');
      }

      setShowToast(true);
      setToastMessage('Request declined successfully');
      
      // Refresh the jobs list
      fetchJobs(activeTab);
    } catch (error: any) {
      console.error('Error declining request:', error);
      setShowToast(true);
      setToastMessage(error.message || 'Failed to decline request');
    }
  };

  const handleQuotationClick = (job: JobData) => {
    // Navigate to dedicated quotation page
    history.push('/mechanic/quotation', { job });
  };

  useEffect(() => {
    const checkScrollable = () => {
      if (tabsRef.current) {
        setIsScrollable(tabsRef.current.scrollWidth > tabsRef.current.clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);

    // Fetch jobs when component mounts or tab changes
    fetchJobs(activeTab);

    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab, location.key]); // Added location.key to refetch on navigation

  const tabs = [
    { id: 'all', label: 'All', count: activeTab === 'all' ? jobs.length : undefined },
    { id: 'requests', label: 'Requests', count: activeTab === 'requests' ? jobs.length : undefined },
    { id: 'available', label: 'Available', count: activeTab === 'available' ? jobs.length : undefined },
    { id: 'quotation', label: 'Quotation', count: activeTab === 'quotation' ? jobs.length : undefined },
    { id: 'active', label: 'Active', count: activeTab === 'active' ? jobs.length : undefined },
    { id: 'completed', label: 'Completed', count: activeTab === 'completed' ? jobs.length : undefined },
    { id: 'backjob', label: 'Backjobs', count: activeTab === 'backjob' ? jobs.length : undefined },
    { id: 'cancelled', label: 'Cancelled', count: activeTab === 'cancelled' ? jobs.length : undefined },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'available':
      case 'quoted':
      case 'qouted':
        return 'status-available';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'backjob':
        return 'status-backjob';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Response';
      case 'available':
        return 'Available';
      case 'quoted':
      case 'qouted':
        return 'Quoted';
      case 'active':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'backjob':
        return 'Follow-up Job';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <IonPage>
      <IonContent className="mechanic-jobs-content" scrollY>
        {/* Header */}
        <div className="mechanic-jobs-header">
          <h1 className="mechanic-jobs-title">Jobs</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="mechanic-notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mechanic-tabs-container">
          <div
            className={`mechanic-tabs ${isScrollable ? 'scrollable' : ''}`}
            ref={tabsRef}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`mechanic-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Update URL with filter parameter
                  const newSearch = new URLSearchParams(location.search);
                  newSearch.set('filter', tab.id);
                  history.replace({ search: newSearch.toString() });
                }}
              >
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="mechanic-jobs-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <span className="material-icons-round error-icon">error_outline</span>
              <p className="error-message">{error}</p>
              <button
                className="retry-button"
                onClick={() => fetchJobs()}
              >
                Retry
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">work_outline</span>
              <h3>No jobs found</h3>
              <p>
                {activeTab === 'available'
                  ? 'No available jobs at the moment. Check back later!'
                  : activeTab === 'requests'
                  ? 'No pending requests at the moment.'
                  : activeTab === 'quotation'
                  ? 'No quoted requests at the moment.'
                  : activeTab === 'all'
                  ? 'No jobs found.'
                  : `No ${activeTab} jobs found.`
                }
              </p>
            </div>
          ) : (
            <div className="mechanic-jobs-list">
              {jobs.map((job) => (
                <div
                  key={job.booking_id || job.request_id}
                  className="mechanic-job-card"
                  onClick={() => goToJobDetail(job)}
                >
                  <div className="mechanic-job-header">
                    <div className="mechanic-job-info">
                      <div className="mechanic-job-client">{job.client_name}</div>
                      <div className="mechanic-job-summary">{job.request_summary}</div>
                      <div className="mechanic-job-id">
                        {job.booking_id ? `#BK-${job.booking_id}` : `#RQ-${job.request_id}`}
                      </div>
                    </div>
                    <div className={`mechanic-status-badge ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </div>
                  </div>

                  <div className="mechanic-job-details">
                    <div className="mechanic-job-meta">
                      <span className="mechanic-job-type">{job.request_type}</span>
                      {job.amount_fee && (
                        <span className="mechanic-job-amount">₱{job.amount_fee}</span>
                      )}
                    </div>
                    <div className="mechanic-job-time">
                      {new Date(job.booked_at || job.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {job.service_location && (
                    <div className="mechanic-job-location">
                      <span className="material-icons-round location-icon">location_on</span>
                      <span className="location-text">{job.service_location}</span>
                    </div>
                  )}

                  {job.status === 'pending' && (
                    <div className="mechanic-job-actions">
                      <button
                        className="action-button decline-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineRequest(job.request_id);
                        }}
                      >
                        <span className="material-icons-round">close</span>
                        Decline
                      </button>
                      
                      {/* Show Quotation button for all pending requests */}
                      <button
                        className="action-button quotation-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuotationClick(job);
                        }}
                      >
                        <span className="material-icons-round">receipt</span>
                        Quote
                      </button>
                      
                      <button
                        className="action-button accept-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(job.request_id);
                        }}
                      >
                        <span className="material-icons-round">check</span>
                        {job.request_type === 'direct' ? 'Confirm' : 'Accept'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Jobs;