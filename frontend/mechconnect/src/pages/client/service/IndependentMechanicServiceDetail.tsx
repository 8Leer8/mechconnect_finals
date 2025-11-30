import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import './IndependentMechanicServiceDetail.css';

interface RouteParams {
  id: string;
}

interface ServiceData {
  service_id: number;
  service_name: string;
  description: string;
  price: number;
  service_banner: string;
  category: string;
  provider_type: string;
  provider_id: number;
  provider_name: string;
  provider_contact?: string;
  provider_bio?: string;
  created_at: string;
}

const IndependentMechanicServiceDetail: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => history.goBack();
  const goToMechanicProfile = () => {
    if (serviceData) {
      history.push(`/client/mechanic-detail/${serviceData.provider_id}`);
    }
  };
  const handleBookNow = () => history.push('/client/direct-request');

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/services/detail/${id}/`);
      const data = await response.json();
      
      if (response.ok) {
        setServiceData(data);
      } else {
        setError(data.error || 'Failed to fetch service details');
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddonClick = (addonId: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonId) 
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="service-detail-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading service details...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="service-detail-content">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Service</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!serviceData) {
    return (
      <IonPage>
        <IonContent className="service-detail-content">
          <div className="error-container">
            <h3>Service Not Found</h3>
            <p>The service you're looking for doesn't exist.</p>
            <button className="retry-button" onClick={goBack}>
              Go Back
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="service-detail-content">
        <div className="service-detail-header">
          <button className="back-button" onClick={goBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="page-title">Service Details</h1>
          <div className="header-spacer"></div>
        </div>

        <div className="service-image">
          <div className="service-type-badge">Independent Mechanic</div>
        </div>

        <div className="service-info-section">
          <h2 className="service-name">{serviceData.service_name}</h2>
          <div className="service-price">₱{serviceData.price?.toLocaleString()}</div>

          <div className="section-block">
            <h3 className="section-title">Description</h3>
            <p className="service-description">
              Professional engine repair service including diagnostics, troubleshooting, 
              and repair of engine components. Our expert mechanic will ensure your 
              vehicle runs smoothly and efficiently.
            </p>
          </div>

          <div className="section-block">
            <h3 className="section-title">Includes</h3>
            <div className="includes-list">
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Complete engine diagnostics</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Engine oil replacement</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Oil filter replacement</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Basic tune-up</span>
              </div>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Add-ons</h3>
            <div className="addons-list">
              <div 
                className={`addon-item ${selectedAddons.includes('1') ? 'selected' : ''}`}
                onClick={(e) => handleAddonClick('1')}
              >
                <div className="addon-checkbox">
                  {selectedAddons.includes('1') && (
                    <span className="material-icons-round">check</span>
                  )}
                </div>
                <div className="addon-info">
                  <div className="addon-name">Air Filter Replacement</div>
                  <div className="addon-price">+ ₱250</div>
                </div>
              </div>

              <div 
                className={`addon-item ${selectedAddons.includes('2') ? 'selected' : ''}`}
                onClick={(e) => handleAddonClick('2')}
              >
                <div className="addon-checkbox">
                  {selectedAddons.includes('2') && (
                    <span className="material-icons-round">check</span>
                  )}
                </div>
                <div className="addon-info">
                  <div className="addon-name">Spark Plugs Replacement</div>
                  <div className="addon-price">+ ₱450</div>
                </div>
              </div>

              <div 
                className={`addon-item ${selectedAddons.includes('3') ? 'selected' : ''}`}
                onClick={(e) => handleAddonClick('3')}
              >
                <div className="addon-checkbox">
                  {selectedAddons.includes('3') && (
                    <span className="material-icons-round">check</span>
                  )}
                </div>
                <div className="addon-info">
                  <div className="addon-name">Engine Coolant Flush</div>
                  <div className="addon-price">+ ₱350</div>
                </div>
              </div>

              <div 
                className={`addon-item ${selectedAddons.includes('4') ? 'selected' : ''}`}
                onClick={(e) => handleAddonClick('4')}
              >
                <div className="addon-checkbox">
                  {selectedAddons.includes('4') && (
                    <span className="material-icons-round">check</span>
                  )}
                </div>
                <div className="addon-info">
                  <div className="addon-name">Timing Belt Inspection</div>
                  <div className="addon-price">+ ₱200</div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Provider</h3>
            <div className="provider-card" onClick={goToMechanicProfile}>
              <div className="provider-avatar">MJ</div>
              <div className="provider-details">
                <div className="provider-name">{serviceData.provider_name}</div>
                <div className="provider-type">
                  <span className="material-icons-round type-icon">person</span>
                  Independent Mechanic
                </div>
              </div>
              <span className="material-icons-round arrow-icon">chevron_right</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">star</span>
              </div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">rate_review</span>
              </div>
              <div className="stat-value">128</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="stat-value">247</div>
              <div className="stat-label">Jobs</div>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Reviews</h3>
            
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">JD</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">John Doe</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 20, 2025</div>
              </div>
              <p className="review-comment">
                Excellent service! Very professional and thorough. Fixed my engine 
                issue quickly and the price was reasonable. Highly recommended!
              </p>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">MS</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">Maria Santos</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star-outline">star_outline</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 18, 2025</div>
              </div>
              <p className="review-comment">
                Great mechanic! He explained everything clearly and fixed the problem 
                efficiently. Will definitely book again for future services.
              </p>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">RC</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">Robert Cruz</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 15, 2025</div>
              </div>
              <p className="review-comment">
                Outstanding work! Very knowledgeable and took the time to make sure 
                everything was perfect. My car runs like new. Thank you!
              </p>
            </div>
          </div>

          <button className="book-now-button" onClick={handleBookNow}>
            <span className="material-icons-round">event</span>
            Book Now
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default IndependentMechanicServiceDetail;
