import { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonAlert,
} from '@ionic/react';
import {
  logOutOutline,
  peopleOutline,
  banOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  warningOutline,
  searchOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Users.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_banned: boolean;
  date_joined: string;
  roles: Array<{ account_role: string }>;
}

const HeadAdminUsers: React.FC = () => {
  const history = useHistory();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ header: '', message: '', userId: 0, action: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      history.push('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    const roles = userData.roles || [];
    const hasHeadAdminRole = roles.some((r: any) => r.account_role === 'head_admin');

    if (!hasHeadAdminRole) {
      history.push('/login');
      return;
    }

    fetchUsers();
  }, [history]);

  useEffect(() => {
    filterUsers();
  }, [searchText, filterRole, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/users/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => 
        user.roles.some(r => r.account_role === filterRole)
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => user.is_active && !user.is_banned);
    } else if (filterStatus === 'banned') {
      filtered = filtered.filter(user => user.is_banned);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleBanUser = (userId: number, username: string) => {
    setAlertConfig({
      header: 'Ban User',
      message: `Are you sure you want to ban ${username}?`,
      userId,
      action: 'ban'
    });
    setShowAlert(true);
  };

  const handleUnbanUser = (userId: number, username: string) => {
    setAlertConfig({
      header: 'Unban User',
      message: `Are you sure you want to unban ${username}?`,
      userId,
      action: 'unban'
    });
    setShowAlert(true);
  };

  const confirmAction = async () => {
    try {
      const adminId = localStorage.getItem('userId');
      const endpoint = alertConfig.action === 'ban' ? 'head-admin/ban-user' : 'head-admin/unban-user';
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          user_id: alertConfig.userId
        })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setShowAlert(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'client': return 'primary';
      case 'mechanic': return 'success';
      case 'shop_owner': return 'warning';
      case 'admin': return 'danger';
      case 'head_admin': return 'dark';
      default: return 'medium';
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <>
      <HeadAdminSidebar />
      <IonPage className="head-admin-page">
        <IonHeader>
          <IonToolbar className="dashboard-toolbar">
            <IonButtons slot="start" className="mobile-only">
              <IonMenuButton />
            </IonButtons>
            <IonTitle className="toolbar-title">User Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="users-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage all users on the platform</p>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by name, email, or username"
                    className="search-bar"
                  />
                  
                  <IonSelect
                    value={filterRole}
                    onIonChange={(e) => setFilterRole(e.detail.value)}
                    placeholder="Filter by Role"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Roles</IonSelectOption>
                    <IonSelectOption value="client">Clients</IonSelectOption>
                    <IonSelectOption value="mechanic">Mechanics</IonSelectOption>
                    <IonSelectOption value="shop_owner">Shop Owners</IonSelectOption>
                    <IonSelectOption value="admin">Admins</IonSelectOption>
                  </IonSelect>

                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="active">Active</IonSelectOption>
                    <IonSelectOption value="banned">Banned</IonSelectOption>
                    <IonSelectOption value="inactive">Inactive</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={peopleOutline} className="stat-icon" />
                <div>
                  <h3>{users.length}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{users.filter(u => u.is_active && !u.is_banned).length}</h3>
                  <p>Active</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={banOutline} className="stat-icon danger" />
                <div>
                  <h3>{users.filter(u => u.is_banned).length}</h3>
                  <p>Banned</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={closeCircleOutline} className="stat-icon warning" />
                <div>
                  <h3>{users.filter(u => !u.is_active).length}</h3>
                  <p>Inactive</p>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Users ({filteredUsers.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role(s)</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td className="username">{user.username}</td>
                          <td>{user.first_name} {user.last_name}</td>
                          <td className="email">{user.email}</td>
                          <td>
                            <div className="roles-cell">
                              {user.roles.map((role, idx) => (
                                <IonBadge key={idx} color={getRoleBadgeColor(role.account_role)}>
                                  {role.account_role.replace('_', ' ')}
                                </IonBadge>
                              ))}
                            </div>
                          </td>
                          <td>
                            {user.is_banned ? (
                              <IonBadge color="danger">Banned</IonBadge>
                            ) : user.is_active ? (
                              <IonBadge color="success">Active</IonBadge>
                            ) : (
                              <IonBadge color="warning">Inactive</IonBadge>
                            )}
                          </td>
                          <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              {user.is_banned ? (
                                <IonButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleUnbanUser(user.id, user.username)}
                                >
                                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                  Unban
                                </IonButton>
                              ) : (
                                <IonButton
                                  size="small"
                                  color="danger"
                                  onClick={() => handleBanUser(user.id, user.username)}
                                >
                                  <IonIcon icon={banOutline} slot="start" />
                                  Ban
                                </IonButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No users found matching your criteria</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={alertConfig.header}
          message={alertConfig.message}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Confirm', handler: confirmAction }
          ]}
        />
      </IonPage>
    </>
  );
};

export default HeadAdminUsers;
