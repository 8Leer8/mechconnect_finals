import { IonModal } from '@ionic/react';
import './viewBookingModal.css';

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="view-booking-modal">
      <div className="view-modal-container">
        {/* Header */}
        <div className="view-modal-header">
          <h2>Booking Details</h2>
          <button className="close-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Customer Info */}
        <div className="view-section">
          <h3 className="section-title">Customer Information</h3>
          <div className="customer-details">
            <div className="customer-avatar-large">
              {booking.customerName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="customer-info-details">
              <h4>{booking.customerName}</h4>
              <div className="info-row">
                <span className="material-icons-round">phone</span>
                <span>{booking.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className="view-section">
          <h3 className="section-title">Status</h3>
          <div className="status-priority-row">
            <span className={`status-pill status-${booking.status.toLowerCase()}`}>{booking.status}</span>
            <span className={`priority-pill priority-${booking.priority.toLowerCase()}`}>{booking.priority} Priority</span>
          </div>
        </div>

        {/* Service Details */}
        <div className="view-section">
          <h3 className="section-title">Service Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="material-icons-round detail-icon">build</span>
              <div>
                <p className="detail-label">Service</p>
                <p className="detail-value">{booking.service}</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="material-icons-round detail-icon">directions_car</span>
              <div>
                <p className="detail-label">Vehicle</p>
                <p className="detail-value">{booking.vehicle}</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="material-icons-round detail-icon">schedule</span>
              <div>
                <p className="detail-label">Duration</p>
                <p className="detail-value">{booking.duration}</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="material-icons-round detail-icon">calendar_today</span>
              <div>
                <p className="detail-label">Schedule</p>
                <p className="detail-value">{booking.schedule}</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="material-icons-round detail-icon">payments</span>
              <div>
                <p className="detail-label">Price Range</p>
                <p className="detail-value price">{booking.priceRange}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="view-section">
            <h3 className="section-title">Notes</h3>
            <div className="notes-box">
              <span className="material-icons-round">sticky_note_2</span>
              <p>{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="view-modal-actions">
          <button className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default ViewBookingModal;

