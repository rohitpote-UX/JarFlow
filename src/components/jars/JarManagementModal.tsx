import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Package,
  Layers,
  Users,
  AlertOctagon,
  HelpCircle,
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { JarStatus, Jar } from '../../types';
import { formatDate } from '../../utils/formatters';
import { sound } from '../../utils/sound';

export const JarManagementModal: React.FC = () => {
  const {
    jars,
    totalJars,
    availableJars,
    customerJars,
    damagedJars,
    updateJarStatus,
    addJarBatch,
    settings,
    jarModalOpen,
    setJarModalOpen,
  } = useApp();

  const isMr = settings.language === 'mr';

  const [activeTab, setActiveTab] = useState<'inventory' | 'add_stock' | 'qr_scanner'>('inventory');
  const [statusFilter, setStatusFilter] = useState<JarStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchCount, setBatchCount] = useState<number>(20);
  const [selectedJarForQR, setSelectedJarForQR] = useState<Jar | null>(null);
  const [scannerSimulating, setScannerSimulating] = useState(false);
  const [scannedResult, setScannedResult] = useState<Jar | null>(null);

  if (!jarModalOpen) return null;

  const filteredJars = jars.filter((j) => {
    const matchesSearch =
      j.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.currentCustomerName && j.currentCustomerName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all') return j.status === statusFilter;
    return true;
  });

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCount <= 0) return;
    addJarBatch(batchCount);
    setActiveTab('inventory');
  };

  const handleSimulateScan = () => {
    setScannerSimulating(true);
    sound.playClick();
    setTimeout(() => {
      setScannerSimulating(false);
      // Pick random jar from list
      const randomJar = jars[Math.floor(Math.random() * jars.length)];
      setScannedResult(randomJar);
      sound.playSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-5 shadow-sheet space-y-3.5 animate-slide-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">
                {isMr ? 'जार साठा व ट्रॅकिंग' : 'Jar Inventory & QR Tracking'}
              </h2>
              <p className="text-xs text-gray-500">
                {isMr ? 'गोदाम साठा, ग्राहकांकडील जार आणि QR कोड' : 'Live jar status & tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setJarModalOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Breakdown Pills */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-gray-50 border border-gray-200">
            <span className="text-[10px] text-gray-500 font-bold block">{isMr ? 'एकूण जार' : 'Total'}</span>
            <span className="text-base font-black text-gray-900">{totalJars}</span>
          </div>
          <div className="p-2 rounded-2xl bg-green-50 border border-green-200">
            <span className="text-[10px] text-success-700 font-bold block">{isMr ? 'उपलब्ध' : 'Available'}</span>
            <span className="text-base font-black text-success-700">{availableJars}</span>
          </div>
          <div className="p-2 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] text-brand-800 font-bold block">{isMr ? 'ग्राहकांकडे' : 'With Clients'}</span>
            <span className="text-base font-black text-brand-800">{customerJars}</span>
          </div>
          <div className="p-2 rounded-2xl bg-red-50 border border-red-200">
            <span className="text-[10px] text-danger-600 font-bold block">{isMr ? 'खराब' : 'Damaged'}</span>
            <span className="text-base font-black text-danger-600">{damagedJars}</span>
          </div>
        </div>

        {/* Tabs for Jar Management */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('inventory');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
              activeTab === 'inventory'
                ? 'bg-brand-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 {isMr ? 'जार यादी' : 'Jar List'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('qr_scanner');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
              activeTab === 'qr_scanner'
                ? 'bg-brand-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📷 {isMr ? 'QR स्कॅनर' : 'QR Scanner'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('add_stock');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
              activeTab === 'add_stock'
                ? 'bg-brand-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            + {isMr ? 'नवीन स्टॉक जोडा' : 'Add Stock'}
          </button>
        </div>

        {/* TAB 1: Inventory List */}
        {activeTab === 'inventory' && (
          <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isMr ? 'जार नंबर किंवा ग्राहक शोधा...' : 'Search JAR serial or client...'}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-800"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as JarStatus | 'all')}
                className="px-2 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold focus:outline-none"
              >
                <option value="all">{isMr ? 'सर्व स्थिती' : 'All Status'}</option>
                <option value="available">{isMr ? 'उपलब्ध (Available)' : 'Available'}</option>
                <option value="with_customer">{isMr ? 'ग्राहकाकडे' : 'With Customer'}</option>
                <option value="damaged">{isMr ? 'खराब / फुटलेले' : 'Damaged'}</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-xs pr-1">
              {filteredJars.map((jar) => (
                <div key={jar.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedJarForQR(jar);
                      }}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-gray-900">{jar.serialNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            jar.status === 'available'
                              ? 'bg-green-100 text-success-700'
                              : jar.status === 'with_customer'
                              ? 'bg-blue-100 text-brand-800'
                              : 'bg-red-100 text-danger-700'
                          }`}
                        >
                          {jar.status === 'available'
                            ? isMr
                              ? 'गोदाम उपलब्ध'
                              : 'Available'
                            : jar.status === 'with_customer'
                            ? isMr
                              ? 'ग्राहकाकडे'
                              : 'With Client'
                            : isMr
                            ? 'खराब'
                            : 'Damaged'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {jar.currentCustomerName
                          ? `${jar.currentCustomerName} (${isMr ? 'दिले' : 'Since'}: ${formatDate(jar.dateGiven || '')})`
                          : isMr
                          ? 'गोदाम साठ्यात तयार'
                          : 'In Godown Stock'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1">
                    {jar.status === 'available' && (
                      <button
                        onClick={() => updateJarStatus(jar.id, 'damaged')}
                        className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-danger-700 font-bold text-[10px] active-press"
                      >
                        {isMr ? 'खराब नोंदवा' : 'Damaged'}
                      </button>
                    )}
                    {jar.status === 'damaged' && (
                      <button
                        onClick={() => updateJarStatus(jar.id, 'available')}
                        className="px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-success-700 font-bold text-[10px] active-press"
                      >
                        {isMr ? 'दुरुस्त झाले' : 'Repaired'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QR Scanner Simulation */}
        {activeTab === 'qr_scanner' && (
          <div className="space-y-4 py-3 text-center">
            <div className="relative mx-auto w-56 h-56 rounded-3xl bg-gray-900 border-4 border-brand-700 flex flex-col items-center justify-center overflow-hidden">
              <Camera className="w-12 h-12 text-blue-400 mb-2 opacity-80" />
              <span className="text-xs text-white font-medium">
                {scannerSimulating
                  ? isMr
                    ? 'QR कोड स्कॅन होत आहे...'
                    : 'Scanning Jar Barcode...'
                  : isMr
                  ? 'कॅमेरा जार समोरील QR वर धरा'
                  : 'Point camera at Jar QR sticker'}
              </span>

              {scannerSimulating && (
                <div className="absolute inset-0 bg-blue-500/20 animate-pulse flex items-center justify-center">
                  <div className="w-full h-1 bg-blue-400 shadow-glow animate-bounce" />
                </div>
              )}
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={scannerSimulating}
              className="py-2.5 px-6 rounded-2xl bg-brand-800 hover:bg-brand-900 active-press text-white text-xs font-bold shadow-button"
            >
              {scannerSimulating
                ? isMr
                  ? 'स्कॅन सुरू आहे...'
                  : 'Scanning...'
                : isMr
                ? '📸 QR कोड स्कॅन करा'
                : '📸 Scan Jar QR Code'}
            </button>

            {scannedResult && (
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-left text-xs space-y-1 animate-fade-in max-w-sm mx-auto">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-brand-900">{scannedResult.serialNumber}</span>
                  <span className="font-bold text-success-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px]">
                    {scannedResult.status}
                  </span>
                </div>
                <p className="text-gray-600">
                  {scannedResult.currentCustomerName
                    ? `Current Holder: ${scannedResult.currentCustomerName}`
                    : 'Currently available in Godown'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Add Batch Stock */}
        {activeTab === 'add_stock' && (
          <form onSubmit={handleAddBatch} className="space-y-3 py-2">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-brand-900">
              {isMr
                ? 'नवीन खरेदी केलेले जार सिस्टिममध्ये जोडा. सिस्टिम आपोआप नवीन सिरीयल नंबर आणि QR जनरेट करेल.'
                : 'Add newly purchased empty jars to Godown stock. System will auto-generate serial IDs.'}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isMr ? 'नवीन जार संख्या (Quantity)' : 'Number of New Jars to Add'}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-button active-press"
            >
              + {isMr ? `साठ्यात ${batchCount} जार जमा करा` : `Add ${batchCount} Jars to Godown`}
            </button>
          </form>
        )}

        {/* QR Code Sticker Preview Modal */}
        {selectedJarForQR && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white p-5 rounded-3xl max-w-xs w-full text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-800 mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedJarForQR.serialNumber}</h4>
                <p className="text-[11px] text-gray-500">{settings.businessName}</p>
              </div>

              {/* Render high contrast vector QR box */}
              <div className="p-4 bg-white border-2 border-gray-900 rounded-2xl inline-block shadow-sm">
                <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
                  {/* Outer corner boxes */}
                  <rect x="10" y="10" width="24" height="24" fill="#000000" />
                  <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" />
                  <rect x="18" y="18" width="8" height="8" fill="#000000" />

                  <rect x="66" y="10" width="24" height="24" fill="#000000" />
                  <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" />
                  <rect x="74" y="18" width="8" height="8" fill="#000000" />

                  <rect x="10" y="66" width="24" height="24" fill="#000000" />
                  <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" />
                  <rect x="18" y="74" width="8" height="8" fill="#000000" />

                  {/* Internal mock data blocks */}
                  <rect x="42" y="15" width="16" height="6" fill="#000000" />
                  <rect x="40" y="30" width="20" height="8" fill="#000000" />
                  <rect x="15" y="44" width="20" height="6" fill="#000000" />
                  <rect x="65" y="44" width="22" height="6" fill="#000000" />
                  <rect x="42" y="55" width="16" height="16" fill="#000000" />
                  <rect x="68" y="70" width="18" height="16" fill="#000000" />
                  <rect x="42" y="80" width="16" height="6" fill="#000000" />
                </svg>
                <span className="text-[10px] font-mono font-bold text-gray-700 block mt-1">
                  {selectedJarForQR.qrCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="py-2 rounded-xl bg-brand-800 text-white text-xs font-bold active-press"
                >
                  {isMr ? 'प्रिंट करा' : 'Print Sticker'}
                </button>
                <button
                  onClick={() => setSelectedJarForQR(null)}
                  className="py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold active-press"
                >
                  {isMr ? 'बंद करा' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
