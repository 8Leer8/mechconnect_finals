import { IonContent, IonPage, IonToast, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationsAPI, NotificationItem, formatTimeAgo } from '../../../utils/api';
import './Notification.css';

const Notification: React.FC = () => {
  const history = useHistory();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const goBack = () => history.goBack();

  // Get user ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('User data from localStorage:', userData);
        const id = userData.acc_id || userData.account_id;
        if (id) {
          setUserId(id);
          console.log('User ID set to:', id);
        } else {
          console.error('No acc_id or account_id found in user data');
          setError('User ID not found. Please log in again.');
          setShowToast(true);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        setError('Failed to load user data. Please log in again.');
        setShowToast(true);
      }
    } else {
      console.error('No user data in localStorage');
      setError('User not logged in. Please log in.');
      setShowToast(true);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) {
      console.log('No userId, skipping fetch');
      return;
    }
    
    console.log('Fetching notifications for user:', userId);
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsAPI.getUserNotifications(userId);
      console.log('Notifications API result:', result);
      
      if (result.error) {
        setError(result.error);
        setShowToast(true);
        setNotifications([]);
      } else if (result.data) {
        setNotifications(result.data.notifications || []);
        console.log('Notifications loaded:', result.data.notifications?.length || 0);
      }
    } catch (err) {
      setError('Failed to load notifications');
      setShowToast(true);
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when userId is available
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchNotifications();
    event.detail.complete();
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    const result = await notificationsAPI.markAsRead(notificationId);
    
    if (result.error) {
      console.error('Error marking notification as read:', result.error);
    } else {
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'alert':
        return 'error';
      case 'promotional':
        return 'campaign';
      default:
        return 'notifications';
    }
  };

  // Get color class for notification type
  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'info':
        return 'notification-info';
      case 'warning':
        return 'notification-warning';
      case 'alert':
        return 'notification-alert';
      case 'promotional':
        return 'notification-promotional';
      default:
        return 'notification-info';
    }
  };

  return (
    <IonPage>
      <IonContent className="notification-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Header */}
        <div className="notification-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Notifications</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Content */}
        <div className="notification-container">
          {loading && notifications.length === 0 ? (
            <div className="loading-message">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">notifications_none</span>
              <p className="empty-text">No notifications yet</p>
              <p className="empty-subtext">You'll see updates about your bookings here</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`notification-item ${getNotificationClass(notification.type)} ${
                    !notification.is_read ? 'unread' : ''
                  }`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.notification_id)}
                >
                  <div className="notification-icon">
                    <span className="material-icons-round">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h3 className="notification-title">{notification.title}</h3>
                      {!notification.is_read && <div className="unread-dot"></div>}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error || ''}
          duration={3000}
          position="top"
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Notification;
