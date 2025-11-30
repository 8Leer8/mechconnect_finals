import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import './booking.css';

interface BookingRequest {
  id: string;
  customerName: string;
  phone: string;
  service: string;
  vehicle: string;
  duration: string;
  schedule: string;
  priceRange: string;
  notes: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected' | 'Declined';
  priority: 'High' | 'Medium' | 'Low';
}

interface SummaryCard {
  id: string;
  icon: string;
  iconClass: string;
  value: number;
  label: string;
}

const ManageBooking: React.FC = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingRequest['status']>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | BookingRequest['priority']>('All');

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  const bookings: BookingRequest[] = [
    {
      id: 'BK-20231001',
      customerName: 'Lisa Anderson',
      phone: '+1 (555) 876-5432',
      service: 'Electrical Diagnosis',
      vehicle: '2019 Volkswagen Jetta',
      duration: '2-3 hours',
      schedule: 'Oct 20, 11:00 AM',
      priceRange: '₱120-₱200',
      notes: 'Dashboard lights not working, possible electrical issue',
      status: 'Pending',
      priority: 'High'
    }
  ];

  const summaryCards: SummaryCard[] = useMemo(() => {
    const statusCounts = bookings.reduce(
      (acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      {} as Record<BookingRequest['status'], number>
    );

    return [
      { id: '1', icon: 'event', iconClass: 'summary-icon-blue', value: bookings.length, label: 'Total Bookings' },
      { id: '2', icon: 'schedule', iconClass: 'summary-icon-orange', value: statusCounts['Pending'] || 0, label: 'Pending' },
      { id: '3', icon: 'check_circle', iconClass: 'summary-icon-green', value: statusCounts['Accepted'] || 0, label: 'Accepted' },
      { id: '4', icon: 'done_all', iconClass: 'summary-icon-purple', value: statusCounts['Completed'] || 0, label: 'Completed' },
      { id: '5', icon: 'close', iconClass: 'summary-icon-red', value: statusCounts['Rejected'] || 0, label: 'Rejected' },
      { id: '6', icon: 'cancel', iconClass: 'summary-icon-grey', value: statusCounts['Declined'] || 0, label: 'Declined' }
    ];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchSearch =
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || booking.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || booking.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [bookings, searchTerm, statusFilter, priorityFilter]);

  return (
    <IonPage>
      <IonContent className="booking-content" fullscreen>
        {/* Header */}
        <div className="booking-header">
          <div className="header-left">
            <button className="menu-button">
              <span className="material-icons-round">menu</span>
            </button>
            <h1 className="header-title">MechConnect</h1>
          </div>
          <div className="header-right">
            <button className="notification-button" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge" />
            </button>
            <button className="profile-button" onClick={goToProfile}>
              SO
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="booking-title-section">
          <h2 className="booking-title">Booking Requests</h2>
          <p className="booking-subtitle">Manage bookings and assign mechanics.</p>
        </div>

        {/* Summary cards */}
        <div className="booking-section">
          <div className="summary-cards">
            {summaryCards.map((card) => (
              <div key={card.id} className="summary-card">
                <div className={`summary-icon ${card.iconClass}`}>
                  <span className="material-icons-round">{card.icon}</span>
                </div>
                <div className="summary-content">
                  <p className="summary-number">{card.value}</p>
                  <p className="summary-label">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="booking-section">
          <div className="search-filter-card">
            <div className="search-container">
              <span className="material-icons-round search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
              <div className="filter-controls">
              <div className="select-group">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Declined">Declined</option>
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)}>
                  <option value="All">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button className="clear-filters" onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setSearchTerm('');
              }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Booking list */}
        <div className="booking-section">
          <p className="booking-count">Showing {filteredBookings.length} of {bookings.length} bookings</p>
          <div className="booking-card-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {booking.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3>{booking.customerName}</h3>
                      <p>{booking.phone}</p>
                    </div>
                  </div>
                  <div className="booking-badges">
                    <span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                    <span className={`priority-pill priority-${booking.priority.toLowerCase()}`}>{booking.priority}</span>
                  </div>
                </div>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="material-icons-round detail-icon">build</span>
                    <span>{booking.service}</span>
                  </div>
                  <div className="detail-row">
                    <span className="material-icons-round detail-icon">directions_car</span>
                    <span>{booking.vehicle}</span>
                  </div>
                  <div className="detail-row">
                    <span className="material-icons-round detail-icon">schedule</span>
                    <span>{booking.duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="material-icons-round detail-icon">calendar_today</span>
                    <span>{booking.schedule}</span>
                  </div>
                  <div className="detail-row">
                    <span className="material-icons-round detail-icon">payments</span>
                    <span className="price-range">{booking.priceRange}</span>
                  </div>
                  <div className="detail-row notes-row">
                    <span className="material-icons-round detail-icon">sticky_note_2</span>
                    <span>
                      <strong>Notes:</strong> "{booking.notes}"
                    </span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button className="secondary-button">View</button>
                  <div className="action-group">
                    <button className="primary-button">Accept & Assign</button>
                    <button className="danger-button">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
      <BottomNavShop />
    </IonPage>
  );
};

export default ManageBooking;


