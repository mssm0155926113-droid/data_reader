import React from 'react';
import { Database, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, HelpCircle, Layers, RefreshCw } from 'lucide-react';
import { SqlServerConfig } from '../types/ledger';

interface HeaderProps {
  sqlConfig: SqlServerConfig | null;
  isDbConnected: boolean;
  onOpenDbModal: () => void;
  onOpenGuide: () => void;
  onOpenVoiceInput: () => void;
  onOpenFruit67Modal: () => void;
  onOpenFruit67Workflow: () => void;
  pendingSyncCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  sqlConfig,
  isDbConnected,
  onOpenDbModal,
  onOpenGuide,
  onOpenVoiceInput,
  onOpenFruit67Modal,
  onOpenFruit67Workflow,
  pendingSyncCount = 0,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-300 via-indigo-200 to-white bg-clip-text text-transparent">
                مستخرج الدفاتر اليدوية إلى SQL Server
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" />
                Gemini Vision OCR
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              قراءة السجلات واليوميات الورقية بخط اليد وتحويلها تلقائياً إلى جداول قواعد بيانات T-SQL
            </p>
          </div>
        </div>

        {/* Right Actions: fruit67 Workflow Model, Sync, Voice Input, Guide, SQL Server Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fruit67 Workflow Model Button */}
          <button
            onClick={onOpenFruit67Workflow}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 rounded-lg shadow-md shadow-amber-600/20 border border-amber-400/40 transition-all cursor-pointer ring-1 ring-amber-400/30"
            title="نموذج تدفق الإدخال الصوتي وجداول قاعدة بيانات fruit67 (fatora_f والمبيعات)"
          >
            <Layers className="w-4 h-4 text-amber-200" />
            <span>نموذج الجداول والصوت 📊</span>
          </button>

          {/* fruit67 Sync Button */}
          <button
            onClick={onOpenFruit67Modal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md shadow-emerald-600/20 border border-emerald-400/30 transition-all cursor-pointer"
            title="إدارة ومزامنة قاعدة بيانات fruit67 مع الكمبيوتر"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
            <span>مزامنة fruit67</span>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                {pendingSyncCount}
              </span>
            )}
          </button>

          {/* Voice Input Button */}
          <button
            onClick={onOpenVoiceInput}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 rounded-lg shadow-md shadow-rose-600/20 border border-rose-500/30 transition-all cursor-pointer"
            title="الإدخال الصوتي (العدد، الوزن، الاسم، السعر، اسم النقلة)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>إدخال صوتي 🎙️</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all"
            title="طريقة الاستخدام والدليل"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">دليل الاستخدام</span>
          </button>

          <button
            onClick={onOpenDbModal}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isDbConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 shadow-sm shadow-emerald-900/20'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <Database className={`w-4 h-4 ${isDbConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <div className="text-right">
              <div className="flex items-center gap-1">
                {isDbConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>متصل بـ SQL Server</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>إعدادات SQL Server</span>
                  </>
                )}
              </div>
              {sqlConfig && isDbConnected && (
                <div className="text-[10px] text-emerald-400/80 font-mono">
                  {sqlConfig.database} @ {sqlConfig.server}
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
