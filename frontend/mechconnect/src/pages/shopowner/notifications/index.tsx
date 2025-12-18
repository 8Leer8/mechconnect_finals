import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavShop from '../../../components/bottomnavshop';
import './Notifications.css';

interface Notification {
  notification_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'promotional';
  is_read: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user ID from localStorage
      let userId = localStorage.getItem('user_id');
      
      if (!userId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.acc_id?.toString() || user.id?.toString();
          } catch {
            userId = null;
          }
        }
      }

      if (!userId) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/accounts/notifications/?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        // Map API response to component format
        const mappedNotifications: Notification[] = (data.notifications || []).map((notif: any) => ({
          notification_id: notif.notification_id,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          is_read: notif.is_read,
          created_at: notif.created_at
        }));
        
        setNotifications(mappedNotifications);
      } else {
        setError(data.error || 'Failed to load notifications');
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Network error occurred');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Recently';
    }
  };

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

  const getNotificationColor = (type: string) => {
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
        return 'notification-default';
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/accounts/notifications/${notificationId}/read/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification.notification_id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      await Promise.all(
        unreadNotifications.map(notif =>
          fetch(`http://localhost:8000/api/accounts/notifications/${notif.notification_id}/read/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        )
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      setShowToast(true);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.notification_id);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <IonPage>
      <IonContent className="shop-notifications-content" scrollY>
        {/* Header */}
        <div className="shop-notifications-header">
          <button
            className="back-button"
            onClick={() => history.goBack()}
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="shop-notifications-title">Notifications</h1>
          <div className="header-actions">
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
        <div className="shop-notifications-list">
          {loading ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">
                <span className="material-icons-round">hourglass_empty</span>
              </div>
              <h3>Loading notifications...</h3>
              <p>Please wait while we fetch your notifications</p>
            </div>
          ) : error ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">
                <span className="material-icons-round">error_outline</span>
              </div>
              <h3>Error Loading Notifications</h3>
              <p>{error}</p>
              <button
                className="retry-button"
                onClick={fetchNotifications}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  background: 'hsl(25, 85%, 55%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">
                <span className="material-icons-round">notifications_off</span>
              </div>
              <h3>No notifications yet</h3>
              <p>You'll see your shop updates and messages here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''} clickable`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`notification-icon ${getNotificationColor(notification.type)}`}>
                  <span className="material-icons-round">{getNotificationIcon(notification.type)}</span>
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{formatTime(notification.created_at)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </div>

                {!notification.is_read && (
                  <div className="notification-unread-indicator"></div>
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

      <BottomNavShop />
    </IonPage>
  );
};

export default Notifications;

