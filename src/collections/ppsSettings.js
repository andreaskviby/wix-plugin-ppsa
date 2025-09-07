import wixData from 'wix-data';

/**
 * Collection schema for storing app settings and configuration
 */
export const ppsSettingsCollection = {
  _id: 'pps_settings',
  displayName: 'PPS Settings',
  fields: [
    {
      key: 'id',
      displayName: 'ID', 
      type: 'text',
      required: true
    },
    {
      key: 'siteId',
      displayName: 'Site ID',
      type: 'text', 
      required: true
    },
    {
      key: 'surveyTitle',
      displayName: 'Survey Title',
      type: 'text',
      required: true,
      defaultValue: 'How did you hear about us?'
    },
    {
      key: 'choices',
      displayName: 'Survey Choices',
      type: 'object',
      required: true,
      defaultValue: [
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
      ]
    },
    {
      key: 'displayRules',
      displayName: 'Display Rules',
      type: 'object',
      required: true,
      defaultValue: {
        showToAll: true,
        firstTimeOnly: false,
        samplingRate: 100
      }
    },
    {
      key: 'consentSettings',
      displayName: 'Consent Settings',
      type: 'object',
      required: false,
      defaultValue: {
        showConsent: false,
        appendToCRM: false
      }
    },
    {
      key: 'analyticsSettings',
      displayName: 'Analytics Settings',
      type: 'object',
      required: false,
      defaultValue: {
        enableServerEvents: false,
        pixelIds: {},
        customEventName: 'HDYHAU'
      }
    },
    {
      key: 'locale',
      displayName: 'Locale Settings',
      type: 'object',
      required: false
    },
    {
      key: 'isActive',
      displayName: 'Survey Active',
      type: 'boolean',
      required: true,
      defaultValue: true
    },
    {
      key: 'updatedAt',
      displayName: 'Updated At', 
      type: 'date',
      required: true
    }
  ],
  indexes: [
    { name: 'siteId', fields: [{ fieldKey: 'siteId', order: 'asc' }] },
    { name: 'updatedAt', fields: [{ fieldKey: 'updatedAt', order: 'desc' }] }
  ],
  permissions: {
    insert: 'Admin',
    update: 'Admin',
    remove: 'Admin', 
    read: 'Admin'
  }
};