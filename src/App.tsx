/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, AppLanguage } from './types/database';
import { EkatraDB, subscribeToDB } from './lib/supabase';
import { Header } from './components/common/Header';
import { CollectorHome } from './components/collector/CollectorHome';
import { RecyclerHome } from './components/recycler/RecyclerHome';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoginScreen } from './components/auth/LoginScreen';
import { WhatsAppDemoModal } from './components/channels/WhatsAppDemoModal';
import { SMSDemoModal } from './components/channels/SMSDemoModal';
import { getTranslation } from './lib/i18n';
import { ShieldCheck, Recycle, LogOut } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('collector');
  const [isWhatsAppDemoOpen, setIsWhatsAppDemoOpen] = useState(false);
  const [isSMSDemoOpen, setIsSMSDemoOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('ekatra_auth_session');
      return savedAuth === 'true';
    }
    return false;
  });

  const [currentLang, setCurrentLang] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ekatra_lang') as AppLanguage;
      if (['mr', 'hi', 'en', 'gu', 'ta', 'te', 'kn'].includes(saved)) {
        return saved;
      }
    }
    return 'mr'; // Default to Marathi for Maharashtra informal scrap workers
  });

  // Master Synchronized Database State
  const [categories, setCategories] = useState(() => EkatraDB.getCategories());
  const [prices, setPrices] = useState(() => EkatraDB.getPrices());
  const [recyclers, setRecyclers] = useState(() => EkatraDB.getRecyclers());
  const [collector, setCollector] = useState(() => EkatraDB.getCollectorProfile());
  const [lots, setLots] = useState(() => EkatraDB.getLots());
  const [payments, setPayments] = useState(() => EkatraDB.getPayments());
  const [handovers, setHandovers] = useState(() => EkatraDB.getHandovers());
  const [complaints, setComplaints] = useState(() => EkatraDB.getComplaints());
  const [safetyGuides, setSafetyGuides] = useState(() => EkatraDB.getSafetyGuides());
  const [fieldResearch, setFieldResearch] = useState(() => EkatraDB.getFieldResearch());
  const [anomalies, setAnomalies] = useState(() => EkatraDB.getAnomalies());

  const refreshData = useCallback(() => {
    setCategories(EkatraDB.getCategories());
    setPrices(EkatraDB.getPrices());
    setRecyclers(EkatraDB.getRecyclers());
    setCollector(EkatraDB.getCollectorProfile());
    setLots(EkatraDB.getLots());
    setPayments(EkatraDB.getPayments());
    setHandovers(EkatraDB.getHandovers());
    setComplaints(EkatraDB.getComplaints());
    setSafetyGuides(EkatraDB.getSafetyGuides());
    setFieldResearch(EkatraDB.getFieldResearch());
    setAnomalies(EkatraDB.getAnomalies());
  }, []);

  useEffect(() => {
    const unsub = subscribeToDB(() => {
      refreshData();
    });
    return () => unsub();
  }, [refreshData]);

  const handleLangChange = (newLang: AppLanguage) => {
    setCurrentLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ekatra_lang', newLang);
    }
  };

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ekatra_auth_session', 'true');
      localStorage.setItem('ekatra_role', role);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ekatra_auth_session');
    }
  };

  const t = getTranslation(currentLang);

  // If user is not logged in, show the dedicated Login Screen with Language & Voiceover options first
  if (!isAuthenticated) {
    return (
      <LoginScreen
        currentLang={currentLang}
        onLanguageChange={handleLangChange}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header with Role & Language toggles, Voiceover, Connectivity Pill, and Logout */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentLang={currentLang}
        onLangChange={handleLangChange}
        onLogout={handleLogout}
        onOpenWhatsAppDemo={() => setIsWhatsAppDemoOpen(true)}
        onOpenSMSDemo={() => setIsSMSDemoOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentRole === 'collector' && (
          <CollectorHome
            collector={collector}
            categories={categories}
            prices={prices}
            lots={lots}
            payments={payments}
            safetyGuides={safetyGuides}
            complaints={complaints}
            lang={currentLang}
            onRefresh={refreshData}
          />
        )}

        {currentRole === 'recycler' && (
          <RecyclerHome
            recycler={recyclers[0] || EkatraDB.getRecyclers()[0]}
            lots={lots}
            payments={payments}
            categories={categories}
            lang={currentLang}
            onRefresh={refreshData}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            lots={lots}
            recyclers={recyclers}
            payments={payments}
            handovers={handovers}
            categories={categories}
            prices={prices}
            complaints={complaints}
            fieldResearch={fieldResearch}
            anomalies={anomalies}
            lang={currentLang}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Global Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-400">EKATRA E-Waste Digital Bridge</span>
            <span>•</span>
            <span>CPCB & SPCB Regulatory Framework Aligned</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.logout}</span>
            </button>
            <span>•</span>
            <span>Zero Landfill Mission</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp Multi-Channel Demo Interface */}
      <WhatsAppDemoModal
        isOpen={isWhatsAppDemoOpen}
        onClose={() => setIsWhatsAppDemoOpen(false)}
        lang={currentLang}
        onDataChanged={refreshData}
        onNavigateToLots={() => {
          setCurrentRole('collector');
        }}
      />

      {/* SMS Multi-Channel Demo Interface */}
      <SMSDemoModal
        isOpen={isSMSDemoOpen}
        onClose={() => setIsSMSDemoOpen(false)}
        lang={currentLang}
        onDataChanged={refreshData}
        onNavigateToLots={() => {
          setCurrentRole('collector');
        }}
      />
    </div>
  );
}
