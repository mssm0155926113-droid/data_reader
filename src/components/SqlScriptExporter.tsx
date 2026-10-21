import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  FileSpreadsheet, 
  FileJson, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ExtractedRow, SqlServerConfig, TableDefinition } from '../types/ledger';
import { generateTSqlScript, executeInsertToSqlServer } from '../services/api';

interface SqlScriptExporterProps {
  tableSchema: TableDefinition;
  rows: ExtractedRow[];
  sqlConfig: SqlServerConfig;
  isDbConnected: boolean;
  onOpenDbModal: () => void;
}

export const SqlScriptExporter: React.FC<SqlScriptExporterProps> = ({
  tableSchema,
  rows,
  sqlConfig,
  isDbConnected,
  onOpenDbModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    message: string;
    insertedCount?: number;
  } | null>(null);

  const activeRows = rows.filter((r) => !r.isExcluded);
  const tsqlCode = generateTSqlScript(tableSchema, activeRows);

  const handleCopySql = () => {
    navigator.clipboard.writeText(tsqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([tsqlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insert_${tableSchema.name}_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const cols = tableSchema.columns.map((c) => c.name);
    const headers = cols.join(',');
    const csvRows = activeRows.map((r) => {
      return cols
        .map((colName) => {
          const val = r.cells[colName]?.value ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableSchema.name}_records.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const formatted = activeRows.map((r) => {
      const obj: Record<string, any> = {};
      tableSchema.columns.forEach((c) => {
        obj[c.name] = r.cells[c.name]?.value ?? null;
      });
      return obj;
    });

    const jsonStr = JSON.stringify(formatted, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableSchema.name}_records.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectExecute = () => {
    if (!isDbConnected) {
      onOpenDbModal();
      return;
    }

    if (activeRows.length === 0) {
      setExecutionResult({
        success: false,
        message: 'لا توجد سجلات محددة للإدخال في الجدول',
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const performExecution = async () => {
    setShowConfirmModal(false);
    setExecuting(true);
    setExecutionResult(null);

    try {
      const res = await executeInsertToSqlServer(sqlConfig, tableSchema, activeRows);
      if (res.success) {
        setExecutionResult({
          success: true,
          message: res.message || `تم إدراج ${res.insertedCount} سجل بنجاح!`,
          insertedCount: res.insertedCount,
        });
      } else {
        setExecutionResult({
          success: false,
          message: res.error || 'حدث خطأ أثناء تنفيذ الإدخال',
        });
      }
    } catch (err: any) {
      setExecutionResult({
        success: false,
        message: 'فشل الإدخال: ' + (err.message || String(err)),
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              إدخال وتصدير البيانات إلى SQL Server
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر الإدخال المباشر بالقاعدة عبر الشبكة أو نسخ/تحميل كود T-SQL المتوافق مع SSMS
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Execute to SQL Server */}
          <button
            onClick={handleDirectExecute}
            disabled={executing || activeRows.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md ${
              isDbConnected
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            {executing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الإدخال في SQL Server...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isDbConnected ? 'تنفيذ الإدخال المباشر في القاعدة' : 'ربط وإدخال في SQL Server'}
                </span>
              </>
            )}
          </button>

          {/* Copy SQL Script */}
          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ كود T-SQL'}</span>
          </button>

          {/* Download SQL File */}
          <button
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="تحميل كود الاستعلام كملف .sql"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>تحميل .sql</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="تصدير ملف Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="تصدير كملف JSON"
          >
            <FileJson className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Direct Execution Result Notification */}
      {executionResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in ${
            executionResult.success
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
          }`}
        >
          {executionResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <div className="font-bold text-sm">{executionResult.message}</div>
            {executionResult.success && (
              <div className="mt-1 text-slate-300">
                أصبحت السجلات متوفرة الآن في جدول [{tableSchema.schemaName || 'dbo'}].[{tableSchema.name}] في قاعدة البيانات.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code Viewer Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>معاينة كود T-SQL المولد تلقائياً (Microsoft SQL Server):</span>
          </div>
          <button
            onClick={() => setShowSqlCode(!showSqlCode)}
            className="text-[11px] text-sky-400 hover:underline"
          >
            {showSqlCode ? 'إخفاء المعاينة' : 'إظهار المعاينة'}
          </button>
        </div>

        {showSqlCode && (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <div className="absolute top-2.5 left-2.5 z-10">
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900/90 border border-slate-700 rounded-md transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'منسوخ' : 'نسخ'}</span>
              </button>
            </div>
            <pre
              dir="ltr"
              className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-indigo-600 selection:text-white"
            >
              {tsqlCode}
            </pre>
          </div>
        )}
      </div>

      {/* In-App Direct Execution Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl shadow-indigo-950/50">
            <div className="flex items-center gap-3 text-amber-400">
              <Database className="w-6 h-6 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                تأكيد الترحيل إلى SQL Server
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في إدراج <strong className="text-emerald-400">{activeRows.length} سجل</strong> مباشرة في جدول <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">[{tableSchema.schemaName || 'dbo'}].[{tableSchema.name}]</code> بقاعدة بيانات <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">[{sqlConfig.database}]</code> على السيرفر <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded">{sqlConfig.server}</code>؟
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={performExecution}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/30"
              >
                تأكيد وبدء الترحيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
