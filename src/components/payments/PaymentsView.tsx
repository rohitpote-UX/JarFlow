import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AddCustomerModal } from '../customers/AddCustomerModal';
import {
  IndianRupee,
  Receipt,
  CheckCircle2,
  MessageCircle,
  Coins,
  Smartphone,
  Building,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { sound } from '../../utils/sound';

export const PaymentsView: React.FC = () => {
  const {
    customers,
    payments,
    addPayment,
    business,
    totalCollectedPeriod,
    totalUdhariAll,
    selectedCustomerId,
    setSelectedCustomerId,
  } = useApp();

  const isMr = business.language === 'mr';
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Form states
  const [customerId, setCustomerId] = useState<string>(
    selectedCustomerId || (customers.find((c) => c.pendingAmount > 0)?.id ?? customers[0]?.id ?? '')
  );
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK'>('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  // Sync selectedCustomerId
  useEffect(() => {
    if (selectedCustomerId) {
      setCustomerId(selectedCustomerId);
    } else if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [selectedCustomerId, customers, customerId]);

  // Set default amount to customer's pending amount if available
  const activeCustomer = customers.find((c) => c.id === customerId);
  const pendingBefore = activeCustomer?.pendingAmount || 0;
  const pendingAfter = Math.max(0, pendingBefore - amount);

  useEffect(() => {
    if (pendingBefore > 0) {
      setAmount(pendingBefore);
    } else {
      setAmount(0);
    }
  }, [customerId, pendingBefore]);

  // Receipt popup state
  const [receiptData, setReceiptData] = useState<{
    id: string;
    customerName: string;
    mobile: string;
    amount: number;
    mode: string;
    remaining: number;
  } | null>(null);

  // CASE 1: NO CUSTOMERS
  if (customers.length === 0) {
    return (
      <div className="pb-28 pt-8 px-4 max-w-md mx-auto text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-green-100 text-success-700 mx-auto flex items-center justify-center shadow-soft">
          <IndianRupee className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900">
            {isMr ? 'पहिले ग्राहक तयार करा' : 'Add Customers First'}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {isMr
              ? 'ग्राहकाकडून पेमेंट जमा करण्यासाठी सिस्टिममध्ये किमान एक ग्राहक असणे आवश्यक आहे.'
              : 'Add at least one customer before recording cash or UPI payment collections.'}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAddCustomerOpen(true);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-brand-800 hover:bg-brand-900 active-press text-white text-xs font-bold shadow-button flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isMr ? '+ ग्राहक जोडा' : '+ Add Customer'}</span>
        </button>

        <AddCustomerModal
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
        />
      </div>
    );
  }

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || amount <= 0) return;

    sound.playSuccess();
    sound.vibrate(30);

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#16A34A', '#22C55E', '#1E40AF'],
    });

    const payment = addPayment({
      customerId: activeCustomer.id,
      amount,
      paymentMode,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setReceiptData({
      id: payment.id,
      customerName: activeCustomer.name,
      mobile: activeCustomer.mobile,
      amount,
      mode: paymentMode,
      remaining: pendingAfter,
    });
  };

  const handleWhatsAppReceipt = () => {
    if (!receiptData) return;
    const msg = isMr
      ? `*${business.name} - जमा पावती*\n\n` +
        `नमस्कार ${receiptData.customerName} जी,\n` +
        `आपल्याकडून *₹${receiptData.amount}* (${receiptData.mode}) जमा झाले आहेत.\n` +
        `आता शिल्लक उधारी: *₹${receiptData.remaining}* आहे.\n\n` +
        `धन्यवाद! 🙏`
      : `*${business.name} - Payment Receipt*\n\n` +
        `Dear ${receiptData.customerName},\n` +
        `Received payment of *₹${receiptData.amount}* via *${receiptData.mode}*.\n` +
        `Remaining balance: *₹${receiptData.remaining}*.\n\n` +
        `Thank you! 🙏`;

    window.open(`https://wa.me/91${receiptData.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pb-28 pt-2 px-3.5 max-w-lg mx-auto space-y-3.5 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
          <IndianRupee className="w-5 h-5 text-success-600" />
          {isMr ? 'रक्कम जमा पावती' : 'Collect Payment'}
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          {isMr ? 'रोख किंवा यूपीआय द्वारे उधारी जमा करा' : 'Record cash or online payment to clear udhari'}
        </p>
      </div>

      {/* Summary highlight pill */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-between">
          <span className="text-gray-600 font-medium">{isMr ? 'आज जमा' : 'Collected'}:</span>
          <span className="font-extrabold text-success-700">{formatCurrency(totalCollectedPeriod)}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
          <span className="text-gray-600 font-medium">{isMr ? 'एकूण बाकी' : 'Total Due'}:</span>
          <span className="font-extrabold text-danger-600">{formatCurrency(totalUdhariAll)}</span>
        </div>
      </div>

      {/* Collect Payment Form */}
      <form onSubmit={handleSavePayment} className="bg-white p-4 rounded-3xl border border-surface-border shadow-card space-y-3">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-brand-700" />
            {isMr ? 'ग्राहक निवडा' : 'Select Customer'}
          </label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setSelectedCustomerId(e.target.value);
            }}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — (उधारी: ₹{c.pendingAmount})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Customer Udhari Live Card */}
        {activeCustomer && (
          <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-medium block">
                {isMr ? 'सध्याची चालू उधारी' : 'Current Due Udhari'}
              </span>
              <span className="text-lg font-black text-danger-600">
                {formatCurrency(pendingBefore)}
              </span>
            </div>

            {pendingBefore > 0 && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAmount(pendingBefore);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-danger-600 text-white text-[11px] font-bold active-press shadow-sm"
              >
                {isMr ? 'पूर्ण रक्कम भरा' : 'Full Clear'}
              </button>
            )}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">
            {isMr ? 'जमा रक्कम (₹) *' : 'Amount Received (₹) *'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-gray-500">₹</span>
            <input
              type="number"
              min="1"
              required
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full pl-8 pr-3 py-2.5 text-base font-extrabold text-success-700 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-success-500"
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            {[100, 200, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAmount(preset);
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition active-press ${
                  amount === preset
                    ? 'bg-success-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">
            {isMr ? 'पेमेंट प्रकार (Mode)' : 'Payment Mode'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPaymentMode('CASH');
              }}
              className={`py-2 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition active-press ${
                paymentMode === 'CASH'
                  ? 'bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{isMr ? 'रोख (Cash)' : 'Cash'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPaymentMode('UPI');
              }}
              className={`py-2 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition active-press ${
                paymentMode === 'UPI'
                  ? 'bg-brand-800 text-white border-brand-800 shadow-md ring-2 ring-blue-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isMr ? 'फोनपे / UPI' : 'UPI'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setPaymentMode('BANK');
              }}
              className={`py-2 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition active-press ${
                paymentMode === 'BANK'
                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>{isMr ? 'बँक' : 'Bank'}</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
          <span className="text-gray-600">{isMr ? 'जमानंतर शिल्लक उधारी:' : 'Remaining Balance:'}</span>
          <span className="font-extrabold text-sm text-gray-900">
            {formatCurrency(pendingAfter)}
          </span>
        </div>

        <button
          type="submit"
          disabled={amount <= 0}
          className={`w-full min-h-[50px] rounded-2xl active-press text-white text-sm font-extrabold shadow-button flex items-center justify-center gap-2 ${
            amount <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-success-600 hover:bg-success-700'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isMr ? 'पेमेंट नोंद करा व पावती द्या' : 'Save Payment & Create Receipt'}</span>
        </button>
      </form>

      {/* Recent Payments History */}
      <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card">
        <h3 className="text-sm font-bold text-gray-900 mb-2.5">
          {isMr ? 'अलीकडील जमा पावत्या' : 'Recent Payment Collections'}
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 space-y-1">
            <Receipt className="w-6 h-6 mx-auto text-gray-300" />
            <p className="font-medium text-gray-500">
              {isMr ? 'अद्याप कोणतेही पेमेंट नोंदवलेले नाही.' : 'No payments collected yet.'}
            </p>
            <p className="text-[11px] text-gray-400">
              {isMr ? 'ग्राहकाकडून रक्कम मिळाल्यावर येथे पावती दिसेल' : 'Payment receipts will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {payments.slice(0, 8).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{pay.customerName}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {formatDate(pay.date)} • <span className="font-semibold text-brand-800">{pay.paymentMode}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-success-600 block">
                    +{formatCurrency(pay.amount)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {isMr ? 'शिल्लक' : 'Bal'}: {formatCurrency(pay.remainingBalance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECEIPT POPUP */}
      {receiptData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-sheet space-y-4 animate-slide-up text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 text-success-600 flex items-center justify-center">
              <Receipt className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isMr ? 'पेमेंट यशस्वीरित्या जमा!' : 'Payment Received!'}
              </h3>
              <p className="text-xs text-gray-500">{receiptData.customerName}</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'जमा रक्कम' : 'Amount Paid'}:</span>
                <span className="text-base font-black text-success-600">{formatCurrency(receiptData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'प्रकार' : 'Mode'}:</span>
                <span className="font-bold text-gray-800">{receiptData.mode}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5">
                <span className="text-gray-600 font-semibold">{isMr ? 'शिल्लक उधारी' : 'Remaining Udhari'}:</span>
                <span className="font-bold text-danger-600">{formatCurrency(receiptData.remaining)}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppReceipt}
              className="w-full py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 active-press shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isMr ? 'ग्राहकाला पावती पाठवा (WhatsApp)' : 'Send Receipt on WhatsApp'}</span>
            </button>

            <button
              onClick={() => setReceiptData(null)}
              className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold active-press"
            >
              {isMr ? 'पूर्ण झाले' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
