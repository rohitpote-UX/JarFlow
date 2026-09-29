import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, LedgerEntry, BusinessSettings, JarTransaction } from '../types';
import { formatDate } from './formatters';

export const generateCustomerLedgerPDF = (
  customer: Customer,
  ledgerEntries: LedgerEntry[],
  settings: BusinessSettings
) => {
  const doc = new jsPDF();

  // Header background
  doc.setFillColor(30, 64, 175); // Deep Blue #1E40AF
  doc.rect(0, 0, 210, 36, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.businessName || 'PureFlow Water Services', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Mobile: ${settings.phone || '9876543210'} | UPI: ${settings.upiId || 'pureflow@upi'}`,
    14,
    24
  );
  doc.text('Water Distribution & Jar Management Statement', 14, 30);

  // Statement Meta Info
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTOMER STATEMENT / खाता खतावणी', 14, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Customer Name: ${customer.name}`, 14, 53);
  doc.text(`Mobile: ${customer.mobile}`, 14, 59);
  doc.text(`Area / Address: ${customer.area || ''} - ${customer.address || ''}`, 14, 65);

  // Highlight Cards for Customer Summary
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(125, 42, 70, 26, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text('Current Jars Held:', 130, 50);
  doc.text('Pending Udhari Balance:', 130, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 64, 175);
  doc.text(`${customer.currentJars} Jars`, 175, 50);
  doc.setTextColor(220, 38, 38);
  doc.text(`INR ${customer.pendingAmount}`, 175, 60);

  // Table Data
  const tableData = ledgerEntries.map((entry) => [
    formatDate(entry.date),
    entry.type === 'TRANSACTION' ? 'Delivery' : 'Payment',
    entry.given > 0 ? entry.given.toString() : '-',
    entry.returned > 0 ? entry.returned.toString() : '-',
    entry.billAmount > 0 ? `Rs. ${entry.billAmount}` : '-',
    entry.paidAmount > 0 ? `Rs. ${entry.paidAmount}` : '-',
    entry.udhariAdded > 0 ? `Rs. ${entry.udhariAdded}` : '-',
    `Rs. ${entry.runningBalance}`,
  ]);

  autoTable(doc, {
    startY: 74,
    head: [
      [
        'Date',
        'Type',
        'Given',
        'Returned',
        'Bill',
        'Paid',
        'Udhari',
        'Balance',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [17, 24, 39],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer notes
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 200;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Report generated on ${new Date().toLocaleString()} | Thank you for prompt payments!`,
    14,
    Math.min(finalY + 12, 280)
  );

  doc.save(`${customer.name.replace(/\s+/g, '_')}_Ledger_Statement.pdf`);
};

export const generateDailySummaryPDF = (
  date: string,
  transactions: JarTransaction[],
  settings: BusinessSettings
) => {
  const doc = new jsPDF();

  // Header background
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.businessName || 'PureFlow Water Services', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Operations & Sales Summary - Date: ${formatDate(date)}`, 14, 23);

  // Calculate totals
  const totalGiven = transactions.reduce((sum, t) => sum + t.jarsGiven, 0);
  const totalReturned = transactions.reduce((sum, t) => sum + t.jarsReturned, 0);
  const totalCash = transactions.reduce((sum, t) => sum + t.cashPaid, 0);
  const totalUPI = transactions.reduce((sum, t) => sum + t.upiPaid, 0);
  const totalUdhari = transactions.reduce((sum, t) => sum + t.udhariAmount, 0);

  // Summary box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 38, 182, 22, 3, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Jars Given: ${totalGiven}`, 20, 46);
  doc.text(`Jars Returned: ${totalReturned}`, 65, 46);
  doc.text(`Cash: Rs. ${totalCash}`, 110, 46);
  doc.text(`UPI: Rs. ${totalUPI}`, 150, 46);

  doc.setTextColor(220, 38, 38);
  doc.text(`Today's Udhari: Rs. ${totalUdhari}`, 20, 54);
  doc.setTextColor(22, 163, 74);
  doc.text(`Total Collections: Rs. ${totalCash + totalUPI}`, 110, 54);

  const tableData = transactions.map((t) => [
    t.customerName,
    t.jarsGiven.toString(),
    t.jarsReturned.toString(),
    `Rs. ${t.billAmount}`,
    `Rs. ${t.totalPaid}`,
    `Rs. ${t.udhariAmount}`,
    t.paymentMode,
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['Customer', 'Given', 'Returned', 'Bill', 'Paid', 'Udhari', 'Mode']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Daily_Report_${date}.pdf`);
};
