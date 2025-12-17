import { IonContent, IonPage, IonModal, IonToast } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './WorkingJob.css';

interface Quote {
  id: number;
  title: string;
  amount: number;
  description: string;
}

const WorkingJob: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [jobStatus, setJobStatus] = useState<'arrived' | 'working'>('arrived');
  const [workTimer, setWorkTimer] = useState(0); // Timer in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([
    { id: 1, title: 'Initial Quote', amount: 3200, description: 'Full diagnostic scan and error code reading' },
    { id: 2, title: 'Additional Services', amount: 800, description: 'Oil change and filter replacement' }
  ]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [beforePictures, setBeforePictures] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && workTimer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, workTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goBack = () => {
    history.goBack();
  };

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const handleStartWorking = () => {
    // Show warning if no pictures, but still allow starting
    if (beforePictures.length === 0) {
      setToastMessage('Warning: No before pictures taken. Consider taking pictures for insurance purposes.');
      setShowToast(true);
    }
    
    setJobStatus('working');
    setIsTimerRunning(true);
    setToastMessage('Job started! Timer is running.');
    setShowToast(true);
  };

  const handlePauseJob = () => {
    setIsTimerRunning(false);
    setToastMessage('Job paused. Timer stopped.');
    setShowToast(true);
  };

  const handleContactClient = () => {
    setToastMessage('Contact feature coming soon');
    setShowToast(true);
  };

  const handleCompleteJob = () => {
    setShowFinishModal(true);
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    setIsTimerRunning(false); // Pause the timer when finishing job
    setToastMessage('Job finished successfully! Thank you for your service.');
    setShowToast(true);
    // TODO: Backend integration for job completion
    console.log('Finishing job with ID:', id);

    // Navigate to jobs page with completed filter after a short delay to show the toast
    setTimeout(() => {
      history.push('/mechanic/jobs?filter=completed');
    }, 2000);
  };

  const handleAddQuote = () => {
    setEditingQuote(null);
    setShowQuoteModal(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowQuoteModal(true);
  };

  const handleDeleteQuote = (quoteId: number) => {
    setQuotes(quotes.filter(q => q.id !== quoteId));
    setToastMessage('Quote deleted successfully');
    setShowToast(true);
  };

  const handleSaveQuote = (quoteData: { title: string; amount: number; description: string }) => {
    if (editingQuote) {
      setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...q, ...quoteData } : q));
      setToastMessage('Quote updated and sent successfully');
    } else {
      const newQuote: Quote = {
        id: Math.max(...quotes.map(q => q.id)) + 1,
        ...quoteData
      };
      setQuotes([...quotes, newQuote]);
      setToastMessage('Quote sent successfully');
    }
    setShowQuoteModal(false);
    setEditingQuote(null);
    setShowToast(true);
  };

  const handleTakePicture = () => {
    // In a real app, this would open camera
    // For now, simulate taking a picture
    const newPicture = `picture_${Date.now()}.jpg`;
    setBeforePictures([...beforePictures, newPicture]);
    setToastMessage('Picture taken successfully!');
    setShowToast(true);
  };

  const handleRemovePicture = (index: number) => {
    const newPictures = beforePictures.filter((_, i) => i !== index);
    setBeforePictures(newPictures);
    setToastMessage('Picture removed');
    setShowToast(true);
  };

  const handleReportProblem = () => {
    setToastMessage('Report problem feature coming soon');
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonContent className="working-job-content" scrollY>
        {/* Header */}
        <div className="mechanic-job-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-job-detail-title">Working on Job</h1>
          <div className="header-actions">
            <button
              className="report-button"
              onClick={handleReportProblem}
            >
              <span className="material-icons-round">report_problem</span>
            </button>
            <Wallet />
            <button
              className="notification-button"
              onClick={goToNotifications}
            >
              <span className="material-icons-round">notifications</span>
            </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="status-section">
          <div className="status-card">
            <h3 className="status-title">Job Status</h3>
            <div className={`status-indicator ${jobStatus}`}>
              <span className="status-text">
                {jobStatus === 'arrived' && 'Arrived at Location'}
                {jobStatus === 'working' && `Working on Vehicle ${isTimerRunning ? '- Timer Running' : '- Timer Paused'} - ${formatTime(workTimer)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Before Pictures Section */}
        <div className="pictures-section">
          <div className="pictures-card">
            <h3 className="section-title">Before Pictures <span className="required">*</span></h3>
            <p className="pictures-subtitle">Take pictures of the vehicle before starting work (required for insurance)</p>
            
            <div className="pictures-grid">
              {beforePictures.map((picture, index) => (
                <div key={index} className="picture-item">
                  <img src="/placeholder-image.jpg" alt={`Before ${index + 1}`} className="picture-preview" />
                  <button className="remove-picture" onClick={() => handleRemovePicture(index)}>
                    <span className="material-icons-round">close</span>
                  </button>
                </div>
              ))}
              <button className="add-picture" onClick={handleTakePicture}>
                <span className="material-icons-round add-icon">add_a_photo</span>
                <span className="add-text">Take Picture</span>
              </button>
            </div>
            
            {beforePictures.length === 0 && (
              <div className="pictures-warning">
                <span className="material-icons-round warning-icon">warning</span>
                <span className="warning-text">Before pictures are recommended for insurance purposes</span>
              </div>
            )}
          </div>
        </div>

        {/* Quotes Management */}
        <div className="quotes-section">
          <div className="quotes-header">
            <h3 className="section-title">Quotes</h3>
            <button className="btn-send-quote" onClick={handleAddQuote}>
              <span className="material-icons-round">send</span>
              Send Quote
            </button>
          </div>
          <div className="quotes-list">
            {quotes.map(quote => (
              <div key={quote.id} className="quote-item">
                <div className="quote-header">
                  <span className="quote-title">{quote.title}</span>
                  <span className="quote-amount">₱{quote.amount.toFixed(2)}</span>
                </div>
                <p className="quote-description">{quote.description}</p>
                <div className="quote-actions">
                  <button className="btn-edit" onClick={() => handleEditQuote(quote)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDeleteQuote(quote.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-contact" onClick={handleContactClient}>
            <span className="material-icons-round icon-sm">phone</span>
            Contact Client
          </button>

          {/* Always show these buttons */}
          {workTimer > 0 && (
            <div className="timer-display">
              <span className="timer-label">Work Time:</span>
              <span className="timer-value">{formatTime(workTimer)}</span>
            </div>
          )}
          
          <button 
            className={isTimerRunning ? "btn-pause" : "btn-finish"} 
            onClick={isTimerRunning ? handlePauseJob : handleStartWorking}
          >
            <span className="material-icons-round icon-sm">
              {isTimerRunning ? "pause" : "play_arrow"}
            </span>
            {isTimerRunning ? "Pause Job" : "Start Job"}
          </button>
          
          {workTimer > 0 && (
            <button className="btn-complete" onClick={handleCompleteJob}>
              <span className="material-icons-round icon-sm">done_all</span>
              Finish Job
            </button>
          )}
        </div>

        {/* Quote Modal */}
        <IonModal isOpen={showQuoteModal} onDidDismiss={() => setShowQuoteModal(false)}>
        <QuoteModal
          quote={editingQuote}
          onSave={handleSaveQuote}
          onClose={() => setShowQuoteModal(false)}
        />
      </IonModal>

      <IonModal isOpen={showFinishModal} onDidDismiss={() => setShowFinishModal(false)}>
        <FinishJobModal
          onConfirm={handleConfirmFinish}
          onCancel={() => setShowFinishModal(false)}
        />
      </IonModal>        {/* Finish Job Confirmation Modal */}
        <IonModal isOpen={showFinishModal} onDidDismiss={() => setShowFinishModal(false)}>
          <FinishJobModal
            onConfirm={handleConfirmFinish}
            onCancel={() => setShowFinishModal(false)}
          />
        </IonModal>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

interface QuoteModalProps {
  quote: Quote | null;
  onSave: (data: { title: string; amount: number; description: string }) => void;
  onClose: () => void;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ quote, onSave, onClose }) => {
  const [title, setTitle] = useState(quote?.title || '');
  const [amount, setAmount] = useState(quote?.amount.toString() || '');
  const [description, setDescription] = useState(quote?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      amount: parseFloat(amount) || 0,
      description
    });
  };

  return (
    <div className="quote-modal">
      <div className="quote-modal-header">
        <h2>{quote ? 'Edit Quote' : 'Send Quote'}</h2>
        <button className="close-button" onClick={onClose}>
          <span className="material-icons-round">close</span>
        </button>
      </div>
      <form className="quote-modal-content" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₱)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="quote-modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-save">{quote ? 'Update & Send' : 'Send Quote'}</button>
        </div>
      </form>
    </div>
  );
};

interface FinishJobModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const FinishJobModal: React.FC<FinishJobModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="finish-job-modal">
      <div className="finish-job-modal-header">
        <h2>Finish Job</h2>
        <button className="close-button" onClick={onCancel}>
          <span className="material-icons-round">close</span>
        </button>
      </div>
      <div className="finish-job-modal-content">
        <div className="finish-job-icon">
          <span className="material-icons-round">help_outline</span>
        </div>
        <h3>Are you sure you want to finish this job?</h3>
        <p>This action cannot be undone. The job will be marked as completed.</p>
        <div className="finish-job-modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm}>Yes, Finish Job</button>
        </div>
      </div>
    </div>
  );
};

export default WorkingJob;