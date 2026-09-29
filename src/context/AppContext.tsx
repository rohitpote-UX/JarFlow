import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Business,
  Customer,
  Jar,
  JarTransaction,
  Payment,
  AppNotification,
  AppTab,
  TimeFilter,
  LedgerEntry,
  JarStatus,
  BusinessSettings,
} from '../types';
import { storage, createFreshBusiness } from '../utils/storage';
import {
  isToday,
  isYesterday,
  isInCurrentWeek,
  isInCurrentMonth,
} from '../utils/formatters';
import { sound } from '../utils/sound';

interface AppContextType {
  business: Business;
  settings: BusinessSettings; // compatibility bridge
  customers: Customer[];
  transactions: JarTransaction[];
  payments: Payment[];
  jars: Jar[];
  notifications: AppNotification[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  isOnline: boolean;
  mobileFrameView: boolean;
  setMobileFrameView: (val: boolean | ((prev: boolean) => boolean)) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (val: boolean) => void;
  jarModalOpen: boolean;
  setJarModalOpen: (val: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (val: boolean) => void;
  notificationsModalOpen: boolean;
  setNotificationsModalOpen: (val: boolean) => void;

  // Smart dynamic calculations (derived from real records only)
  totalJars: number;
  customerJars: number;
  damagedJars: number;
  availableJars: number;
  filteredTransactions: JarTransaction[];
  jarsGivenPeriod: number;
  jarsReturnedPeriod: number;
  cashPeriod: number;
  upiPeriod: number;
  udhariPeriod: number;
  totalCollectedPeriod: number;
  totalUdhariAll: number;

  // Actions
  updateBusiness: (patch: Partial<Business>) => void;
  completeOnboarding: (initialJars: number, defaultRate: number) => void;
  setInitialInventory: (totalJars: number) => void;
  resetToEmptyBusiness: () => void;

  addTransaction: (data: {
    customerId: string;
    jarsGiven: number;
    jarsReturned: number;
    ratePerJar: number;
    cashPaid: number;
    upiPaid: number;
    paymentMode: 'CASH' | 'UPI' | 'SPLIT' | 'UDHARI' | 'NONE';
    notes?: string;
  }) => { success: boolean; error?: string; transaction?: JarTransaction };

  addPayment: (data: {
    customerId: string;
    amount: number;
    paymentMode: 'CASH' | 'UPI' | 'BANK';
    referenceNo?: string;
    notes?: string;
  }) => Payment;

  addCustomer: (data: Omit<Customer, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerLedger: (customerId: string) => LedgerEntry[];
  updateJarStatus: (jarId: string, status: JarStatus, customerId?: string) => void;
  addJarBatch: (count: number, prefix?: string) => void;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  toggleLanguage: () => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeBusinessId] = useState<string>(() => storage.getActiveBusinessId());

  // Business state
  const [business, setBusiness] = useState<Business>(() => storage.getBusiness(activeBusinessId));

  // Entities scoped to active business (strictly empty for new business!)
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers(activeBusinessId));
  const [transactions, setTransactions] = useState<JarTransaction[]>(() => storage.getTransactions(activeBusinessId));
  const [payments, setPayments] = useState<Payment[]>(() => storage.getPayments(activeBusinessId));
  const [jars, setJars] = useState<Jar[]>(() => storage.getJars(activeBusinessId));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storage.getNotifications(activeBusinessId));

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [mobileFrameView, setMobileFrameView] = useState<boolean>(false);

  // Modals
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [jarModalOpen, setJarModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Persist to tenant-scoped localStorage
  useEffect(() => {
    storage.saveBusiness(business);
  }, [business]);

  useEffect(() => {
    storage.saveCustomers(activeBusinessId, customers);
  }, [customers, activeBusinessId]);

  useEffect(() => {
    storage.saveTransactions(activeBusinessId, transactions);
  }, [transactions, activeBusinessId]);

  useEffect(() => {
    storage.savePayments(activeBusinessId, payments);
  }, [payments, activeBusinessId]);

  useEffect(() => {
    storage.saveJars(activeBusinessId, jars);
  }, [jars, activeBusinessId]);

  useEffect(() => {
    storage.saveNotifications(activeBusinessId, notifications);
  }, [notifications, activeBusinessId]);

  // Online / offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filtered transactions based on active time filter
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (timeFilter === 'today') return isToday(tx.date);
      if (timeFilter === 'yesterday') return isYesterday(tx.date);
      if (timeFilter === 'week') return isInCurrentWeek(tx.date);
      if (timeFilter === 'month') return isInCurrentMonth(tx.date);
      return true;
    });
  }, [transactions, timeFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (timeFilter === 'today') return isToday(p.date);
      if (timeFilter === 'yesterday') return isYesterday(p.date);
      if (timeFilter === 'week') return isInCurrentWeek(p.date);
      if (timeFilter === 'month') return isInCurrentMonth(p.date);
      return true;
    });
  }, [payments, timeFilter]);

  // Dynamic calculations strictly from real records
  const totalJars = business.totalGodownJars || 0;

  const customerJars = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.currentJars || 0), 0);
  }, [customers]);

  const damagedJars = useMemo(() => {
    return jars.filter((j) => j.status === 'damaged').length;
  }, [jars]);

  const lostJars = useMemo(() => {
    return jars.filter((j) => j.status === 'lost').length;
  }, [jars]);

  const availableJars = Math.max(0, totalJars - customerJars - damagedJars - lostJars);

  const jarsGivenPeriod = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.jarsGiven, 0);
  }, [filteredTransactions]);

  const jarsReturnedPeriod = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.jarsReturned, 0);
  }, [filteredTransactions]);

  const cashPeriod = useMemo(() => {
    const txCash = filteredTransactions.reduce((sum, t) => sum + t.cashPaid, 0);
    const payCash = filteredPayments
      .filter((p) => p.paymentMode === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    return txCash + payCash;
  }, [filteredTransactions, filteredPayments]);

  const upiPeriod = useMemo(() => {
    const txUpi = filteredTransactions.reduce((sum, t) => sum + t.upiPaid, 0);
    const payUpi = filteredPayments
      .filter((p) => p.paymentMode === 'UPI' || p.paymentMode === 'BANK')
      .reduce((sum, p) => sum + p.amount, 0);
    return txUpi + payUpi;
  }, [filteredTransactions, filteredPayments]);

  const totalCollectedPeriod = cashPeriod + upiPeriod;

  const udhariPeriod = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.udhariAmount, 0);
  }, [filteredTransactions]);

  const totalUdhariAll = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);
  }, [customers]);

  // Compatibility settings object
  const settings: BusinessSettings = useMemo(
    () => ({
      businessName: business.name || 'माझा वॉटर व्यवसाय',
      ownerName: business.ownerName || '',
      phone: business.phone || '',
      upiId: business.upiId || '',
      address: business.address || '',
      defaultJarRate: business.defaultJarRate || 35,
      totalGodownJars: business.totalGodownJars || 0,
      lowStockThreshold: business.lowStockThreshold || 20,
      language: business.language || 'mr',
    }),
    [business]
  );

  // Business Actions
  const updateBusiness = (patch: Partial<Business>) => {
    setBusiness((prev) => ({ ...prev, ...patch }));
  };

  const completeOnboarding = (initialJars: number, defaultRate: number) => {
    setBusiness((prev) => ({
      ...prev,
      name: prev.name || 'माझा वॉटर व्यवसाय',
      totalGodownJars: Math.max(0, initialJars),
      defaultJarRate: defaultRate || 35,
      onboardingCompleted: true,
    }));
  };

  const setInitialInventory = (jarCount: number) => {
    setBusiness((prev) => ({
      ...prev,
      totalGodownJars: Math.max(0, jarCount),
    }));
    sound.playSuccess();
  };

  const resetToEmptyBusiness = () => {
    storage.clearBusinessData(activeBusinessId);
    const fresh = createFreshBusiness(activeBusinessId);
    setBusiness(fresh);
    setCustomers([]);
    setTransactions([]);
    setPayments([]);
    setJars([]);
    setNotifications(storage.getNotifications(activeBusinessId));
    sound.playClick();
  };

  // Transaction with Strict Inventory Validation (No Negative Inventory)
  const addTransaction = (data: {
    customerId: string;
    jarsGiven: number;
    jarsReturned: number;
    ratePerJar: number;
    cashPaid: number;
    upiPaid: number;
    paymentMode: 'CASH' | 'UPI' | 'SPLIT' | 'UDHARI' | 'NONE';
    notes?: string;
  }): { success: boolean; error?: string; transaction?: JarTransaction } => {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) {
      return { success: false, error: 'पहिले ग्राहक निवडा (Please select a customer).' };
    }

    // STRICT VALIDATION: No Negative Inventory
    if (data.jarsGiven > availableJars) {
      sound.playWarning();
      return {
        success: false,
        error: `गोदाममध्ये पुरेसे जार उपलब्ध नाहीत! सध्या फक्त ${availableJars} जार शिल्लक आहेत. (Available: ${availableJars})`,
      };
    }

    // STRICT VALIDATION: Customer cannot return more jars than they hold
    if (data.jarsReturned > customer.currentJars) {
      sound.playWarning();
      return {
        success: false,
        error: `ग्राहकाकडे फक्त ${customer.currentJars} जार आहेत, त्यापेक्षा जास्त परत घेता येणार नाहीत. (Customer only holds ${customer.currentJars} jars)`,
      };
    }

    const billAmount = data.jarsGiven * data.ratePerJar;
    const totalPaid = data.cashPaid + data.upiPaid;
    const udhariAmount = Math.max(0, billAmount - totalPaid);
    const netJarsChange = data.jarsGiven - data.jarsReturned;

    const newTx: JarTransaction = {
      id: `tx-${Date.now()}`,
      businessId: activeBusinessId,
      customerId: data.customerId,
      customerName: customer.name,
      customerMobile: customer.mobile,
      date: new Date().toISOString(),
      jarsGiven: data.jarsGiven,
      jarsReturned: data.jarsReturned,
      netJarsChange,
      ratePerJar: data.ratePerJar,
      billAmount,
      cashPaid: data.cashPaid,
      upiPaid: data.upiPaid,
      totalPaid,
      udhariAmount,
      paymentMode: data.paymentMode,
      notes: data.notes,
      synced: isOnline,
      createdAt: new Date().toISOString(),
    };

    // Update customer balances atomically
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === data.customerId) {
          const updatedJars = Math.max(0, c.currentJars + netJarsChange);
          const updatedPending = Math.max(0, c.pendingAmount + udhariAmount);
          return {
            ...c,
            currentJars: updatedJars,
            pendingAmount: updatedPending,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);

    sound.playSuccess();
    sound.vibrate(30);

    return { success: true, transaction: newTx };
  };

  const addPayment = (data: {
    customerId: string;
    amount: number;
    paymentMode: 'CASH' | 'UPI' | 'BANK';
    referenceNo?: string;
    notes?: string;
  }): Payment => {
    const customer = customers.find((c) => c.id === data.customerId);
    const previousPending = customer ? customer.pendingAmount : 0;
    const remainingBalance = Math.max(0, previousPending - data.amount);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      businessId: activeBusinessId,
      customerId: data.customerId,
      customerName: customer ? customer.name : 'Customer',
      date: new Date().toISOString(),
      amount: data.amount,
      paymentMode: data.paymentMode,
      referenceNo: data.referenceNo,
      previousPending,
      remainingBalance,
      notes: data.notes,
      synced: isOnline,
      createdAt: new Date().toISOString(),
    };

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === data.customerId) {
          return {
            ...c,
            pendingAmount: remainingBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    setPayments((prev) => [newPayment, ...prev]);

    sound.playSuccess();
    sound.vibrate(25);

    return newPayment;
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      businessId: activeBusinessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    sound.playClick();
    return newCust;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
    sound.playClick();
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    sound.playClick();
  };

  const getCustomerLedger = (customerId: string): LedgerEntry[] => {
    const custTxs = transactions.filter((t) => t.customerId === customerId);
    const custPays = payments.filter((p) => p.customerId === customerId);

    const rawEvents: Array<{
      date: string;
      type: 'TRANSACTION' | 'PAYMENT';
      item: JarTransaction | Payment;
    }> = [
      ...custTxs.map((t) => ({ date: t.date, type: 'TRANSACTION' as const, item: t })),
      ...custPays.map((p) => ({ date: p.date, type: 'PAYMENT' as const, item: p })),
    ];

    rawEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const ledger: LedgerEntry[] = [];

    rawEvents.forEach((ev) => {
      if (ev.type === 'TRANSACTION') {
        const tx = ev.item as JarTransaction;
        runningBalance += tx.udhariAmount;

        ledger.push({
          id: tx.id,
          businessId: activeBusinessId,
          customerId: tx.customerId,
          date: tx.date,
          type: 'TRANSACTION',
          description: `Given: ${tx.jarsGiven}, Returned: ${tx.jarsReturned}`,
          given: tx.jarsGiven,
          returned: tx.jarsReturned,
          net: tx.netJarsChange,
          rate: tx.ratePerJar,
          billAmount: tx.billAmount,
          paidAmount: tx.totalPaid,
          udhariAdded: tx.udhariAmount,
          runningBalance,
          paymentMode: tx.paymentMode,
        });
      } else {
        const pay = ev.item as Payment;
        runningBalance = Math.max(0, runningBalance - pay.amount);

        ledger.push({
          id: pay.id,
          businessId: activeBusinessId,
          customerId: pay.customerId,
          date: pay.date,
          type: 'PAYMENT',
          description: `Payment Received (${pay.paymentMode})`,
          given: 0,
          returned: 0,
          net: 0,
          billAmount: 0,
          paidAmount: pay.amount,
          udhariAdded: 0,
          runningBalance,
          paymentMode: pay.paymentMode,
        });
      }
    });

    return ledger.reverse();
  };

  const updateJarStatus = (jarId: string, status: JarStatus, customerId?: string) => {
    setJars((prev) =>
      prev.map((j) => {
        if (j.id === jarId) {
          const cust = customerId ? customers.find((c) => c.id === customerId) : undefined;
          return {
            ...j,
            status,
            currentCustomerId: customerId,
            currentCustomerName: cust?.name,
            dateGiven: status === 'with_customer' ? new Date().toISOString() : j.dateGiven,
            dateReturned: status === 'available' ? new Date().toISOString() : j.dateReturned,
          };
        }
        return j;
      })
    );
    sound.playClick();
  };

  const addJarBatch = (count: number, prefix: string = 'JAR') => {
    const newJars: Jar[] = [];
    const startIndex = jars.length + 1;
    for (let i = 0; i < count; i++) {
      const num = String(startIndex + i).padStart(4, '0');
      newJars.push({
        id: `jar-${Date.now()}-${i}`,
        businessId: activeBusinessId,
        serialNumber: `${prefix}-${num}`,
        qrCode: `${business.name ? business.name.replace(/\s+/g, '-').toUpperCase() : 'JAR'}-${prefix}-${num}`,
        status: 'available',
      });
    }
    setJars((prev) => [...newJars, ...prev]);
    setBusiness((prev) => ({
      ...prev,
      totalGodownJars: prev.totalGodownJars + count,
    }));
    sound.playSuccess();
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setBusiness((prev) => ({
      ...prev,
      name: newSettings.businessName !== undefined ? newSettings.businessName : prev.name,
      ownerName: newSettings.ownerName !== undefined ? newSettings.ownerName : prev.ownerName,
      phone: newSettings.phone !== undefined ? newSettings.phone : prev.phone,
      upiId: newSettings.upiId !== undefined ? newSettings.upiId : prev.upiId,
      address: newSettings.address !== undefined ? newSettings.address : prev.address,
      defaultJarRate: newSettings.defaultJarRate !== undefined ? newSettings.defaultJarRate : prev.defaultJarRate,
      totalGodownJars: newSettings.totalGodownJars !== undefined ? newSettings.totalGodownJars : prev.totalGodownJars,
      lowStockThreshold: newSettings.lowStockThreshold !== undefined ? newSettings.lowStockThreshold : prev.lowStockThreshold,
      language: newSettings.language !== undefined ? newSettings.language : prev.language,
    }));
    sound.playClick();
  };

  const toggleLanguage = () => {
    setBusiness((prev) => ({
      ...prev,
      language: prev.language === 'mr' ? 'en' : 'mr',
    }));
    sound.playClick();
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        business,
        settings,
        customers,
        transactions,
        payments,
        jars,
        notifications,
        activeTab,
        setActiveTab,
        selectedCustomerId,
        setSelectedCustomerId,
        timeFilter,
        setTimeFilter,
        isOnline,
        mobileFrameView,
        setMobileFrameView,
        globalSearchOpen,
        setGlobalSearchOpen,
        jarModalOpen,
        setJarModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,
        notificationsModalOpen,
        setNotificationsModalOpen,

        // Real calculations
        totalJars,
        customerJars,
        damagedJars,
        availableJars,
        filteredTransactions,
        jarsGivenPeriod,
        jarsReturnedPeriod,
        cashPeriod,
        upiPeriod,
        udhariPeriod,
        totalCollectedPeriod,
        totalUdhariAll,

        // Actions
        updateBusiness,
        completeOnboarding,
        setInitialInventory,
        resetToEmptyBusiness,
        addTransaction,
        addPayment,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerLedger,
        updateJarStatus,
        addJarBatch,
        updateSettings,
        toggleLanguage,
        markNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
