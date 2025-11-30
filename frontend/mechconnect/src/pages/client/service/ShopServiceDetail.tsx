import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './ShopServiceDetail.css';

const ShopServiceDetail: React.FC = () => {
  const history = useHistory();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const goBack = () => history.goBack();
  const goToShopProfile = () => history.push('/client/shop-profile/1');
  const handleBookNow = () => history.push('/client/direct-request');

  const handleAddonClick = (addonId: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonId) 
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

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
          <div className="service-type-badge">Shop</div>
        </div>

        <div className="service-info-section">
          <h2 className="service-name">Complete Car Maintenance</h2>
          <div className="service-price">₱2,500</div>

          <div className="section-block">
            <h3 className="section-title">Description</h3>
            <p className="service-description">
              Comprehensive car maintenance service provided by our certified shop mechanics. 
              Includes full inspection, fluid checks, and preventive maintenance to keep your 
              vehicle in optimal condition.
            </p>
          </div>

          <div className="section-block">
            <h3 className="section-title">Includes</h3>
            <div className="includes-list">
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Complete vehicle inspection</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Engine oil and filter change</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Brake system check</span>
              </div>
              <div className="include-item">
                <span className="material-icons-round check-icon">check_circle</span>
                <span className="include-text">Tire pressure adjustment</span>
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
                  <div className="addon-name">Tire Rotation</div>
                  <div className="addon-price">+ ₱500</div>
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
                  <div className="addon-name">Wheel Alignment</div>
                  <div className="addon-price">+ ₱800</div>
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
                  <div className="addon-name">Battery Check & Clean</div>
                  <div className="addon-price">+ ₱300</div>
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
                  <div className="addon-name">AC System Check</div>
                  <div className="addon-price">+ ₱600</div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Provider</h3>
            <div className="provider-card" onClick={goToShopProfile}>
              <div className="provider-avatar">AS</div>
              <div className="provider-details">
                <div className="provider-name">AutoCare Solutions</div>
                <div className="provider-type">
                  <span className="material-icons-round type-icon">store</span>
                  Shop
                </div>
              </div>
              <span className="material-icons-round arrow-icon">chevron_right</span>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Mechanics for this Service</h3>
            <div className="mechanics-list">
              <div className="mechanic-item">
                <div className="mechanic-avatar">JD</div>
                <div className="mechanic-name">John Dela Cruz</div>
              </div>
              <div className="mechanic-item">
                <div className="mechanic-avatar">MS</div>
                <div className="mechanic-name">Maria Santos</div>
              </div>
              <div className="mechanic-item">
                <div className="mechanic-avatar">RC</div>
                <div className="mechanic-name">Robert Cruz</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">star</span>
              </div>
              <div className="stat-value">4.9</div>
              <div className="stat-label">Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">rate_review</span>
              </div>
              <div className="stat-value">342</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <span className="material-icons-round">check_circle</span>
              </div>
              <div className="stat-value">1,247</div>
              <div className="stat-label">Jobs</div>
            </div>
          </div>

          <div className="section-block">
            <h3 className="section-title">Reviews</h3>
            
            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">AL</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">Anna Lopez</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 22, 2025</div>
              </div>
              <p className="review-comment">
                Excellent shop! Very professional service and the mechanics are all skilled. 
                They took great care of my car and explained everything thoroughly.
              </p>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">PT</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">Peter Tan</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 19, 2025</div>
              </div>
              <p className="review-comment">
                Great experience! The shop is well-equipped and the staff is friendly. 
                My car maintenance was completed on time and the price was reasonable.
              </p>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">LG</div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">Linda Garcia</div>
                    <div className="review-rating">
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star">star</span>
                      <span className="material-icons-round star-outline">star_outline</span>
                    </div>
                  </div>
                </div>
                <div className="review-date">Nov 16, 2025</div>
              </div>
              <p className="review-comment">
                Very satisfied with the service. The team was efficient and knowledgeable. 
                Will definitely come back for future maintenance needs!
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

export default ShopServiceDetail;
