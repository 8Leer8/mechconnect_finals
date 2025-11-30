import React, { useState } from 'react';

// Filter interfaces for shops
interface ShopFilters {
  city: string;
  verified: string;
  status: string;
}

interface ShopDiscoveryFilterProps {
  isOpen: boolean;
  filters: ShopFilters;
  onApply: (filters: ShopFilters) => void;
  onClose: () => void;
}

const ShopDiscoveryFilter: React.FC<ShopDiscoveryFilterProps> = ({ 
  isOpen, 
  filters, 
  onApply, 
  onClose 
}) => {
  const [tempFilters, setTempFilters] = useState<ShopFilters>(filters);

  const handleTempFilterChange = (filterType: keyof ShopFilters, value: string) => {
    setTempFilters({ ...tempFilters, [filterType]: value });
  };

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleReset = () => {
    const resetFilters: ShopFilters = { city: '', verified: '', status: '' };
    setTempFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filter Shops</h3>
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
              <label className="filter-label">Verification</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Shops' },
                  { value: 'true', label: 'Verified' },
                  { value: 'false', label: 'Unverified' }
                ].map((verification) => (
                  <button
                    key={verification.value}
                    className={`filter-option ${tempFilters.verified === verification.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('verified', verification.value)}
                  >
                    {verification.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
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

export default ShopDiscoveryFilter;
export type { ShopFilters };