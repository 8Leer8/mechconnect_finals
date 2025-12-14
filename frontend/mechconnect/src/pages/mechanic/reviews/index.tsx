import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import BottomNavMechanic from '../../../components/BottomNavMechanic';
import './Reviews.css';

interface Review {
  id: number;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  serviceType: string;
  date: string;
  jobId: string;
}

const Reviews: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      clientName: 'Maria Santos',
      rating: 5,
      comment: 'Excellent service! John was very professional and fixed my car battery quickly. Highly recommend!',
      serviceType: 'Battery Service',
      date: '2025-12-10',
      jobId: 'BK-103'
    },
    {
      id: 2,
      clientName: 'Juan Dela Cruz',
      rating: 5,
      comment: 'Great mechanic! Did a thorough oil change and explained everything clearly. Will definitely use again.',
      serviceType: 'Oil Change',
      date: '2025-12-08',
      jobId: 'BK-102'
    },
    {
      id: 3,
      clientName: 'Ana Reyes',
      rating: 4,
      comment: 'Good work on the brake replacement. A bit expensive but quality was good.',
      serviceType: 'Brake Service',
      date: '2025-12-05',
      jobId: 'BK-101'
    },
    {
      id: 4,
      clientName: 'Pedro Garcia',
      rating: 5,
      comment: 'Very knowledgeable about car diagnostics. Found the issue quickly and fixed it professionally.',
      serviceType: 'Diagnostics',
      date: '2025-12-03',
      jobId: 'BK-99'
    },
    {
      id: 5,
      clientName: 'Rosa Mendoza',
      rating: 5,
      comment: 'Perfect tire service! Balanced and rotated all tires. Very satisfied with the work.',
      serviceType: 'Tire Service',
      date: '2025-11-28',
      jobId: 'BK-98'
    },
    {
      id: 6,
      clientName: 'Carlos Lopez',
      rating: 4,
      comment: 'AC service was good, car is cooling properly now. Took a bit longer than expected though.',
      serviceType: 'AC Service',
      date: '2025-11-25',
      jobId: 'BK-97'
    },
    {
      id: 7,
      clientName: 'Elena Torres',
      rating: 5,
      comment: 'Outstanding suspension work! Car handles much better now. Thank you!',
      serviceType: 'Suspension Service',
      date: '2025-11-20',
      jobId: 'BK-95'
    },
    {
      id: 8,
      clientName: 'Miguel Fernandez',
      rating: 5,
      comment: 'Engine service was top-notch. Very detailed and professional approach.',
      serviceType: 'Engine Service',
      date: '2025-11-18',
      jobId: 'BK-94'
    }
  ];

  const goToNotifications = () => {
    history.push('/mechanic/notifications');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`material-icons-round star ${i <= rating ? 'filled' : 'empty'}`}
        >
          {i <= rating ? 'star' : 'star_border'}
        </span>
      );
    }
    return stars;
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating =>
    reviews.filter(review => review.rating === rating).length
  );

  return (
    <IonPage>
      <IonContent className="mechanic-reviews-content" scrollY>
        {/* Header */}
        <div className="mechanic-reviews-header">
          <button className="back-button" onClick={() => history.goBack()}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="mechanic-reviews-title">Reviews & Ratings</h1>
          <button
            className="notification-button"
            onClick={goToNotifications}
          >
            <span className="material-icons-round">notifications</span>
          </button>
        </div>

        {/* Rating Summary */}
        <div className="rating-summary-section">
          <div className="rating-overview">
            <div className="average-rating">
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              <div className="rating-stars">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="total-reviews">({totalReviews} reviews)</span>
            </div>
          </div>

          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} star</span>
                <div className="rating-progress">
                  <div
                    className="rating-fill"
                    style={{ width: `${(ratingDistribution[rating - 1] / totalReviews) * 100}%` }}
                  ></div>
                </div>
                <span className="rating-count">{ratingDistribution[rating - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="reviews-list-section">
          <h3 className="section-title">Recent Reviews</h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="client-info">
                    <div className="client-avatar">
                      {review.clientAvatar ? (
                        <img src={review.clientAvatar} alt={review.clientName} />
                      ) : (
                        <span className="avatar-placeholder">
                          {review.clientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="client-details">
                      <span className="client-name">{review.clientName}</span>
                      <span className="review-date">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating">
                    <div className="rating-stars">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>

                <div className="review-content">
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-meta">
                    <span className="service-type">{review.serviceType}</span>
                    <span className="job-id">{review.jobId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Notification sent"
          duration={2000}
          color="success"
        />
      </IonContent>

      <BottomNavMechanic />
    </IonPage>
  );
};

export default Reviews;