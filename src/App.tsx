import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopWrapper } from './components/layout/DesktopWrapper';

import { DashboardView } from './components/dashboard/DashboardView';
import { CustomersView } from './components/customers/CustomersView';
import { DailyEntryView } from './components/entry/DailyEntryView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ReportsView } from './components/reports/ReportsView';

import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { JarManagementModal } from './components/jars/JarManagementModal';
import { SettingsModal } from './components/common/SettingsModal';
import { NotificationModal } from './components/common/NotificationModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

export const AppContent: React.FC = () => {
  const { activeTab, settings } = useApp();
  const isMarathi = settings.language === 'mr';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'customers':
        return <CustomersView />;
      case 'entry':
        return <DailyEntryView />;
      case 'payments':
        return <PaymentsView />;
      case 'reports':
        return <ReportsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#FAFAFA] flex flex-col ${isMarathi ? 'font-marathi' : ''}`}>
      {/* PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Main Top Header */}
      <Header />

      {/* Dynamic Content View */}
      <main className="flex-1 w-full relative">
        {renderActiveView()}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav />

      {/* Modals & Drawers */}
      <GlobalSearchModal />
      <JarManagementModal />
      <SettingsModal />
      <NotificationModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DesktopWrapper>
      <AppContent />
    </DesktopWrapper>
  );
};

export default App;
