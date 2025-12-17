import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonModal,
  IonButton,
  IonToast,
  IonIcon,
  IonText,
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { star, starOutline, calendar, location, time, checkmarkCircle, closeCircle, refresh, call, mail, chatbubble } from 'ionicons/icons';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import Wallet from '../../../components/Wallet';
import './BackjobDetail.css';

interface BackjobDetailProps {}

const BackjobDetail: React.FC<BackjobDetailProps> = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mock data for backjob details
  const backjobData = {
    booking_id: parseInt(id),
    request_id: 14,
    status: 'backjob',
    amount_fee: 1800,
    booked_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    client_name: 'Roberto Diaz',
    client_phone: '+63 917 123 4567',
    client_email: 'roberto.diaz@email.com',
    request_summary: 'Follow-up brake inspection - customer reported squeaking',
    request_type: 'Brake Service Follow-up',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    service_location: 'Makati City, Philippines',
    original_job_id: 11,
    client_rating: 4.5,
    client_feedback: 'Good follow-up service, brakes feel much better now.',
    photos: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
    ],
    original_job_details: {
      booking_id: 11,
      completed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      service_type: 'Brake Pad Replacement',
      amount_fee: 3200,
    }
  };

  const handleReschedule = () => {
    // In a real app, this would make an API call to reschedule
    setShowRescheduleModal(false);
    setShowToast(true);
    setToastMessage('Backjob rescheduled successfully!');
    // Navigate back to jobs page after a delay
    setTimeout(() => {
      history.push('/mechanic/jobs?filter=backjob');
    }, 2000);
  };

  const handleContactCustomer = (method: 'call' | 'message' | 'email') => {
    setShowContactModal(false);

    switch (method) {
      case 'call':
        // In a real app, this would initiate a phone call
        window.open(`tel:${backjobData.client_phone}`, '_self');
        break;
      case 'message':
        // In a real app, this would open SMS or messaging app
        window.open(`sms:${backjobData.client_phone}`, '_self');
        break;
      case 'email':
        // In a real app, this would open email client
        window.open(`mailto:${backjobData.client_email}?subject=Follow-up Service for ${backjobData.request_type}`, '_self');
        break;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IonIcon
          key={i}
          icon={i <= rating ? star : starOutline}
          className={i <= rating ? 'star-filled' : 'star-empty'}
        />
      );
    }
    return stars;
  };

  return (
    <IonPage>
      <IonContent className="backjob-detail-content">
        <div className="backjob-detail-container">
          {/* Header */}
          <div className="backjob-detail-header">
            <button
              className="backjob-detail-back-btn"
              onClick={() => history.goBack()}
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h1 className="backjob-detail-title">Backjob Details</h1>
          </div>

          {/* Job Status Badge */}
          <div className="backjob-status-section">
            <div className="backjob-status-badge status-backjob">
              <IonIcon icon={refresh} />
              Follow-up Job
            </div>
          </div>

          {/* Client Information */}
          <div className="backjob-client-section">
            <div className="backjob-client-header">
              <div className="backjob-client-avatar">
                <span className="material-icons-round">person</span>
              </div>
              <div className="backjob-client-info">
                <h3 className="backjob-client-name">{backjobData.client_name}</h3>
                <p className="backjob-job-id">#BK-{backjobData.booking_id}</p>
              </div>
            </div>
            <IonButton
              fill="outline"
              color="primary"
              className="contact-customer-btn"
              onClick={() => setShowContactModal(true)}
            >
              <IonIcon icon={call} slot="start" />
              Contact Customer
            </IonButton>
          </div>

          {/* Service Details */}
          <div className="backjob-service-section">
            <h3 className="backjob-section-title">Service Details</h3>
            <div className="backjob-service-card">
              <div className="backjob-service-type">
                <span className="material-icons-round service-icon">build</span>
                <div>
                  <h4>{backjobData.request_type}</h4>
                  <p>{backjobData.request_summary}</p>
                </div>
              </div>
              <div className="backjob-service-amount">
                <span className="amount-label">Amount</span>
                <span className="amount-value">₱{backjobData.amount_fee}</span>
              </div>
            </div>
          </div>

          {/* Original Job Reference */}
          <div className="backjob-original-section">
            <h3 className="backjob-section-title">Original Job Reference</h3>
            <div className="backjob-original-card">
              <div className="backjob-original-info">
                <div className="backjob-original-header">
                  <span className="material-icons-round">history</span>
                  <h4>Original Service: {backjobData.original_job_details.service_type}</h4>
                </div>
                <p className="backjob-original-id">Booking #{backjobData.original_job_details.booking_id}</p>
                <p className="backjob-original-date">
                  Completed: {new Date(backjobData.original_job_details.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="backjob-original-amount">Original Amount: ₱{backjobData.original_job_details.amount_fee}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="backjob-schedule-section">
            <h3 className="backjob-section-title">Schedule Information</h3>
            <div className="backjob-schedule-card">
              <div className="backjob-schedule-item">
                <IonIcon icon={calendar} />
                <div>
                  <span className="schedule-label">Booked Date</span>
                  <span className="schedule-value">
                    {new Date(backjobData.booked_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="backjob-schedule-item">
                <IonIcon icon={time} />
                <div>
                  <span className="schedule-label">Completed Date</span>
                  <span className="schedule-value">
                    {new Date(backjobData.completed_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="backjob-schedule-item">
                <IonIcon icon={location} />
                <div>
                  <span className="schedule-label">Service Location</span>
                  <span className="schedule-value">{backjobData.service_location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Feedback */}
          <div className="backjob-feedback-section">
            <h3 className="backjob-section-title">Client Feedback</h3>
            <div className="backjob-feedback-card">
              <div className="backjob-feedback-rating">
                <div className="rating-stars">
                  {renderStars(backjobData.client_rating)}
                </div>
                <span className="rating-value">{backjobData.client_rating}/5</span>
              </div>
              <p className="backjob-feedback-text">"{backjobData.client_feedback}"</p>
            </div>
          </div>

          {/* Photos */}
          <div className="backjob-photos-section">
            <h3 className="backjob-section-title">Service Photos</h3>
            <div className="backjob-photos-grid">
              {backjobData.photos.map((photo, index) => (
                <div key={index} className="backjob-photo-item">
                  <img src={photo} alt={`Service photo ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="backjob-actions-section">
            <IonButton
              expand="block"
              className="backjob-reschedule-btn"
              onClick={() => setShowRescheduleModal(true)}
            >
              <IonIcon icon={calendar} slot="start" />
              Reschedule Backjob
            </IonButton>
          </div>
        </div>

        {/* Reschedule Modal */}
        <IonModal
          isOpen={showRescheduleModal}
          onDidDismiss={() => setShowRescheduleModal(false)}
          className="backjob-reschedule-modal"
        >
          <div className="backjob-modal-content">
            <div className="backjob-modal-header">
              <h3>Reschedule Backjob</h3>
              <button
                className="backjob-modal-close"
                onClick={() => setShowRescheduleModal(false)}
              >
                <IonIcon icon={closeCircle} />
              </button>
            </div>
            <div className="backjob-modal-body">
              <p>Are you sure you want to reschedule this follow-up job?</p>
              <p className="backjob-modal-note">
                This will notify the client and update the job status.
              </p>
            </div>
            <div className="backjob-modal-actions">
              <IonButton
                fill="outline"
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </IonButton>
              <IonButton
                onClick={handleReschedule}
                className="backjob-confirm-reschedule"
              >
                <IonIcon icon={checkmarkCircle} slot="start" />
                Confirm Reschedule
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Contact Modal */}
        <IonModal
          isOpen={showContactModal}
          onDidDismiss={() => setShowContactModal(false)}
          className="backjob-contact-modal"
        >
          <div className="backjob-modal-content">
            <div className="backjob-modal-header">
              <h3>Contact Customer</h3>
              <button
                className="backjob-modal-close"
                onClick={() => setShowContactModal(false)}
              >
                <IonIcon icon={closeCircle} />
              </button>
            </div>
            <div className="backjob-modal-body">
              <p>How would you like to contact {backjobData.client_name}?</p>
            </div>
            <div className="backjob-modal-actions contact-options">
              <IonButton
                fill="outline"
                onClick={() => handleContactCustomer('call')}
              >
                <IonIcon icon={call} slot="start" />
                Call
              </IonButton>
              <IonButton
                fill="outline"
                onClick={() => handleContactCustomer('message')}
              >
                <IonIcon icon={chatbubble} slot="start" />
                Message
              </IonButton>
              <IonButton
                fill="outline"
                onClick={() => handleContactCustomer('email')}
              >
                <IonIcon icon={mail} slot="start" />
                Email
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
        />
      </IonContent>

      <BottomNavMechanic />
      <Wallet />
    </IonPage>
  );
};

export default BackjobDetail;