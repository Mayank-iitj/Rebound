import React, { useState, useEffect } from 'react';
import { Locale, translations } from './i18n/translations';
import { Header } from './components/Header';
import { DemoBar } from './components/DemoBar';
import { LandingPageView } from './components/LandingPageView';
import { TodayView } from './components/TodayView';
import { CrashTestView } from './components/CrashTestView';
import { FlightRecorderView } from './components/FlightRecorderView';
import { ProgressView } from './components/ProgressView';
import { SupportView } from './components/SupportView';
import { ProgramDashboardView } from './components/ProgramDashboardView';
import { SimLabView } from './components/SimLabView';
import { GovernorConsoleView } from './components/GovernorConsoleView';
import { SettingsView } from './components/SettingsView';
import { PitchDeckView } from './components/PitchDeckView';
import { JudgeTourModal } from './components/JudgeTourModal';
import { OnboardingModal } from './components/OnboardingModal';
import { fetchToday, fetchProgress, simulateLapse } from './services/api';
import { sound } from './services/sound';
import { 
  Sun, Compass, RotateCcw, TrendingUp, Heart, 
  BarChart3, FlaskConical, ShieldAlert, Settings as SettingsIcon,
  Volume2, VolumeX, Presentation
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [locale, setLocale] = useState<Locale>('en');  // Strictly English
  const [activePersona, setActivePersona] = useState<string>('fatima');
  const [activeTab, setActiveTab] = useState<string>('today');
  const [todayData, setTodayData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [showJudgeTour, setShowJudgeTour] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    // English LTR standard
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  useEffect(() => {
    loadAllData();
  }, [activePersona]);

  const loadAllData = async () => {
    const td = await fetchToday();
    const pd = await fetchProgress();
    setTodayData(td);
    setProgressData(pd);
  };

  const handleAudioReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (speechActive) {
        window.speechSynthesis.cancel();
        setSpeechActive(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      setSpeechActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const t = translations[locale];

  const navItems = [
    { id: 'today', label: t.tabs.today, icon: Sun },
    { id: 'plan', label: t.tabs.plan, icon: Compass },
    { id: 'flightRecorder', label: t.tabs.flightRecorder, icon: RotateCcw },
    { id: 'progress', label: t.tabs.progress, icon: TrendingUp },
    { id: 'support', label: t.tabs.support, icon: Heart },
    { id: 'program', label: t.tabs.program, icon: BarChart3 },
    { id: 'simLab', label: t.tabs.simLab, icon: FlaskConical },
    { id: 'governor', label: t.tabs.governor, icon: ShieldAlert },
    { id: 'deck', label: 'Pitch Deck', icon: Presentation },
    { id: 'settings', label: t.tabs.settings, icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col font-sans text-slate-900 pb-12">
      {/* 1. Floating Demo & Judge Bar */}
      <DemoBar
        locale={locale}
        setLocale={setLocale}
        activePersona={activePersona}
        setActivePersona={(p) => {
          setActivePersona(p);
          setCurrentView('app');
        }}
        onLapseTriggered={() => {
          setCurrentView('app');
          setActiveTab('today');
          loadAllData();
        }}
        onOpenGovernorModal={() => {
          setCurrentView('app');
          setActiveTab('governor');
        }}
        onOpenJudgeTour={() => setShowJudgeTour(true)}
        onRefreshData={loadAllData}
      />

      {/* 2. Executive Navigation Header */}
      <Header
        locale={locale}
        setLocale={setLocale}
        activePersona={activePersona}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenJudgeTour={() => setShowJudgeTour(true)}
        onOpenPitchDeck={() => {
          setCurrentView('app');
          setActiveTab('deck');
        }}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* 3. Sub-Navigation (Visible when in App mode) */}
      {currentView === 'app' && (
        <nav className="bg-white border-b border-sand-200 sticky top-15 z-30 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between overflow-x-auto py-2 scrollbar-none">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playTap();
                      setActiveTab(item.id);
                    }}
                    className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-sand-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Accessibility Audio Button */}
            <button
              onClick={() => handleAudioReadAloud(
                'Welcome to Rebound. Built for the bad week. Today suggests the 2-minute Minimum version to protect your consistency without guilt.'
              )}
              title="Read aloud"
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition shrink-0 ${
                speechActive
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-bold'
                  : 'bg-sand-50 text-slate-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              {speechActive ? <VolumeX className="w-3.5 h-3.5 text-amber-700" /> : <Volume2 className="w-3.5 h-3.5 text-teal-700" />}
              <span>{speechActive ? 'Stop Audio' : 'Listen'}</span>
            </button>
          </div>
        </nav>
      )}

      {/* 4. Active Main Content */}
      <main className={`flex-1 w-full ${currentView === 'landing' ? 'p-0 max-w-none' : 'max-w-6xl mx-auto p-4 sm:p-6'}`}>
        {currentView === 'landing' ? (
          <LandingPageView
            locale={locale}
            onLaunchApp={() => setCurrentView('app')}
            onSelectPersona={(personaId) => {
              setActivePersona(personaId);
              setLocale('en');
              setCurrentView('app');
            }}
            onOpenJudgeTour={() => setShowJudgeTour(true)}
            onOpenPitchDeck={() => {
              setCurrentView('app');
              setActiveTab('deck');
            }}
          />
        ) : (
          <>
            {activeTab === 'today' && (
              <TodayView
                locale={locale}
                todayData={todayData}
                onRefresh={loadAllData}
                onOpenRecorder={() => setActiveTab('flightRecorder')}
              />
            )}

            {activeTab === 'plan' && (
              <CrashTestView locale={locale} />
            )}

            {activeTab === 'flightRecorder' && (
              <FlightRecorderView locale={locale} />
            )}

            {activeTab === 'progress' && (
              <ProgressView locale={locale} progressData={progressData} />
            )}

            {activeTab === 'support' && (
              <SupportView locale={locale} />
            )}

            {activeTab === 'program' && (
              <ProgramDashboardView locale={locale} />
            )}

            {activeTab === 'simLab' && (
              <SimLabView locale={locale} />
            )}

            {activeTab === 'governor' && (
              <GovernorConsoleView locale={locale} />
            )}

            {activeTab === 'deck' && (
              <PitchDeckView
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                }}
                onSelectPersona={(p) => {
                  setActivePersona(p);
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView locale={locale} />
            )}
          </>
        )}
      </main>

      {/* 5. Judge Tour Modal (Guided 6-Step Hackathon Walkthrough) */}
      <JudgeTourModal
        isOpen={showJudgeTour}
        onClose={() => setShowJudgeTour(false)}
        onNavigateTab={(tabId) => {
          setCurrentView('app');
          setActiveTab(tabId);
        }}
        onSelectPersona={(p) => {
          setActivePersona(p);
          setLocale('en');
        }}
        onSimulateLapse={async () => {
          await simulateLapse();
          loadAllData();
        }}
      />

      {/* 6. Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(newProfile) => {
          setLocale('en');
          setCurrentView('app');
          setActiveTab('today');
          loadAllData();
        }}
      />

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-sand-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>Rebound — Sustaining Healthy Behaviors · Abu Dhabi Pilot Ready</span>
          <div className="flex items-center space-x-3 rtl:space-x-reverse font-mono text-[11px] text-teal-800">
            <span>UAE PDPL & ADHICS Compliant Design</span>
            <span>·</span>
            <span>Policy Hash: 368b1932f91a56bc</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
