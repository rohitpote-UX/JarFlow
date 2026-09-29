import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AddCustomerModal } from '../customers/AddCustomerModal';
import {
  CheckCircle2,
  Plus,
  Minus,
  MessageCircle,
  Sparkles,
  UserCheck,
  Search,
  AlertTriangle,
  UserPlus,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, createWhatsAppMessage } from '../../utils/formatters';
import { sound } from '../../utils/sound';

export const DailyEntryView: React.FC = () => {
  const {
    customers,
    business,
    availableJars,
    selectedCustomerId,
    setSelectedCustomerId,
    addTransaction,
    setActiveTab,
    setJarModalOpen,
  } = useApp();

  const isMr = business.language === 'mr';

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  // Selected customer state
  const [customerId, setCustomerId] = useState<string>(
    selectedCustomerId || (customers[0]?.id ?? '')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  // Transaction form state (defaults to 1 if available, otherwise 0)
  const [jarsGiven, setJarsGiven] = useState<number>(() => (availableJars > 0 ? 1 : 0));
  const [jarsReturned, setJarsReturned] = useState<number>(0);
  const [ratePerJar, setRatePerJar] = useState<number>(business.defaultJarRate || 35);
  const [paymentChoice, setPaymentChoice] = useState<'CASH' | 'UPI' | 'UDHARI' | 'SPLIT'>('CASH');
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [upiPaid, setUpiPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Inline validation error message
  const [validationError, setValidationError] = useState<string | null>(null);

  // Post-save modal / snackbar
  const [savedTx, setSavedTx] = useState<{
    id: string;
    customerName: string;
    mobile: string;
    given: number;
    returned: number;
    totalPaid: number;
    newJars: number;
    newPending: number;
  } | null>(null);

  // Find active customer object
  const currentCustomer = customers.find((c) => c.id === customerId);

  // Sync selectedCustomerId from outside
  useEffect(() => {
    if (selectedCustomerId) {
      setCustomerId(selectedCustomerId);
    } else if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0].id);
    }
  }, [selectedCustomerId, customers, customerId]);

  // Update default rate if customer has custom rate
  useEffect(() => {
    if (currentCustomer?.defaultRate) {
      setRatePerJar(currentCustomer.defaultRate);
    } else {
      setRatePerJar(business.defaultJarRate || 35);
    }
  }, [customerId, currentCustomer, business.defaultJarRate]);

  // Auto calculate bill and adjust payment amounts
  const billAmount = jarsGiven * ratePerJar;
  const netJars = jarsGiven - jarsReturned;
  const projectedJars = Math.max(0, (currentCustomer?.currentJars || 0) + netJars);

  useEffect(() => {
    if (paymentChoice === 'CASH') {
      setCashPaid(billAmount);
      setUpiPaid(0);
    } else if (paymentChoice === 'UPI') {
      setCashPaid(0);
      setUpiPaid(billAmount);
    } else if (paymentChoice === 'UDHARI') {
      setCashPaid(0);
      setUpiPaid(0);
    }
  }, [billAmount, paymentChoice]);

  const totalPaid = cashPaid + upiPaid;
  const udhariAmount = Math.max(0, billAmount - totalPaid);
  const projectedPending = (currentCustomer?.pendingAmount || 0) + udhariAmount;

  // Filtered customer list for quick picker
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CASE 1: NO CUSTOMERS IN SYSTEM
  if (customers.length === 0) {
    return (
      <div className="pb-28 pt-8 px-4 max-w-md mx-auto text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-blue-100 text-brand-800 mx-auto flex items-center justify-center shadow-soft">
          <UserPlus className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-gray-900">
            {isMr ? 'पहिले ग्राहक जोडा' : 'Add Customers First'}
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {isMr
              ? 'दैनिक जार वाटपाची नोंद करण्यासाठी तुमच्याकडे किमान एक ग्राहक असणे आवश्यक आहे.'
              : 'You need at least one customer in your account before recording deliveries.'}
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
          <span>{isMr ? 'ग्राहक जोडण्यास जा' : 'Add First Customer'}</span>
        </button>

        <AddCustomerModal
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
        />
      </div>
    );
  }

  const handleSave = () => {
    setValidationError(null);

    if (!currentCustomer) {
      setValidationError(isMr ? 'कृपया ग्राहक निवडा' : 'Please select a customer');
      return;
    }

    // STRICT VALIDATION 1: Jars Given cannot exceed Available Jars
    if (jarsGiven > availableJars) {
      sound.playWarning();
      setValidationError(
        isMr
          ? `गोदाममध्ये पुरेसे जार उपलब्ध नाहीत! उपलब्ध जार फक्त ${availableJars} आहेत.`
          : `Not enough jars in stock! Available jars: only ${availableJars}.`
      );
      return;
    }

    // STRICT VALIDATION 2: Jars Returned cannot exceed customer jars
    if (jarsReturned > currentCustomer.currentJars) {
      sound.playWarning();
      setValidationError(
        isMr
          ? `ग्राहकाकडे फक्त ${currentCustomer.currentJars} जार आहेत, त्यापेक्षा जास्त परत घेता येणार नाहीत.`
          : `Customer currently has only ${currentCustomer.currentJars} jars.`
      );
      return;
    }

    if (jarsGiven === 0 && jarsReturned === 0) {
      sound.playWarning();
      setValidationError(
        isMr
          ? 'किमान १ जार देणे किंवा घेणे आवश्यक आहे.'
          : 'Please enter at least 1 jar given or returned.'
      );
      return;
    }

    const res = addTransaction({
      customerId: currentCustomer.id,
      jarsGiven,
      jarsReturned,
      ratePerJar,
      cashPaid,
      upiPaid,
      paymentMode: paymentChoice,
      notes,
    });

    if (!res.success) {
      setValidationError(res.error || 'त्रुटी आढळली');
      return;
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#1E40AF', '#16A34A', '#F59E0B'],
    });

    setSavedTx({
      id: res.transaction!.id,
      customerName: currentCustomer.name,
      mobile: currentCustomer.mobile,
      given: jarsGiven,
      returned: jarsReturned,
      totalPaid,
      newJars: projectedJars,
      newPending: projectedPending,
    });
  };

  const handleResetForNext = () => {
    setSavedTx(null);
    setJarsGiven(availableJars > 0 ? 1 : 0);
    setJarsReturned(0);
    setNotes('');
    setValidationError(null);
  };

  return (
    <div className="pb-28 pt-2 px-3.5 max-w-lg mx-auto space-y-3.5 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-brand-600" />
            {isMr ? 'दैनिक नोंद' : 'Daily Speed Entry'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {isMr ? 'जार दिले/घेतले + हिशोब नोंद' : 'Record jar given, returned, and payment'}
          </p>
        </div>

        {/* Live available jars indicator */}
        <button
          onClick={() => {
            sound.playClick();
            setJarModalOpen(true);
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border active-press ${
            availableJars > 0
              ? 'bg-green-50 text-success-700 border-green-200'
              : 'bg-red-50 text-danger-700 border-red-200 animate-pulse'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>{availableJars} {isMr ? 'शिल्लक' : 'stock'}</span>
        </button>
      </div>

      {/* Validation Warning Notice if any */}
      {validationError && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-300 text-xs font-bold text-danger-700 flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Warning if Available Jars is 0 */}
      {availableJars === 0 && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{isMr ? 'सध्या उपलब्ध जार नाहीत (0 Jars in Godown).' : 'No jars available in godown.'}</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setJarModalOpen(true);
            }}
            className="px-2 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] active-press shrink-0"
          >
            {isMr ? '+ जार जोडा' : '+ Add Jars'}
          </button>
        </div>
      )}

      {/* STEP 1: Select Customer */}
      <div className="bg-white p-3.5 rounded-3xl border border-surface-border shadow-card space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-brand-700" />
            {isMr ? '१. ग्राहक निवडा (Select Customer)' : '1. Customer'}
          </label>
          <button
            onClick={() => setShowCustomerPicker((prev) => !prev)}
            className="text-xs font-bold text-brand-800 hover:underline"
          >
            {showCustomerPicker
              ? isMr
                ? 'बंद करा'
                : 'Close'
              : isMr
              ? 'बदला / शोधा'
              : 'Change'}
          </button>
        </div>

        {currentCustomer && !showCustomerPicker && (
          <div
            onClick={() => setShowCustomerPicker(true)}
            className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 cursor-pointer active-press flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-900">{currentCustomer.name}</h3>
              <p className="text-xs text-gray-600">{currentCustomer.area} • {currentCustomer.mobile}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-800 text-white block mb-0.5">
                🪣 {currentCustomer.currentJars} {isMr ? 'जार' : 'Jars'}
              </span>
              <span className="text-[11px] font-semibold text-danger-600 block">
                ₹{currentCustomer.pendingAmount} {isMr ? 'उधारी' : 'Pending'}
              </span>
            </div>
          </div>
        )}

        {showCustomerPicker && (
          <div className="space-y-2 animate-fade-in pt-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isMr ? 'ग्राहकाचे नाव किंवा मोबाईल नंबर टाका...' : 'Search customer or mobile...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
                autoFocus
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => {
                    sound.playClick();
                    setCustomerId(cust.id);
                    setSelectedCustomerId(cust.id);
                    setShowCustomerPicker(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    cust.id === customerId
                      ? 'bg-blue-100/70 border-brand-700 font-bold text-brand-900'
                      : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-800'
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{cust.name}</span>
                    <span className="text-[11px] text-gray-500">{cust.area}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-800">🪣 {cust.currentJars}</span>
                    {cust.pendingAmount > 0 && (
                      <span className="block text-[10px] text-danger-600 font-bold">
                        ₹{cust.pendingAmount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Quantity Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Given Stepper */}
        <div className="bg-white p-3.5 rounded-3xl border border-surface-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">
                {isMr ? '२. दिलेले जार' : '2. Given'}
              </span>
              <span className="text-[11px] font-bold text-brand-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Given
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              {isMr ? 'भरलेले जार' : 'Filled Jars'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-1 my-1">
            <button
              onClick={() => {
                sound.playClick();
                setJarsGiven((prev) => Math.max(0, prev - 1));
              }}
              className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 active-press flex items-center justify-center text-gray-800 text-lg font-bold"
            >
              <Minus className="w-5 h-5 stroke-[3]" />
            </button>

            <span className="text-3xl font-black text-brand-800 text-center flex-1">
              {jarsGiven}
            </span>

            <button
              onClick={() => {
                sound.playClick();
                if (jarsGiven >= availableJars) {
                  sound.playWarning();
                  setValidationError(
                    isMr
                      ? `गोदाममध्ये फक्त ${availableJars} जार शिल्लक आहेत!`
                      : `Only ${availableJars} jars available in stock!`
                  );
                  return;
                }
                setValidationError(null);
                setJarsGiven((prev) => prev + 1);
              }}
              className="w-12 h-12 rounded-2xl bg-blue-50 hover:bg-blue-100 active-press flex items-center justify-center text-brand-800 text-lg font-bold"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 mt-2">
            {[1, 2, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => {
                  sound.playClick();
                  if (num > availableJars) {
                    sound.playWarning();
                    setValidationError(
                      isMr
                        ? `गोदाममध्ये फक्त ${availableJars} जार शिल्लक आहेत!`
                        : `Only ${availableJars} jars available in stock!`
                    );
                    setJarsGiven(availableJars);
                    return;
                  }
                  setValidationError(null);
                  setJarsGiven(num);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition active-press ${
                  jarsGiven === num
                    ? 'bg-brand-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Returned Stepper */}
        <div className="bg-white p-3.5 rounded-3xl border border-surface-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-700">
                {isMr ? '३. जमा जार' : '3. Returned'}
              </span>
              <span className="text-[11px] font-bold text-success-700 bg-green-50 px-1.5 py-0.5 rounded">
                Empty
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              {isMr ? 'रिकामे परत आले' : 'Empty Jars Returned'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-1 my-1">
            <button
              onClick={() => {
                sound.playClick();
                setJarsReturned((prev) => Math.max(0, prev - 1));
              }}
              className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 active-press flex items-center justify-center text-gray-800 text-lg font-bold"
            >
              <Minus className="w-5 h-5 stroke-[3]" />
            </button>

            <span className="text-3xl font-black text-success-600 text-center flex-1">
              {jarsReturned}
            </span>

            <button
              onClick={() => {
                sound.playClick();
                const maxHold = currentCustomer?.currentJars || 0;
                if (jarsReturned >= maxHold) {
                  sound.playWarning();
                  setValidationError(
                    isMr
                      ? `ग्राहकाकडे फक्त ${maxHold} जार आहेत!`
                      : `Customer only holds ${maxHold} jars!`
                  );
                  return;
                }
                setValidationError(null);
                setJarsReturned((prev) => prev + 1);
              }}
              className="w-12 h-12 rounded-2xl bg-green-50 hover:bg-green-100 active-press flex items-center justify-center text-success-600 text-lg font-bold"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 mt-2">
            {[0, 1, 2, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  sound.playClick();
                  const maxHold = currentCustomer?.currentJars || 0;
                  if (num > maxHold) {
                    setJarsReturned(maxHold);
                    return;
                  }
                  setValidationError(null);
                  setJarsReturned(num);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition active-press ${
                  jarsReturned === num
                    ? 'bg-success-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 3: Auto Calculation Preview */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-soft flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-400 block">{isMr ? 'दर / जार' : 'Rate / Jar'}</span>
          <div className="flex items-center gap-1 font-bold">
            <span>₹</span>
            <input
              type="number"
              value={ratePerJar}
              onChange={(e) => setRatePerJar(Number(e.target.value) || 0)}
              className="w-12 bg-white/20 text-white px-1 py-0.5 rounded text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="text-center">
          <span className="text-gray-400 block">{isMr ? 'एकूण बिल' : 'Total Bill'}</span>
          <span className="text-lg font-black text-blue-300">{formatCurrency(billAmount)}</span>
        </div>

        <div className="text-right">
          <span className="text-gray-400 block">{isMr ? 'नवीन जार शिल्लक' : 'New Jars Balance'}</span>
          <span className="font-bold text-green-300">
            {projectedJars} {isMr ? 'जार' : 'Jars'}
          </span>
        </div>
      </div>

      {/* STEP 4: Payment Choice */}
      <div className="bg-white p-3.5 rounded-3xl border border-surface-border shadow-card space-y-2.5">
        <label className="text-xs font-bold text-gray-700 block">
          {isMr ? '४. पैसे कसे आले? (Payment Mode)' : '4. Payment Mode'}
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setPaymentChoice('CASH');
            }}
            className={`min-h-[48px] py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border transition active-press ${
              paymentChoice === 'CASH'
                ? 'bg-green-600 text-white border-green-600 shadow-md ring-2 ring-green-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <span>💵 {isMr ? 'रोख' : 'Cash'}</span>
            <span className="text-[11px] opacity-90">{formatCurrency(billAmount)}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setPaymentChoice('UPI');
            }}
            className={`min-h-[48px] py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border transition active-press ${
              paymentChoice === 'UPI'
                ? 'bg-brand-800 text-white border-brand-800 shadow-md ring-2 ring-blue-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <span>📱 {isMr ? 'फोनपे/UPI' : 'UPI'}</span>
            <span className="text-[11px] opacity-90">{formatCurrency(billAmount)}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setPaymentChoice('UDHARI');
            }}
            className={`min-h-[48px] py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center border transition active-press ${
              paymentChoice === 'UDHARI'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <span>⚠️ {isMr ? 'उधारी' : 'Udhari'}</span>
            <span className="text-[11px] opacity-90">{formatCurrency(billAmount)}</span>
          </button>
        </div>

        {udhariAmount > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
            <span>{isMr ? 'ग्राहक खात्यात नवीन उधारी जमा होईल:' : 'Added to customer credit:'}</span>
            <span className="font-bold text-amber-700">{formatCurrency(udhariAmount)}</span>
          </div>
        )}
      </div>

      {/* STEP 5: Big Tactile Save Button */}
      <button
        onClick={handleSave}
        disabled={availableJars === 0 && jarsGiven > 0}
        className={`w-full min-h-[54px] rounded-2xl active-press text-white text-base font-extrabold shadow-button flex items-center justify-center gap-2 ${
          availableJars === 0 && jarsGiven > 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-brand-800 hover:bg-brand-900'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
        <span>{isMr ? 'नोंद पूर्ण करा (सेव्ह करा)' : 'Save Daily Entry (⚡ 3s)'}</span>
      </button>

      {/* SUCCESS MODAL */}
      {savedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-sheet space-y-4 animate-slide-up">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 text-success-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">
                {isMr ? 'नोंद यशस्वीरीत्या सेव्ह झाली!' : 'Entry Saved Successfully!'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{savedTx.customerName}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'दिलेले / जमा' : 'Given / Returned'}:</span>
                <span className="font-bold text-gray-800">
                  {savedTx.given} {isMr ? 'दिले' : 'Given'} / {savedTx.returned} {isMr ? 'जमा' : 'Returned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'जमा झालेले पैसे' : 'Paid Today'}:</span>
                <span className="font-bold text-success-600">{formatCurrency(savedTx.totalPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5">
                <span className="text-gray-600 font-medium">
                  {isMr ? 'सध्याचे एकूण जार' : 'Total Jars With Client'}:
                </span>
                <span className="font-bold text-brand-800">{savedTx.newJars} Jars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">
                  {isMr ? 'शिल्लक उधारी' : 'Remaining Udhari'}:
                </span>
                <span className="font-bold text-danger-600">{formatCurrency(savedTx.newPending)}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/91${savedTx.mobile}?text=${createWhatsAppMessage(
                savedTx.customerName,
                business.name,
                {
                  given: savedTx.given,
                  returned: savedTx.returned,
                  todayPaid: savedTx.totalPaid,
                  currentJars: savedTx.newJars,
                  pendingAmount: savedTx.newPending,
                },
                isMr ? 'mr' : 'en'
              )}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.playClick()}
              className="w-full min-h-[48px] py-2.5 px-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 active-press shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isMr ? 'व्हॉट्सअ‍ॅपवर पावती पाठवा' : 'Send WhatsApp Receipt'}</span>
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  handleResetForNext();
                }}
                className="py-2.5 px-3 rounded-xl bg-brand-50 hover:bg-blue-100 text-brand-800 text-xs font-bold active-press"
              >
                + {isMr ? 'पुढील नोंद' : 'Next Entry'}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  handleResetForNext();
                  setActiveTab('dashboard');
                }}
                className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold active-press"
              >
                {isMr ? 'डॅशबोर्डवर जा' : 'Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
