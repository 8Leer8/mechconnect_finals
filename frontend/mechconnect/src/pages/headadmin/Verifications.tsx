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
  IonChip,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
} from '@ionic/react';
import {
  logOutOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  eyeOutline,
  searchOutline,
  personOutline,
  storefrontOutline,
  timeOutline,
  calendarOutline,
  downloadOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Verifications.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  date_issued: string | null;
  date_expiry: string | null;
  uploaded_at: string;
}

interface VerificationRequest {
  id: number;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  account_type: string;
  requested_at: string;
  status: string;
  documents: Document[];
  profile_data: {
    contact_number?: string;
    address?: string;
    bio?: string;
    shop_name?: string;
  };
}

const Verifications: React.FC = () => {
  const history = useHistory();
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    header: '', 
    message: '', 
    verificationId: 0, 
    action: '' 
  });
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

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

    fetchVerifications();
  }, [history]);

  useEffect(() => {
    filterVerificationRequests();
  }, [searchText, filterType, filterStatus, verifications]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/verifications/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setVerifications(data);
        setFilteredVerifications(data);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVerificationRequests = () => {
    let filtered = [...verifications];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(ver => 
        ver.username.toLowerCase().includes(searchText.toLowerCase()) ||
        ver.email.toLowerCase().includes(searchText.toLowerCase()) ||
        ver.full_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(ver => ver.account_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ver => ver.status === filterStatus);
    }

    setFilteredVerifications(filtered);
  };

  const handleApprove = (verificationId: number, username: string) => {
    setAlertConfig({
      header: 'Approve Verification',
      message: `Are you sure you want to approve the verification request for ${username}?`,
      verificationId,
      action: 'approve'
    });
    setShowAlert(true);
  };

  const handleReject = (verificationId: number, username: string) => {
    setAlertConfig({
      header: 'Reject Verification',
      message: `Are you sure you want to reject the verification request for ${username}?`,
      verificationId,
      action: 'reject'
    });
    setShowAlert(true);
  };

  const confirmAction = async () => {
    try {
      const adminId = localStorage.getItem('userId');
      const endpoint = alertConfig.action === 'approve' 
        ? 'head-admin/verify-user' 
        : 'head-admin/reject-verification';
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          verification_id: alertConfig.verificationId
        })
      });

      if (response.ok) {
        fetchVerifications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setShowAlert(false);
  };

  const handleViewDetails = (verification: VerificationRequest) => {
    setSelectedVerification(verification);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'mechanic': return 'success';
      case 'shop_owner': return 'warning';
      default: return 'medium';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'medium';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isDocumentExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
            <IonTitle className="toolbar-title">Verification Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="verifications-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Verification Management</h1>
                <p className="page-subtitle">Review and approve user verification requests</p>
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
                    value={filterType}
                    onIonChange={(e) => setFilterType(e.detail.value)}
                    placeholder="Filter by Type"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Types</IonSelectOption>
                    <IonSelectOption value="mechanic">Mechanics</IonSelectOption>
                    <IonSelectOption value="shop_owner">Shop Owners</IonSelectOption>
                  </IonSelect>

                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="pending">Pending</IonSelectOption>
                    <IonSelectOption value="approved">Approved</IonSelectOption>
                    <IonSelectOption value="rejected">Rejected</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={timeOutline} className="stat-icon warning" />
                <div>
                  <h3>{verifications.filter(v => v.status === 'pending').length}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{verifications.filter(v => v.status === 'approved').length}</h3>
                  <p>Approved</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={closeCircleOutline} className="stat-icon danger" />
                <div>
                  <h3>{verifications.filter(v => v.status === 'rejected').length}</h3>
                  <p>Rejected</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={documentTextOutline} className="stat-icon" />
                <div>
                  <h3>{verifications.length}</h3>
                  <p>Total Requests</p>
                </div>
              </div>
            </div>

            {/* Verifications Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Verification Requests ({filteredVerifications.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="verifications-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Requested</th>
                        <th>Status</th>
                        <th>Documents</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVerifications.map(verification => (
                        <tr key={verification.id}>
                          <td>{verification.id}</td>
                          <td>
                            <div className="user-cell">
                              <IonIcon 
                                icon={verification.account_type === 'shop_owner' ? storefrontOutline : personOutline} 
                                className="user-icon"
                              />
                              <div>
                                <div className="username">{verification.username}</div>
                                <div className="full-name">{verification.full_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="email">{verification.email}</td>
                          <td>
                            <IonBadge color={getTypeBadgeColor(verification.account_type)}>
                              {verification.account_type.replace('_', ' ')}
                            </IonBadge>
                          </td>
                          <td>{new Date(verification.requested_at).toLocaleDateString()}</td>
                          <td>
                            <IonBadge color={getStatusBadgeColor(verification.status)}>
                              {verification.status}
                            </IonBadge>
                          </td>
                          <td>
                            <IonChip 
                              color={verification.documents.length > 0 ? 'primary' : 'medium'}
                              onClick={() => handleViewDetails(verification)}
                              style={{ cursor: 'pointer' }}
                            >
                              <IonIcon icon={documentTextOutline} />
                              <IonLabel>{verification.documents.length} files</IonLabel>
                            </IonChip>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => handleViewDetails(verification)}
                              >
                                <IonIcon icon={eyeOutline} slot="icon-only" />
                              </IonButton>
                              {verification.status === 'pending' && (
                                <>
                                  <IonButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleApprove(verification.id, verification.username)}
                                  >
                                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                    Approve
                                  </IonButton>
                                  <IonButton
                                    size="small"
                                    color="danger"
                                    onClick={() => handleReject(verification.id, verification.username)}
                                  >
                                    <IonIcon icon={closeCircleOutline} slot="start" />
                                    Reject
                                  </IonButton>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredVerifications.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No verification requests found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Details Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="verification-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Verification Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedVerification && (
              <div className="verification-details">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>User Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Username</h3>
                          <p>{selectedVerification.username}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Full Name</h3>
                          <p>{selectedVerification.full_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{selectedVerification.email}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Account Type</h3>
                          <p>
                            <IonBadge color={getTypeBadgeColor(selectedVerification.account_type)}>
                              {selectedVerification.account_type.replace('_', ' ')}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                      {selectedVerification.profile_data.contact_number && (
                        <IonItem>
                          <IonLabel>
                            <h3>Contact Number</h3>
                            <p>{selectedVerification.profile_data.contact_number}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {selectedVerification.profile_data.address && (
                        <IonItem>
                          <IonLabel>
                            <h3>Address</h3>
                            <p>{selectedVerification.profile_data.address}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {selectedVerification.profile_data.bio && (
                        <IonItem>
                          <IonLabel>
                            <h3>Bio</h3>
                            <p>{selectedVerification.profile_data.bio}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {selectedVerification.profile_data.shop_name && (
                        <IonItem>
                          <IonLabel>
                            <h3>Shop Name</h3>
                            <p>{selectedVerification.profile_data.shop_name}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Submitted Documents</span>
                        <IonBadge color="primary">{selectedVerification.documents.length} files</IonBadge>
                      </div>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {selectedVerification.documents.length > 0 ? (
                      <IonList>
                        {selectedVerification.documents.map((doc, index) => (
                          <IonCard key={index} className="document-card">
                            <IonCardContent>
                              <div className="document-header">
                                <div className="document-info">
                                  <IonIcon icon={documentTextOutline} className="document-icon" />
                                  <div>
                                    <h3 className="document-name">{doc.name}</h3>
                                    <IonBadge color="medium" className="document-type-badge">
                                      {getDocumentTypeLabel(doc.type)}
                                    </IonBadge>
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <IonButton 
                                    fill="clear"
                                    onClick={() => window.open(doc.url, '_blank')}
                                  >
                                    <IonIcon icon={eyeOutline} slot="icon-only" />
                                  </IonButton>
                                  <IonButton 
                                    fill="clear"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = doc.url;
                                      link.download = doc.name;
                                      link.click();
                                    }}
                                  >
                                    <IonIcon icon={downloadOutline} slot="icon-only" />
                                  </IonButton>
                                </div>
                              </div>
                              
                              <div className="document-dates">
                                <div className="date-item">
                                  <IonIcon icon={calendarOutline} />
                                  <div>
                                    <small>Uploaded</small>
                                    <p>{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                {doc.date_issued && (
                                  <div className="date-item">
                                    <IonIcon icon={calendarOutline} />
                                    <div>
                                      <small>Issued</small>
                                      <p>{new Date(doc.date_issued).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {doc.date_expiry && (
                                  <div className="date-item">
                                    <IonIcon 
                                      icon={isDocumentExpired(doc.date_expiry) ? alertCircleOutline : calendarOutline}
                                      color={isDocumentExpired(doc.date_expiry) ? 'danger' : undefined}
                                    />
                                    <div>
                                      <small>Expiry</small>
                                      <p style={{ color: isDocumentExpired(doc.date_expiry) ? '#ef4444' : 'inherit' }}>
                                        {new Date(doc.date_expiry).toLocaleDateString()}
                                        {isDocumentExpired(doc.date_expiry) && ' (Expired)'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </IonCardContent>
                          </IonCard>
                        ))}
                      </IonList>
                    ) : (
                      <div className="no-documents">
                        <IonIcon icon={documentTextOutline} />
                        <IonText color="medium">
                          <p>No documents uploaded</p>
                        </IonText>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>

                {selectedVerification.status === 'pending' && (
                  <div className="modal-actions">
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={() => {
                        setShowModal(false);
                        handleApprove(selectedVerification.id, selectedVerification.username);
                      }}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Approve Verification
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      color="danger"
                      onClick={() => {
                        setShowModal(false);
                        handleReject(selectedVerification.id, selectedVerification.username);
                      }}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Reject Verification
                    </IonButton>
                  </div>
                )}
              </div>
            )}
          </IonContent>
        </IonModal>

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

export default Verifications;