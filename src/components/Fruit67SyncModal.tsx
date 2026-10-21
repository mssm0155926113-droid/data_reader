import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Server, 
  HardDrive, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Search, 
  Table, 
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { TableDefinition, SqlServerConfig } from '../types/ledger';
import { FRUIT67_TABLES } from '../data/fruit67Database';
import { getFruit67Status, syncFruit67ToPc, generateFruit67SyncScript, testSqlServerConnection } from '../services/api';

interface Fruit67SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (table: TableDefinition) => void;
  activeTableName: string;
  sqlConfig: SqlServerConfig;
  onSaveSqlConfig: (cfg: SqlServerConfig) => void;
}

export const Fruit67SyncModal: React.FC<Fruit67SyncModalProps> = ({
  isOpen,
  onClose,
  onSelectTable,
  activeTableName,
  sqlConfig,
  onSaveSqlConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'tables' | 'script'>('sync');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncStatus, setSyncStatus] = useState<{
    databaseName: string;
    totalTables: number;
    totalLocalRecords: number;
    pendingSyncCount: number;
    lastSyncTime: string | null;
  } | null>(null);

  // Sync form state
  const [connectionForm, setConnectionForm] = useState<SqlServerConfig>({
    ...sqlConfig,
    database: 'fruit67', // Always fruit67
  });

  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  // Script generator state
  const [syncScript, setSyncScript] = useState<string>('');
  const [scriptCount, setScriptCount] = useState<number>(0);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Load status on open
  useEffect(() => {
    if (isOpen) {
      loadStatus();
      handleGenerateScript();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const data = await getFruit67Status();
      setSyncStatus(data);
    } catch (e) {
      // ignore
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSqlServerConnection(connectionForm);
      if (res.success) {
        setTestResult({
          success: true,
          message: `تم الاتصال بنجاح بقاعدة البيانات [fruit67] على السيرفر (${connectionForm.server})!`,
        });
        onSaveSqlConfig(connectionForm);
      } else {
        setTestResult({
          success: false,
          message: res.error || 'فشل الاتصال بقاعدة البيانات على الكمبيوتر',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'خطأ أثناء الاتصال: ' + (err.message || String(err)),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncToPc = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncFruit67ToPc(connectionForm);
      if (res.success) {
        setSyncResult({
          success: true,
          message: res.message || 'تمت المزامنة بنجاح!',
          count: res.syncedCount,
        });
        loadStatus();
        handleGenerateScript();
      } else {
        setSyncResult({
          success: false,
          message: res.error || 'حدث خطأ أثناء المزامنة مع الكمبيوتر',
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: 'فشلت المزامنة: ' + (err.message || String(err)),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await generateFruit67SyncScript(undefined, false);
      setSyncScript(res.script);
      setScriptCount(res.count);
    } catch (e) {
      // ignore
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(syncScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([syncScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync_fruit67_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter tables
  const filteredTables = FRUIT67_TABLES.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      (t.descriptionAr && t.descriptionAr.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-950/50">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  مركز مزامنة قاعدة البيانات fruit67 مع الكمبيوتر
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  نسخة محلية نشطة (39 جدول)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نسخة طبق الأصل من قاعدة بياناتك تم استيرادها بالكامل لحفظ الحركات ومزامنتها مع جهازك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Highlights Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400">قاعدة البيانات: </span>
              <strong className="text-white font-mono">fruit67</strong>
            </div>
            <div>
              <span className="text-slate-400">عدد الجداول المستوردة: </span>
              <strong className="text-emerald-400 font-mono">39 جدول</strong>
            </div>
            <div>
              <span className="text-slate-400">السجلات بانتظار المزامنة: </span>
              <strong className="text-amber-400 font-mono">
                {syncStatus?.pendingSyncCount ?? 0} حركة
              </strong>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sync'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>المزامنة المباشرة</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'tables'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>جداول fruit67 (39)</span>
            </button>

            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'script'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>توليد كود SSMS</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-right flex-1">
          {/* TAB 1: Direct Network Synchronization */}
          {activeTab === 'sync' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>المزامنة المباشرة عبر الشبكة المحلية (Direct SQL Sync)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  أدخل بيانات خادم SQL Server على جهاز الكمبيوتر الخاص بك، واضغط <strong>"مزامنة الآن"</strong> ليتم ترحيل كافة السجلات المحفوظة في التطبيق مباشرة إلى قاعدة بيانات <strong>fruit67</strong> على جهازك.
                </p>
              </div>

              {/* Status or Error Notifications */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                    testResult.success
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                    syncResult.success
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div className="font-semibold">{syncResult.message}</div>
                </div>
              )}

              {/* PC Connection Settings Form */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span>إعدادات الاتصال بكمبيوترك الشخصي:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      عنوان كمبيوترك (Host / IP)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={connectionForm.server}
                      onChange={(e) => setConnectionForm({ ...connectionForm, server: e.target.value })}
                      placeholder="مثال: localhost أو 192.168.1.15"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      المنفذ (Port)
                    </label>
                    <input
                      type="number"
                      dir="ltr"
                      value={connectionForm.port}
                      onChange={(e) => setConnectionForm({ ...connectionForm, port: parseInt(e.target.value, 10) || 1433 })}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      قاعدة البيانات المستهدفة
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      disabled
                      value="fruit67"
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-900/60 border border-slate-800 rounded-xl text-emerald-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">
                      اسم المستخدم (User)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={connectionForm.user}
                      onChange={(e) => setConnectionForm({ ...connectionForm, user: e.target.value })}
                      placeholder="sa"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">
                    كلمة المرور (Password)
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    value={connectionForm.password || ''}
                    onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !connectionForm.server}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl border border-slate-700 transition-colors"
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-sky-400" />}
                  <span>اختبار الاتصال بـ fruit67 على الكمبيوتر</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncToPc}
                  disabled={isSyncing || !connectionForm.server}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري المزامنة مع الكمبيوتر...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>بدء مزامنة السجلات المعلقة الآن 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Browse fruit67 39 Tables */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="بحث في أسماء جداول fruit67..."
                    className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  عرض {filteredTables.length} من أصل 39 جدول
                </div>
              </div>

              {/* Table Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredTables.map((tbl) => {
                  const isCurrent = activeTableName === tbl.name;
                  return (
                    <div
                      key={tbl.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-white">
                            [dbo].[{tbl.name}]
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              الجدول النشط حالياً
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 mt-1 font-medium">
                          {tbl.descriptionAr}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          يحتوي على {tbl.columns.length} عمود ({tbl.columns.slice(0, 3).map((c) => c.name).join(', ')}...)
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectTable(tbl);
                          onClose();
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>استخدام هذا الجدول كهدف للإدخال والقراءة</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SSMS Synchronization Script */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <span>سكريبت المزامنة الجاهز لـ SQL Server Management Studio (SSMS)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    إذا كان جهازك في شبكة خاصة، يمكنك نسخ أو تحميل هذا الملف وتشغيله مباشرة في SSMS على الكمبيوتر لتطبيق كافة الحركات فورياً
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{copiedScript ? 'تم النسخ!' : 'نسخ كود التحديث'}</span>
                  </button>

                  <button
                    onClick={handleDownloadScript}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل .sql للكمبيوتر</span>
                  </button>
                </div>
              </div>

              {/* Code Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                <pre
                  dir="ltr"
                  className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed selection:bg-indigo-600 selection:text-white"
                >
                  {syncScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            قاعدة البيانات: <strong>fruit67</strong> • توافق كامل مع SQL Server 2016-2026 و T-SQL
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
