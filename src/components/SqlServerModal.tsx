import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertCircle, Loader2, RefreshCw, KeyRound, Server, HardDrive, ShieldCheck, Download } from 'lucide-react';
import { SqlServerConfig, TableDefinition } from '../types/ledger';
import { testSqlServerConnection, fetchSqlServerTables } from '../services/api';

interface SqlServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SqlServerConfig;
  onSaveConfig: (cfg: SqlServerConfig) => void;
  onImportTable: (table: TableDefinition) => void;
  isDbConnected: boolean;
  setIsDbConnected: (val: boolean) => void;
}

export const SqlServerModal: React.FC<SqlServerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onImportTable,
  isDbConnected,
  setIsDbConnected,
}) => {
  const [formData, setFormData] = useState<SqlServerConfig>({ ...config });
  const [testing, setTesting] = useState(false);
  const [fetchingTables, setFetchingTables] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; details?: string } | null>(null);
  const [dbTables, setDbTables] = useState<TableDefinition[]>([]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await testSqlServerConnection(formData);
      if (res.success) {
        setIsDbConnected(true);
        onSaveConfig(formData);
        setStatusMessage({
          type: 'success',
          text: res.message || 'تم الاتصال بنجاح!',
          details: `إصدار الخادم: ${res.version} | قاعدة البيانات: ${res.currentDb}`,
        });
      } else {
        setIsDbConnected(false);
        setStatusMessage({
          type: 'error',
          text: res.error || 'فشل الاتصال بقاعدة البيانات',
        });
      }
    } catch (err: any) {
      setIsDbConnected(false);
      setStatusMessage({
        type: 'error',
        text: 'خطأ في الاتصال: ' + (err.message || String(err)),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleFetchTables = async () => {
    setFetchingTables(true);
    setStatusMessage(null);
    try {
      const res = await fetchSqlServerTables(formData);
      if (res.success && res.tables) {
        setDbTables(res.tables);
        setIsDbConnected(true);
        setStatusMessage({
          type: 'success',
          text: `تم استرجاع ${res.tables.length} جدول من قاعدة البيانات بنجاح!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'تعذر استرجاع الجداول من قاعدة البيانات',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'خطأ أثناء جلب الجداول: ' + (err.message || String(err)),
      });
    } finally {
      setFetchingTables(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-950/40">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                إعدادات الاتصال بـ Microsoft SQL Server
                {isDbConnected && (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    متصل الآن
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                يمكنك الاتصال المباشر لإدراج البيانات آلياً أو استيراد هياكل الجداول القائمة
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-right">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-semibold">{statusMessage.text}</div>
                {statusMessage.details && (
                  <div className="mt-1 font-mono text-[11px] text-slate-300 opacity-90">
                    {statusMessage.details}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
                <span>عنوان السيرفر (Host / IP / Instance)</span>
                <Server className="w-3.5 h-3.5 text-sky-400" />
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="مثال: localhost أو 192.168.1.50 أو sql.mycompany.com"
                value={formData.server}
                onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
                <span>المنفذ (Port)</span>
              </label>
              <input
                type="number"
                dir="ltr"
                placeholder="1433"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) || 1433 })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
              <span>اسم قاعدة البيانات (Database Name)</span>
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="مثال: ERP_Database أو AccountsDB"
              value={formData.database}
              onChange={(e) => setFormData({ ...formData, database: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
                <span>اسم المستخدم (SQL Auth User)</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="sa"
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
                <span>كلمة المرور (Password)</span>
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="••••••••"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Security & Certificate options */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              خيارات التشفير والشهادات (TLS/SSL)
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trustServerCertificate}
                  onChange={(e) => setFormData({ ...formData, trustServerCertificate: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                <span>Trust Server Certificate (موصى بها للسيرفرات المحلية والتطوير)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.encrypt}
                  onChange={(e) => setFormData({ ...formData, encrypt: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                <span>Encrypt Connection (تشفير الاتصال)</span>
              </label>
            </div>
          </div>

          {/* Discovered Database Tables */}
          {dbTables.length > 0 && (
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">
                  الجداول المتاحة في قاعدة البيانات ({dbTables.length})
                </span>
                <span className="text-[11px] text-slate-400">اختر جدولا لاستيراده فوراً</span>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {dbTables.map((tbl) => (
                  <div
                    key={tbl.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono text-white font-semibold">
                        [{tbl.schemaName}].[{tbl.name}]
                      </span>
                      <span className="text-slate-400 text-[11px] mr-2">
                        ({tbl.columns.length} عمود)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onImportTable(tbl);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      استخدام هذا الجدول
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Note about Offline Script Generation */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">ملاحظة هامة:</strong> إذا لم تكن قاعدة بياناتك متصلة بالإنترنت (مثلاً تعمل على شبكة داخلية Localhost فقط بدون وصول خارجي)، لا تقلق! التطبيق يتيح لك <strong className="text-sky-300">توليد ملف T-SQL كامل وجاهز بضغطة زر</strong> لتشغيله مباشرة عبر SQL Server Management Studio (SSMS) دون الحاجة للاتصال من المتصفح.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !formData.server || !formData.database}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-md shadow-indigo-600/20"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>اختبار الاتصال والحفظ</span>
            </button>

            <button
              onClick={handleFetchTables}
              disabled={fetchingTables || !formData.server || !formData.database}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors border border-slate-700"
            >
              {fetchingTables ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-sky-400" />}
              <span>جلب الجداول تلقائياً</span>
            </button>
          </div>

          <button
            onClick={() => {
              onSaveConfig(formData);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
