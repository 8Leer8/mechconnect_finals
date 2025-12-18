import React, { useState, useEffect } from 'react';

// Filter interfaces
interface Filters {
  city: string;
  barangay: string;
  ranking: string;
  status: string;
}

interface MechanicDiscoveryFilterProps {
  isOpen: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

const MechanicDiscoveryFilter: React.FC<MechanicDiscoveryFilterProps> = ({ 
  isOpen, 
  filters, 
  onApply, 
  onClose 
}) => {
  const [tempFilters, setTempFilters] = useState<Filters>(filters);
  const [availableBarangays, setAvailableBarangays] = useState<string[]>([]);
  const [userBarangay, setUserBarangay] = useState<string | null>(null);

  // Fetch available barangays from API
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('http://localhost:8000/api/accounts/discover/barangays/', {
          headers
        });
        const data = await response.json();
        
        if (response.ok) {
          setAvailableBarangays(data.barangays || []);
          setUserBarangay(data.user_barangay || null);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
      }
    };
    
    if (isOpen) {
      fetchBarangays();
    }
  }, [isOpen]);

  const handleTempFilterChange = (filterType: keyof Filters, value: string) => {
    setTempFilters({ ...tempFilters, [filterType]: value });
  };

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleReset = () => {
    const resetFilters: Filters = { city: '', barangay: '', ranking: '', status: '' };
    setTempFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filter Mechanics</h3>
          <button 
            className="modal-close-btn"
            onClick={onClose}
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="filter-modal-content">
            <div className="filter-group">
              <label className="filter-label">City</label>
              <div className="filter-options">
                {['', 'Tarlac', 'Zamboanga City', 'Manila', 'Cebu City'].map((city) => (
                  <button
                    key={city}
                    className={`filter-option ${tempFilters.city === city ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('city', city)}
                  >
                    {city || 'All Cities'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                Barangay
                {userBarangay && (
                  <span className="filter-label-hint"> (Your area: {userBarangay})</span>
                )}
              </label>
              <div className="filter-options">
                <button
                  key="all-barangays"
                  className={`filter-option ${tempFilters.barangay === '' ? 'active' : ''}`}
                  onClick={() => handleTempFilterChange('barangay', '')}
                >
                  All Barangays
                </button>
                {availableBarangays.map((barangay) => (
                  <button
                    key={barangay}
                    className={`filter-option ${tempFilters.barangay === barangay ? 'active' : ''} ${userBarangay === barangay ? 'priority' : ''}`}
                    onClick={() => handleTempFilterChange('barangay', barangay)}
                  >
                    {barangay}
                    {userBarangay === barangay && ' ⭐'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ranking</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Rankings' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'bronze', label: 'Bronze' },
                  { value: 'standard', label: 'Standard' }
                ].map((ranking) => (
                  <button
                    key={ranking.value}
                    className={`filter-option ${tempFilters.ranking === ranking.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('ranking', ranking.value)}
                  >
                    {ranking.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Status' },
                  { value: 'available', label: 'Available' },
                  { value: 'working', label: 'Working' }
                ].map((status) => (
                  <button
                    key={status.value}
                    className={`filter-option ${tempFilters.status === status.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('status', status.value)}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="reset-btn" onClick={handleReset}>
                Reset
              </button>
              <button className="apply-btn" onClick={handleApply}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDiscoveryFilter;
export type { Filters };