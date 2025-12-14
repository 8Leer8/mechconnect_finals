import { IonModal } from '@ionic/react';
import { useMemo, useState } from 'react';
import './inviteMechanicModal.css';

interface InviteMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MechanicCandidate {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
}

const candidates: MechanicCandidate[] = [
  {
    id: 'cr',
    name: 'Carlos Rivera',
    specialty: 'Engine Diagnostics',
    experience: '8 years experience',
    rating: 4.8
  },
  {
    id: 'ej',
    name: 'Emma Johnson',
    specialty: 'Suspension Systems',
    experience: '4 years experience',
    rating: 4.7
  },
  {
    id: 'dc',
    name: 'David Chen',
    specialty: 'Hybrid Vehicle Repair',
    experience: '6 years experience',
    rating: 4.9
  }
];

const InviteMechanicModal: React.FC<InviteMechanicModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  const visibleMechanics = useMemo(() => {
    if (!search.trim()) {
      return candidates;
    }
    return candidates.filter(
      (mechanic) =>
        mechanic.name.toLowerCase().includes(search.toLowerCase()) ||
        mechanic.specialty.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="invite-mechanic-modal" backdropDismiss={true}>
      <div className="invite-modal-container">
        <div className="invite-modal-header">
          <h2>Invite Existing Mechanic</h2>
          <button className="close-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="invite-search">
          <span className="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Search mechanics by name or expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="candidate-list">
          {visibleMechanics.map((mechanic) => (
            <div key={mechanic.id} className="candidate-card">
              <div className="candidate-avatar">{mechanic.id.toUpperCase()}</div>
              <div className="candidate-info">
                <h4>{mechanic.name}</h4>
                <p>{mechanic.specialty}</p>
                <span className="experience">{mechanic.experience}</span>
              </div>
              <div className="candidate-meta">
                <span className="rating">
                  <span className="material-icons-round">star</span>
                  {mechanic.rating.toFixed(1)}
                </span>
                <button className="invite-action">
                  <span className="material-icons-round">person_add</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </IonModal>
  );
};

export default InviteMechanicModal;


