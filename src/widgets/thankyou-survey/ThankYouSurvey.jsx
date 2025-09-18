import React, { useState, useEffect } from 'react';
import { saveResponse, responseExists } from '../../backend/responses.jsw';
import './ThankYouSurvey.css';

/**
 * Post-Purchase Survey Widget for Thank-You page
 * Collects "How did you hear about us?" responses tied to order data
 */
const ThankYouSurvey = ({ orderId, orderValue, currency, settings }) => {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Default survey choices if not provided in settings
  const defaultChoices = [
    'Instagram',
    'Facebook',
    'TikTok', 
    'YouTube',
    'Google Search',
    'Google Ads',
    'Influencer',
    'Friend/Family',
    'Blog/PR',
    'Podcast',
    'Email/SMS',
    'Other'
  ];

  const surveyTitle = settings?.surveyTitle || 'How did you hear about us?';
  const choices = settings?.choices || defaultChoices;
  const showConsent = settings?.consentSettings?.showConsent || false;

  useEffect(() => {
    // Check if widget should be displayed
    initializeWidget();
  }, [orderId]);

  /**
   * Initialize widget - check if should be displayed and if response already exists
   */
  const initializeWidget = async () => {
    try {
      // Don't show if no orderId
      if (!orderId) {
        console.log('No orderId provided, hiding survey');
        return;
      }

      // Check if response already exists (idempotency)
      const exists = await responseExists(orderId);
      if (exists) {
        console.log('Response already exists for this order');
        setIsSubmitted(true);
        return;
      }

      // Show widget with animation
      setTimeout(() => {
        setIsVisible(true);
      }, 500); // Small delay to ensure page is loaded

    } catch (error) {
      console.error('Error initializing survey widget:', error);
      setError('Failed to load survey');
    }
  };

  /**
   * Handle survey submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedChannel) {
      setError('Please select how you heard about us');
      return;
    }

    if (selectedChannel === 'Other' && !otherText.trim()) {
      setError('Please specify how you heard about us');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const responseData = {
        orderId,
        channel: selectedChannel,
        otherText: selectedChannel === 'Other' ? otherText.trim() : null,
        clientHints: getClientHints()
      };

      const result = await saveResponse(responseData);

      if (result.success) {
        setIsSubmitted(true);
        
        // Fire analytics event
        fireAnalyticsEvent({
          channel: selectedChannel,
          orderId,
          orderValue: orderValue || 0,
          currency: currency || 'USD'
        });

        // Auto-hide after success
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Failed to save response');
      }

    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle channel selection
   */
  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setError('');
    
    // Clear other text if not selecting "Other"
    if (channel !== 'Other') {
      setOtherText('');
    }
  };

  /**
   * Get client hints for analytics
   */
  const getClientHints = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      deviceType: getDeviceType(),
      timestamp: new Date().toISOString()
    };
  };

  /**
   * Detect device type
   */
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  /**
   * Fire analytics event
   */
  const fireAnalyticsEvent = (eventData) => {
    try {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', 'HDYHAU', {
          channel: eventData.channel,
          order_value: eventData.orderValue,
          currency: eventData.currency,
          order_id: eventData.orderId
        });
      }

      // Facebook Pixel
      if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'HDYHAU', {
          channel: eventData.channel,
          value: eventData.orderValue,
          currency: eventData.currency
        });
      }

      // Custom analytics event for other platforms
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'post_purchase_attribution',
          channel: eventData.channel,
          order_value: eventData.orderValue,
          currency: eventData.currency,
          order_id: eventData.orderId
        });
      }

      console.log('Analytics event fired:', eventData);
    } catch (error) {
      console.error('Error firing analytics event:', error);
    }
  };

  // Don't render if not visible or already submitted without showing success
  if (!isVisible && !isSubmitted) {
    return null;
  }

  return (
    <div className={`pps-survey-container ${isVisible ? 'pps-survey-visible' : ''}`}>
      <div className="pps-survey-widget">
        {isSubmitted ? (
          <div className="pps-survey-success">
            <div className="pps-success-icon">✓</div>
            <h3>Thank you!</h3>
            <p>Your feedback helps us serve you better.</p>
          </div>
        ) : (
          <div className="pps-survey-form">
            <h3 className="pps-survey-title">{surveyTitle}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="pps-survey-choices">
                {choices.map((choice) => (
                  <label key={choice} className="pps-choice-item">
                    <input
                      type="radio"
                      name="channel"
                      value={choice}
                      checked={selectedChannel === choice}
                      onChange={() => handleChannelChange(choice)}
                      disabled={isSubmitting}
                    />
                    <span className="pps-choice-text">{choice}</span>
                  </label>
                ))}
              </div>

              {selectedChannel === 'Other' && (
                <div className="pps-other-input">
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    disabled={isSubmitting}
                    maxLength="100"
                  />
                </div>
              )}

              {showConsent && (
                <div className="pps-consent">
                  <p className="pps-consent-text">
                    By submitting this survey, you agree to our{' '}
                    <a href="/privacy" target="_blank">Privacy Policy</a>
                  </p>
                </div>
              )}

              {error && (
                <div className="pps-error-message" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="pps-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="pps-loading-spinner">Submitting...</span>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThankYouSurvey;