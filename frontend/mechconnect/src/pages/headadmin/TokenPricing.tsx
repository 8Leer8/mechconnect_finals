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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  logOutOutline,
  pricetagOutline,
  saveOutline,
  addOutline,
  trashOutline,
  walletOutline,
  cashOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import HeadAdminSidebar from '../../components/HeadAdminSidebar';
import './HeadAdminLayout.css';
import './TokenPricing.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

interface TokenPackage {
  id?: number;
  name: string;
  tokens: number;
  price: number;
  discount_percentage: number;
  is_active: boolean;
  is_featured: boolean;
  description: string;
}

interface PricingStats {
  total_packages: number;
  active_packages: number;
  total_sales: number;
  total_revenue: string;
}

const TokenPricing: React.FC = () => {
  const history = useHistory();
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [stats, setStats] = useState<PricingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<TokenPackage | null>(null);

  const [newPackage, setNewPackage] = useState<TokenPackage>({
    name: '',
    tokens: 0,
    price: 0,
    discount_percentage: 0,
    is_active: true,
    is_featured: false,
    description: ''
  });

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

    fetchTokenPricing();
  }, [history]);

  const fetchTokenPricing = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      // Fetch packages
      const packagesResponse = await fetch(`${API_BASE_URL}/head-admin/token-pricing/?user_id=${userId}`);
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData.packages || []);
        setStats(packagesData.stats || null);
      }
    } catch (error) {
      console.error('Error fetching token pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/token-pricing/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPackage,
          admin_id: userId
        }),
      });

      if (response.ok) {
        alert('Token package created successfully!');
        resetNewPackage();
        fetchTokenPricing();
      } else {
        alert('Failed to create token package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Error creating token package');
    }
  };

  const handleUpdatePackage = async (pkg: TokenPackage) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/token-pricing/${pkg.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pkg,
          admin_id: userId
        }),
      });

      if (response.ok) {
        alert('Token package updated successfully!');
        setEditingPackage(null);
        fetchTokenPricing();
      } else {
        alert('Failed to update token package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Error updating token package');
    }
  };

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this token package?')) return;

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/head-admin/token-pricing/${packageId}/?user_id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Token package deleted successfully!');
        fetchTokenPricing();
      } else {
        alert('Failed to delete token package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Error deleting token package');
    }
  };

  const resetNewPackage = () => {
    setNewPackage({
      name: '',
      tokens: 0,
      price: 0,
      discount_percentage: 0,
      is_active: true,
      is_featured: false,
      description: ''
    });
  };

  const calculatePricePerToken = (price: number, tokens: number) => {
    if (tokens === 0) return 0;
    return (price / tokens).toFixed(2);
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
            <IonTitle className="toolbar-title">Token Pricing</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="head-admin-content" scrollY={true}>
          <div className="token-pricing-container">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Token Pricing Management</h1>
                <p className="page-subtitle">Configure token packages and pricing</p>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6" sizeLg="3">
                    <div className="metric-card primary-card">
                      <div className="metric-icon">
                        <IonIcon icon={pricetagOutline} />
                      </div>
                      <div className="metric-content">
                        <h3 className="metric-value">{stats.total_packages}</h3>
                        <p className="metric-label">Total Packages</p>
                      </div>
                    </div>
                  </IonCol>

                  <IonCol size="12" sizeMd="6" sizeLg="3">
                    <div className="metric-card success-card">
                      <div className="metric-icon">
                        <IonIcon icon={checkmarkCircleOutline} />
                      </div>
                      <div className="metric-content">
                        <h3 className="metric-value">{stats.active_packages}</h3>
                        <p className="metric-label">Active Packages</p>
                      </div>
                    </div>
                  </IonCol>

                  <IonCol size="12" sizeMd="6" sizeLg="3">
                    <div className="metric-card warning-card">
                      <div className="metric-icon">
                        <IonIcon icon={walletOutline} />
                      </div>
                      <div className="metric-content">
                        <h3 className="metric-value">{stats.total_sales.toLocaleString()}</h3>
                        <p className="metric-label">Total Sales</p>
                      </div>
                    </div>
                  </IonCol>

                  <IonCol size="12" sizeMd="6" sizeLg="3">
                    <div className="metric-card revenue-card">
                      <div className="metric-icon">
                        <IonIcon icon={cashOutline} />
                      </div>
                      <div className="metric-content">
                        <h3 className="metric-value">₱{parseFloat(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        <p className="metric-label">Total Revenue</p>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {/* Create New Package */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={addOutline} /> Create New Token Package
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Package Name *</IonLabel>
                    <IonInput
                      value={newPackage.name}
                      onIonInput={(e) => setNewPackage({ ...newPackage, name: e.detail.value! })}
                      placeholder="e.g., Starter Pack, Pro Pack"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Number of Tokens *</IonLabel>
                    <IonInput
                      type="number"
                      value={newPackage.tokens}
                      onIonInput={(e) => setNewPackage({ ...newPackage, tokens: parseInt(e.detail.value!) })}
                      placeholder="e.g., 100"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Price (₱) *</IonLabel>
                    <IonInput
                      type="number"
                      value={newPackage.price}
                      onIonInput={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.detail.value!) })}
                      placeholder="e.g., 500.00"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Discount Percentage (%)</IonLabel>
                    <IonInput
                      type="number"
                      value={newPackage.discount_percentage}
                      onIonInput={(e) => setNewPackage({ ...newPackage, discount_percentage: parseFloat(e.detail.value!) })}
                      placeholder="e.g., 10"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonInput
                      value={newPackage.description}
                      onIonInput={(e) => setNewPackage({ ...newPackage, description: e.detail.value! })}
                      placeholder="Package description"
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel>Active</IonLabel>
                    <IonToggle
                      checked={newPackage.is_active}
                      onIonChange={(e) => setNewPackage({ ...newPackage, is_active: e.detail.checked })}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel>Featured Package</IonLabel>
                    <IonToggle
                      checked={newPackage.is_featured}
                      onIonChange={(e) => setNewPackage({ ...newPackage, is_featured: e.detail.checked })}
                    />
                  </IonItem>

                  {newPackage.tokens > 0 && newPackage.price > 0 && (
                    <IonItem>
                      <IonLabel>
                        <p>Price per token: ₱{calculatePricePerToken(newPackage.price, newPackage.tokens)}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>

                <IonButton expand="block" onClick={handleCreatePackage} className="create-button">
                  <IonIcon icon={addOutline} slot="start" />
                  Create Package
                </IonButton>
              </IonCardContent>
            </IonCard>

            {/* Existing Packages */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Token Packages ({packages.length})</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="packages-grid">
                  {packages.map(pkg => (
                    <div key={pkg.id} className={`package-card ${pkg.is_featured ? 'featured' : ''}`}>
                      {pkg.is_featured && (
                        <div className="featured-badge">
                          <IonIcon icon={trendingUpOutline} /> Featured
                        </div>
                      )}
                      
                      <div className="package-header">
                        <h3>{pkg.name}</h3>
                        <IonBadge color={pkg.is_active ? 'success' : 'danger'}>
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </IonBadge>
                      </div>

                      <div className="package-details">
                        <div className="token-amount">
                          <IonIcon icon={walletOutline} />
                          <span>{pkg.tokens.toLocaleString()} Tokens</span>
                        </div>
                        
                        <div className="price">
                          <span className="price-value">₱{pkg.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          {pkg.discount_percentage > 0 && (
                            <IonBadge color="warning">{pkg.discount_percentage}% OFF</IonBadge>
                          )}
                        </div>

                        <div className="price-per-token">
                          ₱{calculatePricePerToken(pkg.price, pkg.tokens)} per token
                        </div>

                        {pkg.description && (
                          <p className="description">{pkg.description}</p>
                        )}
                      </div>

                      <div className="package-actions">
                        <IonButton
                          size="small"
                          fill="outline"
                          onClick={() => setEditingPackage(pkg)}
                        >
                          <IonIcon icon={saveOutline} slot="start" />
                          Edit
                        </IonButton>
                        <IonButton
                          size="small"
                          fill="outline"
                          color="danger"
                          onClick={() => handleDeletePackage(pkg.id!)}
                        >
                          <IonIcon icon={trashOutline} slot="start" />
                          Delete
                        </IonButton>
                      </div>
                    </div>
                  ))}

                  {packages.length === 0 && (
                    <div className="no-packages">
                      <IonIcon icon={pricetagOutline} />
                      <p>No token packages found. Create one above!</p>
                    </div>
                  )}
                </div>
              </IonCardContent>
            </IonCard>

            {/* Edit Package Modal/Card */}
            {editingPackage && (
              <IonCard className="edit-package-card">
                <IonCardHeader>
                  <IonCardTitle>Edit Token Package</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Package Name</IonLabel>
                      <IonInput
                        value={editingPackage.name}
                        onIonInput={(e) => setEditingPackage({ ...editingPackage, name: e.detail.value! })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Number of Tokens</IonLabel>
                      <IonInput
                        type="number"
                        value={editingPackage.tokens}
                        onIonInput={(e) => setEditingPackage({ ...editingPackage, tokens: parseInt(e.detail.value!) })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Price (₱)</IonLabel>
                      <IonInput
                        type="number"
                        value={editingPackage.price}
                        onIonInput={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.detail.value!) })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Discount Percentage (%)</IonLabel>
                      <IonInput
                        type="number"
                        value={editingPackage.discount_percentage}
                        onIonInput={(e) => setEditingPackage({ ...editingPackage, discount_percentage: parseFloat(e.detail.value!) })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Description</IonLabel>
                      <IonInput
                        value={editingPackage.description}
                        onIonInput={(e) => setEditingPackage({ ...editingPackage, description: e.detail.value! })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel>Active</IonLabel>
                      <IonToggle
                        checked={editingPackage.is_active}
                        onIonChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.detail.checked })}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel>Featured Package</IonLabel>
                      <IonToggle
                        checked={editingPackage.is_featured}
                        onIonChange={(e) => setEditingPackage({ ...editingPackage, is_featured: e.detail.checked })}
                      />
                    </IonItem>
                  </IonList>

                  <div className="edit-actions">
                    <IonButton expand="block" onClick={() => handleUpdatePackage(editingPackage)}>
                      <IonIcon icon={saveOutline} slot="start" />
                      Save Changes
                    </IonButton>
                    <IonButton expand="block" fill="outline" onClick={() => setEditingPackage(null)}>
                      Cancel
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default TokenPricing;