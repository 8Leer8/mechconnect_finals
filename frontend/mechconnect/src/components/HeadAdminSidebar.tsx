import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel
} from '@ionic/react';
import {
  gridOutline,
  peopleOutline,
  checkmarkCircleOutline,
  storefrontOutline,
  walletOutline,
  alertCircleOutline,
  documentTextOutline,
  cashOutline,
  personCircleOutline,
  pricetagOutline,
  settingsOutline,
  statsChartOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './HeadAdminSidebar.css';
import mechLogo from '../assets/images/mechlogo.png';

const HeadAdminSidebar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', path: '/headadmin/dashboard', icon: gridOutline, enabled: true },
    { title: 'Users', path: '/headadmin/users', icon: peopleOutline, enabled: true },
    { title: 'Verifications', path: '/headadmin/verifications', icon: checkmarkCircleOutline, enabled: true },
    { title: 'Shops', path: '/headadmin/shops', icon: storefrontOutline, enabled: true },
    { title: 'Tokens', path: '/headadmin/tokens', icon: walletOutline, enabled: true },
    { title: 'Disputes', path: '/headadmin/disputes', icon: alertCircleOutline, enabled: true },
    { title: 'Reports', path: '/headadmin/reports', icon: documentTextOutline, enabled: true },
    { title: 'Financial & Commission', path: '/headadmin/financial', icon: cashOutline, enabled: true },
    { title: 'Account Management', path: '/headadmin/account-management', icon: personCircleOutline, enabled: true },
    { title: 'Token Pricing', path: '/headadmin/token-pricing', icon: pricetagOutline, enabled: true },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string, event?: React.MouseEvent) => {
    // Stop event propagation to prevent any bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Only navigate if not already on the page
    if (location.pathname !== path) {
      history.push(path);
    }
  };

  return (
    <div className="head-admin-sidebar">
      <IonHeader>
        <IonToolbar color="primary">
          <div className="menu-header">
            <img src={mechLogo} alt="MechConnect Logo" className="menu-logo" />
            <IonTitle>MechConnect</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="sidebar-list">
          {menuItems.map((item, index) => (
            <IonItem
              key={`menu-${item.path}-${index}`}
              button={item.enabled}
              disabled={!item.enabled}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''} ${!item.enabled ? 'disabled' : ''}`}
              onClick={(e) => {
                if (item.enabled) {
                  handleNavigation(item.path, e);
                }
              }}
              detail={false}
              lines="none"
            >
              <IonIcon icon={item.icon} slot="start" />
              <IonLabel>{item.title}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </div>
  );
};

export default HeadAdminSidebar;
