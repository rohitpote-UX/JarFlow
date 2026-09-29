export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (dateStr: string, locale: 'en' | 'mr' = 'en'): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isYesterday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

export const isInCurrentWeek = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
};

export const isInCurrentMonth = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export const createWhatsAppMessage = (
  customerName: string,
  businessName: string,
  data: {
    given?: number;
    returned?: number;
    currentJars?: number;
    pendingAmount?: number;
    todayPaid?: number;
  },
  lang: 'en' | 'mr' = 'en'
): string => {
  if (lang === 'mr') {
    let msg = `*${businessName} - हिशोब पावती*\n\n`;
    msg += `नमस्कार ${customerName} जी,\n`;
    if (data.given !== undefined && data.given > 0) {
      msg += `🔹 आज दिलेले जार: *${data.given}*\n`;
    }
    if (data.returned !== undefined && data.returned > 0) {
      msg += `🔹 आज जमा जार: *${data.returned}*\n`;
    }
    if (data.todayPaid !== undefined && data.todayPaid > 0) {
      msg += `💵 आज जमा रक्कम: *₹${data.todayPaid}*\n`;
    }
    if (data.currentJars !== undefined) {
      msg += `🪣 सध्या तुमच्याकडे असलेले जार: *${data.currentJars}*\n`;
    }
    if (data.pendingAmount !== undefined) {
      msg += `⚠️ शिल्लक उधारी: *₹${data.pendingAmount}*\n`;
    }
    msg += `\nसहकार्याबद्दल धन्यवाद! 🙏\n_${businessName}_`;
    return encodeURIComponent(msg);
  } else {
    let msg = `*${businessName} - Delivery & Account Summary*\n\n`;
    msg += `Dear ${customerName},\n`;
    if (data.given !== undefined && data.given > 0) {
      msg += `🔹 Jars Given Today: *${data.given}*\n`;
    }
    if (data.returned !== undefined && data.returned > 0) {
      msg += `🔹 Jars Returned: *${data.returned}*\n`;
    }
    if (data.todayPaid !== undefined && data.todayPaid > 0) {
      msg += `💵 Today's Payment Received: *₹${data.todayPaid}*\n`;
    }
    if (data.currentJars !== undefined) {
      msg += `🪣 Total Jars with you: *${data.currentJars}*\n`;
    }
    if (data.pendingAmount !== undefined) {
      msg += `⚠️ Remaining Balance (Udhari): *₹${data.pendingAmount}*\n`;
    }
    msg += `\nThank you for choosing us! 🙏\n_${businessName}_`;
    return encodeURIComponent(msg);
  }
};
