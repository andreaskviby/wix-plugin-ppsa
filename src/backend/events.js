import wixEcommerce from 'wix-ecommerce';
// Note: saveResponse is available for future auto-response features

/**
 * Initialize the Wix app
 */
export function initializeApp() {
  console.log('Post-Purchase Survey & Attribution app initialized');
  
  // Register event handlers
  wixEcommerce.onOrderCreated(wixEcommerce_onOrderCreated);
  wixEcommerce.onOrderUpdated(wixEcommerce_onOrderUpdated);
  
  // Setup periodic cleanup
  setInterval(cleanupOrderCache, 24 * 60 * 60 * 1000); // Daily cleanup
}

/**
 * Event handler for when an order is created in Wix Stores
 * This function enriches and caches order metadata for later reconciliation
 * @param {Object} event - Wix eCommerce order created event
 */
export function wixEcommerce_onOrderCreated(event) {
  try {
    console.log('Order created event received:', event);
    
    const order = event.data;
    
    // Cache order metadata for survey reconciliation
    cacheOrderMetadata(order);
    
  } catch (error) {
    console.error('Error handling order created event:', error);
  }
}

/**
 * Event handler for order status updates
 * @param {Object} event - Wix eCommerce order updated event
 */
export function wixEcommerce_onOrderUpdated(event) {
  try {
    console.log('Order updated event received:', event);
    
    const order = event.data;
    
    // Update cached order metadata if needed
    if (order.paymentStatus === 'PAID' || order.fulfillmentStatus === 'FULFILLED') {
      updateOrderMetadata(order);
    }
    
  } catch (error) {
    console.error('Error handling order updated event:', error);
  }
}

/**
 * Cache order metadata for survey reconciliation
 * @param {Object} order - Order object from Wix eCommerce
 */
async function cacheOrderMetadata(order) {
  try {
    const orderMetadata = {
      id: `order_${order._id}`,
      orderId: order._id,
      orderNumber: order.number,
      orderValue: order.totals?.total || 0,
      currency: order.currency || 'USD',
      lineItems: extractLineItems(order.lineItems || []),
      customerInfo: {
        email: order.buyerInfo?.email,
        firstName: order.buyerInfo?.firstName,
        lastName: order.buyerInfo?.lastName
      },
      orderStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      createdAt: order._createdDate,
      site: {
        siteId: order.siteId || null,
        instanceId: order.instanceId || null
      }
    };
    
    // Store in a temporary collection for reconciliation
    // This would use wix-data to store in an 'order_cache' collection
    console.log('Order metadata cached:', orderMetadata);
    
    // In a real implementation, you would:
    // await wixData.insert('order_cache', orderMetadata);
    
  } catch (error) {
    console.error('Error caching order metadata:', error);
  }
}

/**
 * Update cached order metadata
 * @param {Object} order - Updated order object
 */
async function updateOrderMetadata(order) {
  try {
    console.log('Updating order metadata for:', order._id);
    
    // In real implementation, update the cached order data
    // This ensures we have the latest order value and status for reconciliation
    
  } catch (error) {
    console.error('Error updating order metadata:', error);
  }
}

/**
 * Extract and format line items from order
 * @param {Array} lineItems - Raw line items from order
 * @returns {Array} Formatted line items
 */
function extractLineItems(lineItems) {
  return lineItems.map(item => ({
    sku: item.catalogReference?.catalogItemId || item.productName?.original || 'N/A',
    name: item.productName?.original || 'Unknown Product',
    quantity: item.quantity || 1,
    price: item.price?.amount || 0,
    currency: item.price?.currency || 'USD',
    productId: item.catalogReference?.productId || null,
    variantId: item.catalogReference?.options?.variantId || null,
    category: item.catalogReference?.options?.category || null
  }));
}

/**
 * Get cached order metadata for reconciliation
 * @param {string} orderId - Order ID to retrieve
 * @returns {Promise<Object|null>} Cached order metadata
 */
export async function getCachedOrderData(orderId) {
  try {
    // In real implementation, query the order_cache collection
    // For now, return placeholder data structure
    
    console.log('Retrieving cached order data for:', orderId);
    
    return {
      orderId: orderId,
      orderNumber: `ORD-${orderId.slice(-6)}`,
      orderValue: 79.00,
      currency: 'USD',
      lineItems: [
        {
          sku: 'PROD-001',
          name: 'Sample Product',
          quantity: 1,
          price: 79.00,
          currency: 'USD'
        }
      ],
      customerInfo: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe'
      },
      createdAt: new Date()
    };
    
  } catch (error) {
    console.error('Error retrieving cached order data:', error);
    return null;
  }
}

/**
 * Reconcile order data with live eCommerce APIs
 * @param {string} orderId - Order ID to reconcile
 * @returns {Promise<Object>} Reconciled order data
 */
export async function reconcileOrderData(orderId) {
  try {
    // First try to get cached data
    let orderData = await getCachedOrderData(orderId);
    
    if (!orderData) {
      // If no cached data, try to fetch from eCommerce APIs
      orderData = await fetchOrderFromAPI(orderId);
    }
    
    if (!orderData) {
      // If still no data, return default structure
      console.warn('No order data found for reconciliation:', orderId);
      return {
        orderNumber: null,
        orderValue: 0,
        currency: 'USD',
        lineItems: []
      };
    }
    
    // Validate and clean data
    return {
      orderNumber: orderData.orderNumber || `ORD-${orderId.slice(-6)}`,
      orderValue: parseFloat(orderData.orderValue) || 0,
      currency: orderData.currency || 'USD',
      lineItems: orderData.lineItems || [],
      customerInfo: orderData.customerInfo || {}
    };
    
  } catch (error) {
    console.error('Error reconciling order data:', error);
    return {
      orderNumber: null,
      orderValue: 0,
      currency: 'USD', 
      lineItems: []
    };
  }
}

/**
 * Fetch order data directly from Wix eCommerce APIs
 * @param {string} orderId - Order ID to fetch
 * @returns {Promise<Object|null>} Order data from API
 */
async function fetchOrderFromAPI(orderId) {
  try {
    console.log('Fetching order from API:', orderId);
    
    // In real implementation, use wix-ecommerce APIs:
    // const order = await wixEcommerce.orders.getOrder(orderId);
    
    // For now, return null to indicate API fetch would happen here
    return null;
    
  } catch (error) {
    console.error('Error fetching order from API:', error);
    return null;
  }
}

/**
 * Validate order data integrity
 * @param {Object} orderData - Order data to validate
 * @returns {boolean} True if order data is valid
 */
export function validateOrderData(orderData) {
  try {
    // Check required fields
    if (!orderData.orderId) {
      return false;
    }
    
    // Validate order value is a positive number
    const orderValue = parseFloat(orderData.orderValue);
    if (isNaN(orderValue) || orderValue < 0) {
      return false;
    }
    
    // Validate currency format (ISO 4217)
    const currencyRegex = /^[A-Z]{3}$/;
    if (!currencyRegex.test(orderData.currency)) {
      return false;
    }
    
    // Validate line items structure
    if (orderData.lineItems && !Array.isArray(orderData.lineItems)) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error validating order data:', error);
    return false;
  }
}

/**
 * Clean up old cached order data (housekeeping)
 * Should be called periodically to prevent data buildup
 */
export async function cleanupOrderCache() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('Cleaning up order cache older than:', thirtyDaysAgo);
    
    // In real implementation:
    // await wixData.query('order_cache')
    //   .lt('createdAt', thirtyDaysAgo)
    //   .find()
    //   .then(result => {
    //     const deletePromises = result.items.map(item => 
    //       wixData.remove('order_cache', item._id)
    //     );
    //     return Promise.all(deletePromises);
    //   });
    
  } catch (error) {
    console.error('Error cleaning up order cache:', error);
  }
}