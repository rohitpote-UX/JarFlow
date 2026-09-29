import { Customer, LedgerEntry, JarTransaction } from '../types';
import { formatDate } from './formatters';

export const exportCustomerLedgerCSV = (customer: Customer, ledgerEntries: LedgerEntry[]) => {
  const headers = ['Date', 'Type', 'Jars Given', 'Jars Returned', 'Net Change', 'Bill Amount (Rs)', 'Paid Amount (Rs)', 'Udhari (Rs)', 'Balance (Rs)'];
  
  const rows = ledgerEntries.map(entry => [
    formatDate(entry.date),
    entry.type,
    entry.given,
    entry.returned,
    entry.net,
    entry.billAmount,
    entry.paidAmount,
    entry.udhariAdded,
    entry.runningBalance
  ]);

  const csvContent = [
    [`Customer Name: ${customer.name}`, `Mobile: ${customer.mobile}`, `Area: ${customer.area}`],
    [`Current Jars: ${customer.currentJars}`, `Current Pending: Rs. ${customer.pendingAmount}`],
    [],
    headers,
    ...rows
  ].map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');

  downloadCSV(csvContent, `${customer.name}_Ledger.csv`);
};

export const exportTransactionsCSV = (transactions: JarTransaction[], filename = 'Transactions_Report.csv') => {
  const headers = ['Date', 'Customer Name', 'Jars Given', 'Jars Returned', 'Rate (Rs)', 'Bill Amount (Rs)', 'Cash (Rs)', 'UPI (Rs)', 'Total Paid (Rs)', 'Udhari (Rs)', 'Payment Mode'];

  const rows = transactions.map(t => [
    formatDate(t.date),
    t.customerName,
    t.jarsGiven,
    t.jarsReturned,
    t.ratePerJar,
    t.billAmount,
    t.cashPaid,
    t.upiPaid,
    t.totalPaid,
    t.udhariAmount,
    t.paymentMode
  ]);

  const csvContent = [headers, ...rows]
    .map(e => e.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadCSV(csvContent, filename);
};

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
