// RevenueCat Web SDK integration for WorkFlow AI
import { Purchases } from '@revenuecat/purchases-js';

// RevenueCat configuration
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_WEB_API_KEY || '';

// Entitlement identifiers - these should match your RevenueCat dashboard
export const ENTITLEMENTS = {
  PRO: 'pro_access',
  ENTERPRISE: 'enterprise_access',
} as const;

// Product identifiers
export const PRODUCTS = {
  PRO_MONTHLY: 'workflow_ai_pro_monthly',
  PRO_YEARLY: 'workflow_ai_pro_yearly',
  ENTERPRISE_MONTHLY: 'workflow_ai_enterprise_monthly',
  ENTERPRISE_YEARLY: 'workflow_ai_enterprise_yearly',
} as const;

// Subscription tiers
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  limits: {
    workflows: number;
    voiceMinutes: number;
    teamMembers: number;
  };
  entitlement?: string;
}

// Customer info interface (compatible with web)
export interface CustomerInfo {
  userId: string;
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      productIdentifier: string;
      expirationDate?: string;
    }>;
  };
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'cancelled' | 'free';
  currentProductId?: string;
}

// Package interface for purchases
export interface PurchasePackage {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
  };
  defaultPurchaseOption?: {
    id: string;
    price: { formatted: string };
  };
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out WorkFlow AI',
    price: '$0',
    features: [
      '5 workflow generations per month',
      '10 voice minutes per month',
      'n8n platform support',
      'Basic AI models',
      'Community support',
      'JSON export only'
    ],
    limits: {
      workflows: 5,
      voiceMinutes: 10,
      teamMembers: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For individuals and small teams',
    price: '$19',
    features: [
      '300 workflow generations per month',
      '500 voice minutes per month',
      'All 3 platforms (n8n, Zapier, Make.com)',
      'Advanced AI models (Claude Sonnet)',
      'Premium voice features',
      'Email support',
      'Advanced analytics',
      '3 team members',
      'Visual diagrams export'
    ],
    limits: {
      workflows: 300,
      voiceMinutes: 500,
      teamMembers: 3,
    },
    entitlement: ENTITLEMENTS.PRO,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations and power users',
    price: '$49',
    features: [
      'Unlimited workflow generations',
      'Unlimited voice minutes',
      'All platforms + custom integrations',
      'Premium AI models (Claude Opus)',
      'Custom voice options',
      'Priority support + phone',
      'White-label branding',
      'Unlimited team members',
      'Full API access',
      'Enterprise dashboard'
    ],
    limits: {
      workflows: -1, // -1 means unlimited
      voiceMinutes: -1,
      teamMembers: -1,
    },
    entitlement: ENTITLEMENTS.ENTERPRISE,
  },
];

class WebSubscriptionService {
  private static instance: WebSubscriptionService;
  private isConfigured = false;
  private currentUser: string | null = null;
  private purchases: any = null; // Will be RevenueCat Purchases instance

  public static getInstance(): WebSubscriptionService {
    if (!WebSubscriptionService.instance) {
      WebSubscriptionService.instance = new WebSubscriptionService();
    }
    return WebSubscriptionService.instance;
  }

  async configure(userId?: string): Promise<void> {
    try {
      // Initialize RevenueCat Web SDK
      if (typeof window !== 'undefined' && REVENUECAT_API_KEY) {
        const configOptions: any = {
          apiKey: REVENUECAT_API_KEY,
        };
        if (userId) {
          configOptions.appUserId = userId;
        }
        const purchases = Purchases.configure(configOptions);
        this.purchases = purchases;
        console.log('RevenueCat configured successfully');
      } else {
        throw new Error('RevenueCat API key not found. Please set VITE_REVENUECAT_WEB_API_KEY in your environment.');
      }

      this.currentUser = userId || null;
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<any[]> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      // Fetch real offerings from RevenueCat
      const offerings = await this.purchases.getOfferings();
      console.log('RevenueCat offerings response:', offerings);
      
      if (offerings && offerings.current && offerings.current.availablePackages) {
        console.log('Found RevenueCat offerings with packages:', offerings.current.availablePackages.length);
        return [offerings.current];
      } else {
        console.log('No packages found in RevenueCat offerings');
        return [];
      }
    } catch (error) {
      console.error('Failed to get RevenueCat offerings:', error);
      return [];
    }
  }

  async purchasePackage(packageToPurchase: PurchasePackage): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      console.log('Initiating RevenueCat purchase for:', packageToPurchase);
      
      try {
        // Use the real RevenueCat Web SDK purchase flow
        console.log('Using RevenueCat Web SDK purchase flow for package:', packageToPurchase.identifier);
        
        // The RevenueCat Web SDK expects the package in an object with rcPackage property
        const purchaseResult = await this.purchases.purchase({
          rcPackage: packageToPurchase,
        });
        
        console.log('Successfully purchased via RevenueCat/Stripe:', packageToPurchase.identifier);
        
        return { 
          success: true, 
          customerInfo: purchaseResult.customerInfo 
        };
      } catch (purchaseError: any) {
        console.error('RevenueCat purchase error:', purchaseError);
        
        // Handle user cancellation gracefully
        if (purchaseError.errorCode === 'UserCancelledError') {
          return {
            success: false,
            error: 'Purchase was cancelled by user'
          };
        }
        
        return {
          success: false,
          error: purchaseError.message || 'Purchase failed'
        };
      }
    } catch (error: any) {
      console.error('RevenueCat purchase failed:', error);
      return { 
        success: false, 
        error: error.message || 'Purchase failed' 
      };
    }
  }

  private createMockCustomerInfo(productId: string): CustomerInfo {
    const entitlements: any = {};
    let subscriptionStatus: CustomerInfo['subscriptionStatus'] = 'free';
    
    if (productId.includes('pro')) {
      entitlements[ENTITLEMENTS.PRO] = {
        identifier: ENTITLEMENTS.PRO,
        isActive: true,
        productIdentifier: productId,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      subscriptionStatus = 'active';
    } else if (productId.includes('enterprise')) {
      entitlements[ENTITLEMENTS.ENTERPRISE] = {
        identifier: ENTITLEMENTS.ENTERPRISE,
        isActive: true,
        productIdentifier: productId,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      subscriptionStatus = 'active';
    }

    return {
      userId: this.currentUser || 'anonymous',
      entitlements: {
        active: entitlements,
      },
      subscriptionStatus,
      currentProductId: productId,
    };
  }

  // @ts-expect-error - keeping for future functionality
  private _storeSubscriptionLocally(productId: string): void {
    try {
      const subscriptionData = {
        productId,
        purchaseDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        userId: this.currentUser,
      };
      localStorage.setItem('workflow_ai_subscription', JSON.stringify(subscriptionData));
    } catch (error) {
      console.error('Failed to store subscription locally:', error);
    }
  }

  private getStoredSubscription(): any {
    try {
      const stored = localStorage.getItem('workflow_ai_subscription');
      if (stored) {
        const subscription = JSON.parse(stored);
        const expirationDate = new Date(subscription.expirationDate);
        const now = new Date();
        
        if (expirationDate > now) {
          return subscription;
        } else {
          localStorage.removeItem('workflow_ai_subscription');
        }
      }
    } catch (error) {
      console.error('Failed to get stored subscription:', error);
    }
    return null;
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      try {
        // Get real customer info from RevenueCat
        const customerInfo = await this.purchases.getCustomerInfo();
        return customerInfo;
      } catch (customerInfoError) {
        console.error('Failed to fetch RevenueCat customer info, using local fallback:', customerInfoError);
        
        // Fall back to local storage for development
        const storedSubscription = this.getStoredSubscription();
        if (storedSubscription) {
          return this.createMockCustomerInfo(storedSubscription.productId);
        }

        return {
          userId: this.currentUser || 'anonymous',
          entitlements: { active: {} },
          subscriptionStatus: 'free',
        };
      }
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const customerInfo = await this.getCustomerInfo();
      
      return { 
        success: true, 
        customerInfo: customerInfo || undefined 
      };
    } catch (error: any) {
      console.error('Restore failed:', error);
      return { 
        success: false, 
        error: error.message || 'Restore failed' 
      };
    }
  }

  async logIn(userId: string): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    try {
      this.currentUser = userId;
      const customerInfo = await this.getCustomerInfo();
      return { 
        success: true, 
        customerInfo: customerInfo || undefined 
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }

  async logOut(): Promise<{ success: boolean; error?: string }> {
    try {
      this.currentUser = null;
      return { success: true };
    } catch (error: any) {
      console.error('Logout failed:', error);
      return { 
        success: false, 
        error: error.message || 'Logout failed' 
      };
    }
  }

  getSubscriptionTier(customerInfo: CustomerInfo | null): SubscriptionTier {
    if (!customerInfo) {
      return SUBSCRIPTION_TIERS[0];
    }

    if (customerInfo.entitlements.active[ENTITLEMENTS.ENTERPRISE]?.isActive) {
      return SUBSCRIPTION_TIERS[2];
    }

    if (customerInfo.entitlements.active[ENTITLEMENTS.PRO]?.isActive) {
      return SUBSCRIPTION_TIERS[1];
    }

    return SUBSCRIPTION_TIERS[0];
  }

  canPerformAction(customerInfo: CustomerInfo | null, action: 'workflow' | 'voice', currentUsage: number): boolean {
    const tier = this.getSubscriptionTier(customerInfo);
    
    switch (action) {
      case 'workflow':
        return tier.limits.workflows === -1 || currentUsage < tier.limits.workflows;
      case 'voice':
        return tier.limits.voiceMinutes === -1 || currentUsage < tier.limits.voiceMinutes;
      default:
        return false;
    }
  }
}

export default WebSubscriptionService; 