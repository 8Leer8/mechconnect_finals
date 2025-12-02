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
  IonText,
  IonTextarea,
} from '@ionic/react';
import {
  logOutOutline,
  documentTextOutline,
  eyeOutline,
  searchOutline,
  personOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  warningOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './Reports.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface Report {
  id: number;
  reporter_id: number;
  reporter_name: string;
  reporter_email: string;
  reported_id: number;
  reported_name: string;
  reported_email: string;
  reason: string;
  status: string;
  reported_at: string;
  reviewed_at: string | null;
  admin_action_notes: string | null;
}

const Reports: React.FC = () => {
  const history = useHistory();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ 
    header: '', 
    message: '', 
    reportId: 0, 
    action: '' 
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

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

    fetchReports();
  }, [history]);

  useEffect(() => {
    filterReportsList();
  }, [searchText, filterStatus, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/reports/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        setFilteredReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReportsList = () => {
    let filtered = [...reports];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(report => 
        report.reporter_name.toLowerCase().includes(searchText.toLowerCase()) ||
        report.reported_name.toLowerCase().includes(searchText.toLowerCase()) ||
        report.reason.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    setFilteredReports(filtered);
  };

  const handleReviewReport = (report: Report) => {
    setSelectedReport(report);
    setActionNotes('');
    setShowModal(true);
  };

  const handleTakeAction = async (action: 'action_taken' | 'reviewed') => {
    if (!selectedReport) return;

    try {
      const adminId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/review-report/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          report_id: selectedReport.id,
          status: action,
          admin_action_notes: actionNotes
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error taking action:', error);
    }
  };

  const handleDismissReport = (reportId: number, reporterName: string) => {
    setAlertConfig({
      header: 'Dismiss Report',
      message: `Are you sure you want to dismiss the report from ${reporterName}?`,
      reportId,
      action: 'dismiss'
    });
    setShowAlert(true);
  };

  const confirmDismiss = async () => {
    try {
      const adminId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/dismiss-report/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminId,
          report_id: alertConfig.reportId
        })
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
    }
    setShowAlert(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    history.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'primary';
      case 'action_taken': return 'success';
      default: return 'medium';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Reviewed';
      case 'action_taken': return 'Action Taken';
      default: return status;
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
            <IonTitle className="toolbar-title">Report Management</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="reports-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Report Management</h1>
                <p className="page-subtitle">Review and manage user reports</p>
              </div>
            </div>

            {/* Filters */}
            <IonCard className="filter-card">
              <IonCardContent>
                <div className="filter-grid">
                  <IonSearchbar
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search reports..."
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
                    <IonSelectOption value="reviewed">Reviewed</IonSelectOption>
                    <IonSelectOption value="action_taken">Action Taken</IonSelectOption>
                  </IonSelect>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Stats Summary */}
            <div className="stats-row">
              <div className="stat-box">
                <IonIcon icon={documentTextOutline} className="stat-icon" />
                <div>
                  <h3>{reports.length}</h3>
                  <p>Total Reports</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={timeOutline} className="stat-icon warning" />
                <div>
                  <h3>{reports.filter(r => r.status === 'pending').length}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={alertCircleOutline} className="stat-icon primary" />
                <div>
                  <h3>{reports.filter(r => r.status === 'reviewed').length}</h3>
                  <p>Reviewed</p>
                </div>
              </div>
              <div className="stat-box">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon success" />
                <div>
                  <h3>{reports.filter(r => r.status === 'action_taken').length}</h3>
                  <p>Action Taken</p>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  User Reports ({filteredReports.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="reports-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Reporter</th>
                        <th>Reported User</th>
                        <th>Reason</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map(report => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td>
                            <div className="user-info">
                              <IonIcon icon={personOutline} className="user-icon" />
                              <div>
                                <div className="user-name">{report.reporter_name}</div>
                                <div className="user-email">{report.reporter_email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="user-info">
                              <IonIcon icon={personOutline} className="user-icon reported" />
                              <div>
                                <div className="user-name">{report.reported_name}</div>
                                <div className="user-email">{report.reported_email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="reason-cell">
                              {report.reason.substring(0, 50)}
                              {report.reason.length > 50 && '...'}
                            </div>
                          </td>
                          <td>{new Date(report.reported_at).toLocaleDateString()}</td>
                          <td>
                            <IonBadge color={getStatusColor(report.status)}>
                              {getStatusLabel(report.status)}
                            </IonBadge>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <IonButton
                                size="small"
                                fill="clear"
                                onClick={() => handleReviewReport(report)}
                              >
                                <IonIcon icon={eyeOutline} slot="icon-only" />
                              </IonButton>
                              {report.status === 'pending' && (
                                <IonButton
                                  size="small"
                                  color="danger"
                                  fill="outline"
                                  onClick={() => handleDismissReport(report.id, report.reporter_name)}
                                >
                                  Dismiss
                                </IonButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredReports.length === 0 && (
                    <div className="no-results">
                      <IonIcon icon={searchOutline} />
                      <p>No reports found</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>

        {/* Review Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="report-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>Report Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedReport && (
              <div className="report-details">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Report Information</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Report ID</h3>
                          <p>{selectedReport.id}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Status</h3>
                          <p>
                            <IonBadge color={getStatusColor(selectedReport.status)}>
                              {getStatusLabel(selectedReport.status)}
                            </IonBadge>
                          </p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Reported Date</h3>
                          <p>{new Date(selectedReport.reported_at).toLocaleString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Reporter</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Name</h3>
                          <p>{selectedReport.reporter_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{selectedReport.reporter_email}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Reported User</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h3>Name</h3>
                          <p>{selectedReport.reported_name}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel>
                          <h3>Email</h3>
                          <p>{selectedReport.reported_email}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Reason for Report</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText>
                      <p className="report-reason">{selectedReport.reason}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                {selectedReport.admin_action_notes && (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Admin Action Notes</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText>
                        <p>{selectedReport.admin_action_notes}</p>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                )}

                {selectedReport.status === 'pending' && (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Admin Action Notes</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonTextarea
                        value={actionNotes}
                        onIonInput={(e) => setActionNotes(e.detail.value!)}
                        placeholder="Enter action notes..."
                        rows={4}
                      />
                    </IonCardContent>
                  </IonCard>
                )}

                {selectedReport.status === 'pending' && (
                  <div className="modal-actions">
                    <IonButton 
                      expand="block" 
                      color="primary"
                      onClick={() => handleTakeAction('reviewed')}
                    >
                      <IonIcon icon={alertCircleOutline} slot="start" />
                      Mark as Reviewed
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={() => handleTakeAction('action_taken')}
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" />
                      Mark as Action Taken
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
            { text: 'Confirm', handler: confirmDismiss }
          ]}
        />
      </IonPage>
    </>
  );
};

export default Reports;