import {
  Business,
  Customer,
  Jar,
  JarTransaction,
  Payment,
  AppNotification,
} from '../types';

// Multi-tenant key prefix helper
const getStorageKey = (businessId: string, entity: string) => `jarflow_v2_${businessId}_${entity}`;
const ACTIVE_BUSINESS_KEY = 'jarflow_active_business_id';

// Clean legacy demo keys if they exist in localStorage
const cleanLegacyDemoStorage = () => {
  try {
    const legacyKeys = [
      'jarflow_customers_v1',
      'jarflow_transactions_v1',
      'jarflow_payments_v1',
      'jarflow_jars_v1',
      'jarflow_settings_v1',
      'jarflow_notifications_v1',
      'jarflow_offline_queue_v1',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore in non-browser envs
  }
};

// Default fresh business profile for a newly registered owner
export const createFreshBusiness = (id = `biz-${Date.now()}`): Business => ({
  id,
  name: '',
  ownerName: '',
  phone: '',
  area: '',
  address: '',
  upiId: '',
  defaultJarRate: 35,
  totalGodownJars: 0, // STRICT REQUIREMENT: Starts at 0 for a new business!
  lowStockThreshold: 20,
  language: 'mr',
  onboardingCompleted: false, // Triggers clean onboarding
  createdAt: new Date().toISOString(),
});

export const storage = {
  // Ensure legacy demo data is purged
  init() {
    cleanLegacyDemoStorage();
  },

  getActiveBusinessId(): string {
    try {
      let bizId = localStorage.getItem(ACTIVE_BUSINESS_KEY);
      if (!bizId) {
        bizId = `biz-${Date.now()}`;
        localStorage.setItem(ACTIVE_BUSINESS_KEY, bizId);
      }
      return bizId;
    } catch {
      return 'biz-default';
    }
  },

  setActiveBusinessId(businessId: string) {
    localStorage.setItem(ACTIVE_BUSINESS_KEY, businessId);
  },

  getBusiness(businessId: string): Business {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'business'));
      if (data) {
        return JSON.parse(data);
      }
      const fresh = createFreshBusiness(businessId);
      this.saveBusiness(fresh);
      return fresh;
    } catch {
      return createFreshBusiness(businessId);
    }
  },

  saveBusiness(business: Business) {
    localStorage.setItem(getStorageKey(business.id, 'business'), JSON.stringify(business));
  },

  // Customers (STRICT REQUIREMENT: Defaults to empty [] for new business)
  getCustomers(businessId: string): Customer[] {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'customers'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveCustomers(businessId: string, customers: Customer[]) {
    localStorage.setItem(getStorageKey(businessId, 'customers'), JSON.stringify(customers));
  },

  // Transactions (STRICT REQUIREMENT: Defaults to empty [] for new business)
  getTransactions(businessId: string): JarTransaction[] {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'transactions'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTransactions(businessId: string, txs: JarTransaction[]) {
    localStorage.setItem(getStorageKey(businessId, 'transactions'), JSON.stringify(txs));
  },

  // Payments (STRICT REQUIREMENT: Defaults to empty [] for new business)
  getPayments(businessId: string): Payment[] {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'payments'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePayments(businessId: string, payments: Payment[]) {
    localStorage.setItem(getStorageKey(businessId, 'payments'), JSON.stringify(payments));
  },

  // Jars (STRICT REQUIREMENT: Defaults to empty [] for new business)
  getJars(businessId: string): Jar[] {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'jars'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveJars(businessId: string, jars: Jar[]) {
    localStorage.setItem(getStorageKey(businessId, 'jars'), JSON.stringify(jars));
  },

  // Notifications (STRICT REQUIREMENT: Defaults to clean welcome notice or empty [])
  getNotifications(businessId: string): AppNotification[] {
    try {
      const data = localStorage.getItem(getStorageKey(businessId, 'notifications'));
      if (data) return JSON.parse(data);

      return [
        {
          id: `notif-welcome-${Date.now()}`,
          businessId,
          title: 'Welcome to JarFlow',
          titleMr: 'जलधारा मध्ये आपले स्वागत आहे',
          message: 'Your fresh business environment is ready. Add your initial jars to begin.',
          messageMr: 'तुमची नवीन व्यवसाय प्रणाली तयार आहे. सुरुवात करण्यासाठी पहिले जार साठा जोडा.',
          type: 'WELCOME',
          time: 'Just now',
          read: false,
        },
      ];
    } catch {
      return [];
    }
  },
  saveNotifications(businessId: string, notifs: AppNotification[]) {
    localStorage.setItem(getStorageKey(businessId, 'notifications'), JSON.stringify(notifs));
  },

  // Reset/Clear business data completely for a clean state
  clearBusinessData(businessId: string) {
    const keys = ['customers', 'transactions', 'payments', 'jars', 'business', 'notifications'];
    keys.forEach((k) => localStorage.removeItem(getStorageKey(businessId, k)));
  },
};

// Initialize cleanup on module load
storage.init();
