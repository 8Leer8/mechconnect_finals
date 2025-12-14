import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import './Map.css';

const Map: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);

  const goToNotifications = () => history.push('/mechanic/notifications');

  // Mock data for nearby jobs
  const [nearbyJobs] = useState([
    {
      id: 1,
      title: 'Engine Repair',
      client: 'John Doe',
      distance: '2.3 km',
      location: 'Makati City',
      urgency: 'high',
      estimatedTime: '2 hours'
    },
    {
      id: 2,
      title: 'Brake Inspection',
      client: 'Jane Smith',
      distance: '3.8 km',
      location: ' BGC, Taguig',
      urgency: 'medium',
      estimatedTime: '1 hour'
    },
    {
      id: 3,
      title: 'Oil Change',
      client: 'Mike Johnson',
      distance: '5.2 km',
      location: 'Quezon City',
      urgency: 'low',
      estimatedTime: '45 mins'
    }
  ]);

  const goToJobDetail = (jobId: number) => {
    history.push(`/mechanic/job-detail/${jobId}`);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'urgency-high';
      case 'medium':
        return 'urgency-medium';
      case 'low':
        return 'urgency-low';
      default:
        return 'urgency-low';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Standard';
    }
  };

  return (
    <IonPage>
      <IonContent className="mechanic-map-content" scrollY>
        {/* Header */}
        <div className="mechanic-map-header">
          <h1 className="mechanic-map-title">Map</h1>
          <button
            className="mechanic-notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="mechanic-map-container">
          <div className="map-placeholder">
            <div className="map-content">
              <span className="material-icons-round map-icon">map</span>
              <h3>Interactive Map</h3>
              <p>Map integration would go here</p>
              <div className="current-location">
                <span className="material-icons-round location-icon">my_location</span>
                <span className="location-text">Current Location: Manila, Philippines</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mechanic-map-actions">
          <button className="map-action-button">
            <span className="material-icons-round">navigation</span>
            <span>Navigate</span>
          </button>
          <button className="map-action-button">
            <span className="material-icons-round">refresh</span>
            <span>Refresh</span>
          </button>
          <button className="map-action-button">
            <span className="material-icons-round">filter_list</span>
            <span>Filter</span>
          </button>
        </div>

        {/* Nearby Jobs */}
        <div className="mechanic-map-section">
          <h2 className="mechanic-map-section-title">Nearby Jobs</h2>
          <div className="nearby-jobs-list">
            {nearbyJobs.map((job) => (
              <div
                key={job.id}
                className="nearby-job-card"
                onClick={() => goToJobDetail(job.id)}
              >
                <div className="job-header">
                  <div className="job-info">
                    <h4 className="job-title">{job.title}</h4>
                    <p className="job-client">{job.client}</p>
                  </div>
                  <div className={`job-urgency ${getUrgencyColor(job.urgency)}`}>
                    {getUrgencyLabel(job.urgency)}
                  </div>
                </div>

                <div className="job-details">
                  <div className="job-location">
                    <span className="material-icons-round location-icon">location_on</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="job-meta">
                    <span className="job-distance">{job.distance}</span>
                    <span className="job-time">{job.estimatedTime}</span>
                  </div>
                </div>

                <div className="job-actions">
                  <button className="accept-job-button">
                    Accept Job
                  </button>
                  <button className="view-details-button">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mechanic-map-legend">
          <h3>Map Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-icon high-priority"></div>
              <span>High Priority Jobs</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon medium-priority"></div>
              <span>Medium Priority Jobs</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon low-priority"></div>
              <span>Low Priority Jobs</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon current-location"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Location updated"
          duration={2000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Map;