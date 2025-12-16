import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import BottomNavMechanic from '../../components/BottomNavMechanic';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  const goToNotifications = () => history.push('/mechanic/notifications');
  const goToAvailableJobs = () => history.push('/mechanic/jobs?filter=available');
  const goToActiveJobs = () => history.push('/mechanic/jobs?filter=active');
  const goToEarnings = () => history.push('/mechanic/earnings');
  const goToProfile = () => history.push('/mechanic/profile');

  return (
    <IonPage>
      <IonContent className="mechanic-home-content" scrollY>
        {/* Header */}
        <div className="mechanic-home-header">
          <h1 className="mechanic-home-title">Home</h1>
          <button
            className="mechanic-notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
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

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Home;
