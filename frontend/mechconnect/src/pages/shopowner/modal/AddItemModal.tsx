import { IonModal } from '@ionic/react';
import { useState } from 'react';
import './addItemModal.css';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    console.log({ itemName, category, price, stock, description });
    onClose();
    // Reset form
    setItemName('');
    setCategory('');
    setPrice('');
    setStock('');
    setDescription('');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="add-item-modal" backdropDismiss>
      <div className="add-item-modal-container">
        {/* Header */}
        <div className="add-item-modal-header">
          <h2>Add New Item</h2>
          <button className="close-icon" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="add-item-form">
          {/* Item Name */}
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              placeholder="e.g., Premium Motor Oil (5W-30)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              <option value="Engine">Engine</option>
              <option value="Brake System">Brake System</option>
              <option value="Electrical">Electrical</option>
              <option value="Transmission">Transmission</option>
              <option value="Suspension">Suspension</option>
              <option value="Cooling System">Cooling System</option>
              <option value="Exhaust">Exhaust</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Price and Stock */}
          <div className="form-row">
            <div className="form-group">
              <label>Price (₱)</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Enter item description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="add-item-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="add-btn" 
            onClick={handleSubmit}
            disabled={!itemName || !category || !price || !stock}
          >
            <span className="material-icons-round">add</span>
            Add Item
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default AddItemModal;
