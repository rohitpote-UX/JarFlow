import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from './MetricCard';
import { JarMovementChart } from './JarMovementChart';
import { RevenueCashChart } from './RevenueCashChart';
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
    timeFilter,
    setTimeFilter,
    settings,
    setActiveTab,
    setSelectedCustomerId,
    setJarModalOpen,
  } = useApp();

  const isMr = settings.language === 'mr';

  const filterTabs: { id: TimeFilter; label: string; labelMr: string }[] = [
    { id: 'today', label: 'Today', labelMr: 'आज' },
    { id: 'yesterday', label: 'Yesterday', labelMr: 'काल' },
    { id: 'week', label: 'This Week', labelMr: 'चालू आठवडा' },
    { id: 'month', label: 'This Month', labelMr: 'चालू महिना' },
  ];

  // Top 4 customers holding maximum jars
  const topJarCustomers = [...customers]
    .sort((a, b) => (b.currentJars || 0) - (a.currentJars || 0))
    .slice(0, 4);

  return (
    <div className="pb-24 pt-3 px-3.5 max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Quick Questions Banner - Addressing the owner's exact daily business mindset */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-blue-700 text-white p-4 rounded-3xl shadow-card relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
          <Layers className="w-36 h-36" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              {isMr ? 'आजचे मुख्य हिशोब' : "Today's Core Snapshot"}
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
              {new Date().toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-white">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-2xl border border-white/15">
              <span className="text-[11px] text-blue-100 block">
                {isMr ? 'आज दिलेले जार' : 'Jars Given Today'}
              </span>
              <span className="text-2xl font-black">{jarsGivenPeriod}</span>
              <span className="text-[11px] text-blue-200 block">
                {isMr ? `(परत आले: ${jarsReturnedPeriod})` : `(${jarsReturnedPeriod} Returned)`}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-2xl border border-white/15">
              <span className="text-[11px] text-blue-100 block">
                {isMr ? 'आज जमा रक्कम' : "Today's Collection"}
              </span>
              <span className="text-2xl font-black">{formatCurrency(totalCollectedPeriod)}</span>
              <span className="text-[11px] text-amber-200 block">
                {isMr ? `(उधारी: ${formatCurrency(udhariPeriod)})` : `(Udhari: ${formatCurrency(udhariPeriod)})`}
              </span>
            </div>
          </div>

          {/* Quick Question Pills for 1-tap answering */}
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

      {/* Primary 9 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* 1. Total Jars */}
        <MetricCard
          title="Total Jars"
          titleMr="एकूण जार"
          value={totalJars}
          subtitle="Total business assets"
          subtitleMr="एकूण सर्व जार साठा"
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
          subtitle="Ready for dispatch"
          subtitleMr="गोदाममध्ये उपलब्ध"
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
          subtitle={`${timeFilter === 'today' ? 'Today' : 'In period'}`}
          subtitleMr={isMr ? (timeFilter === 'today' ? 'आज पाठवलेले' : 'निवडलेल्या काळात') : ''}
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
          subtitle="Empty jars returned"
          subtitleMr="रिकामे जमा जार"
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
          subtitle="In market circulation"
          subtitleMr="ग्राहकांकडे असलेले"
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
          subtitle={upiPeriod > 0 ? `+ UPI: ${formatCurrency(upiPeriod)}` : 'Direct cash'}
          subtitleMr={isMr ? `(यूपीआय: ${formatCurrency(upiPeriod)})` : ''}
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
          subtitle="New credit in period"
          subtitleMr="या काळातील उधारी"
          icon={AlertTriangle}
          variant="orange"
          isMarathi={isMr}
          onClick={() => setActiveTab('customers')}
        />

        {/* 8. Total Pending Payments */}
        <MetricCard
          title="Total Udhari Balance"
          titleMr="सर्व ग्राहकांची उधारी"
          value={formatCurrency(totalUdhariAll)}
          subtitle="All customers pending"
          subtitleMr="एकूण सर्व येणे बाकी"
          icon={Receipt}
          variant="red"
          isMarathi={isMr}
          onClick={() => setActiveTab('customers')}
        />

        {/* 9. Damaged Jars */}
        <MetricCard
          title="Damaged Jars"
          titleMr="खराब / फुटलेले"
          value={damagedJars}
          subtitle="Needs repair/scrap"
          subtitleMr="दुरुस्ती किंवा भंगार"
          icon={AlertOctagon}
          variant="gray"
          isMarathi={isMr}
          onClick={() => setJarModalOpen(true)}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <JarMovementChart />
        <RevenueCashChart />
      </div>

      {/* Top Customers Holding Jars Widget */}
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
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('customers');
            }}
            className="text-xs font-bold text-brand-800 hover:underline"
          >
            {isMr ? 'सर्व पहा' : 'View All'} →
          </button>
        </div>

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

              {/* Quick Call & WhatsApp Buttons */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${cust.mobile}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                  }}
                  className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 active-press hover:bg-gray-100"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://wa.me/91${cust.mobile}?text=${createWhatsAppMessage(
                    cust.name,
                    settings.businessName,
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
                  title="WhatsApp Statement"
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
      </div>
    </div>
  );
};
