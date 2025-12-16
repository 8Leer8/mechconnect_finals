import { IonModal } from '@ionic/react';
import { useMemo, useState } from 'react';
import './rejectBookingModal.css';

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Schedule Conflict',
  'Shop at Capacity',
  'Equipment/Parts Unavailable',
  'Service Not Offered',
  'Outside Operating Hours',
  'Other Reason'
];

const RejectBookingModal: React.FC<RejectBookingModalProps> = ({ isOpen, onClose }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const canSubmit = Boolean(selectedReason);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="reject-booking-modal" backdropDismiss>
      <div className="reject-modal-container">
        <div className="reject-modal-header">
          <div>
            <p className="modal-label">Reject Booking Request</p>
            <div className="booking-info-header">
              <div className="customer-avatar">LA</div>
              <div>
                <h3>Lisa Anderson</h3>
                <p>Electrical Diagnosis</p>
              </div>
              <span className="priority-pill high">High Priority</span>
            </div>
            <div className="booking-mini-grid">
              <div>
                <p className="mini-label">Schedule</p>
                <p className="mini-value">2024-10-20 11:00 AM</p>
              </div>
              <div>
                <p className="mini-label">Estimated Cost</p>
                <p className="mini-value cost">₱120-₱200</p>
              </div>
            </div>
          </div>
          <button className="close-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <p className="modal-description">
          Please provide a reason for rejecting this booking. The customer will be notified with your explanation.
        </p>

        <div className="reason-list">
          {REASONS.map((reason) => (
            <label key={reason} className="reason-row">
              <input
                type="radio"
                name="reject-reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        <textarea
          className="reject-notes"
          placeholder="Be specific to help the customer understand"
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="char-count">{notes.length}/500</div>

        <div className="reject-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="danger" disabled={!canSubmit} onClick={handleSubmit}>
            Reject Booking
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default RejectBookingModal;


