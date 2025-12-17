import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../components/BottomNavMechanic';
import Wallet from '../../components/Wallet';
import './Home.css';

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

const Home: React.FC = () => {
  const history = useHistory();
  const [pendingRequests, setPendingRequests] = useState<JobData[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const goToNotifications = () => history.push('/mechanic/notifications');
  const goToAvailableJobs = () => history.push('/mechanic/jobs?filter=available');
  const goToActiveJobs = () => history.push('/mechanic/jobs?filter=active');
  const goToEarnings = () => history.push('/mechanic/earnings');
  const goToProfile = () => history.push('/mechanic/profile');

  // Mock pending requests data
  const mockPendingRequests: JobData[] = [
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
    }
  ];

  // Handle accept/decline actions for requests
  const handleAcceptRequest = async (requestId: number) => {
    try {
      // In a real app, this would make an API call
      setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
      setToastMessage('Request accepted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error accepting request:', error);
      setToastMessage('Failed to accept request');
      setShowToast(true);
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      // In a real app, this would make an API call
      setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
      setToastMessage('Request declined');
      setShowToast(true);
    } catch (error) {
      console.error('Error declining request:', error);
      setToastMessage('Failed to decline request');
      setShowToast(true);
    }
  };

  // Load pending requests on component mount
  useEffect(() => {
    // In a real app, this would fetch from API
    setPendingRequests(mockPendingRequests);
  }, []);

  return (
    <IonPage>
      <IonContent className="mechanic-home-content" scrollY>
        {/* Header */}
        <div className="mechanic-home-header">
          <h1 className="mechanic-home-title">Home</h1>
          <div className="header-actions">
            <Wallet />
            <button
              className="mechanic-notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>        {/* Welcome Section */}
        <div className="mechanic-home-section">
          <div className="welcome-card">
            <h2 className="welcome-title">Welcome back, Mechanic!</h2>
            <p className="welcome-subtitle">Ready to work on some vehicles today?</p>
            <div className="earnings-overview">
              <div className="earnings-item">
                <span className="earnings-label">Today's Earnings</span>
                <span className="earnings-amount">₱1,250</span>
              </div>
              <div className="earnings-item">
                <span className="earnings-label">This Week</span>
                <span className="earnings-amount">₱8,750</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mechanic-home-section">
          <h2 className="mechanic-section-title">Quick Actions</h2>
          <div className="mechanic-quick-actions">
            <button
              className="mechanic-action-card"
              onClick={goToAvailableJobs}
            >
              <div className="mechanic-action-icon">
                <span className="material-icons-round">work_outline</span>
              </div>
              <span className="mechanic-action-label">Available Jobs</span>
            </button>

            <button
              className="mechanic-action-card"
              onClick={goToActiveJobs}
            >
              <div className="mechanic-action-icon">
                <span className="material-icons-round">engineering</span>
              </div>
              <span className="mechanic-action-label">Active Jobs</span>
            </button>

            <button
              className="mechanic-action-card"
              onClick={goToEarnings}
            >
              <div className="mechanic-action-icon">
                <span className="material-icons-round">attach_money</span>
              </div>
              <span className="mechanic-action-label">Earnings</span>
            </button>

            <button
              className="mechanic-action-card"
              onClick={goToProfile}
            >
              <div className="mechanic-action-icon">
                <span className="material-icons-round">person</span>
              </div>
              <span className="mechanic-action-label">Profile</span>
            </button>
          </div>
        </div>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mechanic-home-section">
            <div className="mechanic-section-header">
              <h2 className="mechanic-section-title">Pending Requests</h2>
              <button
                className="mechanic-view-all-btn"
                onClick={() => history.push('/mechanic/jobs?filter=requests')}
              >
                View All
              </button>
            </div>
            <div className="mechanic-requests-list">
              {pendingRequests.slice(0, 2).map((request) => (
                <div key={request.request_id} className="mechanic-request-card">
                  <div className="mechanic-request-header">
                    <div className="mechanic-request-info">
                      <div className="mechanic-request-client">{request.client_name}</div>
                      <div className="mechanic-request-summary">{request.request_summary}</div>
                      <div className="mechanic-request-meta">
                        <span className="mechanic-request-type">{request.request_type}</span>
                        <span className="mechanic-request-time">
                          {new Date(request.created_at).toLocaleString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mechanic-request-location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <span className="location-text">{request.service_location}</span>
                  </div>

                  <div className="mechanic-request-actions">
                    <button
                      className="mechanic-btn-accept"
                      onClick={() => handleAcceptRequest(request.request_id)}
                    >
                      <span className="material-icons-round">check</span>
                      Accept
                    </button>
                    <button
                      className="mechanic-btn-decline"
                      onClick={() => handleDeclineRequest(request.request_id)}
                    >
                      <span className="material-icons-round">close</span>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Job Section */}
        <div className="mechanic-home-section">
          <h2 className="mechanic-section-title">Current Job</h2>
          <div className="mechanic-job-card">
            <span className="mechanic-status-tag tag-active">
              <span className="material-icons-round" style={{fontSize: '12px'}}>play_circle</span>
              In Progress
            </span>

            <div className="mechanic-job-header">
              <div className="mechanic-job-info">
                <div className="mechanic-job-avatar">JD</div>
                <div className="mechanic-job-details">
                  <div className="mechanic-job-title">Engine Oil Change</div>
                  <div className="mechanic-job-client">John Doe</div>
                  <div className="mechanic-job-id">#JB-12345</div>
                </div>
              </div>
            </div>

            <div className="mechanic-job-footer">
              <div className="mechanic-job-time">Started 2 hours ago</div>
              <button
                className="mechanic-btn-details"
                onClick={() => history.push('/mechanic/job-detail/12345?type=active')}
              >
                <span className="material-icons-round icon-sm">visibility</span>
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mechanic-home-section">
          <h2 className="mechanic-section-title">Recent Activity</h2>
          <div className="mechanic-activity-list">
            <div
              className="mechanic-activity-item clickable"
              onClick={() => history.push('/mechanic/completed-job/12346')}
            >
              <div className="mechanic-activity-icon">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="mechanic-activity-content">
                <div className="mechanic-activity-title">Completed brake inspection</div>
                <div className="mechanic-activity-time">2 hours ago</div>
              </div>
              <div className="mechanic-activity-amount">+₱850</div>
            </div>

            <div
              className="mechanic-activity-item clickable"
              onClick={() => history.push('/mechanic/active-job/12345')}
            >
              <div className="mechanic-activity-icon">
                <span className="material-icons-round">schedule</span>
              </div>
              <div className="mechanic-activity-content">
                <div className="mechanic-activity-title">Started engine repair</div>
                <div className="mechanic-activity-time">4 hours ago</div>
              </div>
              <div className="mechanic-activity-amount">₱1,200</div>
            </div>
          </div>
        </div>
      </IonContent>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color="success"
      />

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Home;
