import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import './Jobs.css';

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
  service_location?: string;
}

const Jobs: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('available');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  // Data states
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Mechanic ID - In a real app, this would come from authentication context
  const [mechanicId, setMechanicId] = useState<number>(5); // Default to 5 for testing

  const goToNotifications = () => history.push('/mechanic/notifications');

  // Navigation to specific job detail pages
  const goToJobDetail = (jobId: number, status: string) => {
    console.log('Navigating to job detail:', jobId, status);
    switch (status) {
      case 'available':
        history.push(`/mechanic/job-detail/${jobId}`);
        break;
      case 'active':
        history.push(`/mechanic/active-job/${jobId}`);
        break;
      case 'completed':
        history.push(`/mechanic/completed-job/${jobId}`);
        break;
      case 'cancelled':
        history.push(`/mechanic/cancelled-job/${jobId}`);
        break;
      default:
        history.push(`/mechanic/job-detail/${jobId}`);
    }
  };

  // Fetch jobs from API based on tab
  const fetchJobs = async (status = activeTab) => {
    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (status === 'available') {
        // Available jobs are requests that are quoted/accepted but not booked yet
        url = `http://localhost:8000/api/requests/mechanic/available/?mechanic_id=${mechanicId}`;
      } else {
        // Active and past jobs are bookings
        url = `http://localhost:8000/api/bookings/mechanic/?mechanic_id=${mechanicId}&status=${status}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || data.requests || []);
      } else {
        setError(data.error || 'Failed to load jobs');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
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
    fetchJobs();

    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab]);

  const tabs = [
    { id: 'available', label: 'Available', count: jobs.filter(job => job.status === 'available' || job.status === 'quoted').length },
    { id: 'active', label: 'Active', count: jobs.filter(job => job.status === 'active').length },
    { id: 'completed', label: 'Completed', count: jobs.filter(job => job.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: jobs.filter(job => job.status === 'cancelled').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
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
      <IonContent className="mechanic-jobs-content" fullscreen scrollY>
        {/* Header */}
        <div className="mechanic-jobs-header">
          <h1 className="mechanic-jobs-title">Jobs</h1>
          <button
            className="mechanic-notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
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
                onClick={() => setActiveTab(tab.id)}
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
                  onClick={() => goToJobDetail(job.booking_id || job.request_id, job.status)}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Job status updated"
          duration={2000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Jobs;