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
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonAlert,
} from '@ionic/react';
import {
  logOutOutline,
  personCircleOutline,
  addOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  shieldCheckmarkOutline,
  keyOutline,
  personAddOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './AccountManagement.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface AdminAccount {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  permissions: string[];
}

const AccountManagement: React.FC = () => {
  const history = useHistory();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    is_active: true,
    permissions: [] as string[]
  });

  const availablePermissions = [
    'manage_users',
    'manage_verifications',
    'manage_shops',
    'manage_disputes',
    'manage_reports',
    'view_financial',
    'manage_tokens'
  ];

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

    fetchAdmins();
  }, [history]);

  useEffect(() => {
    filterAdminsList();
  }, [searchText, filterStatus, admins]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/admin-accounts/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
        setFilteredAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admin accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAdminsList = () => {
    let filtered = [...admins];

    if (searchText) {
      filtered = filtered.filter(admin =>
        admin.username.toLowerCase().includes(searchText.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchText.toLowerCase()) ||
        admin.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        admin.last_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(admin =>
        filterStatus === 'active' ? admin.is_active : !admin.is_active
      );
    }

    setFilteredAdmins(filtered);
  };

  const handleCreateAdmin = async () => {
    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/admin-accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_by_id: userId
        }),
      });

      if (response.ok) {
        alert('Admin account created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchAdmins();
      } else {
        const error = await response.json();
        alert(`Failed to create admin: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin account');
    }
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/admin-accounts/${selectedAdmin.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          admin_id: userId
        }),
      });

      if (response.ok) {
        alert('Admin account updated successfully!');
        setShowEditModal(false);
        setSelectedAdmin(null);
        resetForm();
        fetchAdmins();
      } else {
        alert('Failed to update admin account');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin account');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteAdminId) return;

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/admin-accounts/${deleteAdminId}/?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Admin account deleted successfully!');
        setShowDeleteAlert(false);
        setDeleteAdminId(null);
        fetchAdmins();
      } else {
        alert('Failed to delete admin account');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin account');
    }
  };

  const handleToggleActive = async (adminId: number, currentStatus: boolean) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/admin-accounts/${adminId}/toggle-active/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: userId,
          is_active: !currentStatus
        }),
      });

      if (response.ok) {
        fetchAdmins();
      } else {
        alert('Failed to toggle admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const openEditModal = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      password: '',
      confirm_password: '',
      is_active: admin.is_active,
      permissions: admin.permissions
    });
    setShowEditModal(true);
  };

  const openDeleteAlert = (adminId: number) => {
    setDeleteAdminId(adminId);
    setShowDeleteAlert(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      is_active: true,
      permissions: []
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
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
            <IonTitle className="toolbar-title">Account Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="account-management-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Admin Account Management</h1>
                <p className="page-subtitle">Manage administrator accounts and permissions</p>
              </div>
              <IonButton color="primary" onClick={() => setShowCreateModal(true)}>
                <IonIcon icon={personAddOutline} slot="start" />
                Create Admin
              </IonButton>
            </div>

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={personCircleOutline} className="stat-icon primary" />
                <div>
                  <h3>{admins.length}</h3>
                  <p>Total Admins</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{admins.filter(a => a.is_active).length}</h3>
                  <p>Active</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={closeCircleOutline} className="stat-icon danger" />
                <div>
                  <h3>{admins.filter(a => !a.is_active).length}</h3>
                  <p>Inactive</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by username, email, or name"
                    className="search-bar"
                  />

                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="active">Active</IonSelectOption>
                    <IonSelectOption value="inactive">Inactive</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Admin List */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Administrator Accounts ({filteredAdmins.length})</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="admin-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Created By</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map(admin => (
                        <tr key={admin.id}>
                          <td>{admin.id}</td>
                          <td>
                            <div className="username-cell">
                              <IonIcon icon={personCircleOutline} />
                              {admin.username}
                            </div>
                          </td>
                          <td>{admin.first_name} {admin.last_name}</td>
                          <td>{admin.email}</td>
                          <td>
                            <IonBadge color={admin.is_active ? 'success' : 'danger'}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </IonBadge>
                          </td>
                          <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                          <td>{admin.created_by || 'System'}</td>
                          <td>
                            <IonBadge color="medium">
                              {admin.permissions.length} permissions
                            </IonBadge>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => openEditModal(admin)}
                              >
                                <IonIcon icon={createOutline} slot="icon-only" />
                              </IonButton>
                              <IonButton
                                size="small"
                                fill="clear"
                                color={admin.is_active ? 'danger' : 'success'}
                                onClick={() => handleToggleActive(admin.id, admin.is_active)}
                              >
                                <IonIcon icon={admin.is_active ? closeCircleOutline : checkmarkCircleOutline} slot="icon-only" />
                              </IonButton>
                              <IonButton
                                size="small"
                                fill="clear"
                                color="danger"
                                onClick={() => openDeleteAlert(admin.id)}
                              >
                                <IonIcon icon={trashOutline} slot="icon-only" />
                              </IonButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAdmins.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={personCircleOutline} />
                      <p>No admin accounts found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Create Admin Modal */}
        <IonModal isOpen={showCreateModal} onDidDismiss={() => { setShowCreateModal(false); resetForm(); }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create Admin Account</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { setShowCreateModal(false); resetForm(); }}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Username *</IonLabel>
                    <IonInput
                      value={formData.username}
                      onIonInput={(e) => setFormData({ ...formData, username: e.detail.value! })}
                      placeholder="Enter username"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Email *</IonLabel>
                    <IonInput
                      type="email"
                      value={formData.email}
                      onIonInput={(e) => setFormData({ ...formData, email: e.detail.value! })}
                      placeholder="Enter email"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">First Name *</IonLabel>
                    <IonInput
                      value={formData.first_name}
                      onIonInput={(e) => setFormData({ ...formData, first_name: e.detail.value! })}
                      placeholder="Enter first name"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Last Name *</IonLabel>
                    <IonInput
                      value={formData.last_name}
                      onIonInput={(e) => setFormData({ ...formData, last_name: e.detail.value! })}
                      placeholder="Enter last name"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Password *</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.password}
                      onIonInput={(e) => setFormData({ ...formData, password: e.detail.value! })}
                      placeholder="Enter password"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Confirm Password *</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.confirm_password}
                      onIonInput={(e) => setFormData({ ...formData, confirm_password: e.detail.value! })}
                      placeholder="Confirm password"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel>Active Status</IonLabel>
                    <IonToggle
                      checked={formData.is_active}
                      onIonChange={(e) => setFormData({ ...formData, is_active: e.detail.checked })}
                    />
                  </IonItem>

                  <div className="permissions-section">
                    <h3>Permissions</h3>
                    {availablePermissions.map(permission => (
                      <IonItem key={permission}>
                        <IonLabel>{permission.replace(/_/g, ' ').toUpperCase()}</IonLabel>
                        <IonToggle
                          checked={formData.permissions.includes(permission)}
                          onIonChange={(e) => {
                            if (e.detail.checked) {
                              setFormData({ ...formData, permissions: [...formData.permissions, permission] });
                            } else {
                              setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
                            }
                          }}
                        />
                      </IonItem>
                    ))}
                  </div>
                </IonList>

                <IonButton expand="block" onClick={handleCreateAdmin} className="submit-button">
                  <IonIcon icon={addOutline} slot="start" />
                  Create Admin Account
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>

        {/* Edit Admin Modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => { setShowEditModal(false); setSelectedAdmin(null); resetForm(); }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Admin Account</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => { setShowEditModal(false); setSelectedAdmin(null); resetForm(); }}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Username</IonLabel>
                    <IonInput
                      value={formData.username}
                      onIonInput={(e) => setFormData({ ...formData, username: e.detail.value! })}
                      disabled
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      type="email"
                      value={formData.email}
                      onIonInput={(e) => setFormData({ ...formData, email: e.detail.value! })}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">First Name</IonLabel>
                    <IonInput
                      value={formData.first_name}
                      onIonInput={(e) => setFormData({ ...formData, first_name: e.detail.value! })}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Last Name</IonLabel>
                    <IonInput
                      value={formData.last_name}
                      onIonInput={(e) => setFormData({ ...formData, last_name: e.detail.value! })}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">New Password (leave blank to keep current)</IonLabel>
                    <IonInput
                      type="password"
                      value={formData.password}
                      onIonInput={(e) => setFormData({ ...formData, password: e.detail.value! })}
                      placeholder="Enter new password"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel>Active Status</IonLabel>
                    <IonToggle
                      checked={formData.is_active}
                      onIonChange={(e) => setFormData({ ...formData, is_active: e.detail.checked })}
                    />
                  </IonItem>

                  <div className="permissions-section">
                    <h3>Permissions</h3>
                    {availablePermissions.map(permission => (
                      <IonItem key={permission}>
                        <IonLabel>{permission.replace(/_/g, ' ').toUpperCase()}</IonLabel>
                        <IonToggle
                          checked={formData.permissions.includes(permission)}
                          onIonChange={(e) => {
                            if (e.detail.checked) {
                              setFormData({ ...formData, permissions: [...formData.permissions, permission] });
                            } else {
                              setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
                            }
                          }}
                        />
                      </IonItem>
                    ))}
                  </div>
                </IonList>

                <IonButton expand="block" onClick={handleUpdateAdmin} className="submit-button">
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Update Admin Account
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>

        {/* Delete Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Admin Account"
          message="Are you sure you want to delete this admin account? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => setDeleteAdminId(null)
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDeleteAdmin
            }
          ]}
        />
      </IonPage>
    </>
  );
};

export default AccountManagement;