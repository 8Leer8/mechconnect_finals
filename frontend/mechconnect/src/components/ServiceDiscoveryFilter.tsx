import React, { useState } from 'react';

// Filter interfaces for services
interface ServiceFilters {
  category: string;
  priceRange: string;
  providerType: string;
}

interface ServiceDiscoveryFilterProps {
  isOpen: boolean;
  filters: ServiceFilters;
  onApply: (filters: ServiceFilters) => void;
  onClose: () => void;
}

const ServiceDiscoveryFilter: React.FC<ServiceDiscoveryFilterProps> = ({ 
  isOpen, 
  filters, 
  onApply, 
  onClose 
}) => {
  const [tempFilters, setTempFilters] = useState<ServiceFilters>(filters);

  const handleTempFilterChange = (filterType: keyof ServiceFilters, value: string) => {
    setTempFilters({ ...tempFilters, [filterType]: value });
  };

  const handleApply = () => {
    onApply(tempFilters);
  };

  const handleReset = () => {
    const resetFilters: ServiceFilters = { category: '', priceRange: '', providerType: '' };
    setTempFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Filter Services</h3>
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
              <label className="filter-label">Service Category</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Categories' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'repair', label: 'Repair' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'inspection', label: 'Inspection' }
                ].map((category) => (
                  <button
                    key={category.value}
                    className={`filter-option ${tempFilters.category === category.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('category', category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Prices' },
                  { value: '0-500', label: '₱0 - ₱500' },
                  { value: '500-1000', label: '₱500 - ₱1,000' },
                  { value: '1000-2000', label: '₱1,000 - ₱2,000' },
                  { value: '2000+', label: '₱2,000+' }
                ].map((priceRange) => (
                  <button
                    key={priceRange.value}
                    className={`filter-option ${tempFilters.priceRange === priceRange.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('priceRange', priceRange.value)}
                  >
                    {priceRange.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Provider Type</label>
              <div className="filter-options">
                {[
                  { value: '', label: 'All Providers' },
                  { value: 'Shop', label: 'Shop' },
                  { value: 'Independent Mechanic', label: 'Independent Mechanic' }
                ].map((providerType) => (
                  <button
                    key={providerType.value}
                    className={`filter-option ${tempFilters.providerType === providerType.value ? 'active' : ''}`}
                    onClick={() => handleTempFilterChange('providerType', providerType.value)}
                  >
                    {providerType.label}
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

export default ServiceDiscoveryFilter;
export type { ServiceFilters };