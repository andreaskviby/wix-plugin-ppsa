// Entry point for Wix Blocks app
import { initializeApp } from './backend/events.js';

// Initialize the app
initializeApp();

// Export widgets for Wix Studio
export { default as ThankYouSurvey } from './widgets/thankyou-survey/ThankYouSurvey.jsx';
export { default as Dashboard } from './pages/dashboard/Dashboard.jsx';