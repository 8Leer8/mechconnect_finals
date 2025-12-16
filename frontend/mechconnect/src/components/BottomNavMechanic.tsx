import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './BottomNavMechanic.css';

const BottomNavMechanic: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const goToHome = () => history.push('/mechanic/home');
  const goToJobs = () => history.push('/mechanic/jobs');
  const goToMap = () => history.push('/mechanic/map');
  const goToProfile = () => history.push('/mechanic/profile');

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bottom-nav-mechanic">
      <button className={`nav-item-mechanic ${isActive('/mechanic/home') ? 'active' : ''}`} onClick={goToHome}>
        <span className="material-icons-round">home</span>
        <span>Home</span>
      </button>
      <button className={`nav-item-mechanic ${isActive('/mechanic/jobs') ? 'active' : ''}`} onClick={goToJobs}>
        <span className="material-icons-round">work</span>
        <span>Jobs</span>
      </button>
      <button className={`nav-item-mechanic ${isActive('/mechanic/map') ? 'active' : ''}`} onClick={goToMap}>
        <span className="material-icons-round">map</span>
        <span>Map</span>
      </button>
      <button className={`nav-item-mechanic ${isActive('/mechanic/profile') ? 'active' : ''}`} onClick={goToProfile}>
        <span className="material-icons-round">person</span>
        <span>Profile</span>
      </button>
    </div>
  );
};

export default BottomNavMechanic;