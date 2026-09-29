import { Customer, Jar, JarTransaction, Payment, BusinessSettings, AppNotification } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'jarflow_customers_v1',
  TRANSACTIONS: 'jarflow_transactions_v1',
  PAYMENTS: 'jarflow_payments_v1',
  JARS: 'jarflow_jars_v1',
  SETTINGS: 'jarflow_settings_v1',
  NOTIFICATIONS: 'jarflow_notifications_v1',
  OFFLINE_QUEUE: 'jarflow_offline_queue_v1',
};

export const defaultSettings: BusinessSettings = {
  businessName: 'PureFlow Waters (जलधारा)',
  ownerName: 'Rohit Pote',
  phone: '9822019988',
  upiId: 'pureflow@upi',
  address: 'Shop No. 4, Water Hub, Main Road, Pune',
  defaultJarRate: 35,
  totalGodownJars: 500,
  lowStockThreshold: 40,
  language: 'mr', // default Marathi for authentic local owner experience!
};

// Initial realistic customers
export const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'सचिन पाटील (हॉटेल ग्रीन पार्क)',
    mobile: '9822012345',
    address: 'Near City Pride, Kothrud',
    area: 'Kothrud',
    active: true,
    currentJars: 14,
    pendingAmount: 1050,
    defaultRate: 35,
    notes: 'Morning 9 AM delivery required',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    name: 'राहुल शर्मा (टेक हब कॅफे)',
    mobile: '9823145678',
    address: 'Phase 1, Blue Ridge Area',
    area: 'Hinjewadi',
    active: true,
    currentJars: 20,
    pendingAmount: 700,
    defaultRate: 35,
    notes: 'Takes 10 jars every alternate day',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    name: 'पूजा कुलकर्णी (फ्लॅट ४०२)',
    mobile: '9890123456',
    address: 'Anand Park Society, DP Road',
    area: 'Aundh',
    active: true,
    currentJars: 2,
    pendingAmount: 0,
    defaultRate: 35,
    notes: 'Regular residential customer',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-4',
    name: 'अमित शिंदे (गोल्ड्स जिम)',
    mobile: '9765432109',
    address: 'Opp. Balewadi High Street',
    area: 'Baner',
    active: true,
    currentJars: 10,
    pendingAmount: 350,
    defaultRate: 35,
    notes: 'High consumption in summer',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-5',
    name: 'विनायक किराणा स्टोअर्स',
    mobile: '9881234567',
    address: 'Ganesh Peth Corner',
    area: 'Shivaji Nagar',
    active: true,
    currentJars: 16,
    pendingAmount: 1400,
    defaultRate: 35,
    notes: 'Weekly cash settlement',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-6',
    name: 'साई अमृततुल्य टी स्टॉल',
    mobile: '9730445566',
    address: 'Goodluck Chowk',
    area: 'Deccan',
    active: true,
    currentJars: 8,
    pendingAmount: 560,
    defaultRate: 35,
    notes: 'Needs 4 jars daily',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-7',
    name: 'हॉटेल स्वागत',
    mobile: '9822889900',
    address: 'Near Gandhi Bhavan',
    area: 'Kothrud',
    active: true,
    currentJars: 22,
    pendingAmount: 1750,
    defaultRate: 35,
    notes: 'Highest volume commercial client',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-8',
    name: 'डॉ. सावंत क्लिनिक',
    mobile: '9890556677',
    address: 'Near Alankar Chowk',
    area: 'Karve Nagar',
    active: true,
    currentJars: 4,
    pendingAmount: 140,
    defaultRate: 35,
    notes: 'Clean handles preferred',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate past 7 days of realistic transactions
const getInitialTransactions = (): JarTransaction[] => {
  const list: JarTransaction[] = [];
  const now = new Date();

  // Today's transactions
  list.push({
    id: 'tx-today-1',
    customerId: 'cust-1',
    customerName: 'सचिन पाटील (हॉटेल ग्रीन पार्क)',
    customerMobile: '9822012345',
    date: new Date(now.setHours(9, 30, 0, 0)).toISOString(),
    jarsGiven: 6,
    jarsReturned: 4,
    netJarsChange: 2,
    ratePerJar: 35,
    billAmount: 210,
    cashPaid: 210,
    upiPaid: 0,
    totalPaid: 210,
    udhariAmount: 0,
    paymentMode: 'CASH',
    notes: 'Morning batch delivery',
    synced: true,
    createdAt: new Date().toISOString(),
  });

  list.push({
    id: 'tx-today-2',
    customerId: 'cust-2',
    customerName: 'राहुल शर्मा (टेक हब कॅफे)',
    customerMobile: '9823145678',
    date: new Date(now.setHours(11, 15, 0, 0)).toISOString(),
    jarsGiven: 10,
    jarsReturned: 8,
    netJarsChange: 2,
    ratePerJar: 35,
    billAmount: 350,
    cashPaid: 0,
    upiPaid: 350,
    totalPaid: 350,
    udhariAmount: 0,
    paymentMode: 'UPI',
    notes: 'UPI paid on delivery QR',
    synced: true,
    createdAt: new Date().toISOString(),
  });

  list.push({
    id: 'tx-today-3',
    customerId: 'cust-4',
    customerName: 'अमित शिंदे (गोल्ड्स जिम)',
    customerMobile: '9765432109',
    date: new Date(now.setHours(14, 0, 0, 0)).toISOString(),
    jarsGiven: 5,
    jarsReturned: 3,
    netJarsChange: 2,
    ratePerJar: 35,
    billAmount: 175,
    cashPaid: 0,
    upiPaid: 0,
    totalPaid: 0,
    udhariAmount: 175,
    paymentMode: 'UDHARI',
    notes: 'Manager not available, added to udhari',
    synced: true,
    createdAt: new Date().toISOString(),
  });

  // Yesterday
  const yesterday = new Date(Date.now() - 86400000);
  list.push({
    id: 'tx-yest-1',
    customerId: 'cust-7',
    customerName: 'हॉटेल स्वागत',
    customerMobile: '9822889900',
    date: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(),
    jarsGiven: 12,
    jarsReturned: 10,
    netJarsChange: 2,
    ratePerJar: 35,
    billAmount: 420,
    cashPaid: 420,
    upiPaid: 0,
    totalPaid: 420,
    udhariAmount: 0,
    paymentMode: 'CASH',
    synced: true,
    createdAt: yesterday.toISOString(),
  });

  list.push({
    id: 'tx-yest-2',
    customerId: 'cust-5',
    customerName: 'विनायक किराणा स्टोअर्स',
    customerMobile: '9881234567',
    date: new Date(yesterday.setHours(16, 20, 0, 0)).toISOString(),
    jarsGiven: 8,
    jarsReturned: 6,
    netJarsChange: 2,
    ratePerJar: 35,
    billAmount: 280,
    cashPaid: 0,
    upiPaid: 0,
    totalPaid: 0,
    udhariAmount: 280,
    paymentMode: 'UDHARI',
    synced: true,
    createdAt: yesterday.toISOString(),
  });

  // Older entries this week
  for (let i = 2; i <= 6; i++) {
    const pastDate = new Date(Date.now() - i * 86400000);
    list.push({
      id: `tx-past-${i}`,
      customerId: i % 2 === 0 ? 'cust-6' : 'cust-1',
      customerName: i % 2 === 0 ? 'साई अमृततुल्य टी स्टॉल' : 'सचिन पाटील (हॉटेल ग्रीन पार्क)',
      customerMobile: i % 2 === 0 ? '9730445566' : '9822012345',
      date: pastDate.toISOString(),
      jarsGiven: 4 + (i * 2),
      jarsReturned: 3 + (i * 2),
      netJarsChange: 1,
      ratePerJar: 35,
      billAmount: (4 + (i * 2)) * 35,
      cashPaid: i % 3 === 0 ? 0 : (4 + (i * 2)) * 35,
      upiPaid: 0,
      totalPaid: i % 3 === 0 ? 0 : (4 + (i * 2)) * 35,
      udhariAmount: i % 3 === 0 ? (4 + (i * 2)) * 35 : 0,
      paymentMode: i % 3 === 0 ? 'UDHARI' : 'CASH',
      synced: true,
      createdAt: pastDate.toISOString(),
    });
  }

  return list;
};

// Initial payments
const getInitialPayments = (): Payment[] => {
  return [
    {
      id: 'pay-1',
      customerId: 'cust-1',
      customerName: 'सचिन पाटील (हॉटेल ग्रीन पार्क)',
      date: new Date().toISOString(),
      amount: 500,
      paymentMode: 'UPI',
      referenceNo: 'UPI-9842109283',
      previousPending: 1550,
      remainingBalance: 1050,
      notes: 'Cleared part of last week udhari',
      synced: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay-2',
      customerId: 'cust-5',
      customerName: 'विनायक किराणा स्टोअर्स',
      date: new Date(Date.now() - 86400000).toISOString(),
      amount: 1000,
      paymentMode: 'CASH',
      previousPending: 2400,
      remainingBalance: 1400,
      notes: 'Cash collected by staff',
      synced: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
};

// Initial notifications
const defaultNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Daily Summary Ready',
    titleMr: 'आजचा दैनिक हिशोब',
    message: 'Today: 21 jars delivered, 15 returned, ₹560 cash, ₹175 udhari',
    messageMr: 'आज: २१ जार दिले, १५ परत आले, ₹५६० रोख, ₹१७५ उधारी',
    type: 'DAILY',
    time: 'Just now',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'High Udhari Alert',
    titleMr: 'जास्त उधारी इशारा',
    message: 'हॉटेल स्वागत has pending balance of ₹1,750.',
    messageMr: 'हॉटेल स्वागत यांची उधारी ₹१,७५० बाकी आहे.',
    type: 'PAYMENT',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Godown Stock Normal',
    titleMr: 'गोदाम साठा स्थिती',
    message: '404 jars currently available in Godown.',
    messageMr: 'गोदाममध्ये सध्या ४०४ जार उपलब्ध आहेत.',
    type: 'STOCK',
    time: 'Today 9 AM',
    read: true,
  }
];

// Initial individual tracked jars (sample 30 with serial numbers & QR)
const getInitialJars = (): Jar[] => {
  const jars: Jar[] = [];
  const statusPool: { status: 'available' | 'with_customer' | 'damaged'; cust?: { id: string; name: string } }[] = [
    { status: 'with_customer', cust: { id: 'cust-1', name: 'सचिन पाटील' } },
    { status: 'with_customer', cust: { id: 'cust-2', name: 'राहुल शर्मा' } },
    { status: 'with_customer', cust: { id: 'cust-7', name: 'हॉटेल स्वागत' } },
    { status: 'available' },
    { status: 'available' },
    { status: 'damaged' },
    { status: 'available' },
    { status: 'with_customer', cust: { id: 'cust-5', name: 'विनायक किराणा' } },
    { status: 'available' },
  ];

  for (let i = 1; i <= 30; i++) {
    const idNum = String(i).padStart(4, '0');
    const pick = statusPool[i % statusPool.length];
    jars.push({
      id: `jar-${i}`,
      serialNumber: `JAR-${idNum}`,
      qrCode: `PUREFLOW-JAR-${idNum}`,
      status: pick.status,
      currentCustomerId: pick.cust?.id,
      currentCustomerName: pick.cust?.name,
      dateGiven: pick.status === 'with_customer' ? new Date(Date.now() - (i % 7) * 86400000).toISOString() : undefined,
      notes: pick.status === 'damaged' ? 'Crack on base, send to recycling' : undefined,
    });
  }
  return jars;
};

export const storage = {
  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : defaultCustomers;
    } catch {
      return defaultCustomers;
    }
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getTransactions: (): JarTransaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  },
  saveTransactions: (txs: JarTransaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  getPayments: (): Payment[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : getInitialPayments();
    } catch {
      return getInitialPayments();
    }
  },
  savePayments: (payments: Payment[]) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  getJars: (): Jar[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JARS);
      return data ? JSON.parse(data) : getInitialJars();
    } catch {
      return getInitialJars();
    }
  },
  saveJars: (jars: Jar[]) => {
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(jars));
  },

  getSettings: (): BusinessSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },
  saveSettings: (settings: BusinessSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getNotifications: (): AppNotification[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : defaultNotifications;
    } catch {
      return defaultNotifications;
    }
  },
  saveNotifications: (notifs: AppNotification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
};
