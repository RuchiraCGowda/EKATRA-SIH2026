import React, { useState } from 'react';
import {
  Factory,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Send,
  IndianRupee,
  Layers,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  RecyclerProfile,
  Lot,
  Payment,
  AppLanguage,
  MaterialCategory,
} from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { MakeOfferModal } from './MakeOfferModal';
import { ConfirmHandoverModal } from './ConfirmHandoverModal';
import { EkatraDB } from '../../lib/supabase';
import { getMaterialCategoryName } from '../../lib/materialHelpers';

interface RecyclerHomeProps {
  recycler: RecyclerProfile;
  lots: Lot[];
  payments: Payment[];
  categories: MaterialCategory[];
  lang: AppLanguage;
  onRefresh: () => void;
}

type RecyclerTab = 'available' | 'orders' | 'transactions' | 'profile' | 'bulk';

export const RecyclerHome: React.FC<RecyclerHomeProps> = ({
  recycler,
  lots,
  payments,
  categories,
  lang,
  onRefresh,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<RecyclerTab>('available');
  const [selectedLotForOffer, setSelectedLotForOffer] = useState<Lot | null>(null);
  const [selectedLotForHandover, setSelectedLotForHandover] = useState<Lot | null>(null);
  const [bulkNotification, setBulkNotification] = useState<string | null>(null);

  // Filter lots
  const availableLots = lots.filter(
    (l) => l.status === 'collected' || l.status === 'offer_received'
  );

  const activeOrders = lots.filter(
    (l) =>
      (l.status === 'recycler_selected' || l.status === 'handover_scheduled') &&
      l.selected_recycler_id === recycler.id
  );

  const completedTransactions = payments.filter(
    (p) => p.recycler_id === recycler.id || !p.recycler_id || p.recycler?.id === recycler.id
  );

  const handlePostBulk = () => {
    const msg =
      lang === 'mr'
        ? 'मोठ्या प्रमाणातील भंगार मागणी नोंदवली गेली आहे! परिसरातील वेचकांना सूचना पाठवली जाईल.'
        : lang === 'hi'
        ? 'थोक स्क्रैप खरीद आवश्यकता पोस्ट कर दी गई है! क्षेत्रीय संग्राहकों को सूचित किया जाएगा।'
        : lang === 'gu'
        ? 'જથ્થાબંધ ભંગાર ખરીદી આવશ્યકતા પોસ્ટ કરવામાં આવી છે!'
        : lang === 'ta'
        ? 'மொத்த கொள்முதல் தேவை வெற்றிகரமாக பதிவு செய்யப்பட்டது!'
        : lang === 'te'
        ? 'బల్క్ సేకరణ అవసరం పోస్ట్ చేయబడింది!'
        : lang === 'kn'
        ? 'ಬೃಹತ್ ಸಂಗ್ರಹಣಾ ಅವಶ್ಯಕತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ!'
        : 'Bulk procurement requirement posted! Informal collectors in the cluster will be notified.';
    setBulkNotification(msg);
    setTimeout(() => setBulkNotification(null), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Recycler Facility Header */}
      <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-100">
                {recycler.company_name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  recycler.authorization_status === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                {recycler.authorization_status === 'verified'
                  ? lang === 'mr'
                    ? '✓ शासन अधिकृत रीसायक्लर'
                    : lang === 'hi'
                    ? '✓ सरकार अधिकृत रीसाइक्लर'
                    : lang === 'gu'
                    ? '✓ સરકાર માન્ય રિસાયકલર'
                    : lang === 'ta'
                    ? '✓ அரசு அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்'
                    : lang === 'te'
                    ? '✓ ప్రభుత్వ ధృవీకృత రీసైక్లర్'
                    : lang === 'kn'
                    ? '✓ ಸರ್ಕಾರಿ ಪರಿಶೀಲಿತ ರಿಸೈಕ್ಲರ್'
                    : '✓ Government Verified Aggregator'
                  : lang === 'mr'
                  ? 'तात्पुरते / तपासणी सुरू'
                  : lang === 'hi'
                  ? 'अनंतिम / समीक्षाधीन'
                  : 'Provisional / Under Review'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {recycler.facility_address}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
              <span className="font-mono text-slate-300">
                {lang === 'mr'
                  ? 'परवाना:'
                  : lang === 'hi'
                  ? 'लाइसेंस:'
                  : lang === 'gu'
                  ? 'લાઇસન્સ:'
                  : 'License:'}{' '}
                {recycler.spcb_license_number || 'MPCB-RO-2026'}
              </span>
              <span>•</span>
              <span>
                {lang === 'mr'
                  ? 'कार्यक्षेत्र:'
                  : lang === 'hi'
                  ? 'दायरा:'
                  : 'Radius:'}{' '}
                {recycler.service_radius_km} km
              </span>
              <span>•</span>
              <span className="text-teal-400 font-semibold">
                {lang === 'mr'
                  ? 'क्षमता:'
                  : lang === 'hi'
                  ? 'क्षमता:'
                  : 'Cap:'}{' '}
                {recycler.capacity_per_month_mt} MT/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {bulkNotification && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{bulkNotification}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          {t.availableLots} ({availableLots.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          {t.activeOrders} ({activeOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {lang === 'mr'
            ? 'व्यवहार आणि भरणा'
            : lang === 'hi'
            ? 'लेन-देन और निपटान'
            : lang === 'gu'
            ? 'વ્યવહાર અને ચુકવણી'
            : lang === 'ta'
            ? 'பரிவர்த்தனைகள்'
            : lang === 'te'
            ? 'లావాదేవీలు & చెల్లింపులు'
            : lang === 'kn'
            ? 'ವಹಿವಾಟುಗಳು & ಇತ್ಯರ್ಥ'
            : 'Transactions & Settlement'}{' '}
          ({completedTransactions.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          {lang === 'mr'
            ? 'सुविधा व परवाने'
            : lang === 'hi'
            ? 'सुविधा व लाइसेंस'
            : lang === 'gu'
            ? 'સુવિધા અને લાયસન્સ'
            : lang === 'ta'
            ? 'வசதி மற்றும் உரிமங்கள்'
            : lang === 'te'
            ? 'సౌకర్యం & లైసెన్సులు'
            : lang === 'kn'
            ? 'ಸೌಲಭ್ಯ & ಪರವಾನಗಿಗಳು'
            : 'Facility & Licenses'}
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'bulk'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          {lang === 'mr'
            ? 'घाऊक खरेदी'
            : lang === 'hi'
            ? 'थोक खरीद'
            : lang === 'gu'
            ? 'જથ્થાબંધ ખરીદી'
            : lang === 'ta'
            ? 'மொத்த கொள்முதல்'
            : lang === 'te'
            ? 'బల్క్ సేకరణ'
            : lang === 'kn'
            ? 'ಬೃಹತ್ ಸಂಗ್ರಹಣೆ'
            : 'Bulk Procurement'}
        </button>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: AVAILABLE LOTS */}
      {/* ================================================================ */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lots waiting for quotes in your operational radius</span>
            <span>Real-time Supabase feed</span>
          </div>

          {availableLots.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-500">
              No new scrap lots currently waiting for quotes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableLots.map((lot) => {
                const myOffer = lot.offers?.find((o) => o.recycler_id === recycler.id);

                return (
                  <div
                    key={lot.id}
                    className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-teal-500/40 transition-all shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                            <img
                              src={lot.primary_image_url}
                              alt={getMaterialCategoryName(lot.category, lang)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-teal-400">
                              {lot.lot_code}
                            </span>
                            <h3 className="font-bold text-slate-100 text-base leading-snug">
                              {getMaterialCategoryName(lot.category, lang)}
                            </h3>
                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {lot.location_name}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-900 text-slate-200 border border-slate-700">
                          {lot.approx_weight_kg} kg
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl">
                        {lot.description || 'Collection lot from informal aggregator.'}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Benchmark</span>
                          <span className="font-bold text-slate-300">
                            ₹{lot.category?.benchmark_price_per_kg}/kg
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Estimated Total</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            ₹{lot.estimated_value_inr}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60">
                      {myOffer ? (
                        <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs flex items-center justify-between">
                          <span className="text-teal-300 font-semibold">
                            Offer Submitted: ₹{myOffer.offered_rate_per_kg}/kg (Total ₹
                            {myOffer.total_offered_amount})
                          </span>
                          <span className="text-[10px] text-slate-400">Waiting for Collector</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedLotForOffer(lot)}
                          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {t.makeOffer}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: ACTIVE ORDERS & PICKUP SCHEDULE */}
      {/* ================================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Accepted lots assigned to your facility for collection</span>
            <span>Handover requires weight confirmation & OTP</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-500">
              No active orders currently awaiting collection.
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((lot) => (
                <div
                  key={lot.id}
                  className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={lot.primary_image_url}
                        alt={lot.category?.name_en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-400">
                          {lot.lot_code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300">
                          Order Active
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-base mt-0.5">
                        {getMaterialCategoryName(lot.category, lang)} ({lot.approx_weight_kg} kg)
                      </h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {lot.location_name}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-400">
                          Agreed: ₹{lot.agreed_rate_per_kg}/kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedLotForHandover(lot)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Handover & Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: SETTLED TRANSACTIONS & PAYMENTS */}
      {/* ================================================================ */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block">Total Payouts Settled</span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{completedTransactions.reduce((acc, p) => acc + p.amount_inr, 0).toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block">Handovers Completed</span>
              <span className="text-2xl font-black text-slate-100">
                {completedTransactions.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs text-slate-400 block">Regulatory Compliance</span>
              <span className="text-2xl font-black text-teal-400">100% CPCB Form 6</span>
            </div>
          </div>

          <div className="space-y-3">
            {completedTransactions.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-sm">
                No settled transactions found yet for this facility. Complete active handovers above to settle payouts!
              </div>
            ) : (
              completedTransactions.map((p) => {
                const matName = getMaterialCategoryName(p.lot?.category, lang);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs hover:border-teal-500/40 transition-all shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-400">
                          {p.transaction_code}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {matName} {p.lot?.approx_weight_kg ? `(${p.lot.approx_weight_kg} kg)` : ''}
                        </span>
                      </div>
                      <div className="text-slate-300 font-medium mt-1">
                        Lot Ref: {p.lot?.lot_code || 'LOT'} • Ref: {p.payment_reference}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Settled: {new Date(p.completed_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 text-sm block">
                        ₹{p.amount_inr.toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                        {p.payment_mode}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: FACILITY & AUTHORIZATION PROFILE */}
      {/* ================================================================ */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {lang === 'mr'
                ? 'अधिकृत सुविधा नोंदणी व परवाने'
                : lang === 'hi'
                ? 'अधिकृत सुविधा रिकॉर्ड व लाइसेंस'
                : lang === 'gu'
                ? 'સુવિધા રેકોર્ડ અને લાયસન્સ'
                : lang === 'ta'
                ? 'வசதி அங்கீகார பதிவு'
                : lang === 'te'
                ? 'సౌకర్యం అధికారిక రికార్డు'
                : lang === 'kn'
                ? 'ಸೌಲಭ್ಯ ಅಧಿಕೃತ ದಾಖಲೆ'
                : 'Facility Authorization Record'}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
              <span className="text-slate-400 block">
                {lang === 'mr'
                  ? 'राज्य प्रदूषण नियंत्रण मंडळ (SPCB) परवाना'
                  : lang === 'hi'
                  ? 'राज्य प्रदूषण नियंत्रण बोर्ड (SPCB) लाइसेंस'
                  : 'State Pollution Control Board (SPCB) License'}
              </span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {recycler.spcb_license_number}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
              <span className="text-slate-400 block">
                {lang === 'mr'
                  ? 'केंद्रीय प्रदूषण नियंत्रण मंडळ (CPCB) नोंदणी क्र.'
                  : lang === 'hi'
                  ? 'केंद्रीय प्रदूषण नियंत्रण बोर्ड (CPCB) पंजीकरण'
                  : 'Central Pollution Control Board (CPCB) Reg No'}
              </span>
              <span className="font-mono font-bold text-slate-200 text-sm">
                {recycler.cpcb_registration_no}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <span className="text-slate-400 block">
                  {lang === 'mr' ? 'प्रक्रिया क्षमता' : lang === 'hi' ? 'प्रसंस्करण क्षमता' : 'Processing Capacity'}
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  {recycler.capacity_per_month_mt} MT / Month
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
                <span className="text-slate-400 block">
                  {lang === 'mr' ? 'कार्यक्षेत्र त्रिज्या' : lang === 'hi' ? 'सेवा दायरा' : 'Operational Service Radius'}
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  {recycler.service_radius_km} km
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
              {lang === 'mr'
                ? '✓ एकत्रामार्फत होणाऱ्या सर्व व्यवहारांसाठी डिजिटल फॉर्म ६ जाहीरनामा शासकीय तपासणीसाठी तयार होतो.'
                : lang === 'hi'
                ? '✓ एकत्र के माध्यम से सभी लेन-देन के लिए डिजिटल फॉर्म 6 मैनिफेस्ट स्वतः तैयार होता है।'
                : '✓ All scrap transactions initiated through EKATRA generate digital Form 6 manifest records for government inspection.'}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 5: BULK PROCUREMENT (Section 15) */}
      {/* ================================================================ */}
      {activeTab === 'bulk' && (
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-slate-100">
                {lang === 'mr'
                  ? 'घाऊक भंगार खरेदी मागणी'
                  : lang === 'hi'
                  ? 'थोक स्क्रैप खरीद आवश्यकता'
                  : lang === 'gu'
                  ? 'જથ્થાબંધ ભંગાર ખરીદી આવશ્યકતા'
                  : lang === 'ta'
                  ? 'மொத்தக் கொள்முதல் தேவைகள்'
                  : lang === 'te'
                  ? 'బల్క్ సేకరణ అవసరాలు'
                  : lang === 'kn'
                  ? 'ಬೃಹತ್ ಸಂಗ್ರಹಣಾ ಅವಶ್ಯಕತೆಗಳು'
                  : 'Bulk Scrap Procurement Requirements'}
              </h2>
            </div>
            <button
              onClick={handlePostBulk}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md"
            >
              {lang === 'mr'
                ? '+ मागणी नोंदवा'
                : lang === 'hi'
                ? '+ आवश्यकता पोस्ट करें'
                : '+ Post Requirement'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'mr'
              ? 'अधिकृत रीसायक्लर मोठ्या प्रमाणातील लॉट्स (उदा. ५०० किलो+ पीसीबी किंवा १,००० किलो+ बॅटरी स्क्रॅप) थेट खरेदी करू शकतात.'
              : lang === 'hi'
              ? 'अधिकृत रीसाइक्लर बड़ी मात्रा में लॉट (जैसे 500 किग्रा+ पीसीबी या 1,000 किग्रा+ बैटरी) सीधे खरीद सकते हैं।'
              : 'Authorized recyclers can aggregate massive volume batches (e.g. 500kg+ PCB or 1,000kg+ Battery scrap) across multiple informal collection points with guaranteed advance rates.'}
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300 text-sm">
                Target: 500 kg High-Grade PCB Scrap
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300">
                {lang === 'mr' ? 'एकत्रिकरण सुरू' : lang === 'hi' ? 'एकत्रीकरण जारी' : 'Aggregating'}
              </span>
            </div>
            <p className="text-slate-400">
              {lang === 'mr'
                ? 'ऑफर केलेला दर: ₹३३०/किलो. शुक्रवारसाठी संकलन वाहन नियोजित.'
                : lang === 'hi'
                ? 'प्रस्तावित दर: ₹330/किग्रा। शुक्रवार को वाहन निर्धारित।'
                : 'Offered rate: ₹330/kg. Doorstep collection van scheduled for cluster on Friday.'}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <MakeOfferModal
        isOpen={Boolean(selectedLotForOffer)}
        onClose={() => setSelectedLotForOffer(null)}
        lot={selectedLotForOffer}
        recycler={recycler}
        lang={lang}
        onSuccess={onRefresh}
      />

      <ConfirmHandoverModal
        isOpen={Boolean(selectedLotForHandover)}
        onClose={() => setSelectedLotForHandover(null)}
        lot={selectedLotForHandover}
        recycler={recycler}
        lang={lang}
        onSuccess={onRefresh}
      />
    </div>
  );
};
