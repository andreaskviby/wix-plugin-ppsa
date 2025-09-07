// Type definitions for Post-Purchase Survey & Attribution Wix Plugin

export interface PPSResponse {
  id: string;
  orderId: string;
  orderNumber?: string;
  orderValue: number;
  currency: string;
  channel: string;
  otherText?: string;
  lineItems: LineItem[];
  createdAt: Date;
  clientHints: ClientHints;
  consentFlags: ConsentFlags;
}

export interface LineItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  productId?: string;
  variantId?: string;
  category?: string;
}

export interface ClientHints {
  userAgent?: string;
  language?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  timestamp: string;
}

export interface ConsentFlags {
  dataCollection: boolean;
  analytics: boolean;
  marketing?: boolean;
}

export interface PPSSettings {
  id: string;
  siteId: string;
  surveyTitle: string;
  choices: string[];
  displayRules: DisplayRules;
  consentSettings: ConsentSettings;
  analyticsSettings: AnalyticsSettings;
  locale?: LocaleSettings;
  isActive: boolean;
  updatedAt: Date;
}

export interface DisplayRules {
  showToAll: boolean;
  firstTimeOnly: boolean;
  samplingRate: number; // 1-100
}

export interface ConsentSettings {
  showConsent: boolean;
  appendToCRM: boolean;
  privacyPolicyUrl?: string;
}

export interface AnalyticsSettings {
  enableServerEvents: boolean;
  pixelIds: Record<string, string>;
  customEventName: string;
}

export interface LocaleSettings {
  [locale: string]: {
    surveyTitle: string;
    choices: string[];
  };
}

export interface Plan {
  planId: 'free' | 'pro' | 'growth';
  name: string;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  responses: number;
  surveys: number;
  serverEvents: boolean;
  advancedSettings: boolean;
}

export interface Analytics {
  topChannels: ChannelData[];
  revenueShare: ChannelData[];
  trend: TrendData[];
  totals: Totals;
}

export interface ChannelData {
  channel: string;
  count: number;
  percentage: string;
  revenue?: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface Totals {
  responses: number;
  revenue: string;
  averageOrderValue: string;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  recordCount?: number;
  mimeType?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Filters {
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
  dateRange?: '7days' | '30days' | '90days' | 'custom';
  skip?: number;
  limit?: number;
}

export interface UpgradeRecommendation {
  type: 'plan_upgrade' | 'feature_enable';
  target: string;
  reason: string;
  benefit: string;
}

export interface Usage {
  monthlyResponses: number;
  needsServerEvents: boolean;
  multipleProducts: boolean;
  surveyCount: number;
}

// Wix-specific types
export interface WixOrder {
  _id: string;
  number: string;
  totals?: {
    total: number;
  };
  currency: string;
  lineItems?: WixLineItem[];
  buyerInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  paymentStatus: string;
  fulfillmentStatus: string;
  _createdDate: Date;
  siteId?: string;
  instanceId?: string;
}

export interface WixLineItem {
  catalogReference?: {
    catalogItemId?: string;
    productId?: string;
    options?: {
      variantId?: string;
      category?: string;
    };
  };
  productName?: {
    original: string;
  };
  quantity?: number;
  price?: {
    amount: number;
    currency: string;
  };
}

export interface WixEvent<T = any> {
  data: T;
  eventType: string;
  instanceId: string;
  eventTime: Date;
}