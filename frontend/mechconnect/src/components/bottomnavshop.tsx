import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './bottomnavshop.css';

const BottomNavShop: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const goToDashboard = () => history.push('/shopowner/dashboard');
  const goToBookings = () => history.push('/shopowner/manage-bookings');
  const goToMechanics = () => history.push('/shopowner/mechanics');
  const goToShop = () => history.push('/shopowner/shop');
  const goToRevenue = () => history.push('/shopowner/revenue');

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bottom-nav-shop">
      <button className={`nav-item-shop ${isActive('/shopowner/dashboard') ? 'active' : ''}`} onClick={goToDashboard}>
        <span className="material-icons-round">dashboard</span>
        <span>Dashboard</span>
      </button>
      <button className={`nav-item-shop ${isActive('/shopowner/manage-bookings') ? 'active' : ''}`} onClick={goToBookings}>
        <span className="material-icons-round">event</span>
        <span>Bookings</span>
      </button>
      <button className={`nav-item-shop ${isActive('/shopowner/mechanics') ? 'active' : ''}`} onClick={goToMechanics}>
        <span className="material-icons-round">engineering</span>
        <span>Mechanics</span>
      </button>
      <button className={`nav-item-shop ${isActive('/shopowner/shop') ? 'active' : ''}`} onClick={goToShop}>
        <span className="material-icons-round">store</span>
        <span>Shop</span>
      </button>
      <button className={`nav-item-shop ${isActive('/shopowner/revenue') ? 'active' : ''}`} onClick={goToRevenue}>
        <span className="material-icons-round">attach_money</span>
        <span>Revenue</span>
      </button>
    </div>
  );
};

export default BottomNavShop;

