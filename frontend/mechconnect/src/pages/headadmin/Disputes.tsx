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
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
} from '@ionic/react';
import {
  logOutOutline,
  alertCircleOutline,
  eyeOutline,
  searchOutline,
  personOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  documentTextOutline,
  cashOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Disputes.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface Dispute {
  id: number;
  booking_id: number;
  client_name: string;
  mechanic_name: string;
  reason: string;
  description: string;
  status: string;
  filed_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

const Disputes: React.FC = () => {
  const history = useHistory();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    header: '', 
    message: '', 
    disputeId: 0, 
    action: '' 
  });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

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

    fetchDisputes();
  }, [history]);

  useEffect(() => {
    filterDisputesList();
  }, [searchText, filterStatus, disputes]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/disputes/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDisputes(data);
        setFilteredDisputes(data);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDisputesList = () => {
    let filtered = [...disputes];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(dispute => 
        dispute.client_name.toLowerCase().includes(searchText.toLowerCase()) ||
        dispute.mechanic_name.toLowerCase().includes(searchText.toLowerCase()) ||
        dispute.reason.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === filterStatus);
    }

    setFilteredDisputes(filtered);
  };

  const handleResolve = (disputeId: number, bookingId: number) => {
    setAlertConfig({
      header: 'Resolve Dispute',
      message: `Are you sure you want to resolve this dispute for Booking #${bookingId}?`,
      disputeId,
      action: 'resolve'
    });
    setShowAlert(true);
  };

  const handleReject = (disputeId: number, bookingId: number) => {
    setAlertConfig({
      header: 'Reject Dispute',
      message: `Are you sure you want to reject this dispute for Booking #${bookingId}?`,
      disputeId,
      action: 'reject'
    });
    setShowAlert(true);
  };

  const confirmAction = async () => {
    try {
      const adminId = localStorage.getItem('userId');
      const endpoint = alertConfig.action === 'resolve' 
        ? 'head-admin/resolve-dispute' 
        : 'head-admin/reject-dispute';
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          dispute_id: alertConfig.disputeId,
          resolution_notes: resolutionNotes || 'Resolved by admin'
        })
      });

      if (response.ok) {
        fetchDisputes();
        setResolutionNotes('');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
    setShowAlert(false);
  };

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'rejected': return 'danger';
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
            <IonTitle className="toolbar-title">Dispute Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="disputes-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Dispute Management</h1>
                <p className="page-subtitle">Review and resolve booking disputes</p>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search by client, mechanic, or reason"
                    className="search-bar"
                  />
                  
                  <IonSelect
                    value={filterStatus}
                    onIonChange={(e) => setFilterStatus(e.detail.value)}
                    placeholder="Filter by Status"
                    className="filter-select"
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="pending">Pending</IonSelectOption>
                    <IonSelectOption value="resolved">Resolved</IonSelectOption>
                    <IonSelectOption value="rejected">Rejected</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={alertCircleOutline} className="stat-icon" />
                <div>
                  <h3>{disputes.length}</h3>
                  <p>Total Disputes</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={timeOutline} className="stat-icon warning" />
                <div>
                  <h3>{disputes.filter(d => d.status === 'pending').length}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{disputes.filter(d => d.status === 'resolved').length}</h3>
                  <p>Resolved</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={closeCircleOutline} className="stat-icon danger" />
                <div>
                  <h3>{disputes.filter(d => d.status === 'rejected').length}</h3>
                  <p>Rejected</p>
                </div>
              </div>
            </div>

            {/* Disputes Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  Disputes ({filteredDisputes.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="disputes-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Booking</th>
                        <th>Client</th>
                        <th>Mechanic</th>
                        <th>Reason</th>
                        <th>Filed Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisputes.map(dispute => (
                        <tr key={dispute.id}>
                          <td>{dispute.id}</td>
                          <td className="booking-id">#{dispute.booking_id}</td>
                          <td>{dispute.client_name}</td>
                          <td>{dispute.mechanic_name}</td>
                          <td className="reason-cell">{dispute.reason}</td>
                          <td>{new Date(dispute.filed_at).toLocaleDateString()}</td>
                          <td>
                            <IonBadge color={getStatusColor(dispute.status)}>
                              {dispute.status}
                            </IonBadge>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => handleViewDetails(dispute)}
                              >
                                <IonIcon icon={eyeOutline} slot="icon-only" />
                              </IonButton>
                              {dispute.status === 'pending' && (
                                <>
                                  <IonButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleResolve(dispute.id, dispute.booking_id)}
                                  >
                                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                    Resolve
                                  </IonButton>
                                  <IonButton
                                    size="small"
                                    color="danger"
                                    onClick={() => handleReject(dispute.id, dispute.booking_id)}
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
                  {filteredDisputes.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No disputes found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Details Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="dispute-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Dispute Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedDispute && (
              <div className="dispute-details">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Dispute Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Dispute ID</h3>
                          <p>#{selectedDispute.id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Booking ID</h3>
                          <p>#{selectedDispute.booking_id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>
                          <h3>Client</h3>
                          <p>{selectedDispute.client_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>
                          <h3>Mechanic</h3>
                          <p>{selectedDispute.mechanic_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Reason</h3>
                          <p>{selectedDispute.reason}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Description</h3>
                          <p>{selectedDispute.description}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Status</h3>
                          <p>
                            <IonBadge color={getStatusColor(selectedDispute.status)}>
                              {selectedDispute.status}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonIcon icon={calendarOutline} slot="start" />
                        <IonLabel>
                          <h3>Filed Date</h3>
                          <p>{new Date(selectedDispute.filed_at).toLocaleString()}</p>
                        </IonLabel>
                      </IonItem>
                      {selectedDispute.resolved_at && (
                        <IonItem>
                          <IonIcon icon={calendarOutline} slot="start" />
                          <IonLabel>
                            <h3>Resolved Date</h3>
                            <p>{new Date(selectedDispute.resolved_at).toLocaleString()}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {selectedDispute.resolution_notes && (
                        <IonItem>
                          <IonIcon icon={documentTextOutline} slot="start" />
                          <IonLabel>
                            <h3>Resolution Notes</h3>
                            <p>{selectedDispute.resolution_notes}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>

                {selectedDispute.status === 'pending' && (
                  <div className="modal-actions">
                    <IonCard>
                      <IonCardContent>
                        <IonLabel>Resolution Notes (Optional)</IonLabel>
                        <IonTextarea
                          value={resolutionNotes}
                          onIonInput={(e) => setResolutionNotes(e.detail.value!)}
                          placeholder="Add notes about the resolution..."
                          rows={4}
                        />
                      </IonCardContent>
                    </IonCard>
                    
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={() => {
                        setShowModal(false);
                        handleResolve(selectedDispute.id, selectedDispute.booking_id);
                      }}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Resolve Dispute
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      color="danger"
                      onClick={() => {
                        setShowModal(false);
                        handleReject(selectedDispute.id, selectedDispute.booking_id);
                      }}
                    >
                      <IonIcon icon={closeCircleOutline} slot="start" />
                      Reject Dispute
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

export default Disputes;