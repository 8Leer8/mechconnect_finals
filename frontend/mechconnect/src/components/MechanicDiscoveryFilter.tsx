import React, { useState } from 'react';

// Filter interfaces
interface Filters {
  city: string;
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

  const handleTempFilterChange = (filterType: keyof Filters, value: string) => {
    setTempFilters({ ...tempFilters, [filterType]: value });
  };

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleReset = () => {
    const resetFilters: Filters = { city: '', ranking: '', status: '' };
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