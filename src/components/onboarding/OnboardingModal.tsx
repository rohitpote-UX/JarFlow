import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../../utils/sound';

export const OnboardingModal: React.FC = () => {
  const { business, updateBusiness, completeOnboarding } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState(business.name || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [address, setAddress] = useState(business.address || '');
  const [initialJars, setInitialJars] = useState<number | ''>(100);
  const [ratePerJar, setRatePerJar] = useState<number>(35);

  const isMr = business.language === 'mr';

  // Only display if onboarding is not completed
  if (business.onboardingCompleted) {
    return null;
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    sound.playClick();
    updateBusiness({
      name: businessName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();

    const jarCount = typeof initialJars === 'number' ? Math.max(0, initialJars) : 0;
    completeOnboarding(jarCount, ratePerJar);
  };

  const handleSkipJars = () => {
    sound.playClick();
    completeOnboarding(0, ratePerJar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-sheet space-y-4 animate-slide-up border border-gray-100">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step === 1 ? 'bg-brand-800 text-white shadow-button' : 'bg-green-100 text-success-700'
              }`}
            >
              {step === 1 ? '1' : '✓'}
            </span>
            <span className="text-xs font-bold text-gray-500">
              {step === 1 ? (isMr ? 'व्यवसाय माहिती' : 'Business Profile') : (isMr ? 'जार साठा' : 'Jar Inventory')}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">Step {step} of 2</span>
        </div>

        {/* STEP 1: Welcome & Business Profile */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-3.5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand-800 mx-auto flex items-center justify-center shadow-soft">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {isMr ? 'तुमच्या व्यवसायाचे स्वागत आहे 👋' : 'Welcome to Your Business 👋'}
              </h2>
              <p className="text-xs text-gray-500">
                {isMr
                  ? 'तुमचा नवीन वॉटर जार व्यवसाय सुरू करण्यासाठी प्राथमिक माहिती भरा'
                  : 'Enter your business details to get started with zero clutter'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isMr ? 'व्यवसायाचे नाव (Business Name) *' : 'Business Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={isMr ? 'उदा. गणेश वॉटर सप्लायर्स / जलधारा' : 'e.g. PureFlow Water Services'}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isMr ? 'मोबाईल नंबर (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9822000000"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isMr ? 'पत्ता / परिसर (Address / Area)' : 'Address / Route'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isMr ? 'उदा. मुख्य रस्ता, कोथरूड, पुणे' : 'e.g. Main Road, Pune'}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[48px] py-2.5 rounded-2xl bg-brand-800 hover:bg-brand-900 active-press text-white text-xs font-bold shadow-button flex items-center justify-center gap-2"
              >
                <span>{isMr ? 'सुरू करा (पुढे जा)' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Initial Jar Inventory */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-3.5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-success-700 mx-auto flex items-center justify-center shadow-soft">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {isMr ? 'तुमच्याकडे एकूण किती जार आहेत?' : 'How many jars do you own?'}
              </h2>
              <p className="text-xs text-gray-500">
                {isMr
                  ? 'तुमचा गोदाम साठा येथे नोंदवा. (नंतर कधीही बदलता येईल)'
                  : 'Enter your initial inventory stock. You can update this anytime.'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-center">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {isMr ? 'एकूण जार संख्या (Total Jars)' : 'Total Jar Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialJars}
                  onChange={(e) => setInitialJars(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="100"
                  className="w-32 mx-auto py-2 text-2xl font-black text-center rounded-xl bg-white border border-gray-300 text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-800"
                  autoFocus
                />
                <span className="text-[11px] text-gray-500 block mt-1">
                  {isMr ? 'हे जार तुमच्या गोदामात उपलब्ध म्हणून नोंदवले जातील' : 'These will be recorded as Available in Godown'}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {isMr ? 'प्रति जार दर (Default Rate / Jar)' : 'Default Rate / Jar (₹)'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={ratePerJar}
                    onChange={(e) => setRatePerJar(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full min-h-[48px] py-2.5 rounded-2xl bg-success-600 hover:bg-success-700 active-press text-white text-xs font-bold shadow-button flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isMr ? 'जार जोडून सुरुवात करा' : 'Start with this Inventory'}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipJars}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:underline active-press text-center block"
              >
                {isMr ? 'जार नंतर जोडू (Skip for now)' : 'Skip for now (I will add jars later)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
