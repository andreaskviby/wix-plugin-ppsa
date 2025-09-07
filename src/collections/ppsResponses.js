import wixData from 'wix-data';

/**
 * Collection schema for storing post-purchase survey responses
 */
export const ppsResponsesCollection = {
  _id: 'pps_responses',
  displayName: 'PPS Responses',
  fields: [
    {
      key: 'id',
      displayName: 'ID',
      type: 'text',
      required: true
    },
    {
      key: 'orderId', 
      displayName: 'Order ID',
      type: 'text',
      required: true
    },
    {
      key: 'orderNumber',
      displayName: 'Order Number', 
      type: 'text',
      required: false
    },
    {
      key: 'orderValue',
      displayName: 'Order Value',
      type: 'number',
      required: true
    },
    {
      key: 'currency',
      displayName: 'Currency',
      type: 'text',
      required: true
    },
    {
      key: 'channel',
      displayName: 'Attribution Channel',
      type: 'text',
      required: true
    },
    {
      key: 'otherText',
      displayName: 'Other Text (if channel = Other)',
      type: 'text',
      required: false
    },
    {
      key: 'lineItems',
      displayName: 'Line Items Summary',
      type: 'object',
      required: false
    },
    {
      key: 'createdAt',
      displayName: 'Created At',
      type: 'date',
      required: true
    },
    {
      key: 'clientHints',
      displayName: 'Client Hints (UA/Device/Locale)',
      type: 'object',
      required: false
    },
    {
      key: 'consentFlags',
      displayName: 'Consent Flags',
      type: 'object',
      required: false
    }
  ],
  indexes: [
    { name: 'createdAt', fields: [{ fieldKey: 'createdAt', order: 'desc' }] },
    { name: 'orderId', fields: [{ fieldKey: 'orderId', order: 'asc' }] },
    { name: 'channel', fields: [{ fieldKey: 'channel', order: 'asc' }] }
  ],
  permissions: {
    insert: 'Admin',
    update: 'Admin', 
    remove: 'Admin',
    read: 'Admin'
  }
};