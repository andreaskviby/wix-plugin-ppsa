# Post-Purchase Survey & Attribution - Setup & Testing Guide

## Overview

This Wix Plugin provides a comprehensive post-purchase attribution solution that captures "How did you hear about us?" responses immediately after checkout, ties them to order value, and pushes data to analytics platforms for better marketing attribution.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Wix Studio Account** with development access
- **Node.js** (version 16 or higher)
- **Wix CLI** installed globally: `npm install -g @wix/cli`
- **Wix Stores** enabled on your test site
- **Basic understanding** of JavaScript/React and Wix development

## 🚀 Installation & Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to your project directory
cd wix-plugin-ppsa

# Install dependencies
npm install

# Install dev dependencies
npm install --save-dev @types/react @types/react-dom eslint jest @testing-library/react @testing-library/jest-dom
```

### Step 2: Configure Wix Development Environment

```bash
# Login to your Wix account
wix login

# Initialize the project as a Wix Blocks app
wix dev
```

### Step 3: Set Up Collections

The app requires two Wix Data collections:

#### Collection 1: `pps_responses`
- **Purpose**: Store survey responses with order data
- **Permissions**: Admin only
- **Fields**: See `src/collections/ppsResponses.js` for complete schema

#### Collection 2: `pps_settings`
- **Purpose**: Store app configuration and settings
- **Permissions**: Admin only  
- **Fields**: See `src/collections/ppsSettings.js` for complete schema

### Step 4: Configure Backend Functions

Upload the following backend files to your Wix site:

1. `src/backend/responses.jsw` - Main response handling
2. `src/backend/plan.jsw` - Plan management and billing
3. `src/backend/export.jsw` - Data export functionality
4. `src/backend/events.js` - eCommerce event handlers

### Step 5: Deploy Widgets and Pages

1. **Thank-You Survey Widget**: Deploy `src/widgets/thankyou-survey/`
2. **Dashboard Page**: Deploy `src/pages/dashboard/`

## 🧪 Testing Instructions

### Unit Tests

Run comprehensive backend and frontend tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Integration Testing

#### Test Thank-You Page Survey

1. **Create Test Order**:
   ```bash
   # Use Wix Stores test mode
   # Add items to cart and complete checkout
   # Note the order ID from the thank-you page
   ```

2. **Verify Survey Display**:
   - Survey should appear automatically on thank-you page
   - All channel options should be visible
   - "Other" option should show text input when selected

3. **Test Survey Submission**:
   - Select a channel and submit
   - Verify success message appears
   - Check that duplicate submissions are blocked

4. **Verify Analytics Events**:
   ```javascript
   // Check browser console for analytics events
   // Should see gtag, fbq, and dataLayer events
   console.log(window.dataLayer);
   ```

#### Test Dashboard Analytics

1. **Access Dashboard**:
   - Navigate to `/dashboard` page in your app
   - Verify authentication and plan display

2. **Test Analytics Views**:
   - **Top Channels**: Should show channel distribution
   - **Revenue Share**: Should show revenue by channel
   - **Trend**: Should show 30-day response trend
   - **Response Rate**: Should calculate based on total orders

3. **Test Export Functionality**:
   ```bash
   # Click Export CSV button
   # Verify file downloads correctly
   # Check CSV format and data accuracy
   ```

#### Test Plan Management

1. **Free Plan Limits**:
   - Create 100+ test responses
   - Verify 101st response is blocked
   - Check upgrade prompts appear

2. **Feature Gating**:
   - Test server events (Pro+ only)
   - Test advanced settings (Pro+ only)
   - Test multi-survey rotation (Growth only)

### Load Testing

Test the system under realistic load:

```bash
# Create multiple concurrent survey submissions
# Monitor response times and error rates
# Verify database performance under load
```

### Cross-Browser Testing

Test on multiple browsers and devices:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablets

## 🔧 Configuration

### Environment Variables

Set these in your Wix Secrets Manager:

```javascript
// Analytics Configuration
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
FACEBOOK_PIXEL_ID=your_pixel_id
TIKTOK_PIXEL_ID=your_tiktok_id

// Server Events (Pro+ plans)
META_CAPI_ACCESS_TOKEN=your_capi_token
META_CAPI_DATASET_ID=your_dataset_id
```

### Survey Customization

Customize survey options in the dashboard settings:

```javascript
const surveySettings = {
  surveyTitle: "How did you hear about us?",
  choices: [
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
  ],
  displayRules: {
    showToAll: true,
    firstTimeOnly: false,
    samplingRate: 100
  }
};
```

## 📊 Analytics Integration

### Google Analytics 4 Setup

1. **Install GA4** on your Wix site
2. **Configure Custom Event**:
   ```javascript
   gtag('event', 'HDYHAU', {
     channel: 'Instagram',
     order_value: 79.99,
     currency: 'USD',
     order_id: 'ORD-123456'
   });
   ```

### Facebook Pixel Setup

1. **Install Facebook Pixel** via Wix Marketing Tools
2. **Verify Custom Events**:
   ```javascript
   fbq('trackCustom', 'HDYHAU', {
     channel: 'Instagram',
     value: 79.99,
     currency: 'USD'
   });
   ```

### Server-Side Events (Pro+ Plans)

Configure Meta Conversions API for better attribution:

```javascript
// Set up in Wix Secrets
META_CAPI_ACCESS_TOKEN=your_token
META_CAPI_DATASET_ID=your_dataset_id

// Events will be automatically forwarded
// Check Meta Events Manager for verification
```

## 🚀 Deployment to Production

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Analytics events firing correctly
- [ ] Plan billing configured
- [ ] Collections created with proper permissions
- [ ] Backend functions deployed
- [ ] Widgets and pages deployed
- [ ] SSL certificates configured
- [ ] Performance optimization completed

### Deployment Steps

1. **Build Production Bundle**:
   ```bash
   npm run build
   ```

2. **Deploy to Wix**:
   ```bash
   wix publish
   ```

3. **Verify Production**:
   - Test complete user flow
   - Check analytics integration
   - Verify billing functionality
   - Test export features

### Post-Deployment Monitoring

1. **Set Up Monitoring**:
   - Response rate tracking
   - Error rate monitoring
   - Performance metrics
   - User engagement analytics

2. **Regular Maintenance**:
   - Weekly data exports for backup
   - Monthly performance reviews
   - Quarterly feature updates
   - Annual security audits

## 📈 Marketing & App Store Submission

### App Store Preparation

1. **App Description**: 
   - Highlight key benefits: attribution accuracy, revenue insights
   - Include screenshots of dashboard and survey widget
   - Emphasize one-click installation and setup

2. **Pricing Strategy**:
   - **Free**: 100 responses/month, basic dashboard
   - **Pro ($29/month)**: Unlimited responses, server events
   - **Growth ($79/month)**: Advanced segmentation, multi-survey

3. **SEO Keywords**: 
   - "post-purchase survey"
   - "attribution tracking"
   - "marketing analytics" 
   - "customer insights"
   - "ecommerce attribution"

### Support Documentation

Create comprehensive user guides:
- Quick start guide for store owners
- Advanced configuration for marketers
- API documentation for developers
- Troubleshooting and FAQ section

## 🐛 Troubleshooting

### Common Issues

1. **Survey Not Appearing**:
   - Check if orderId is available on thank-you page
   - Verify widget is properly embedded
   - Check site permissions and collection access

2. **Analytics Events Not Firing**:
   - Verify analytics tags are installed on site
   - Check console for JavaScript errors
   - Confirm event payload format

3. **Export Failing**:
   - Check plan limits (free plan has export restrictions)
   - Verify date ranges are valid
   - Check for data permission issues

4. **Performance Issues**:
   - Review database query efficiency
   - Check for memory leaks in React components
   - Optimize image and asset loading

### Debug Mode

Enable debug logging:

```javascript
// Add to wix.config.json
{
  "debug": true,
  "logging": {
    "level": "debug",
    "console": true
  }
}
```

## 📞 Support

For technical support:
- **Documentation**: Check the comprehensive docs in `/docs`
- **Issues**: Report bugs via GitHub issues
- **Community**: Join the Wix Developer Community
- **Direct Support**: Contact via app dashboard

## 🔄 Updates & Maintenance

### Update Schedule
- **Monthly**: Security patches and bug fixes
- **Quarterly**: New features and improvements
- **Annually**: Major version upgrades

### Backward Compatibility
- All API changes are backward compatible for 1 year
- Deprecated features receive 6-month notice
- Migration guides provided for breaking changes

---

**Next Steps**: Once testing is complete, proceed with App Store submission and marketing campaign launch. Monitor performance metrics and user feedback for continuous improvement.