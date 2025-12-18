import { IonModal } from '@ionic/react';
import { useMemo, useState, useEffect } from 'react';
import './inviteMechanicModal.css';

interface InviteMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MechanicCandidate {
  acc_id: number;
  id: string; // initials for avatar
  name: string;
  specialty: string;
  experience: string;
  rating: number;
}

interface ApiMechanic {
  acc_id: number;
  full_name: string;
  profile_photo: string | null;
  bio: string | null;
  average_rating: string;
  ranking: string;
  location: string;
  total_jobs: number;
  contact_number: string;
  status: string;
}

const InviteMechanicModal: React.FC<InviteMechanicModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<MechanicCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedMechanics, setInvitedMechanics] = useState<Set<number>>(new Set());
  const [invitingMechanics, setInvitingMechanics] = useState<Set<number>>(new Set());

  // Fetch mechanics from API
  useEffect(() => {
    if (isOpen) {
      fetchMechanics();
    } else {
      // Reset search when modal closes
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchMechanics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/accounts/discover/mechanics/');
      const data = await response.json();

      if (response.ok) {
        const mechanics: ApiMechanic[] = data.mechanics || [];
        
        // Map API response to component format
        const mappedMechanics: MechanicCandidate[] = mechanics.map((mechanic) => {
          // Get initials from full name
          const initials = mechanic.full_name
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          // Process specialty from bio with better validation
          let specialty = 'General Mechanic'; // Default fallback
          
          if (mechanic.bio && mechanic.bio.trim()) {
            const bio = mechanic.bio.trim();
            
            // Check if bio is valid (not just repeated characters or too long)
            const isRepeatedChars = /^(.)\1+$/.test(bio);
            const isValidLength = bio.length <= 100;
            const hasValidContent = bio.length >= 3 && !isRepeatedChars;
            
            if (hasValidContent && isValidLength) {
              // Truncate to 40 characters for display
              specialty = bio.length > 40 ? bio.substring(0, 40) + '...' : bio;
            }
          }
          
          return {
            acc_id: mechanic.acc_id,
            id: initials.toLowerCase(),
            name: mechanic.full_name,
            specialty: specialty,
            experience: '', // Not used anymore
            rating: parseFloat(mechanic.average_rating) || 0
          };
        });
        
        setCandidates(mappedMechanics);
      } else {
        setError(data.error || 'Failed to load mechanics');
        setCandidates([]);
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching mechanics:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleMechanics = useMemo(() => {
    if (!search.trim()) {
      return candidates;
    }
    const searchLower = search.toLowerCase();
    return candidates.filter(
      (mechanic) =>
        mechanic.name.toLowerCase().includes(searchLower) ||
        mechanic.specialty.toLowerCase().includes(searchLower)
    );
  }, [search, candidates]);

  const handleInvite = async (mechanicId: number) => {
    // Check if already invited
    if (invitedMechanics.has(mechanicId)) {
      return;
    }

    // Add to inviting set
    setInvitingMechanics((prev) => new Set(prev).add(mechanicId));

    try {
      // Get shop ID from localStorage or use default
      // In production, this should be fetched from the authenticated user's profile
      let shopId = localStorage.getItem('shop_id');
      
      // If shop_id is not in localStorage, try to get it from user data
      if (!shopId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            shopId = user.shop_id?.toString() || '1';
          } catch {
            shopId = '1'; // Default fallback
          }
        } else {
          shopId = '1'; // Default fallback
        }
      }
      
      // Call API to invite mechanic
      const response = await fetch(`http://localhost:8000/api/shops/invite-mechanic/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mechanic_id: mechanicId,
          shop_id: parseInt(shopId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to invited set
        setInvitedMechanics((prev) => new Set(prev).add(mechanicId));
      } else {
        // Handle error - show message or alert
        console.error('Failed to invite mechanic:', data.error || data.message || 'Unknown error');
        alert(data.error || data.message || 'Failed to invite mechanic. Please try again.');
      }
    } catch (err) {
      console.error('Error inviting mechanic:', err);
      alert('Network error occurred. Please try again.');
    } finally {
      // Remove from inviting set
      setInvitingMechanics((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mechanicId);
        return newSet;
      });
    }
  };

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
          {loading ? (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">hourglass_empty</span>
              <h3>Loading Mechanics...</h3>
              <p>Please wait while we fetch available mechanics.</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">error_outline</span>
              <h3>Error Loading Mechanics</h3>
              <p>{error}</p>
            </div>
          ) : visibleMechanics.length > 0 ? (
            visibleMechanics.map((mechanic) => (
              <div key={mechanic.acc_id} className="candidate-card">
                <div className="candidate-avatar">{mechanic.id.toUpperCase()}</div>
                <div className="candidate-info">
                  <h4>{mechanic.name}</h4>
                  <p>{mechanic.specialty}</p>
                </div>
                <div className="candidate-meta">
                  <span className="rating">
                    <span className="material-icons-round">star</span>
                    {mechanic.rating.toFixed(1)}
                  </span>
                  <button 
                    className={`invite-action ${invitedMechanics.has(mechanic.acc_id) ? 'invited' : ''} ${invitingMechanics.has(mechanic.acc_id) ? 'inviting' : ''}`}
                    onClick={() => handleInvite(mechanic.acc_id)}
                    disabled={invitedMechanics.has(mechanic.acc_id) || invitingMechanics.has(mechanic.acc_id)}
                  >
                    {invitedMechanics.has(mechanic.acc_id) ? (
                      <span className="material-icons-round check-icon">check</span>
                    ) : invitingMechanics.has(mechanic.acc_id) ? (
                      <span className="material-icons-round loading-icon">hourglass_empty</span>
                    ) : (
                      <span className="material-icons-round">person_add</span>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <span className="material-icons-round empty-icon">engineering</span>
              <h3>No Mechanics Found</h3>
              <p>{search.trim() ? 'No mechanics match your search criteria.' : 'No mechanics available at the moment.'}</p>
            </div>
          )}
        </div>

        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </IonModal>
  );
};

export default InviteMechanicModal;


