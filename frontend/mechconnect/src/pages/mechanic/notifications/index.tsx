import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './Notifications.css';

interface Notification {
  id: number;
  type: 'job_request' | 'job_accepted' | 'job_completed' | 'payment' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const Notifications: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);

  // Mock notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'job_request',
      title: 'New Service Request',
      message: 'John Doe requested engine repair service',
      time: '2 minutes ago',
      read: false,
      actionUrl: '/mechanic/job-detail/12345?type=available'
    },
    {
      id: 2,
      type: 'job_accepted',
      title: 'Job Accepted',
      message: 'Your quote for brake inspection was accepted',
      time: '15 minutes ago',
      read: false,
      actionUrl: '/mechanic/job-detail/12346?type=active'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'You received ₱850 for completed oil change',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'job_completed',
      title: 'Job Completed',
      message: 'Tire replacement job has been marked as completed',
      time: '2 hours ago',
      read: true,
      actionUrl: '/mechanic/job-detail/12347?type=completed'
    },
    {
      id: 5,
      type: 'message',
      title: 'New Message',
      message: 'Sarah Wilson sent you a message about her booking',
      time: '3 hours ago',
      read: true
    },
    {
      id: 6,
      type: 'system',
      title: 'System Update',
      message: 'New features available in your mechanic dashboard',
      time: '1 day ago',
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_request':
        return 'work_outline';
      case 'job_accepted':
        return 'check_circle';
      case 'job_completed':
        return 'done_all';
      case 'payment':
        return 'account_balance_wallet';
      case 'message':
        return 'chat';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job_request':
        return 'notification-job-request';
      case 'job_accepted':
        return 'notification-job-accepted';
      case 'job_completed':
        return 'notification-job-completed';
      case 'payment':
        return 'notification-payment';
      case 'message':
        return 'notification-message';
      case 'system':
        return 'notification-system';
      default:
        return 'notification-default';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setShowToast(true);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      history.push(notification.actionUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <IonPage>
      <IonContent className="mechanic-notifications-content" scrollY>
        {/* Header */}
        <div className="mechanic-notifications-header">
          <button
            className="back-button"
            onClick={() => history.goBack()}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-notifications-title">Notifications</h1>
          <div className="header-actions">
            <Wallet />
            {unreadCount > 0 && (
              <button
                className="mark-all-read-button"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="mechanic-notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">
                <span className="material-icons-round">notifications_off</span>
              </div>
              <h3>No notifications yet</h3>
              <p>You'll see your job updates and messages here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.actionUrl ? 'clickable' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`notification-icon ${getNotificationColor(notification.type)}`}>
                  <span className="material-icons-round">{getNotificationIcon(notification.type)}</span>
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>

                {!notification.read && (
                  <div className="notification-unread-indicator"></div>
                )}

                {notification.actionUrl && (
                  <div className="notification-arrow">
                    <span className="material-icons-round">chevron_right</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Toast for feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="All notifications marked as read"
          duration={2000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Notifications;