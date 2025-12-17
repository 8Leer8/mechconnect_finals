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

  // Mechanic ID - In a real app, this would come from authentication context
  const [mechanicId, setMechanicId] = useState<number>(5); // Default to 5 for testing

  // Mock placeholder jobs data
  const mockJobs: JobData[] = [
    {
      request_id: 11,
      status: 'pending',
      client_name: 'Roberto Diaz',
      request_summary: 'Emergency brake repair - car won\'t stop properly',
      request_type: 'Emergency Brake Service',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      service_location: 'Makati City, Philippines'
    },
    {
      request_id: 12,
      status: 'pending',
      client_name: 'Sofia Reyes',
      request_summary: 'Car won\'t start - battery might be dead',
      request_type: 'Emergency Battery Service',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      service_location: 'Taguig City, Philippines'
    },
    {
      request_id: 13,
      status: 'pending',
      client_name: 'Antonio Cruz',
      request_summary: 'Strange noise from engine when accelerating',
      request_type: 'Engine Diagnostic',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      service_location: 'Quezon City, Philippines'
    },
    {
      request_id: 1,
      status: 'available',
      client_name: 'Maria Santos',
      request_summary: 'Car battery replacement',
      request_type: 'Battery Service',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      service_location: 'Makati City, Philippines'
    },
    {
      request_id: 2,
      status: 'quoted',
      amount_fee: 2500,
      client_name: 'Juan Dela Cruz',
      request_summary: 'Engine oil change and filter replacement',
      request_type: 'Oil Change',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      service_location: 'Quezon City, Philippines'
    },
    {
      booking_id: 101,
      request_id: 3,
      status: 'active',
      amount_fee: 1800,
      booked_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      client_name: 'Ana Reyes',
      request_summary: 'Brake pad replacement and inspection',
      request_type: 'Brake Service',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      service_location: 'Pasig City, Philippines'
    },
    {
      booking_id: 102,
      request_id: 4,
      status: 'active',
      amount_fee: 3200,
      booked_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      client_name: 'Pedro Garcia',
      request_summary: 'Full diagnostic scan and error code reading',
      request_type: 'Diagnostics',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      service_location: 'Taguig City, Philippines'
    },
    {
      booking_id: 103,
      request_id: 5,
      status: 'completed',
      amount_fee: 1500,
      booked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Rosa Mendoza',
      request_summary: 'Tire rotation and pressure check',
      request_type: 'Tire Service',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Manila, Philippines'
    },
    {
      booking_id: 104,
      request_id: 6,
      status: 'completed',
      amount_fee: 4500,
      booked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Carlos Lopez',
      request_summary: 'Air conditioning system recharge and repair',
      request_type: 'AC Service',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Parañaque City, Philippines'
    },
    {
      booking_id: 105,
      request_id: 7,
      status: 'cancelled',
      amount_fee: 2800,
      booked_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Elena Torres',
      request_summary: 'Transmission fluid change',
      request_type: 'Transmission Service',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Las Piñas City, Philippines'
    },
    {
      request_id: 8,
      status: 'available',
      client_name: 'Miguel Fernandez',
      request_summary: 'Spark plug replacement and ignition check',
      request_type: 'Ignition Service',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      service_location: 'Muntinlupa City, Philippines'
    },
    {
      booking_id: 106,
      request_id: 9,
      status: 'completed',
      amount_fee: 2100,
      booked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Isabel Ramos',
      request_summary: 'Suspension inspection and alignment',
      request_type: 'Suspension Service',
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Valenzuela City, Philippines'
    },
    {
      request_id: 10,
      status: 'quoted',
      amount_fee: 3900,
      client_name: 'Francisco Morales',
      request_summary: 'Complete engine tune-up and maintenance',
      request_type: 'Engine Service',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      service_location: 'Caloocan City, Philippines'
    },
    {
      booking_id: 107,
      request_id: 14,
      status: 'backjob',
      amount_fee: 1800,
      booked_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Roberto Diaz',
      request_summary: 'Follow-up brake inspection - customer reported squeaking',
      request_type: 'Brake Service Follow-up',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Makati City, Philippines',
      original_job_id: 11
    },
    {
      booking_id: 108,
      request_id: 15,
      status: 'backjob',
      amount_fee: 2500,
      booked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Carlos Lopez',
      request_summary: 'AC system recheck - customer says cooling is weak',
      request_type: 'AC Service Follow-up',
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Parañaque City, Philippines',
      original_job_id: 104
    },
    {
      booking_id: 109,
      request_id: 16,
      status: 'backjob',
      amount_fee: 1200,
      booked_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: 'Rosa Mendoza',
      request_summary: 'Tire pressure monitoring - customer wants regular checks',
      request_type: 'Tire Service Follow-up',
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      service_location: 'Manila, Philippines',
      original_job_id: 103
    }
  ];

  // Read query parameters and set initial tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');
    if (filter && ['all', 'requests', 'available', 'active', 'completed', 'cancelled'].includes(filter)) {
      setActiveTab(filter);
    }
  }, [location.search]);

  const goToNotifications = () => history.push('/mechanic/notifications');

  // Navigation to job detail pages
  const goToJobDetail = (jobId: number, status: string) => {
    console.log('Navigating to job detail:', jobId, status);
    
    // Use specific routes for different job types
    let route = '/mechanic/job-detail';
    if (status === 'active') {
      route = '/mechanic/active-job/102'; // Always go to active job 102 (Pedro Garcia's diagnostic service) for demo
    } else if (status === 'completed') {
      route = `/mechanic/completed-job/${jobId}`;
    } else if (status === 'backjob') {
      route = `/mechanic/backjob-detail/${jobId}`;
    } else if (status === 'cancelled') {
      route = `/mechanic/cancelled-job/${jobId}`;
    } else {
      route = `${route}/${jobId}`;
    }
    
    history.push(route);
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
      } else if (status === 'requests') {
        // Requests are jobs specifically assigned to this mechanic
        url = `http://localhost:8000/api/requests/mechanic/assigned/?mechanic_id=${mechanicId}`;
      } else if (status === 'all') {
        // For 'all', we'll combine data from multiple endpoints or use mock data
        url = `http://localhost:8000/api/bookings/mechanic/?mechanic_id=${mechanicId}`;
      } else {
        // Active and past jobs are bookings
        url = `http://localhost:8000/api/bookings/mechanic/?mechanic_id=${mechanicId}&status=${status}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        let fetchedJobs = data.jobs || data.requests || [];
        
        // For 'all', try to get all statuses
        if (status === 'all') {
          // In a real app, this might require multiple API calls
          // For now, use mock data to show all types
          setJobs(mockJobs);
        } else {
          // Filter mock jobs by status if no real data
          const filteredMockJobs = mockJobs.filter(job => {
            if (status === 'available') {
              return job.status === 'available' || job.status === 'quoted';
            } else if (status === 'requests') {
              return job.status === 'pending';
            }
            return job.status === status;
          });
          
          // Use real data if available, otherwise use mock data
          setJobs(fetchedJobs.length > 0 ? fetchedJobs : filteredMockJobs);
        }
      } else {
        // On API error, use mock data
        const filteredMockJobs = status === 'all' ? mockJobs : mockJobs.filter(job => {
          if (status === 'available') {
            return job.status === 'available' || job.status === 'quoted';
          } else if (status === 'requests') {
            return job.status === 'pending';
          } else if (status === 'backjob') {
            return job.status === 'backjob';
          }
          return job.status === status;
        });
        setJobs(filteredMockJobs);
        setError(null); // Don't show error if we have mock data
      }
    } catch (err) {
      // On network error, use mock data
      const filteredMockJobs = status === 'all' ? mockJobs : mockJobs.filter(job => {
        if (status === 'available') {
          return job.status === 'available' || job.status === 'quoted';
        } else if (status === 'requests') {
          return job.status === 'pending';
        } else if (status === 'backjob') {
          return job.status === 'backjob';
        }
        return job.status === status;
      });
      setJobs(filteredMockJobs);
      setError(null); // Don't show error if we have mock data
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept/decline actions for requests
  const handleAcceptRequest = async (requestId: number) => {
    try {
      // In a real app, this would make an API call
      // await fetch(`http://localhost:8000/api/requests/${requestId}/accept/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mechanic_id: mechanicId })
      // });

      // For demo, update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.request_id === requestId 
            ? { ...job, status: 'active', booked_at: new Date().toISOString() }
            : job
        )
      );
      setShowToast(true);
      setToastMessage('Request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      setShowToast(true);
      setToastMessage('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      // In a real app, this would make an API call
      // await fetch(`http://localhost:8000/api/requests/${requestId}/decline/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mechanic_id: mechanicId })
      // });

      // For demo, update local state
      setJobs(prevJobs => 
        prevJobs.filter(job => job.request_id !== requestId)
      );
      setShowToast(true);
      setToastMessage('Request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      setShowToast(true);
      setToastMessage('Failed to decline request');
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
    { id: 'all', label: 'All', count: mockJobs.length },
    { id: 'requests', label: 'Requests', count: mockJobs.filter(job => job.status === 'pending').length },
    { id: 'available', label: 'Available', count: mockJobs.filter(job => job.status === 'available' || job.status === 'quoted').length },
    { id: 'active', label: 'Active', count: mockJobs.filter(job => job.status === 'active').length },
    { id: 'completed', label: 'Completed', count: mockJobs.filter(job => job.status === 'completed').length },
    { id: 'backjob', label: 'Backjobs', count: mockJobs.filter(job => job.status === 'backjob').length },
    { id: 'cancelled', label: 'Cancelled', count: mockJobs.filter(job => job.status === 'cancelled').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'available':
      case 'quoted':
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

                  {job.status === 'pending' && (
                    <div className="mechanic-job-actions">
                      <button
                        className="action-button accept-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(job.request_id);
                        }}
                      >
                        <span className="material-icons-round">check</span>
                        Accept
                      </button>
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