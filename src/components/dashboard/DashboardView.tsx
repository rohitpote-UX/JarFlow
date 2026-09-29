import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from './MetricCard';
import { JarMovementChart } from './JarMovementChart';
import { RevenueCashChart } from './RevenueCashChart';
import { AddCustomerModal } from '../customers/AddCustomerModal';
import {
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Coins,
  AlertTriangle,
  Receipt,
  AlertOctagon,
  Phone,
  MessageCircle,
  Plus,
  UserPlus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, createWhatsAppMessage } from '../../utils/formatters';
import { TimeFilter } from '../../types';
import { sound } from '../../utils/sound';

export const DashboardView: React.FC = () => {
  const {
    totalJars,
    availableJars,
    customerJars,
    damagedJars,
    jarsGivenPeriod,
    jarsReturnedPeriod,
    cashPeriod,
    upiPeriod,
    totalCollectedPeriod,
    udhariPeriod,
    totalUdhariAll,
    customers,
    transactions,
    timeFilter,
    setTimeFilter,
    business,
    setActiveTab,
    setSelectedCustomerId,
    setJarModalOpen,
  } = useApp();

  const isMr = business.language === 'mr';
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const filterTabs: { id: TimeFilter; label: string; labelMr: string }[] = [
    { id: 'today', label: 'Today', labelMr: 'आज' },
    { id: 'yesterday', label: 'Yesterday', labelMr: 'काल' },
    { id: 'week', label: 'This Week', labelMr: 'चालू आठवडा' },
    { id: 'month', label: 'This Month', labelMr: 'चालू महिना' },
  ];

  const hasData = totalJars > 0 || customers.length > 0 || transactions.length > 0;

  // Top customers holding jars
  const topJarCustomers = [...customers]
    .filter((c) => c.currentJars > 0)
    .sort((a, b) => b.currentJars - a.currentJars)
    .slice(0, 4);

  return (
    <div className="pb-24 pt-3 px-3.5 max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Top Core Snapshot Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-blue-700 text-white p-4 rounded-3xl shadow-card relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
          <Layers className="w-36 h-36" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              {isMr ? 'आजची स्थिती' : "Today's Status"}
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              {new Date().toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-white">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15">
              <span className="text-[11px] text-blue-100 block">
                {isMr ? 'आज दिलेले जार' : 'Jars Given Today'}
              </span>
              <span className="text-2xl font-black">{jarsGivenPeriod}</span>
              <span className="text-[11px] text-blue-200 block">
                {isMr ? `(परत आले: ${jarsReturnedPeriod})` : `(${jarsReturnedPeriod} Returned)`}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15">
              <span className="text-[11px] text-blue-100 block">
                {isMr ? 'आज जमा रक्कम' : "Today's Collection"}
              </span>
              <span className="text-2xl font-black">{formatCurrency(totalCollectedPeriod)}</span>
              <span className="text-[11px] text-amber-200 block">
                {isMr ? `(उधारी: ${formatCurrency(udhariPeriod)})` : `(Udhari: ${formatCurrency(udhariPeriod)})`}
              </span>
            </div>
          </div>

          {/* Quick Navigation questions */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('customers');
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active-press whitespace-nowrap"
            >
              🔍 {isMr ? 'कोणाकडे किती जार आहेत?' : 'Who has how many jars?'}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('payments');
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 active-press whitespace-nowrap"
            >
              💰 {isMr ? 'उधारी कोणाची बाकी?' : 'Who owes udhari?'}
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE CALL-TO-ACTION BANNER (When zero jars or zero customers) */}
      {!hasData && (
        <div className="p-4 rounded-3xl bg-blue-50/90 border border-blue-200/80 shadow-soft space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-800 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isMr ? 'तुमचा व्यवसाय सुरू करण्यासाठी पहिले जार जोडा.' : 'Add your first jars to get started.'}
              </h3>
              <p className="text-xs text-gray-500">
                {isMr
                  ? 'तुमचा एकूण जार साठा नोंदवा आणि पहिले ग्राहक तयार करा.'
                  : 'Record your godown jar count and create your customer list.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                setJarModalOpen(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-brand-800 hover:bg-brand-900 active-press text-white text-xs font-bold shadow-button flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isMr ? '+ जार जोडा' : '+ Add Jars'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsAddCustomerOpen(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white hover:bg-gray-100 active-press text-gray-800 border border-gray-300 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-brand-700" />
              <span>{isMr ? '+ ग्राहक जोडा' : '+ Add Customer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK START SECTION (Shown when business has no transactions) */}
      {transactions.length === 0 && (
        <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">
                {isMr ? 'सुरुवात करण्यासाठी' : 'Quick Start Guide'}
              </h3>
              <p className="text-xs text-gray-500">
                {isMr ? '४ सोप्या पायऱ्यांमध्ये तुमचा व्यवसाय सुरू करा' : '4 quick steps to launch your business'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-800">
              New Business
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Step 1: Add Jars */}
            <div
              onClick={() => {
                sound.playClick();
                setJarModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-gray-50/80 hover:bg-blue-50/60 border border-gray-100 cursor-pointer active-press transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <Package className="w-4 h-4 text-brand-700" />
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-gray-900">{isMr ? 'जार जोडा' : '1. Add Jars'}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isMr ? 'तुमच्या एकूण जारची संख्या नोंदवा' : 'Set your total jar quantity'}
                </p>
              </div>
            </div>

            {/* Step 2: Add Customer */}
            <div
              onClick={() => {
                sound.playClick();
                setIsAddCustomerOpen(true);
              }}
              className="p-3 rounded-2xl bg-gray-50/80 hover:bg-blue-50/60 border border-gray-100 cursor-pointer active-press transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <Users className="w-4 h-4 text-brand-700" />
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-gray-900">{isMr ? 'ग्राहक जोडा' : '2. Add Customer'}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isMr ? 'तुमचे पहिले ग्राहक तयार करा' : 'Create your first customer'}
                </p>
              </div>
            </div>

            {/* Step 3: Daily Entry */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveTab('entry');
              }}
              className="p-3 rounded-2xl bg-gray-50/80 hover:bg-blue-50/60 border border-gray-100 cursor-pointer active-press transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <Plus className="w-4 h-4 text-brand-700" />
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-gray-900">{isMr ? 'नवीन नोंद' : '3. Daily Entry'}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isMr ? 'ग्राहकाला जार देण्याची नोंद करा' : 'Record jar dispatch in 3s'}
                </p>
              </div>
            </div>

            {/* Step 4: Collect Payment */}
            <div
              onClick={() => {
                sound.playClick();
                setActiveTab('payments');
              }}
              className="p-3 rounded-2xl bg-gray-50/80 hover:bg-blue-50/60 border border-gray-100 cursor-pointer active-press transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <Coins className="w-4 h-4 text-brand-700" />
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-gray-900">{isMr ? 'पेमेंट जमा करा' : '4. Collect Cash'}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isMr ? 'ग्राहकाकडून पेमेंट नोंदवा' : 'Record cash or UPI payments'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {filterTabs.map((tab) => {
          const isSelected = timeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setTimeFilter(tab.id);
              }}
              className={`flex-1 min-w-[76px] py-2 px-3 rounded-2xl text-xs font-bold transition-all duration-200 active-press whitespace-nowrap text-center ${
                isSelected
                  ? 'bg-brand-800 text-white shadow-button'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isMr ? tab.labelMr : tab.label}
            </button>
          );
        })}
      </div>

      {/* PRIMARY 9 METRIC CARDS WITH PRODUCTION ZERO-DATA TEXT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* 1. Total Jars */}
        <MetricCard
          title="Total Jars"
          titleMr="एकूण जार"
          value={totalJars}
          subtitle={totalJars === 0 ? 'No jars added yet' : 'Total business assets'}
          subtitleMr={totalJars === 0 ? 'अद्याप जार जोडलेले नाहीत' : 'एकूण सर्व जार साठा'}
          icon={Package}
          variant="blue"
          isMarathi={isMr}
          onClick={() => setJarModalOpen(true)}
        />

        {/* 2. Available Jars */}
        <MetricCard
          title="Available in Stock"
          titleMr="गोदाम शिल्लक"
          value={availableJars}
          subtitle={availableJars === 0 ? 'Available jars' : 'Ready for dispatch'}
          subtitleMr={availableJars === 0 ? 'उपलब्ध जार' : 'गोदाममध्ये उपलब्ध'}
          icon={Layers}
          variant="green"
          isMarathi={isMr}
          onClick={() => setJarModalOpen(true)}
        />

        {/* 3. Jars Given Today */}
        <MetricCard
          title="Jars Given"
          titleMr="दिलेले जार"
          value={jarsGivenPeriod}
          subtitle={jarsGivenPeriod === 0 ? 'No jars given today' : 'In period'}
          subtitleMr={jarsGivenPeriod === 0 ? 'आज कोणताही जार दिलेला नाही' : 'आज पाठवलेले'}
          icon={ArrowUpRight}
          variant="blue"
          isMarathi={isMr}
          onClick={() => setActiveTab('entry')}
        />

        {/* 4. Jars Returned Today */}
        <MetricCard
          title="Jars Returned"
          titleMr="परत आलेले जार"
          value={jarsReturnedPeriod}
          subtitle={jarsReturnedPeriod === 0 ? 'No returns today' : 'Empty jars returned'}
          subtitleMr={jarsReturnedPeriod === 0 ? 'आज कोणताही जार परत आलेला नाही' : 'रिकामे जमा जार'}
          icon={ArrowDownLeft}
          variant="green"
          isMarathi={isMr}
          onClick={() => setActiveTab('entry')}
        />

        {/* 5. Jars With Customers */}
        <MetricCard
          title="With Customers"
          titleMr="ग्राहकांकडे जार"
          value={customerJars}
          subtitle={customerJars === 0 ? '0 in circulation' : 'In market circulation'}
          subtitleMr={customerJars === 0 ? 'बाजारात ० जार' : 'ग्राहकांकडे असलेले'}
          icon={Users}
          variant="purple"
          isMarathi={isMr}
          onClick={() => setActiveTab('customers')}
        />

        {/* 6. Today's Cash */}
        <MetricCard
          title="Cash Collected"
          titleMr="रोख रक्कम जमा"
          value={formatCurrency(cashPeriod)}
          subtitle={cashPeriod === 0 ? '₹0 cash today' : `Direct cash: ${formatCurrency(cashPeriod)}`}
          subtitleMr={cashPeriod === 0 ? 'आज रोख जमा ०' : `रोख: ${formatCurrency(cashPeriod)}`}
          icon={Coins}
          variant="green"
          isMarathi={isMr}
          onClick={() => setActiveTab('payments')}
        />

        {/* 7. Today's Udhari */}
        <MetricCard
          title="Credit Given (Udhari)"
          titleMr="नवीन उधारी"
          value={formatCurrency(udhariPeriod)}
          subtitle={udhariPeriod === 0 ? 'No credit given' : 'New credit today'}
          subtitleMr={udhariPeriod === 0 ? 'आज नवीन उधारी ०' : 'नवीन उधारी'}
          icon={AlertTriangle}
          variant="orange"
          isMarathi={isMr}
          onClick={() => setActiveTab('customers')}
        />

        {/* 8. Total Pending Payments */}
        <MetricCard
          title="Total Udhari Balance"
          titleMr="प्रलंबित पेमेंट"
          value={formatCurrency(totalUdhariAll)}
          subtitle={totalUdhariAll === 0 ? 'All dues clear' : 'Total market pending'}
          subtitleMr={totalUdhariAll === 0 ? 'सर्व हिशोब क्लिअर' : 'एकूण सर्व येणे बाकी'}
          icon={Receipt}
          variant="red"
          isMarathi={isMr}
          onClick={() => setActiveTab('customers')}
        />

        {/* 9. Damaged Jars */}
        <MetricCard
          title="Damaged Jars"
          titleMr="खराब जार"
          value={damagedJars}
          subtitle={damagedJars === 0 ? '0 damaged' : 'Needs repair'}
          subtitleMr={damagedJars === 0 ? '० खराब' : 'दुरुस्ती आवश्यक'}
          icon={AlertOctagon}
          variant="gray"
          isMarathi={isMr}
          onClick={() => setJarModalOpen(true)}
        />
      </div>

      {/* CHARTS SECTION (Real data only, no mock bars!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <JarMovementChart />
        <RevenueCashChart />
      </div>

      {/* TOP CUSTOMERS WIDGET */}
      <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {isMr ? 'जास्त जार असलेले ग्राहक' : 'Top Customers by Jars'}
            </h3>
            <p className="text-xs text-gray-500">
              {isMr ? 'कोणाकडे किती जार आहेत आणि किती उधारी आहे' : 'Clients with highest jar holding'}
            </p>
          </div>
          {customers.length > 0 && (
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('customers');
              }}
              className="text-xs font-bold text-brand-800 hover:underline"
            >
              {isMr ? 'सर्व पहा' : 'View All'} →
            </button>
          )}
        </div>

        {topJarCustomers.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-gray-500">
              {isMr ? 'अजून कोणतेही ग्राहक जोडलेले नाहीत.' : 'No customers have jars yet.'}
            </p>
            <button
              onClick={() => {
                sound.playClick();
                setIsAddCustomerOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 font-bold active-press text-xs inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isMr ? '+ ग्राहक जोडा' : '+ Add Customer'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {topJarCustomers.map((cust) => (
              <div
                key={cust.id}
                className="p-3 rounded-2xl bg-gray-50/80 hover:bg-blue-50/40 border border-gray-100 flex items-center justify-between transition-colors"
              >
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedCustomerId(cust.id);
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900">{cust.name}</h4>
                    <span className="text-[10px] font-medium text-gray-500">{cust.area}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-semibold text-brand-800">
                      🪣 {cust.currentJars} {isMr ? 'जार' : 'Jars'}
                    </span>
                    <span className={cust.pendingAmount > 0 ? 'font-bold text-danger-600' : 'text-gray-500'}>
                      ₹ {cust.pendingAmount} {isMr ? 'उधारी' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${cust.mobile}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 active-press hover:bg-gray-100"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://wa.me/91${cust.mobile}?text=${createWhatsAppMessage(
                      cust.name,
                      business.name,
                      {
                        currentJars: cust.currentJars,
                        pendingAmount: cust.pendingAmount,
                      },
                      isMr ? 'mr' : 'en'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                    }}
                    className="w-8 h-8 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-success-600 active-press hover:bg-green-100"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedCustomerId(cust.id);
                      setActiveTab('entry');
                    }}
                    className="w-8 h-8 rounded-xl bg-brand-800 text-white flex items-center justify-center active-press hover:bg-brand-900"
                    title="Give or Return Jar"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>
  );
};
