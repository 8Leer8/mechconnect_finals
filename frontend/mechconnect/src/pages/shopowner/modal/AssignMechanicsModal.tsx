import { IonModal } from '@ionic/react';
import { useMemo, useState } from 'react';
import './assignMechanicsModal.css';

interface AssignMechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssignMechanic {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  workload: 'Low' | 'Medium' | 'High';
  currentJobs: number;
  rating: number;
}

const availableMechanics: AssignMechanic[] = [
  { id: 'jd', initials: 'JD', name: 'John Doe', specialty: 'Engine Specialist', workload: 'Medium', currentJobs: 3, rating: 4.9 },
  { id: 'sk', initials: 'SK', name: 'Sarah Kim', specialty: 'Brake Systems', workload: 'Low', currentJobs: 2, rating: 4.8 },
  { id: 'mr', initials: 'MR', name: 'Mike Rodriguez', specialty: 'Electrical Systems', workload: 'Low', currentJobs: 1, rating: 4.7 },
  { id: 'al', initials: 'AL', name: 'Alex Lee', specialty: 'Transmission Expert', workload: 'Medium', currentJobs: 4, rating: 4.9 },
  { id: 'rt', initials: 'RT', name: 'Rachel Thompson', specialty: 'Diagnostic Specialist', workload: 'Low', currentJobs: 2, rating: 4.8 }
];

const AssignMechanicsModal: React.FC<AssignMechanicsModalProps> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]));
  };

  const selectedCount = selected.length;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="assign-mechanics-modal" backdropDismiss>
      <div className="assign-modal-container">
        <div className="assign-modal-header">
          <div>
            <h2>Assign Mechanics to Booking</h2>
            <p>Select one or more mechanics to assign. Mechanics will be notified and can accept or decline.</p>
          </div>
          <button className="close-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="booking-summary">
          <div>
            <p className="summary-label">Service</p>
            <p className="summary-value">Electrical Diagnosis</p>
          </div>
          <div>
            <p className="summary-label">Vehicle</p>
            <p className="summary-value">2019 Volkswagen Jetta</p>
          </div>
          <div>
            <p className="summary-label">Schedule</p>
            <p className="summary-value">2024-10-20 11:00 AM</p>
          </div>
          <div>
            <p className="summary-label">Estimated Cost</p>
            <p className="summary-value cost">₱120-₱200</p>
          </div>
        </div>

        <h3 className="mechanics-section-title">Available Mechanics ({availableMechanics.length})</h3>

        <div className="mechanic-list">
          {availableMechanics.map((mechanic) => (
            <label key={mechanic.id} className="mechanic-row">
              <input
                type="checkbox"
                checked={selected.includes(mechanic.id)}
                onChange={() => toggleSelection(mechanic.id)}
              />
              <div className="mechanic-avatar">{mechanic.initials}</div>
              <div className="mechanic-info">
                <div>
                  <h4>{mechanic.name}</h4>
                  <p className="mechanic-specialty">{mechanic.specialty}</p>
                </div>
                <div className="rating">
                  <span className="material-icons-round">star</span>
                  {mechanic.rating.toFixed(1)}
                </div>
              </div>
              <div className="mechanic-workload">
                <span className={`workload-pill workload-${mechanic.workload.toLowerCase()}`}>
                  {mechanic.workload} workload
                </span>
                <p>{mechanic.currentJobs} current jobs</p>
              </div>
            </label>
          ))}
        </div>

        <div className="assign-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={!selectedCount}>
            Assign {selectedCount || ''} {selectedCount === 1 ? 'Mechanic' : 'Mechanics'}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default AssignMechanicsModal;


