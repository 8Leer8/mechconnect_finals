import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import InviteMechanicModal from '../modal/InviteMechanicModal';
import './mechanic.css';

interface MechanicData {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  joinedDate: string;
  expertise: string;
  earnings: string;
  rating: string;
  bookings: number;
  experience: string;
  status: 'Active' | 'Invited';
}

interface SummaryCardData {
  id: string;
  icon: string;
  iconClass: string;
  value: string | number;
  label: string;
  subtext?: string;
}

const Mechanic: React.FC = () => {
  const history = useHistory();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Invited'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const goToNotifications = () => history.push('/shopowner/notifications');
  const goToProfile = () => history.push('/shopowner/profile');

  // Sample mechanic data
  const [mechanics] = useState<MechanicData[]>([]);

  const filteredMechanics = useMemo(() => {
    return mechanics.filter((mechanic) => {
      const matchesFilter = activeFilter === 'All' || mechanic.status === activeFilter;
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        mechanic.name.toLowerCase().includes(searchTerm) ||
        mechanic.email.toLowerCase().includes(searchTerm) ||
        mechanic.expertise.toLowerCase().includes(searchTerm);
      return matchesFilter && matchesSearch;
    });
  }, [mechanics, activeFilter, searchQuery]);

  const summaryStats = useMemo(() => {
    const totalMechanics = mechanics.length;
    const activeMechanics = mechanics.filter((m) => m.status === 'Active').length;
    const invitedMechanics = mechanics.filter((m) => m.status === 'Invited').length;
    const totalEarnings = mechanics.reduce((sum, m) => {
      const earnings = parseFloat(m.earnings.replace('₱', '').replace(',', '')) || 0;
      return sum + earnings;
    }, 0);
    const totalBookings = mechanics.reduce((sum, m) => sum + m.bookings, 0);
    const avgRating =
      mechanics.filter((m) => m.rating !== '0').reduce((sum, m, _, arr) => sum + parseFloat(m.rating) / arr.length, 0) || 0;

    return {
      totalMechanics,
      activeMechanics,
      invitedMechanics,
      totalEarnings: `₱${totalEarnings.toLocaleString()}`,
      totalBookings,
      avgRating: avgRating.toFixed(1)
    };
  }, [mechanics]);

  const summaryCards: SummaryCardData[] = useMemo(
    () => [
      {
        id: '1',
        icon: 'people',
        iconClass: 'summary-icon-blue',
        value: summaryStats.totalMechanics,
        label: 'Total Mechanics',
        subtext: 'This month'
      },
      {
        id: '2',
        icon: 'check_circle',
        iconClass: 'summary-icon-green',
        value: summaryStats.activeMechanics,
        label: 'Active',
        subtext: 'Currently working'
      },
      {
        id: '3',
        icon: 'person_add',
        iconClass: 'summary-icon-purple',
        value: summaryStats.invitedMechanics,
        label: 'Invited',
        subtext: 'Awaiting response'
      },
      {
        id: '4',
        icon: 'payments',
        iconClass: 'summary-icon-orange',
        value: summaryStats.totalEarnings,
        label: 'Total Earnings',
        subtext: 'This month'
      },
      {
        id: '5',
        icon: 'event',
        iconClass: 'summary-icon-blue',
        value: summaryStats.totalBookings,
        label: 'Total Bookings',
        subtext: 'All time'
      },
      {
        id: '6',
        icon: 'star',
        iconClass: 'summary-icon-gold',
        value: summaryStats.avgRating,
        label: 'Avg Rating',
        subtext: 'Customer reviews'
      }
    ],
    [summaryStats]
  );

  return (
    <IonPage>
      <IonContent className="mechanic-content" fullscreen scrollY>
        {/* Header */}
        <div className="mechanic-header">
          <div className="header-left">
            <h1 className="header-title">MechConnect</h1>
          </div>
          <div className="header-right">
            <button className="notification-button" onClick={goToNotifications}>
              <span className="material-icons-round">notifications</span>
              <span className="notification-badge"></span>
            </button>
            <button className="profile-button" onClick={goToProfile}>
              SO
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mechanic-title-section">
          <h2 className="mechanic-title">Mechanics Management</h2>
          <p className="mechanic-subtitle">Manage your shop's mechanics, add new team members, and track performance.</p>
        </div>

        {/* Summary cards */}
        <div className="mechanic-section">
          <div className="summary-cards">
            {summaryCards.map((card) => (
              <div key={card.id} className="summary-card">
                <div className={`summary-icon ${card.iconClass}`}>
                  <span className="material-icons-round">{card.icon}</span>
                </div>
                <div className="summary-content">
                  <p className="summary-number">{card.value}</p>
                  <p className="summary-label">{card.label}</p>
                  {card.subtext && <p className="summary-subtext">{card.subtext}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & filters */}
        <div className="mechanic-section">
          <div className="search-filter-card">
            <div className="search-container">
              <span className="material-icons-round search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search mechanics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <div className="filter-buttons">
                <button
                  className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All
                </button>
                <button
                  className={`filter-button ${activeFilter === 'Active' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Active')}
                >
                  Active
                </button>
                <button
                  className={`filter-button ${activeFilter === 'Invited' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Invited')}
                >
                  Invited
                </button>
              </div>
                <button className="invite-button" onClick={() => setIsInviteModalOpen(true)}>
                <span className="material-icons-round">person_add</span>
                Invite Mechanic
              </button>
            </div>
          </div>
        </div>

        {/* Mechanic list */}
        <div className="mechanic-section">
          <div className="mechanics-cards-container">
            {filteredMechanics.length ? (
              filteredMechanics.map((mechanic) => (
                <div key={mechanic.id} className="mechanic-profile-card">
                  <div className="mechanic-card-header">
                    <div className="mechanic-card-avatar">{mechanic.initials}</div>
                    <div className={`status-badge status-${mechanic.status.toLowerCase()}`}>{mechanic.status}</div>
                  </div>
                  <div className="mechanic-card-info">
                    <div className="mechanic-card-top">
                      <div>
                        <h3 className="mechanic-card-name">{mechanic.name}</h3>
                        <p className="mechanic-card-specialty">{mechanic.expertise}</p>
                        <p className="mechanic-card-performance">
                          {mechanic.bookings} bookings {mechanic.rating !== '0' && `• ★ ${mechanic.rating}`}
                        </p>
                      </div>
                      <div className="mechanic-card-meta">
                        <p className="meta-label">Experience</p>
                        <p className="meta-value">{mechanic.experience}</p>
                        <p className="meta-label">Bookings</p>
                        <p className="meta-value">{mechanic.bookings}</p>
                      </div>
                    </div>
                    <div className="mechanic-card-details">
                      <div className="mechanic-card-detail">
                        <span className="material-icons-round detail-icon">email</span>
                        <span>{mechanic.email}</span>
                      </div>
                      <div className="mechanic-card-detail">
                        <span className="material-icons-round detail-icon">phone</span>
                        <span>{mechanic.phone}</span>
                      </div>
                      <div className="mechanic-card-detail">
                        <span className="material-icons-round detail-icon">calendar_today</span>
                        <span>Joined: {mechanic.joinedDate}</span>
                      </div>
                    </div>
                    <div className="mechanic-card-revenue">
                      <p className="mechanic-revenue-amount">{mechanic.earnings}</p>
                      <p className="mechanic-revenue-label">Earnings</p>
                    </div>
                    <button className="remove-button">
                      <span className="material-icons-round">delete</span>
                      Remove from Shop
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-mechanics-message">
                <p>No mechanics found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
      <InviteMechanicModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      <BottomNavShop />
    </IonPage>
  );
};

export default Mechanic;