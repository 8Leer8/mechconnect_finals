import { IonModal } from '@ionic/react';
import { useState, useEffect } from 'react';
import './addItemModal.css';

interface ShopItem {
  item_id: number;
  item_name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  onItemUpdated?: () => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, item, onItemUpdated }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setItemName(item.item_name);
      setCategory(item.category);
      setPrice(item.price.toString());
      setStock(item.stock.toString());
      setDescription(item.description || '');
      setError(null);
    }
  }, [item]);

  const resetForm = () => {
    if (item) {
      setItemName(item.item_name);
      setCategory(item.category);
      setPrice(item.price.toString());
      setStock(item.stock.toString());
      setDescription(item.description || '');
    }
    setError(null);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!itemName || !category || !price || !stock) {
      setError('Please fill in all required fields');
      return;
    }

    if (!item) {
      setError('No item selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to update item
      const response = await fetch(`http://localhost:8000/api/shops/items/${item.item_id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: itemName,
          category: category,
          price: parseFloat(price),
          stock: parseInt(stock),
          description: description || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - close modal
        onClose();
        
        // Call callback to refresh items list if provided
        if (onItemUpdated) {
          onItemUpdated();
        }
      } else {
        // Handle error
        setError(data.error || data.message || 'Failed to update item. Please try again.');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} cssClass="add-item-modal" backdropDismiss>
      <div className="add-item-modal-container">
        {/* Header */}
        <div className="add-item-modal-header">
          <h2>Edit Item</h2>
          <button className="close-icon" onClick={handleClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="material-icons-round">error_outline</span>
            <span>{error}</span>
          </div>
        )}

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
          <button className="cancel-btn" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="add-btn" 
            onClick={handleSubmit}
            disabled={!itemName || !category || !price || !stock || loading}
          >
            {loading ? (
              <>
                <span className="material-icons-round loading-spinner">hourglass_empty</span>
                Updating...
              </>
            ) : (
              <>
                <span className="material-icons-round">save</span>
                Update Item
              </>
            )}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default EditItemModal;

