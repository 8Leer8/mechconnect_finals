import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const goToBooking = () => history.push('/client/booking');
  const goToRequest = () => history.push('/client/request');
  const goToHome = () => history.push('/client/home');
  const goToDiscover = () => history.push('/client/discover');
  const goToProfile = () => history.push('/client/profile');

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <button className={`nav-item ${isActive('/client/booking') ? 'active' : ''}`} onClick={goToBooking}>
        <span className="material-icons-round">event</span>
        <span>Booking</span>
      </button>
      <button className={`nav-item ${isActive('/client/request') ? 'active' : ''}`} onClick={goToRequest}>
        <span className="material-icons-round">build_circle</span>
        <span>Request</span>
      </button>
      <button className={`nav-item ${isActive('/client/home') ? 'active' : ''}`} onClick={goToHome}>
        <span className="material-icons-round">home</span>
        <span>Home</span>
      </button>
      <button className={`nav-item ${isActive('/client/discover') ? 'active' : ''}`} onClick={goToDiscover}>
        <span className="material-icons-round">explore</span>
        <span>Discover</span>
      </button>
      <button className={`nav-item ${isActive('/client/profile') ? 'active' : ''}`} onClick={goToProfile}>
        <span className="material-icons-round">person</span>
        <span>Profile</span>
      </button>
    </div>
  );
};

export default BottomNav;