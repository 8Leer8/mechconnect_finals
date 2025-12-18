import { IonModal } from '@ionic/react';
import { useState } from 'react';
import './deleteItemModal.css';

interface ShopItem {
  item_id: number;
  item_name: string;
  category: string;
  price: number;
  stock: number;
}

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  onItemDeleted?: () => void;
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({ isOpen, onClose, item, onItemDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!item) {
      setError('No item selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to delete item
      const response = await fetch(`http://localhost:8000/api/shops/items/${item.item_id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Success - close modal
        onClose();
        
        // Call callback to refresh items list if provided
        if (onItemDeleted) {
          onItemDeleted();
        }
      } else {
        // Handle error
        setError(data.error || data.message || 'Failed to delete item. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} cssClass="delete-item-modal" backdropDismiss>
      <div className="delete-item-modal-container">
        {/* Header */}
        <div className="delete-item-modal-header">
          <h2>Delete Item</h2>
          <button className="close-icon" onClick={onClose}>
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

        {/* Content */}
        <div className="delete-item-content">
          <div className="delete-icon">
            <span className="material-icons-round">warning</span>
          </div>
          <h3>Are you sure?</h3>
          <p>
            You are about to delete <strong>"{item?.item_name}"</strong>. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="delete-item-actions">
          <button className="cancel-btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="delete-btn" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="material-icons-round loading-spinner">hourglass_empty</span>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-icons-round">delete</span>
                Delete Item
              </>
            )}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default DeleteItemModal;

